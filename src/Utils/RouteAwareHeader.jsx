// src/Utils/RouteAwareHeader.jsx
import React from "react";
import {useLocation} from "react-router-dom";
import {SidebarTrigger} from "@/components/ui/sidebar";
import AppBreadcrumbs from "@/Utils/AppBreadcrumbs.jsx";
import HeaderBar from "@/Utils/HeaderBar.jsx";

function isProjectRoute(path) {
    return path.startsWith("/project") || path.startsWith("/board");
}

export default function RouteAwareHeader() {
    const {pathname} = useLocation();

    // On project routes, DON'T render a header here.
    // The Project page itself renders <ProjectHeader />, avoiding duplicates.
    if (isProjectRoute(pathname)) {
        return null;
    }

    // On all other routes, render the regular header.
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
