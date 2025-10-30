// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie";
import {API_URL as RAW_API_URL} from "@/config.js";
import {startTokenRefresher} from "@/utils/tokenRefresher";

const API_URL = (RAW_API_URL || "").replace(/\/+$/, "");

// Create a pre-configured Axios instance
const axiosClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // allow cookie-based auth
});

// Request interceptor → attach Authorization header
axiosClient.interceptors.request.use(
    (config) => {
        const token =
            Cookies.get("access_token") || Cookies.get("jwt") || Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor → handle token expiry (optional)
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // if unauthorized and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await axios.post(`${API_URL}/auth/refresh`, {}, {withCredentials: true});

                // Retry the original request after refresh
                return axiosClient(originalRequest);
            } catch (refreshError) {
                console.error("Auto token refresh failed:", refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Start background refresher (optional global behavior)
startTokenRefresher(API_URL);

export default axiosClient;
