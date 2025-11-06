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
                               }) => {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${iconWrapClass}`}>{icon}</div>
                {badgeText ? (
                    <Badge variant="outline" className={badgeClass}>
                        {badgeText}
                    </Badge>
                ) : null}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
            <p className="text-sm text-muted-foreground">{label}</p>
        </Card>
    );
};
