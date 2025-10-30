// src/Component/Menu/Menu.jsx
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import menuItems from "@/Component/Menu/menuConfig.jsx";

// Normalize like the backend: spaces/underscores -> hyphens, uppercase
const normalizeRole = (v) =>
    (v || "")
        .toString()
        .trim()
        .replace(/[ _]/g, "-")
        .toUpperCase();

const Menu = () => {
    const [role, setRole] = useState("EMPLOYEE"); // store normalized
    const navigate = useNavigate();

    useEffect(() => {
        try {
            // Prefer sessionStorage; fallback to localStorage for backward compat
            const raw = sessionStorage.getItem("userData");
            if (raw) {
                const userData = JSON.parse(raw);
                // backend might return role or roles[]
                const rawRole =
                    userData?.role ||
                    (Array.isArray(userData?.roles) && userData.roles.length ? userData.roles[0] : null);
                if (rawRole) setRole(normalizeRole(rawRole));
            }
        } catch (e) {
            console.error("Failed to parse userData:", e);
        }
    }, []);

    const filteredItems = menuItems.filter((item) =>
        (item.allowedRoles || []).some((r) => normalizeRole(r) === role)
    );

    return (
        <div className="min-h-screen p-6 flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {filteredItems.map((item) => (
                    <div
                        key={item.key}
                        onClick={() => navigate(`/menu/${item.key}`)}
                        className={`
              ${item.bgClass}
              dark:bg-gray-800/80 backdrop-blur-md
              p-6 rounded-lg
              shadow hover:shadow-lg
              cursor-pointer text-center
              transition-all
              flex flex-col items-center gap-3
            `}
                    >
                        {item.icon}
                        <div className="text-lg font-medium text-gray-800 dark:text-white">
                            {item.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menu;
