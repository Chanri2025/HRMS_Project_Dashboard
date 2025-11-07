import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

function normalizeSubProject(row = {}) {
    return {
        id: row.subproject_id ?? row.id,
        projectId: row.project_id ?? null,
        description: row.description || "",
        status: row.project_status || row.status || "Unknown",
        assignedBy: row.assigned_by ?? null,
        assignedTo: row.assigned_to ?? null,
        createdOn: row.created_on || row.createdAt || null,
        lastModified: row.last_modified || row.updatedAt || null,
    };
}

export function useSubProjects() {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";

    const enabled = Boolean(accessToken);

    const query = useQuery({
        queryKey: ["sub-projects"],
        enabled,
        queryFn: async () => {
            const res = await http.get("/sub-projects", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const arr = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];

            return arr.map(normalizeSubProject);
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const list = Array.isArray(query.data) ? query.data : [];

    const total = list.length;
    const completed = list.filter(
        (sp) => (sp.status || "").toLowerCase() === "completed"
    );
    const active = list.filter(
        (sp) => (sp.status || "").toLowerCase() === "active"
    );

    const completedCount = completed.length;
    const activeCount = active.length;
    const completionPercent =
        total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
        ...query,
        subProjects: list,
        total,
        completedCount,
        activeCount,
        completionPercent,
    };
}
