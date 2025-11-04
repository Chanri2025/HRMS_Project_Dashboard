// src/components/ProjectSidebar.jsx
import React, {useMemo} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {
    LayoutDashboard,
    KanbanSquare,
    Users,
    Settings,
    Calendar,
    BarChart3,
    ChevronRight,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

/** 👉 You can freely edit this structure. Nested `children` renders a collapsible submenu. */
const menuItems = [
    {title: "Dashboard", url: "/", icon: LayoutDashboard},
    {title: "Board", url: "/board", icon: KanbanSquare},
    {title: "Calendar", url: "/calendar", icon: Calendar},
    {title: "Attendance", url: "/attendance", icon: Users},

    {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
        children: [
            {title: "Overview", url: "/reports/overview"},
            {title: "Sales", url: "/reports/sales"},
            {title: "Team Performance", url: "/reports/team-performance"},
        ],
    },
    {
        title: "Organisations",
        url: "/team",
        icon: Users,
        children: [
            {title: "Home", url: "/team"},
            {title: "Organisation Tree", url: "/team/org"},
            {title: "Departments", url: "/team/departments"},
            {title: "Sub - Departments", url: "/team/org/sub-departments"},
            {title: "Designations", url: "/team/org/designations"},
            {title: "Quick Add", url: "/team/org/quick-add"},
        ],
    },
    {title: "Settings", url: "/settings", icon: Settings},
];

function ParentIsActive(pathname, parentUrl, children = []) {
    if (pathname === parentUrl) return true;
    if (pathname.startsWith(parentUrl + "/")) return true;
    return children.some(
        (c) => pathname === c.url || pathname.startsWith(c.url + "/")
    );
}

export function ProjectSidebar() {
    const {pathname} = useLocation();

    const items = useMemo(
        () =>
            menuItems.map((item) => ({
                ...item,
                isActive: ParentIsActive(pathname, item.url, item.children),
            })),
        [pathname]
    );

    return (
        <Sidebar>
            <SidebarContent>
                <div className="px-6 py-4">
                    <h1 className="text-xl font-bold text-foreground">SprintFlow</h1>
                    <p className="text-sm text-muted-foreground">Project Management</p>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const Icon = item.icon;

                                // -------- Simple link (no children)
                                if (!item.children?.length) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <NavLink
                                                    to={item.url}
                                                    end
                                                    className={({isActive}) =>
                                                        [
                                                            "flex items-center gap-2 rounded-lg transition-colors duration-200",
                                                            "ring-1 ring-transparent hover:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring",
                                                            isActive
                                                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                                : "hover:bg-sidebar-accent/50",
                                                        ].join(" ")
                                                    }
                                                >
                                                    <Icon className="h-4 w-4"/>
                                                    <span>{item.title}</span>
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }

                                // -------- Collapsible group (has children)
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        {/* Use a group to style child elements based on open/closed state */}
                                        <Collapsible defaultOpen={item.isActive} className="group/coll">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    className={[
                                                        "w-full justify-between rounded-lg transition-all duration-200",
                                                        "ring-1 ring-transparent hover:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring",
                                                        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                                                        item.isActive
                                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                            : "hover:bg-sidebar-accent/50",
                                                    ].join(" ")}
                                                >
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4"/>
                              {item.title}
                          </span>

                                                    {/* Arrow with smooth rotation + subtle scale on press */}
                                                    <ChevronRight
                                                        className={[
                                                            "h-4 w-4 transition-transform duration-200 ease-out",
                                                            "group-data-[state=open]/coll:rotate-90",
                                                            "active:scale-95",
                                                        ].join(" ")}
                                                    />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            {/* Animated content:
                          - fade & slide
                          - smooth height using transition-all
                      */}
                                            <CollapsibleContent
                                                className={[
                                                    "overflow-hidden pl-8",
                                                    "transition-all data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=open]:duration-300",
                                                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=closed]:duration-200",
                                                ].join(" ")}
                                            >
                                                <div className="mt-1 flex flex-col gap-1">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.title}
                                                            to={child.url}
                                                            end
                                                            className={({isActive}) =>
                                                                [
                                                                    "block rounded-md px-2 py-1.5 text-sm transition-colors duration-200",
                                                                    "ring-1 ring-transparent hover:ring-ring/20 focus-visible:ring-2 focus-visible:ring-ring",
                                                                    isActive
                                                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                                                                ].join(" ")
                                                            }
                                                        >
                                                            {child.title}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
