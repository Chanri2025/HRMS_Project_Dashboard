// src/hooks/useActiveProjects.js
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
        subprojects: Array.isArray(row.subprojects) ? row.subprojects : [],
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
                headers: {Authorization: `Bearer ${accessToken}`},
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

// Single project (with subprojects) from /projects/{id}
export function useProjectById(projectId) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const enabled = Boolean(accessToken) && Boolean(projectId);

    return useQuery({
        queryKey: ["projects", projectId],
        enabled,
        queryFn: async () => {
            const res = await http.get(`/projects/${projectId}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            const data = res.data?.data ?? res.data ?? null;
            if (!data) throw new Error("No project found");

            return normalizeProject(data);
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        onError: (err) => {
            toast.error(errText(err) || "Failed to load project");
        },
    });
}

export function useUserById(userId) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";

    return useQuery({
        queryKey: ["users", userId],
        enabled: Boolean(accessToken) && Boolean(userId),
        queryFn: async () => {
            const res = await http.get(`/auth/users/${userId}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return res.data;
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}

// ---------- Project Members ----------

function normalizeProjectMember(row = {}) {
    const userId =
        row.user_id ??
        row.userId ??
        row.id ??
        null;

    return {
        userId,
        fullName:
            row.full_name ||
            row.name ||
            row.employee?.full_name ||
            "",
        email: row.email || row.employee?.email || "",
        designationId:
            row.designation_id ??
            row.designationId ??
            undefined,
        deptId:
            row.dept_id ??
            row.department_id ??
            row.deptId ??
            undefined,
    };
}

export function useProjectMembers(projectId) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";

    return useQuery({
        queryKey: ["projects", projectId, "members"],
        enabled: Boolean(accessToken) && Boolean(projectId),
        queryFn: async () => {
            const res = await http.get(`/projects/${projectId}/members`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            const arr = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];

            return arr.map(normalizeProjectMember);
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
}

// ---------- Mutations: Projects ----------

export function useUpdateProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, payload}) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing project id");

            const res = await http.put(`/projects/${id}`, payload, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            return res.data;
        },
        onSuccess: (_, {id}) => {
            toast.success("Project updated successfully");
            queryClient.invalidateQueries(["projects", "all"]);
            queryClient.invalidateQueries(["projects", id]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to update project");
        },
    });
}

export function useDeleteProject() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            if (!accessToken) throw new Error("No access token");
            if (!id) throw new Error("Missing project id");

            const res = await http.delete(`/projects/${id}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
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

// ---------- Mutations: Members ----------

export function useAddProjectMember() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({projectId, userId, deptId, designationId}) => {
            if (!accessToken) throw new Error("No access token");
            if (!projectId) throw new Error("Missing project id");
            if (!userId) throw new Error("Missing user identifier");
            if (deptId === undefined || deptId === null) {
                throw new Error("Missing dept_id for member");
            }

            const numericUserId =
                typeof userId === "string" && /^\d+$/.test(userId)
                    ? Number(userId)
                    : userId;

            const numericDeptId =
                typeof deptId === "string" && /^\d+$/.test(deptId)
                    ? Number(deptId)
                    : deptId;

            const body = {
                user_id: numericUserId,
                dept_id: numericDeptId,
            };

            if (
                designationId !== undefined &&
                designationId !== null &&
                designationId !== "" &&
                !Number.isNaN(Number(designationId))
            ) {
                body.designation_id = Number(designationId);
            }

            const res = await http.post(
                `/projects/${projectId}/members`,
                body,
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                }
            );
            return res.data;
        },
        onSuccess: (_, {projectId}) => {
            toast.success("Member added to project");
            queryClient.invalidateQueries(["projects", projectId, "members"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to add member");
        },
    });
}

export function useRemoveProjectMember() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({projectId, userId}) => {
            if (!accessToken) throw new Error("No access token");
            if (!projectId) throw new Error("Missing project id");
            if (!userId) throw new Error("Missing user identifier");

            const numericUserId =
                typeof userId === "string" && /^\d+$/.test(userId)
                    ? Number(userId)
                    : userId;

            const res = await http.delete(
                `/projects/${projectId}/members/${numericUserId}`,
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                }
            );

            return res.data;
        },
        onSuccess: (_, {projectId}) => {
            toast.success("Member removed from project");
            queryClient.invalidateQueries(["projects", projectId, "members"]);
        },
        onError: (error) => {
            toast.error(errText(error) || "Failed to remove member");
        },
    });
}

// ---------- New: Create Sub Project ----------

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

// --- Create Project: POST /projects
export function useCreateProject() {
  const ctx = getUserCtx();
  const accessToken = ctx?.accessToken || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      if (!accessToken) throw new Error("No access token");
      const res = await http.post("/projects", payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      // refresh lists
      queryClient.invalidateQueries(["projects", "all"]);
    },
    onError: (error) => {
      toast.error(errText(error) || "Failed to create project");
    },
  });
}

