// src/hooks/useSubProjects.js
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";
import {getCurrentRole} from "@/Utils/navigation"; // 👈 role helper

export function normalizeSubProject(row = {}) {
    return {
        id: row.subproject_id ?? row.id,
        projectId: row.project_id ?? null,
        subprojectName: row.subproject_name || row.name || "",
        description: row.description || "",
        status: row.project_status || row.status || "To do",
        assignedBy: row.assigned_by ?? null,
        assignedTo: row.assigned_to ?? null,
        deadline: row.subproject_deadline || row.deadline || null,
        createdOn: row.created_on || row.createdAt || null,
        lastModified: row.last_modified || row.updatedAt || null,
    };
}

// All subprojects (role + user-based)
export function useSubProjects() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const enabled = Boolean(accessToken);

    // 🔐 Role-based logic
    const role = getCurrentRole(); // SUPER-ADMIN / ADMIN / MANAGER / EMPLOYEE / USER
    const isManagerial = ["SUPER-ADMIN", "ADMIN", "MANAGER"].includes(role);

    // 👤 Current user id from auth context
    const userId =
        ctx?.user?.id ??
        ctx?.user_id ??
        ctx?.userId ??
        null;

    const query = useQuery({
        queryKey: ["sub-projects", {role, userId}],
        enabled,
        queryFn: async () => {
            // For non-manager roles, send ?user_id=...
            const params =
                !isManagerial && userId
                    ? {user_id: userId}
                    : undefined;

            const res = await http.get("/sub-projects", {
                headers: {Authorization: `Bearer ${accessToken}`},
                params,
            });

            const arr = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];

            return arr.map(normalizeSubProject);
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        ...query,
        subProjects: Array.isArray(query.data) ? query.data : [],
    };
}

// Create
export function useCreateSubProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            if (!accessToken) throw new Error("No access token");

            const res = await http.post("/sub-projects", payload, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            return res.data;
        },
        onSuccess: (data, variables) => {
            toast.success("Sub project created successfully");
            queryClient.invalidateQueries(["sub-projects"]);

            const pid = variables?.project_id || variables?.projectId;
            if (pid) {
                queryClient.invalidateQueries(["projects", pid]);
            }
            queryClient.invalidateQueries(["projects", "all"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to create sub project");
        },
    });
}

// Drag & drop status update: PUT /sub-projects/:id { project_status }
export function useUpdateSubProjectStatus() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, project_status, projectId}) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing subproject id");

            const res = await http.put(
                `/sub-projects/${id}`,
                {project_status},
                {headers: {Authorization: `Bearer ${accessToken}`}}
            );

            return res.data;
        },
        onSuccess: (_data, variables) => {
            toast.success(
                `Sub project status updated to "${variables.project_status}".`
            );
            queryClient.invalidateQueries(["sub-projects"]);
            if (variables.projectId) {
                queryClient.invalidateQueries(["projects", variables.projectId]);
            }
            queryClient.invalidateQueries(["projects", "all"]);
        },
        onError: (error) => {
            toast.error(
                errText(error) || "Failed to update sub project status"
            );
        },
    });
}

// Full update from details modal: PUT /sub-projects/:id { ...fields }
export function useUpdateSubProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, data}) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing subproject id");

            const res = await http.put(`/sub-projects/${id}`, data, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            return res.data;
        },
        onSuccess: (data, {id, projectId}) => {
            toast.success("Sub project updated successfully");
            queryClient.invalidateQueries(["sub-projects"]);
            if (projectId || data?.project_id) {
                queryClient.invalidateQueries([
                    "projects",
                    projectId || data.project_id,
                ]);
            }
            if (data?.project_id || projectId) {
                queryClient.invalidateQueries(["projects", "all"]);
            }
        },
        onError: (error) => {
            toast.error(
                errText(error) || "Failed to update sub project"
            );
        },
    });
}

// Delete: DELETE /sub-projects/:id
export function useDeleteSubProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        // You can pass { id, projectId } so we can invalidate the parent project
        mutationFn: async ({id}) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing subproject id");

            const res = await http.delete(`/sub-projects/${id}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            return res.data;
        },
        onSuccess: (_data, {projectId}) => {
            toast.success("Sub project deleted successfully");
            // Refresh sub-project list and any affected project views
            queryClient.invalidateQueries(["sub-projects"]);
            if (projectId) {
                queryClient.invalidateQueries(["projects", projectId]);
            }
            queryClient.invalidateQueries(["projects", "all"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to delete sub project");
        },
    });
}
