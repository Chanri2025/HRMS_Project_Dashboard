import axios from "axios";
import {API_URL as RAW_API_URL} from "@/config.js";

const API_BASE = String(RAW_API_URL || "").replace(/\/+$/, "");

function readCookie(name) {
    if (typeof document === "undefined") return null;
    const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[2]) : null;
}

export function getAccessToken() {
    const ck =
        readCookie("access_token") || readCookie("Authorization") || readCookie("jwt");
    if (ck) return ck.startsWith("Bearer ") ? ck.slice(7).trim() : ck.trim();

    try {
        const ud = JSON.parse(
            localStorage.getItem("userData") || sessionStorage.getItem("userData")
        );
        if (ud?.access_token) return ud.access_token;
        if (ud?.token) return ud.token;
    } catch {
    }

    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token") || null;
}

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const t = getAccessToken();
    if (t) {
        config.headers = {...(config.headers || {}), Authorization: `Bearer ${t}`};
    }
    return config;
});

export default api;
