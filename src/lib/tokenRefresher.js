// src/utils/tokenRefresher.js
import axios from "axios";
import { API_URL as RAW_API_URL } from "@/config.js";

// --- Config helpers ---
const API_BASE = String(RAW_API_URL || "")
  .trim()
  .replace(/\/+$/, "");
const url = (p = "") => `${API_BASE}/${String(p).replace(/^\/+/, "")}`;

// --- Cookie helpers ---
const getCookie = (name) => {
  const match = document.cookie.match(
    new RegExp("(^|; )" + encodeURIComponent(name) + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name, value, minutes = 10, sameSite = "Lax") => {
  if (!value) return;
  const maxAge = Math.max(1, Math.floor(minutes * 60)); // seconds
  const isSecure = window.location.protocol === "https:";
  document.cookie =
    `${name}=${encodeURIComponent(
      value
    )}; Max-Age=${maxAge}; Path=/; SameSite=${sameSite}` +
    (isSecure ? "; Secure" : "");
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

// --- One-shot refresh ---
export const refreshTokensOnce = async () => {
  try {
    // Prefer cookie; fallback to session-stored token
    const cookieRT = getCookie("refresh_token");
    let rt = cookieRT;
    if (!rt) {
      const u = JSON.parse(sessionStorage.getItem("userData") || "null");
      rt = u?.refresh_token || null;
    }
    if (!rt) return false;

    const resp = await fetch(url("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      // If refresh fails, drop only access token; keep RT so user might still be valid next time.
      deleteCookie("access_token");
      delete axios.defaults.headers.common.Authorization;
      return false;
    }

    const { access_token, refresh_token } = data || {};

    // Update cookies
    if (access_token) setCookie("access_token", access_token, 10, "Lax");
    if (refresh_token)
      setCookie("refresh_token", refresh_token, 7 * 24 * 60, "Lax");

    // Update axios header
    if (access_token) {
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    }

    // Merge into session userData
    try {
      const u = JSON.parse(sessionStorage.getItem("userData") || "null") || {};
      const merged = {
        ...u,
        ...(access_token ? { access_token } : {}),
        ...(refresh_token ? { refresh_token } : {}),
      };
      sessionStorage.setItem("userData", JSON.stringify(merged));
    } catch {
      /* no-op */
    }

    return true;
  } catch {
    // Network or parse error: keep current tokens as-is
    return false;
  }
};

// --- Interval manager ---
let _intervalId = null;

export const startTokenRefresher = (opts = {}) => {
  const {
    intervalMs = 5 * 60 * 1000, // 5 minutes
    runImmediately = true,
  } = opts;

  // Avoid multiple intervals if called twice
  if (_intervalId) clearInterval(_intervalId);

  const tick = () => {
    // Optional: skip when tab is hidden to save battery; remove if you want strict every-5-mins
    if (document.visibilityState === "hidden") return;
    refreshTokensOnce();
  };

  if (runImmediately) tick();
  _intervalId = setInterval(tick, intervalMs);

  // Return a stop function for cleanup
  return () => {
    if (_intervalId) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  };
};

export const stopTokenRefresher = () => {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
  // Also clear auth header if you want (optional)
  // delete axios.defaults.headers.common.Authorization;
  // deleteCookie("access_token");
  // deleteCookie("refresh_token");
};
