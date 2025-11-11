import React from "react";
import {ClipboardList, CheckCircle2, Loader2} from "lucide-react";

export function ProjectHeaderStats({
                                       totalTasks = 0,
                                       doneTasks = 0,
                                       inProgressTasks = 0,
                                   }) {
    const cards = [
        {
            id: "total",
            label: "Total Tasks",
            value: totalTasks,
            icon: <ClipboardList className="h-5 w-5 text-sky-700"/>,
            gradient:
                "from-sky-300 via-sky-400 to-blue-300", // much softer
            border: "border-sky-200/100",
            textColor: "text-sky-800",
        },
        {
            id: "completed",
            label: "Completed",
            value: doneTasks,
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-700"/>,
            gradient:
                "from-emerald-300 via-green-400 to-teal-300", // softer green
            border: "border-emerald-200/100",
            textColor: "text-emerald-800",
        },
        {
            id: "inProgress",
            label: "In Progress",
            value: inProgressTasks,
            icon: <Loader2 className="h-5 w-5 text-amber-700 animate-spin-slow"/>,
            gradient:
                "from-amber-300 via-yellow-400 to-orange-300",
            border: "border-amber-200/100",
            textColor: "text-amber-800",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
            {cards.map((c) => (
                <div
                    key={c.id}
                    className={`
            relative p-5 rounded-2xl overflow-hidden
            bg-gradient-to-br ${c.gradient}
            border ${c.border}
            shadow-[0_4px_12px_rgba(0,0,0,0.05)]
            backdrop-blur-md
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-md hover:shadow-slate-300/40
            flex items-center justify-between
          `}
                >
                    {/* Frost overlay for glassy feel */}
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-xl pointer-events-none rounded-2xl"/>

                    {/* Content */}
                    <div className="relative z-10">
                        <p className="text-xs sm:text-sm text-black font-medium mb-1">
                            {c.label}
                        </p>
                        <p className={`text-3xl font-bold ${c.textColor}`}>{c.value}</p>
                    </div>

                    {/* Icon */}
                    <div
                        className={`
              relative z-10 flex items-center justify-center
              h-12 w-12 rounded-full
              bg-white/70 border border-white/60 shadow-inner
              backdrop-blur-sm
            `}
                    >
                        {c.icon}
                    </div>

                    {/* Soft highlight rim */}
                    <div className="absolute inset-0 rounded-2xl border border-white/50 pointer-events-none"/>
                </div>
            ))}
        </div>
    );
}
