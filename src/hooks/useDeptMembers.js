import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

/** Safely read dept_id from session/local storage */
function getDeptIdFromStorage() {
    const raw = getUserCtx().raw || {};
    return raw?.employee?.dept_id ?? raw?.dept_id ?? null;
}

/** Create initials from name */
function initialsFromName(name = "") {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("") || "TM"
    );
}

/** Normalize API row → { name, email, phone, deptId, initials } */
function normalizeMember(row = {}) {
    const name = row.full_name || row.name || "Member";
    const email = row.email || "";
    const phone = row.phone || "";
    const deptId = row.dept_id ?? row.employee?.dept_id ?? null;
    return {name, email, phone, deptId, initials: initialsFromName(name)};
}

export function useDeptMembers(deptIdOverride) {
    const ctx = getUserCtx();
    const accessToken = ctx?.accessToken || "";
    const deptId = useMemo(
        () => deptIdOverride ?? getDeptIdFromStorage(),
        [deptIdOverride]
    );

    const enabled = Boolean(deptId && accessToken);

    const query = useQuery({
        queryKey: ["auth", "members", {deptId}],
        enabled,
        queryFn: async () => {
            const res = await http.get("/auth/members", {
                params: {dept_id: deptId},
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
            return arr.map(normalizeMember);
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {...query, deptId};
}
