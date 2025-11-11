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

// ✅ Get all scrums
export function useScrums() {
    const {accessToken} = getUserCtx();
    const enabled = Boolean(accessToken);

    return useQuery({
        queryKey: ["scrums"],
        enabled,
        queryFn: async () => {
            const res = await http.get("/scrums", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
            // Normalize basic shape
            return arr.map((s) => ({
                id: s.id,
                user_id: s.user_id,
                subproject_id: s.subproject_id,
                today_task: s.today_task,
                eta_date: s.eta_date || null,
                dependencies: Array.isArray(s.dependencies) ? s.dependencies : [],
                concern: s.concern || "",
                created_at: s.created_at,
            }));
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
}

// ✅ Create scrum (already used in AddScrumModal)
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
