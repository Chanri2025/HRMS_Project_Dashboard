import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";
import {toast} from "sonner";
import {errText} from "@/lib/errText";

/**
 * Resolve dept_id from user context / raw storage.
 */
function getDeptIdFromCtx(ctx) {
    const raw = ctx?.raw || {};

    return (
        ctx?.employee?.dept_id ??
        ctx?.user?.employee?.dept_id ??
        ctx?.me?.employee?.dept_id ??
        ctx?.dept_id ??
        raw?.employee?.dept_id ??
        raw?.dept_id ??
        null
    );
}

/**
 * useDeptMembers
 *  - If deptIdOverride is provided, uses that.
 *  - Otherwise infers dept_id from current user's context.
 *  - Calls GET /auth/members?dept_id={dept_id}
 *  - Returns backend rows as-is (including user_id, dept_id).
 */
export function useDeptMembers(deptIdOverride) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";

    const deptId = useMemo(
        () => deptIdOverride ?? getDeptIdFromCtx(ctx),
        [deptIdOverride, ctx]
    );

    const enabled = Boolean(accessToken) && Boolean(deptId);

    return useQuery({
        queryKey: ["deptMembers", deptId],
        enabled,
        queryFn: async () => {
            try {
                const res = await http.get("/auth/members", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {dept_id: deptId},
                });

                const data = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.data)
                        ? res.data.data
                        : [];

                return data;
            } catch (error) {
                toast.error(errText(error) || "Failed to load department members");
                throw error;
            }
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}
