import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL as RAW_API_URL } from "@/config.js";

// Normalize API base
const API_URL = String(RAW_API_URL || "")
  .trim()
  .replace(/\/+$/, "");
const join = (base, path) =>
  `${base}/${String(path || "").replace(/^\/+/, "")}`;

// Cookies
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

const SignInForm = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState(""); // email login
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (resp.ok) {
        // merge user + tokens
        const combinedUserData = {
          ...(data.user ?? {}),
          access_token: data.access_token || null,
          refresh_token: data.refresh_token || null,
        };

        // persist (both for backward compat)
        sessionStorage.setItem("userData", JSON.stringify(combinedUserData));
        localStorage.setItem("userData", JSON.stringify(combinedUserData));

        // ephemeral creds (optional)
        sessionStorage.setItem(
          "userCredentials",
          JSON.stringify({ email, password })
        );

        // axios default auth
        if (data.access_token) {
          axios.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        } else {
          delete axios.defaults.headers.common.Authorization;
        }

        // cookies
        if (data.access_token)
          setCookie("access_token", data.access_token, 10, "Lax");
        else deleteCookie("access_token");

        if (data.refresh_token)
          setCookie("refresh_token", data.refresh_token, 7 * 24 * 60, "Lax");
        else deleteCookie("refresh_token");

        toast.success("Logged in successfully!");
        setIsAuthenticated(true);
        navigate("/"); // <-- go to your app home (valid route)
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
    } catch {
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
        className="max-w-sm mx-auto p-6 bg-transparent rounded-lg flex flex-col gap-4 w-[350px]">
        <h2 className="text-xl font-semibold text-center text-gray-700">
          Sign In
        </h2>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
