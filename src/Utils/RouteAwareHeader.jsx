// src/Utils/RouteAwareHeader.jsx
import React from "react";
import {useLocation} from "react-router-dom";
import {SidebarTrigger} from "@/components/ui/sidebar";
import AppBreadcrumbs from "@/Utils/AppBreadcrumbs.jsx";
import HeaderBar from "@/Utils/HeaderBar.jsx";

function isProjectRoute(path) {
    // any route where the Project page renders its own big header
    return path.startsWith("/project") || path.startsWith("/board");
}

export default function RouteAwareHeader() {
    const {pathname} = useLocation();

    if (isProjectRoute(pathname)) {
        // Slim breadcrumb strip for project routes (avoids double header)
        return (
            <div className="border-b bg-card">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        <SidebarTrigger/>
                        <AppBreadcrumbs/>
                    </div>
                    {/* keep right side minimal (or remove if you want absolutely nothing) */}
                     <HeaderBar />
                </div>
            </div>
        );
    }

    // Regular header everywhere else
    return (
        <div className="border-b bg-card">
            <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                    <SidebarTrigger/>
                    <AppBreadcrumbs/>
                </div>
                <HeaderBar/>
            </div>
        </div>
    );
}
