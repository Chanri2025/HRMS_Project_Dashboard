import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Bell, LogOut as LogOutIcon} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import ConfirmDialog from "@/Utils/ConfirmDialog.jsx";
import {stopTokenRefresher} from "@/lib/tokenRefresher.js";
import UserProfileModal from "@/Component/Profile/UserProfileModal.jsx";

/* -------------------- Helpers -------------------- */
const getUserData = () => {
    try {
        return JSON.parse(sessionStorage.getItem("userData") || "null");
    } catch {
        return null;
    }
};

const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);
    if (!words.length) return "U";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
};

/* -------------------- Component -------------------- */
/**
 * This component is rendered INSIDE the top bar from App.jsx.
 * It should NOT create another header or sticky container.
 */
export default function HeaderBar({setIsAuthenticated}) {
    const navigate = useNavigate();
    const user = getUserData();
    const displayName =
        user?.full_name || user?.name || user?.username || "User";
    const initials = getInitials(displayName);

    const [logoutOpen, setLogoutOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            stopTokenRefresher?.();

            // Clear cookies
            document.cookie.split(";").forEach((c) => {
                const eqPos = c.indexOf("=");
                const name = (eqPos > -1 ? c.substr(0, eqPos) : c).trim();
                if (!name) return;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });

            // Clear storages
            localStorage.clear();
            sessionStorage.clear();

            // Clear caches
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((name) => caches.delete(name)));
            }

            // Unregister SWs
            if ("serviceWorker" in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map((r) => r.unregister()));
            }

            // Remove axios auth header
            delete axios.defaults.headers.common.Authorization;

            setIsAuthenticated?.(false);

            navigate("/login", {replace: true});
            window.location.reload();
        } catch (err) {
            console.error("Logout cleanup failed:", err);
            navigate("/login", {replace: true});
        }
    };

    return (
        <>
            {/* Right-side control strip */}
            <div
                className={`
          flex items-center gap-2 sm:gap-3
          flex-shrink-0
        `}
            >
                {/* Notifications */}
                <Button
                    size="icon"
                    variant="ghost"
                    className={`
            rounded-full border border-sky-100
            bg-sky-50/40 text-sky-600
            hover:bg-sky-100 hover:text-sky-700
            shadow-none
          `}
                    title="Notifications"
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4"/>
                </Button>

                {/* Avatar + dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={`
                w-10 h-10 rounded-full
                bg-gradient-to-br from-sky-500 to-indigo-500
                text-white flex items-center justify-center
                font-semibold text-sm
                shadow-sm
                hover:shadow-md hover:scale-[1.03]
                outline-none focus-visible:ring-2 focus-visible:ring-sky-400
                transition-all
              `}
                            title={displayName}
                            aria-label="Account menu"
                        >
                            {initials}
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-52 shadow-lg border border-slate-100"
                    >
                        <DropdownMenuLabel className="truncate max-w-[11rem] text-slate-800">
                            {displayName}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/settings")}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => setLogoutOpen(true)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <LogOutIcon className="h-4 w-4 mr-2"/>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Desktop-only Logout; mobile uses dropdown */}
                <Button
                    onClick={() => setLogoutOpen(true)}
                    variant="outline"
                    className={`
            hidden sm:inline-flex
            h-9 px-3 gap-1 rounded-lg
            border-red-200 text-red-600
            hover:bg-red-50 hover:text-red-700
            transition-all text-sm font-medium
            whitespace-nowrap
          `}
                    title="Logout"
                >
                    <LogOutIcon className="h-4 w-4"/>
                    <span>Logout</span>
                </Button>
            </div>

            {/* Modals (rendered via portal, safe outside layout flow) */}
            <ConfirmDialog
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
                title="Logout Confirmation"
                description="Are you sure you want to log out?"
                confirmText="Logout"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleLogout}
            />

            <UserProfileModal open={profileOpen} onOpenChange={setProfileOpen}/>
        </>
    );
}
