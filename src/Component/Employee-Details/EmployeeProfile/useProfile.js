import {useEffect, useState, useCallback} from "react";
import {fetchMe, patchUserCore, patchMyPhoto} from "./profileApi";
import {toast} from "react-toastify";

export function useProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const me = await fetchMe();
            setProfile(me);
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.detail || "Could not load profile");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const updateCore = useCallback(
        async ({full_name}) => {
            if (!profile?.user_id) return;
            await patchUserCore(profile.user_id, {full_name});
            await load();
        },
        [profile?.user_id, load]
    );

    const updatePhoto = useCallback(
        async (base64OrDataUrl) => {
            await patchMyPhoto(
                base64OrDataUrl.startsWith("data:")
                    ? base64OrDataUrl
                    : `data:image/jpeg;base64,${base64OrDataUrl}`
            );
            await load();
        },
        [load]
    );

    return {profile, loading, reload: load, updateCore, updatePhoto};
}
