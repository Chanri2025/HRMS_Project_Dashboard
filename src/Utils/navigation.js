// src/config/navigation.js
import {
    LayoutDashboard,
    KanbanSquare,
    Users,
    Settings,
    Calendar,
    BarChart3,
    UserCog,
    Target,
} from "lucide-react";

/** Role constants */
export const ALL_ROLES = [
    "SUPER-ADMIN",
    "ADMIN",
    "MANAGER",
    "EMPLOYEE",
    "USER",
];

/** Get current role from sessionStorage (fallback to USER) */
export function getCurrentRole() {
    try {
        const raw = sessionStorage.getItem("userData");
        if (raw) {
            const parsed = JSON.parse(raw);
            const role = String(parsed?.role || "USER").toUpperCase();
            if (ALL_ROLES.includes(role)) return role;
        }
    } catch {
    }
    return "USER";
}

/** Guard */
function isAllowed(allowedRoles, role) {
    const list =
        Array.isArray(allowedRoles) && allowedRoles.length
            ? allowedRoles
            : ALL_ROLES;
    return list.includes(role);
}

/** Single source of truth for app navigation (role-aware via allowedRoles) */
export const MENU = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        allowedRoles: ALL_ROLES, // everyone
    },
    {
        title: "Project Page",
        url: "/board",
        icon: KanbanSquare,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"],
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
    },
    {
        title: "Attendance",
        url: "/attendance",
        icon: Users,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
    },
    {
        title: "Project Section",
        url: "/project",
        icon: Target,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"],
        children: [
            {
                title: "Project Dashboard",
                url: "/project",
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"],
            },
            {
                title: "Create Project",
                url: "/project/add",
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"],
            },
            {
                title: "Scrum Dashboard",
                url: "/project/scrum",
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"],
            },
        ],
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
        children: [
            {
                title: "Overview",
                url: "/reports",
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
            },
            {
                title: "Sales",
                url: "/reports",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
            {
                title: "Team Performance",
                url: "/reports",
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
            },
        ],
    },
    {
        title: "Organisation",
        url: "/team",
        icon: Users,
        allowedRoles: ["SUPER-ADMIN", "ADMIN"],
        children: [
            {
                title: "Organisation Dashboard",
                url: "/team",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
            {
                title: "Organisation Tree",
                url: "/team/org",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
            {
                title: "Departments",
                url: "/team/departments",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
            {
                title: "Sub - Departments",
                url: "/team/org/sub-departments",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
            {
                title: "Designations",
                url: "/team/org/designations",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
            {
                title: "Quick Add",
                url: "/team/org/quick-add",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
        ],
    },
    {
        title: "Employees Section",
        url: "/employees-section",
        icon: UserCog,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
        children: [
            {
                title: "Employees Dashboard",
                url: "/employees-section/dashboard",
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
            },
            {
                title: "Add Employees",
                url: "/employees-section/add",
                allowedRoles: ["SUPER-ADMIN", "ADMIN"],
            },
        ],
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        allowedRoles: ["SUPER-ADMIN", "ADMIN", "MANAGER"],
    },
];

/** Filter the MENU based on role (also filters children) */
export function filterMenuByRole(menu, role) {
    return (menu || []).reduce((acc, item) => {
        if (!isAllowed(item.allowedRoles, role)) return acc;

        let children; // keep undefined unless there are visible children
        if (Array.isArray(item.children) && item.children.length) {
            const filteredKids = item.children.filter((c) =>
                isAllowed(c.allowedRoles, role)
            );
            if (filteredKids.length) children = filteredKids;
        }

        acc.push({...item, children});
        return acc;
    }, []);
}

/** Flatten MENU into a { path: label } map (pass filtered menu for visible-only labels) */
export function buildLabelMap(menu = MENU) {
    const map = {};
    const visit = (items) => {
        items.forEach((it) => {
            if (it.url && it.title) map[it.url] = it.title;
            if (Array.isArray(it.children) && it.children.length) visit(it.children);
        });
    };
    visit(menu);
    if (!map["/"]) map["/"] = "Dashboard";
    return map;
}

/** Pretty-fallback for unknown segments (e.g., IDs) */
function prettify(seg) {
    try {
        const s = decodeURIComponent(seg);
        return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
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

/** Determine if a parent item should appear active for a pathname (null-safe) */
export function parentIsActive(pathname, parentUrl = "", children) {
    const kids = Array.isArray(children) ? children : [];
    if (!parentUrl) return false;

    if (pathname === parentUrl) return true;
    if (pathname.startsWith(parentUrl + "/")) return true;

    return kids.some(
        (c) =>
            (c?.url && pathname === c.url) ||
            (c?.url && pathname.startsWith(c.url + "/"))
    );
}
