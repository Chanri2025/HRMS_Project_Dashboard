// src/Component/Utils/SignInForm.jsx
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import InputField from "../Utils/InputField";
import {API_URL as RAW_API_URL} from "@/config.js";
import {toast} from "react-toastify";
import axios from "axios";

// Normalize API base, avoid trailing slash issues
const API_URL = String(RAW_API_URL || "").trim().replace(/\/+$/, "");
const join = (base, path) => `${base}/${String(path || "").replace(/^\/+/, "")}`;

// small helpers for cookies
const setCookie = (name, value, minutes = 10, sameSite = "Lax") => {
    if (!value) return;
    const maxAge = Math.max(1, Math.floor(minutes * 60)); // seconds
    const isSecure = window.location.protocol === "https:";
    document.cookie =
        `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=${sameSite}` +
        (isSecure ? "; Secure" : "");
};

const deleteCookie = (name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const SignInForm = ({setIsAuthenticated}) => {
    const [email, setEmail] = useState(""); // using email
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const resp = await fetch(join(API_URL, "/auth/login"), {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            const data = await resp.json();

            if (resp.ok) {
                // Combine user + tokens so refresher can read refresh_token from userData
                const combinedUserData = {
                    ...(data.user ?? {}),
                    access_token: data.access_token || null,
                    refresh_token: data.refresh_token || null,
                };

                // Store userData in BOTH storages (back-compat with your utilities)
                sessionStorage.setItem("userData", JSON.stringify(combinedUserData));
                localStorage.setItem("userData", JSON.stringify(combinedUserData));

                // Keep credentials ephemeral (optional)
                sessionStorage.setItem("userCredentials", JSON.stringify({email, password}));

                // Set axios default Authorization for subsequent axios calls
                if (data.access_token) {
                    axios.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
                } else {
                    delete axios.defaults.headers.common.Authorization;
                }

                // Cookies:
                // access_token ~10 minutes
                if (data.access_token) {
                    setCookie("access_token", data.access_token, 10, "Lax");
                } else {
                    deleteCookie("access_token");
                }
                // refresh_token ~7 days (use SameSite=Lax for same-site; switch to None if cross-site + HTTPS)
                if (data.refresh_token) {
                    setCookie("refresh_token", data.refresh_token, 7 * 24 * 60, "Lax");
                } else {
                    deleteCookie("refresh_token");
                }

                toast.success("Logged in successfully!");
                setIsAuthenticated(true);
                navigate("/menu");
            } else {
                const msg = data.detail || data.message || "Invalid credentials";
                setError(msg);
                deleteCookie("access_token");
                deleteCookie("refresh_token");
                sessionStorage.removeItem("userCredentials");
                localStorage.removeItem("userData");
                sessionStorage.removeItem("userData");
                delete axios.defaults.headers.common.Authorization;
                setIsAuthenticated(false);
                toast.error(msg);
            }
        } catch (err) {
            const msg = "Something went wrong. Please try again.";
            setError(msg);
            deleteCookie("access_token");
            deleteCookie("refresh_token");
            sessionStorage.removeItem("userCredentials");
            localStorage.removeItem("userData");
            sessionStorage.removeItem("userData");
            delete axios.defaults.headers.common.Authorization;
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center w-[350px] justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="max-w-sm mx-auto p-6 bg-transparent rounded-lg flex flex-col gap-4 w-[350px]"
            >
                <h2 className="text-xl font-semibold text-center text-gray-700">Sign In</h2>

                <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
};

export default SignInForm;
