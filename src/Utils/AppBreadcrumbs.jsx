// src/components/AppBreadcrumbs.jsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

/** Map each path segment (and composite path) to a label for pretty breadcrumbs. */
const LABELS = {
  "/": "Dashboard",
  "/board": "Board",
  "/calendar": "Calendar",
  "/attendance": "Attendance",
  "/reports": "Reports",
  "/reports/overview": "Overview",
  "/reports/sales": "Sales",
  "/reports/team-performance": "Team Performance",
  "/team": "Team",
  "/team/org": "Organisation",
  "/team/members": "Members",
  "/team/roles": "Roles & Access",
  "/settings": "Settings",
};

export default function AppBreadcrumbs() {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0)
      return [{ path: "/", label: LABELS["/"] || "Home" }];

    const acc = [];
    let built = "";
    segments.forEach((seg) => {
      built += `/${seg}`;
      acc.push({ path: built, label: LABELS[built] || decodeURIComponent(seg) });
    });
    return [{ path: "/", label: LABELS["/"] || "Home" }, ...acc];
  }, [pathname]);

  const last = crumbs[crumbs.length - 1]?.path;

  return (
    <div className="flex items-center">
      <Breadcrumb>
        <BreadcrumbList className="flex items-center space-x-1 text-sm text-muted-foreground">
          {crumbs.map((c, idx) => {
            const isLast = c.path === last;
            return (
              <React.Fragment key={c.path}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {c.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={c.path}
                        className="hover:text-foreground transition-colors"
                      >
                        {c.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {idx < crumbs.length - 1 && (
                  <BreadcrumbSeparator className="mx-1 text-muted-foreground" />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
