import React from "react";
import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";

export const DashboardHeader = ({title, subtitle, ctaLabel, onCta}) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            {ctaLabel && (
                <Button onClick={onCta}>
                    {ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            )}
        </div>
    );
};
