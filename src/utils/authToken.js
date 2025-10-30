// src/utils/authToken.js
// Reads access token from cookie first, then falls back to local/session storage.

const COOKIE_KEYS = ["access_token", "accessToken", "jwt", "Authorization"];

// Simple cookie parser
export function readCookie(name) {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

// Try: cookie -> localStorage.userData.access_token -> localStorage.access_token -> sessionStorage
export function getAccessToken() {
    // 1) Cookies (if not HttpOnly)
    for (const key of COOKIE_KEYS) {
        const val = readCookie(key);
        if (val) {
            // common case: cookie may be "Bearer <token>" or just the token
            if (val.startsWith("Bearer ")) return val.slice(7).trim();
            return val.trim();
        }
    }

    // 2) localStorage.userData
    try {
        const raw = localStorage.getItem("userData") || sessionStorage.getItem("userData");
        if (raw) {
            const ud = JSON.parse(raw);
            if (ud?.access_token) return ud.access_token;
            if (ud?.token) return ud.token;
        }
    } catch {
    }

    // 3) localStorage/sessionStorage loose keys
    const direct = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (direct) return direct;

    return null;
}

export function makeAuthHeaders(extra = {}) {
    const token = getAccessToken();
    return token
        ? {...extra, Authorization: `Bearer ${token}`}
        : {...extra};
}

// Optional: a tiny axios helper that always injects Authorization before requests.
import axios from "axios";

export function createAxiosWithAuth(baseURL = "") {
    const instance = axios.create({
        baseURL: String(baseURL || "").replace(/\/+$/, ""), // no trailing slash
        withCredentials: true,
    });

    instance.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token) {
            config.headers = {...(config.headers || {}), Authorization: `Bearer ${token}`};
        }
        return config;
    });

    return instance;
}
