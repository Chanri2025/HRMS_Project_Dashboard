import api from "./client";

export const fetchMe = async () => {
    const {data} = await api.get("/auth/me");
    return data; // shaped user
};

export const patchUserCore = async (userId, payload) => {
    // allowed: full_name, profile_photo (string), is_active
    const {data} = await api.patch(`/auth/users/${userId}`, payload);
    return data;
};

export const patchMyPhoto = async (dataUrlOrBase64) => {
    // can send full data URL or base64; server strips prefix
    const {data} = await api.patch("/auth/me/photo", {
        profile_photo: dataUrlOrBase64,
    });
    return data;
};
