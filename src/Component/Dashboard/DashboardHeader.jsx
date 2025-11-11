import React from "react";
import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";

export const DashboardHeader = ({title, subtitle, ctaLabel, onCta, children}) => {
    return (
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                {subtitle && (
                    <p className="text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {ctaLabel && (
                    <Button onClick={onCta} className="flex items-center gap-2">
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4"/>
                    </Button>
                )}
                {/* Extra actions injected from parent, e.g. Add Scrum */}
                {children}
            </div>
        </div>
    );
};
