// src/config/navigation.js
import {
    LayoutDashboard,
    KanbanSquare,
    Users,
    Settings,
    Calendar,
    BarChart3,
    UserCog,
    Target
} from "lucide-react";

/** Single source of truth for app navigation */
export const MENU = [
    {title: "Dashboard", url: "/", icon: LayoutDashboard},
    {title: "Project Page", url: "/board", icon: KanbanSquare},
    {title: "Calendar", url: "/calendar", icon: Calendar},
    {title: "Attendance", url: "/attendance", icon: Users},
    {
        title: "Project Section",
        url: "/project",
        icon: Target,
        children: [
            {title: "Project Dashboard", url: "/project"},
            {title: "Create Project", url: "/project/add"},
        ],
    },
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
        title: "Organisation",
        url: "/team",
        icon: Users,
        children: [
            {title: "Organisation Dashboard", url: "/team"},
            {title: "Organisation Tree", url: "/team/org"},
            {title: "Departments", url: "/team/departments"},
            {title: "Sub - Departments", url: "/team/org/sub-departments"},
            {title: "Designations", url: "/team/org/designations"},
            {title: "Quick Add", url: "/team/org/quick-add"},
        ],
    },
    {
        title: "Employees Section",
        url: "/employees-section",
        icon: UserCog,
        children: [
            {title: "Employees Dashboard", url: "/employees-section/dashboard"},
            {title: "Add Employees", url: "/employees-section/add"},
        ],
    },

    {title: "Settings", url: "/settings", icon: Settings},
];

/** Flatten MENU into a { path: label } map */
export function buildLabelMap(menu = MENU) {
    const map = {};
    const visit = (items) => {
        items.forEach((it) => {
            if (it.url && it.title) map[it.url] = it.title;
            if (Array.isArray(it.children) && it.children.length) visit(it.children);
        });
    };
    visit(menu);
    // Make sure root is named
    if (!map["/"]) map["/"] = "Dashboard";
    return map;
}

/** Pretty-fallback for unknown segments (e.g., IDs) */
function prettify(seg) {
    try {
        const s = decodeURIComponent(seg);
        // Turn "sub-departments" -> "Sub Departments"
        return s
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (m) => m.toUpperCase());
    } catch {
        return seg;
    }
}

/** Compute breadcrumbs from pathname using the label map */
export function getBreadcrumbs(pathname, labelMap) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
        return [{path: "/", label: labelMap["/"] || "Dashboard"}];
    }
    const acc = [];
    let built = "";
    segments.forEach((seg) => {
        built += `/${seg}`;
        acc.push({path: built, label: labelMap[built] || prettify(seg)});
    });
    return [{path: "/", label: labelMap["/"] || "Dashboard"}, ...acc];
}

/** Determine if a parent item should appear active for a pathname */
export function parentIsActive(pathname, parentUrl, children = []) {
    if (pathname === parentUrl) return true;
    if (pathname.startsWith(parentUrl + "/")) return true;
    return children.some(
        (c) => pathname === c.url || pathname.startsWith(c.url + "/")
    );
}
