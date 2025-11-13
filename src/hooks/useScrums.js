// src/hooks/useScrums.js
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

// ✅ Get all users (for id → name mapping)
export function useUsers(enabled = true) {
    const {accessToken} = getUserCtx();
    const canRun = Boolean(enabled && accessToken);

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

// ✅ Get all scrums (always include work_hours)
export function useScrums() {
    const {accessToken} = getUserCtx();
    const enabled = Boolean(accessToken);

    return useQuery({
        queryKey: ["scrums"],
        enabled,
        queryFn: async () => {
            const res = await http.get("/scrums", {
                headers: {Authorization: `Bearer ${accessToken}`},
                params: {
                    include_hours: true, // 👈 always ask backend to calculate hours
                },
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
            toast.success("Scrum added successfully");
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
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const qc = useQueryClient();

    // try to extract actor_id from logged-in user
    const actorIdDefault =
        ctx?.user?.user_id || ctx?.user?.id || ctx?.user_id || null;

    return useMutation({
        mutationFn: async ({scrumId, action, note}) => {
            if (!accessToken) throw new Error("No access token");
            if (!scrumId) throw new Error("Missing scrum id");
            if (!action) throw new Error("Missing lifecycle action");

            const payload = {
                action,                        // 'start' | 'pause' | 'end'
                note: note ?? null,            // optional
                actor_id: actorIdDefault ?? undefined, // optional
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
                    ? "Scrum started"
                    : act === "pause"
                        ? "Scrum paused"
                        : act === "end"
                            ? "Scrum completed"
                            : "Scrum updated";

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
