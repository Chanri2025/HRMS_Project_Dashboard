// src/components/AppBreadcrumbs.jsx
import React, {useMemo} from "react";
import {Link, useLocation} from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {buildLabelMap, getBreadcrumbs, MENU} from "@/Utils/navigation.js";

export default function AppBreadcrumbs() {
    const {pathname} = useLocation();
    const labelMap = useMemo(() => buildLabelMap(MENU), []);
    const crumbs = useMemo(() => getBreadcrumbs(pathname, labelMap), [pathname, labelMap]);
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
                                    <BreadcrumbSeparator className="mx-1 text-muted-foreground"/>
                                )}
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
