import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, LogOut as LogOutIcon } from "lucide-react";
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
import { stopTokenRefresher } from "@/lib/tokenRefresher.js";
import UserProfileModal from "@/Component/Profile/UserProfileModal.jsx";

/* -------------------- Helpers -------------------- */
const deleteCookie = (name) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const getUserData = () => {
  try {
    return JSON.parse(sessionStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
};

const getInitials = (name = "") => {
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
};

/* -------------------- Component -------------------- */
export default function HeaderBar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const user = getUserData();
  const displayName = user?.full_name || user?.name || user?.username || "User";
  const initials = getInitials(displayName);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    stopTokenRefresher();
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    sessionStorage.removeItem("userCredentials");
    sessionStorage.removeItem("userData");
    delete axios.defaults.headers.common.Authorization;
    setIsAuthenticated?.(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-14 items-center px-4 justify-between w-full">
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <Button
          size="icon"
          className="rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Avatar opens dropdown (no name button) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-semibold text-sm hover:bg-sky-600 transition"
              title="Account"
              aria-label="Account menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout button */}
        <Button
          onClick={() => setLogoutOpen(true)}
          variant="destructive"
          size="icon"
          className="rounded-sm w-30 h-10 flex items-center justify-center pl-2 pr-2"
          title="Logout"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Logout confirm */}
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

      {/* Profile modal */}
      <UserProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
