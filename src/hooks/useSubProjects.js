import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

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

// ---------- Fetch all sub-projects (optional global list) ----------
export function useSubProjects() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const enabled = Boolean(accessToken);

    const query = useQuery({
        queryKey: ["sub-projects"],
        enabled,
        queryFn: async () => {
            const res = await http.get("/sub-projects", {
                headers: {Authorization: `Bearer ${accessToken}`},
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

// ---------- Create Sub Project ----------
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

            // global list
            queryClient.invalidateQueries(["sub-projects"]);

            const pid = variables?.project_id || variables?.projectId;
            if (pid) {
                // project detail (with subprojects)
                queryClient.invalidateQueries(["projects", pid]);
            }

            // projects overview
            queryClient.invalidateQueries(["projects", "all"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to create sub project");
        },
    });
}

// ---------- Update Sub Project Status (Kanban drag & drop) ----------
export function useUpdateSubProjectStatus() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        // expects: { id, project_status, projectId? }
        mutationFn: async ({id, project_status}) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("No sub-project id");
            if (!project_status) throw new Error("No project_status");

            // PUT {{test_server}}sub-projects/:id
            // { "project_status": "Completed" }
            const res = await http.put(
                `/sub-projects/${id}`,
                {project_status},
                {headers: {Authorization: `Bearer ${accessToken}`}}
            );

            return res.data;
        },

        onSuccess: (data, variables) => {
            const statusLabel =
                variables?.project_status ||
                data?.project_status ||
                data?.status;

            toast.success(
                statusLabel
                    ? `Sub project status updated to "${statusLabel}".`
                    : "Sub project status updated."
            );

            // Refresh global sub-project list
            queryClient.invalidateQueries(["sub-projects"]);

            // Determine which project detail to refresh
            const pid =
                variables?.projectId ||
                data?.project_id ||
                data?.projectId ||
                null;

            if (pid) {
                queryClient.invalidateQueries(["projects", pid]);
            }

            // Refresh projects overview
            queryClient.invalidateQueries(["projects", "all"]);
        },

        onError: (error) => {
            toast.error(
                errText(error) || "Failed to update sub project status"
            );
        },
    });
}
