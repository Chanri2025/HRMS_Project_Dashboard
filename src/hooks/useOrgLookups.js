import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

function useOne(endpoint, id, pick) {
    const {accessToken} = getUserCtx();
    const enabled = Boolean(id && accessToken);

    return useQuery({
        queryKey: [endpoint, id],
        enabled,
        queryFn: async () => {
            const res = await http.get(`${endpoint}/${id}`, {
                // Usually interceptor is enough; being explicit never hurts:
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            const data = res.data || {};
            return pick(data);
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}

export function useDepartmentName(id) {
    return useOne("/org/departments", id, (d) => d.dept_name || "");
}

export function useSubDepartmentName(id) {
    return useOne("/org/sub-departments", id, (d) => d.sub_dept_name || d.name || "");
}

export function useDesignationName(id) {
    return useOne("/org/designations", id, (d) => d.designation_name || d.name || "");
}
