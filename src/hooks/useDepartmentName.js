import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

export function useDepartmentName(deptId) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const enabled = Boolean(deptId && accessToken);

    const query = useQuery({
        queryKey: ["org", "department", deptId],
        enabled,
        queryFn: async () => {
            const res = await http.get(`/org/departments/${deptId}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return res.data?.dept_name || "";
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return query;
}
