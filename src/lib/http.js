import axios from "axios";
import {API_URL} from "@/config";

/* ------------ safe browser guards ------------ */
function isBrowser() {
    return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function getItemSafe(storage, key) {
    try {
        return storage?.getItem?.(key) ?? null;
    } catch {
        return null;
    }
}

function parseJSONSafe(raw) {
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/* ------------ find user object across stores/keys ------------ */
function readUserObject() {
    if (!isBrowser()) return null;

    // try sessionStorage then localStorage
    const stores = [window.sessionStorage, window.localStorage];
    const keys = ["user_data", "userData"];

    for (const store of stores) {
        for (const key of keys) {
            const raw = getItemSafe(store, key);
            const obj = parseJSONSafe(raw);
            if (obj && (obj.user_id != null || obj.id != null || obj.access_token)) {
                return obj;
            }
        }
    }
    return null;
}

/* ------------ public: normalized user context ------------ */
export function getUserCtx() {
    const obj = readUserObject() || {};
    const userIdRaw = obj?.user_id ?? obj?.id ?? 0;

    return {
        userId: Number(userIdRaw) || 0,                 // ← always a number
        accessToken: obj?.access_token || "",
        role: obj?.role || "",
        fullName: obj?.full_name || "",
        email: obj?.email || "",
        raw: obj, // optional: handy when debugging
    };
}

/* ------------ shared axios client ------------ */
export const http = axios.create({
    baseURL: (API_URL || "").replace(/\/+$/, ""),
    headers: {"Content-Type": "application/json"},
});

// Attach token on every request
http.interceptors.request.use((config) => {
    const {accessToken} = getUserCtx();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});
