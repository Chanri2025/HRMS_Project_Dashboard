// src/Component/ProjectSection/ScrumDashboard/ScrumKpiSection.jsx
import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Activity, Clock, ListChecks, CheckCircle2} from "lucide-react";
import {AnimatedNumber} from "./AnimatedNumber.jsx";

export function ScrumKpiSection({kpis, isLoading}) {
    if (isLoading) {
        // Skeleton UI while scrums are loading
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((key) => (
                    <Card
                        key={key}
                        className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-muted/40 to-muted/10
                        shadow-sm"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24"/>
                            <div className="p-2 rounded-full bg-white/70 shadow-sm">
                                <Skeleton className="h-5 w-5 rounded-full"/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2"/>
                            <Skeleton className="h-3 w-32"/>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Scrums */}
            <Card
                className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#e2f0ff] to-[#f5f7ff]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
                <div
                    className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-blue-400/20"/>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">
                        Total Scrums
                    </CardTitle>
                    <div className="p-2 rounded-full bg-white shadow-sm">
                        <Activity className="h-5 w-5 text-blue-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-800">
                        <AnimatedNumber value={kpis.total}/>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                        All scrums in current view
                    </p>
                </CardContent>
            </Card>

            {/* Completed Scrums */}
            <Card
                className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#e5fff2] to-[#f3fff8]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
                <div
                    className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-400/20"/>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-800">
                        Completed Scrums
                    </CardTitle>
                    <div className="p-2 rounded-full bg-white shadow-sm">
                        <ListChecks className="h-5 w-5 text-emerald-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-emerald-900">
                        <AnimatedNumber value={kpis.completed}/>
                    </div>
                    <p className="text-sm text-emerald-700 mt-1">
                        Marked as completed
                    </p>
                </CardContent>
            </Card>

            {/* Completed Sub-Projects */}
            <Card
                className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#fff7da] to-[#fff3c4]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
                <div
                    className="pointer-events-none absolute -top-10 -right-4 h-24 w-24 rounded-full bg-amber-400/25"/>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">
                        Completed Sub-Projects
                    </CardTitle>

                    {/* Radial progress */}
                    <div className="relative h-10 w-10">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(#fbbf24 ${kpis.subProjectsPct * 3.6}deg, #fef3c7 0deg)`,
                            }}
                        />
                        <div
                            className="absolute inset-1 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-amber-500"/>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-1 text-2xl font-semibold text-amber-900">
                        <AnimatedNumber value={kpis.completedSubs}/>
                        <span className="text-lg text-amber-700">
                            / {kpis.totalSubProjects || 0}
                        </span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                        {kpis.subProjectsPct || 0}% completed
                    </p>
                </CardContent>
            </Card>

            {/* Total Logged Hours */}
            <Card
                className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#fff3ea] to-[#ffe8d6]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
                <div
                    className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-orange-400/25"/>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-900">
                        Total Logged Hours
                    </CardTitle>
                    <div className="p-2 rounded-full bg-white shadow-sm">
                        <Clock className="h-5 w-5 text-orange-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-orange-900">
                        {kpis.totalHoursDisplay}
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                        Sum of all work hours
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
