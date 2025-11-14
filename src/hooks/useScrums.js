// src/hooks/useScrums.js
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

const PRIVILEGED_ROLES = ["SUPER-ADMIN", "ADMIN", "MANAGER"];

// Small helper: get id + role from ctx OR sessionStorage
function resolveUserMeta() {
    const ctx = getUserCtx() || {};

    let accessToken = ctx?.accessToken || ctx?.access_token || "";
    let baseUser = ctx?.user || ctx || {};

    let userId = baseUser?.user_id ?? baseUser?.id ?? null;
    let role = baseUser?.role ?? null;

    // Fallback to sessionStorage.userData
    try {
        const raw = sessionStorage.getItem("userData");
        if (raw) {
            const parsed = JSON.parse(raw);

            if (!userId) {
                userId = parsed.user_id ?? parsed.id ?? null;
            }
            if (!role) {
                role = parsed.role ?? null;
            }
            if (!accessToken) {
                accessToken = parsed.access_token || accessToken;
            }
        }
    } catch {
        // ignore JSON / access errors
    }

    return {
        accessToken,
        userId,
        role: role ? String(role).toUpperCase() : "",
    };
}

// ✅ Get all users (for id → name mapping)
export function useUsers(enabled = true) {
    const {accessToken} = getUserCtx();
    const canRun = Boolean(accessToken && enabled);

    return useQuery({
        queryKey: ["users"],
        enabled: canRun,
        queryFn: async () => {
            const res = await http.get("/auth/users", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return Array.isArray(res.data) ? res.data : res.data?.data || [];
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}

// ✅ Get scrums (role-aware: user_id only for non-privileged roles)
export function useScrums() {
    const {accessToken, userId, role} = resolveUserMeta();

    const enabled = Boolean(accessToken);
    const isPrivileged = PRIVILEGED_ROLES.includes(role);
    const shouldFilterByUser = !isPrivileged;

    // Always include_hours, and for non-privileged send a concrete user_id
    const params = {
        include_hours: true,
        ...(shouldFilterByUser ? {user_id: userId ?? -1} : {}),
    };

    // Make queryKey depend on role + user, so cache stays correct
    const queryKey = ["scrums", isPrivileged ? "ALL" : (userId ?? "UNKNOWN")];

    return useQuery({
        queryKey,
        enabled,
        queryFn: async () => {
            const res = await http.get("/scrums", {
                headers: {Authorization: `Bearer ${accessToken}`},
                params,
            });

            const arr = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];

            // Normalize shape
            return arr.map((s) => ({
                id: s.id,
                user_id: s.user_id,
                subproject_id: s.subproject_id,
                today_task: s.today_task,
                eta_date: s.eta_date || null,
                dependencies: Array.isArray(s.dependencies)
                    ? s.dependencies
                    : [],
                concern: s.concern || "",

                scrum_status: s.scrum_status || null,
                last_action_at: s.last_action_at || null,
                status_events: Array.isArray(s.status_events)
                    ? s.status_events
                    : [],
                work_hours:
                    typeof s.work_hours === "number"
                        ? s.work_hours
                        : s.work_hours
                            ? Number(s.work_hours)
                            : null,

                created_at: s.created_at,
            }));
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
}

// ✅ Create scrum
export function useCreateScrum() {
    const {accessToken} = getUserCtx();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            if (!accessToken) throw new Error("No access token");
            const res = await http.post("/scrums", payload, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("ScrumDashboard added successfully");
            qc.invalidateQueries({queryKey: ["scrums"]});
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to add scrum");
        },
    });
}

// ✅ Lifecycle: POST /scrums/{scrum_id}/lifecycle
// action: 'start' | 'pause' | 'end'
export function useScrumLifecycle() {
    const ctx = getUserCtx() || {};
    const accessToken = ctx?.accessToken || ctx?.access_token || "";
    const qc = useQueryClient();

    // try to extract actor_id from logged-in user or sessionStorage
    let actorIdDefault =
        ctx?.user?.user_id || ctx?.user?.id || ctx?.user_id || ctx?.id || null;

    if (!actorIdDefault) {
        try {
            const raw = sessionStorage.getItem("userData");
            if (raw) {
                const parsed = JSON.parse(raw);
                actorIdDefault = parsed.user_id ?? parsed.id ?? null;
            }
        } catch {
        }
    }

    return useMutation({
        mutationFn: async ({scrumId, action, note}) => {
            if (!accessToken) throw new Error("No access token");
            if (!scrumId) throw new Error("Missing scrum id");
            if (!action) throw new Error("Missing lifecycle action");

            const payload = {
                action,
                note: note ?? null,
                actor_id: actorIdDefault ?? undefined,
            };

            const res = await http.post(
                `/scrums/${scrumId}/lifecycle`,
                payload,
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                }
            );
            return res.data;
        },
        onSuccess: (_data, variables) => {
            const act = variables.action;
            const label =
                act === "start"
                    ? "ScrumDashboard started"
                    : act === "pause"
                        ? "ScrumDashboard paused"
                        : act === "end"
                            ? "ScrumDashboard completed"
                            : "ScrumDashboard updated";

            toast.success(label);
            qc.invalidateQueries({queryKey: ["scrums"]});
        },
        onError: (error) => {
            toast.error(
                errText(error) || "Failed to update scrum lifecycle"
            );
        },
    });
}
