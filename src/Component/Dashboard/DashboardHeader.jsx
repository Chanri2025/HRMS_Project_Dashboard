import React from "react";
import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";

export const DashboardHeader = ({title, subtitle, ctaLabel, onCta, children}) => {
    return (
        <div
            className="
                flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                bg-gradient-to-br from-white/60 via-slate-50/80 to-sky-50/60
                backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 shadow-sm
                transition-all duration-300 hover:shadow-md
            "
        >
            {/* Title + Subtitle */}
            <div className="flex flex-col space-y-1">
                <h1
                    className="
                        text-3xl font-bold tracking-tight text-slate-800
                        bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-sky-700 to-indigo-600
                    "
                >
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-sm md:text-base text-slate-600">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
                {ctaLabel && (
                    <Button
                        onClick={onCta}
                        className="
                            flex items-center gap-2 px-5 py-2 font-medium text-sm
                            bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500
                            text-white rounded-m shadow-sm
                            transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
                            hover:from-sky-600 hover:via-indigo-600 hover:to-violet-600
                            active:scale-[0.98]
                        "
                    >
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4 ml-1"/>
                    </Button>
                )}

                {children && <div
                    className="flex items-center gap-2"
                >{children}</div>}
            </div>
        </div>
    );
};
