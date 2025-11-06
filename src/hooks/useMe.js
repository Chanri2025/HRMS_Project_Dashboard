import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";

/** GET /auth/me with custom header user_token */
export function useMe(enabled) {
    const {accessToken} = getUserCtx();
    const canRun = Boolean(enabled && accessToken);

    return useQuery({
        queryKey: ["auth", "me"],
        enabled: canRun,
        queryFn: async () => {
            const res = await http.get("/auth/me", {
                headers: {user_token: accessToken},
            });
            return res.data;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
}

/** PUT /auth/me/profile with Authorization: Bearer <token> */
export function useUpdateMeProfile() {
    const qc = useQueryClient();
    const {accessToken} = getUserCtx();

    return useMutation({
        mutationFn: async (payload) => {
            if (!accessToken) throw new Error("Missing access token");
            const res = await http.patch("/auth/me/profile", payload, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return res.data;
        },
        onSuccess: () => {
            // refresh the profile data
            qc.invalidateQueries({queryKey: ["auth", "me"]});
        },
    });
}
