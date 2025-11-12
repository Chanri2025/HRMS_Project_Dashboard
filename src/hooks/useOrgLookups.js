import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

// ---------- Internals ----------
function toLabel(name, id, fallback = "") {
    const nm = (name ?? "").toString().trim();
    if (!nm && (id == null || id === "")) return fallback;
    if (id == null || id === "") return nm || fallback;
    return `${nm} (#${id})`;
}

function useOne(endpoint, id, pick) {
    const {accessToken} = getUserCtx();
    const enabled = Boolean(id && accessToken);

    return useQuery({
        queryKey: [endpoint, id],
        enabled,
        queryFn: async () => {
            const res = await http.get(`${endpoint}/${id}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            const data = res.data || {};
            return pick ? pick(data) : data;
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}

function useOneRaw(endpoint, id) {
    return useOne(endpoint, id, (d) => d);
}

// ---------- Existing “name-only” hooks (kept for compatibility) ----------
export function useDepartmentName(id) {
    return useOne("/org/departments", id, (d) => d.dept_name || "");
}

export function useSubDepartmentName(id) {
    return useOne("/org/sub-departments", id, (d) => d.sub_dept_name || d.name || "");
}

export function useDesignationName(id) {
    return useOne("/org/designations", id, (d) => d.designation_name || d.name || "");
}

// ---------- New “label” hooks (Name + #ID) ----------
export function useDepartmentLabel(id) {
    const q = useOneRaw("/org/departments", id);
    const name = q.data?.dept_name || q.data?.name || "";
    return {...q, label: toLabel(name, id, "Department"), id, name};
}

export function useSubDepartmentLabel(id) {
    const q = useOneRaw("/org/sub-departments", id);
    const name = q.data?.sub_dept_name || q.data?.name || "";
    return {...q, label: toLabel(name, id, "Sub-Department"), id, name};
}

export function useDesignationLabel(id) {
    const q = useOneRaw("/org/designations", id);
    const name = q.data?.designation_name || q.data?.name || "";
    return {...q, label: toLabel(name, id, "Designation"), id, name};
}

export function useUserLabel(userId) {
    const {accessToken} = getUserCtx();
    const enabled = Boolean(accessToken) && Boolean(userId);

    const q = useQuery({
        queryKey: ["users", userId, "label"],
        enabled,
        queryFn: async () => {
            const res = await http.get(`/auth/users/${userId}`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return res.data || {};
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const fullName =
        q.data?.employee?.full_name ||
        q.data?.full_name ||
        q.data?.name ||
        "User";

    return {...q, label: toLabel(fullName, userId, `User (#${userId})`), id: userId, name: fullName};
}
