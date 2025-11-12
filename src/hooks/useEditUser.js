// src/hooks/useEditUser.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

function errText(err, fb = "Request failed") {
    const d = err?.response?.data?.detail;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join("; ");
    if (typeof d === "string") return d;
    if (d && typeof d === "object") return JSON.stringify(d);
    return err?.response?.data?.message || err?.message || fb;
}

function coerceNullableIds(patch) {
    const keys = ["dept_id", "sub_dept_id", "designation_id"];
    const out = {...patch};
    keys.forEach((k) => {
        if (out[k] === "" || out[k] === undefined) out[k] = null;
    });
    return out;
}

export function useEditUser(options = {}) {
    const qc = useQueryClient();
    const me = getUserCtx();

    return useMutation({
        mutationFn: async ({userId, patch}) => {
            if (userId == null) throw new Error("userId is required");
            const body = coerceNullableIds(patch);
            const isSelf = Number(userId) === Number(me?.userId);
            const url = isSelf ? "/auth/me/profile" : `/auth/users/${userId}`;
            const res = await http.patch(url, body);
            return res.data;
        },
        onSuccess: (_data, vars) => {
            // refresh the users table
            qc.invalidateQueries({queryKey: ["auth", "users"]});
            options?.onSuccess?.(_data, vars);
        },
        onError: (err, vars, ctx) => {
            options?.onError?.(errText(err), err, vars, ctx);
        },
    });
}
