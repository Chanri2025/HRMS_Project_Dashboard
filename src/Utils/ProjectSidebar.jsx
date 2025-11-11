// src/components/ProjectSidebar.jsx
import React, {useMemo} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {ChevronRight} from "lucide-react";
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

import {MENU, parentIsActive} from "@/Utils/navigation";

export function ProjectSidebar() {
    const {pathname} = useLocation();

    const items = useMemo(
        () =>
            MENU.map((item) => ({
                ...item,
                isActive: parentIsActive(pathname, item.url, item.children),
            })),
        [pathname]
    );

    return (
        <Sidebar>
            <SidebarContent>
                <div className="px-6 py-4">
                    <h1 className="text-xl font-bold text-foreground">Appynitty</h1>
                    <p className="text-sm text-muted-foreground">Project Management</p>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const Icon = item.icon;

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
                                                    {Icon ? <Icon className="h-4 w-4"/> : null}
                                                    <span>{item.title}</span>
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
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
                            {Icon ? <Icon className="h-4 w-4"/> : null}
                              {item.title}
                          </span>
                                                    <ChevronRight
                                                        className={[
                                                            "h-4 w-4 transition-transform duration-200 ease-out",
                                                            "group-data-[state=open]/coll:rotate-90",
                                                            "active:scale-95",
                                                        ].join(" ")}
                                                    />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

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
