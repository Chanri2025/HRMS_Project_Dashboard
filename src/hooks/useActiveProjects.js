import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

function normalizeProject(row = {}) {
    return {
        id: row.project_id ?? row.id,
        name: row.project_name ?? row.name ?? "Project",
        description: row.description || "",
        status: row.project_status || row.status || "Unknown",
        createdOn: row.created_on || row.createdAt || null,
        lastModified: row.last_modified || row.updatedAt || null,
        createdById: row.created_by ?? row.createdBy ?? null,
    };
}

export function useActiveProjects() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const enabled = Boolean(accessToken);

    const query = useQuery({
        queryKey: ["projects", "all"],
        enabled,
        queryFn: async () => {
            const res = await http.get("/projects", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const arr = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];

            return arr.map(normalizeProject);
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const all = Array.isArray(query.data) ? query.data : [];
    const activeProjects = all.filter(
        (p) => (p.status || "").toLowerCase() === "active"
    );

    return {
        ...query,
        activeProjects,
        activeCount: activeProjects.length,
    };
}

// ---------- Fetch single user for "Created by" ----------
export function useUserById(userId) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";

    return useQuery({
        queryKey: ["users", userId],
        enabled: Boolean(accessToken) && Boolean(userId),
        queryFn: async () => {
            const res = await http.get(`/auth/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return res.data;
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}

// ---------- Update project: PUT /project/{id} ----------
export function useUpdateProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, payload}) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing project id");

            const res = await http.put(`/project/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return res.data;
        },
        onSuccess: () => {
            toast.success("Project updated successfully");
            queryClient.invalidateQueries(["projects", "all"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to update project");
        },
    });
}

// ---------- Delete project: DELETE /project/{id} ----------
export function useDeleteProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing project id");

            const res = await http.delete(`/project/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return res.data;
        },
        onSuccess: () => {
            toast.success("Project deleted successfully");
            queryClient.invalidateQueries(["projects", "all"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to delete project");
        },
    });
}
