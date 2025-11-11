import React from "react";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

export const MetricStatCard = ({
                                   icon,
                                   iconWrapClass = "bg-muted/40",
                                   badgeText,
                                   badgeClass = "bg-muted/40 text-foreground border-border",
                                   value,
                                   label,
                                   variant = "default", // optional prop to allow color variants later
                               }) => {
    // subtle, professional gradient backgrounds
    const bgMap = {
        default: "bg-gradient-to-br from-slate-50 to-slate-100",
        blue: "bg-gradient-to-br from-sky-50 to-blue-100",
        violet: "bg-gradient-to-br from-violet-50 to-indigo-100",
        green: "bg-gradient-to-br from-emerald-50 to-teal-100",
        amber: "bg-gradient-to-br from-amber-50 to-yellow-100",
    };

    return (
        <Card
            className={`p-6 shadow-sm border border-border rounded-xl transition hover:shadow-md ${bgMap[variant] || bgMap.default}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-full shadow-inner ${iconWrapClass}`}>
                    {icon}
                </div>
                {badgeText ? (
                    <Badge variant="outline" className={`font-medium ${badgeClass}`}>
                        {badgeText}
                    </Badge>
                ) : null}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
                {value}
            </h3>
            <p className="text-sm text-accent-foreground font-medium">{label}</p>
        </Card>
    );
};
