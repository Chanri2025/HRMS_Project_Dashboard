// src/components/dashboard/MetricStatCardSkeleton.jsx
import React from "react";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export const MetricStatCardSkeleton = () => {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-9 w-9 rounded-lg"/>
                <Skeleton className="h-5 w-14 rounded-full"/>
            </div>
            <Skeleton className="h-7 w-16 mb-2"/>
            <Skeleton className="h-4 w-24"/>
        </Card>
    );
};
