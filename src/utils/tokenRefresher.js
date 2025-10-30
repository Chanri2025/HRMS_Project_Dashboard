// src/utils/tokenRefresher.js
import axios from "axios";

/* ------------------------ Small helpers ------------------------ */

// Normalize base URL: trim spaces + drop trailing slashes
const normalizeBase = (base) => String(base || "").trim().replace(/\/+$/, "");

// Join base + path without double slashes
const joinUrl = (base, path) =>
    `${normalizeBase(base)}/${String(path || "").replace(/^\/+/, "")}`;

// Read userData from either storage (keeps old setups working)
const readUserData = () => {
    const raw =
        sessionStorage.getItem("userData") || localStorage.getItem("userData");
    return raw ? JSON.parse(raw) : null;
};

const writeUserData = (ud) => {
    if (!ud) return;
    localStorage.setItem("userData", JSON.stringify(ud));
    sessionStorage.setItem("userData", JSON.stringify(ud));
};

// Decide SameSite mode automatically (Lax for same-site, None+Secure for cross-site)
const computeCookieAttrs = (apiBaseUrl) => {
    try {
        const api = new URL(normalizeBase(apiBaseUrl));
        const here = new URL(window.location.href);
        const sameSite =
            api.protocol === here.protocol && api.hostname === here.hostname && api.port === here.port;

        // Same-site → Lax+Secure; Cross-site → None; Secure
        return sameSite ? "SameSite=Lax; Secure" : "SameSite=None; Secure";
    } catch {
        return "SameSite=None; Secure";
    }
};

// Set/refresh access_token cookie (expires ~15 minutes by default)
const setAccessTokenCookie = (token, apiBaseUrl, ttlMs = 15 * 60 * 1000) => {
    if (!token) return;
    const expires = new Date(Date.now() + ttlMs).toUTCString();
    const sameSitePart = computeCookieAttrs(apiBaseUrl);
    document.cookie = `access_token=${token}; Path=/; Expires=${expires}; ${sameSitePart}`;
};

// Optional: clear cookie (e.g., on logout)
export const clearAccessTokenCookie = () => {
    document.cookie =
        "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
};

/* ------------------------ Token Refresher ------------------------ */
/**
 * Starts a background interval that refreshes JWT periodically.
 * Runs once immediately, then every `intervalMs` (default 10 min),
 * and again whenever the tab becomes visible.
 *
 * Persists refreshed tokens in:
 *  - localStorage/sessionStorage (userData)
 *  - axios default Authorization header
 *  - a browser cookie (for backend cookie-based auth)
 *
 * Returns a cleanup function to stop it.
 *
 * @param {string} apiBaseUrl e.g. "http://127.0.0.1:5000/"
 * @param {number} intervalMs default 10 minutes
 * @param {number} accessTtlMs cookie TTL (default ~15 min)
 */
export function startTokenRefresher(
    apiBaseUrl,
    intervalMs = 10 * 60 * 1000,
    accessTtlMs = 15 * 60 * 1000
) {
    let stopped = false;

    // Ensure axios sends cookies if backend uses them
    axios.defaults.withCredentials = true;

    const doRefresh = async () => {
        if (stopped) return;

        const userData = readUserData();
        const refreshToken = userData?.refresh_token;
        if (!refreshToken) return;

        try {
            const url = joinUrl(apiBaseUrl, "/auth/refresh");
            const res = await axios.post(url, {refresh_token: refreshToken});

            if (res?.data?.access_token) {
                const updated = {
                    ...userData,
                    access_token: res.data.access_token,
                    refresh_token: res.data.refresh_token || refreshToken,
                };

                // 1) Update storages
                writeUserData(updated);

                // 2) Set axios default Authorization header
                axios.defaults.headers.common.Authorization = `Bearer ${updated.access_token}`;

                // 3) Also store in cookie
                setAccessTokenCookie(updated.access_token, apiBaseUrl, accessTtlMs);

                if (process.env.NODE_ENV !== "production") {
                    console.log("✅ Token refreshed:", new Date().toLocaleTimeString());
                }
            }
        } catch (err) {
            console.error(
                "⚠️ Token refresh failed:",
                err?.response?.data || err.message
            );
        }
    };

    // Run once immediately, then on interval
    doRefresh();
    const id = setInterval(doRefresh, intervalMs);

    // Refresh when tab becomes visible (saves network while hidden)
    const visHandler = () => {
        if (document.hidden) return;
        doRefresh();
    };
    document.addEventListener("visibilitychange", visHandler);

    // Cleanup
    return () => {
        stopped = true;
        clearInterval(id);
        document.removeEventListener("visibilitychange", visHandler);
    };
}
