// src/components/dashboard/TeamMembersCardSkeleton.jsx
import React from "react";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export const TeamMembersCardSkeleton = () => {
    return (
        <Card className="p-6">
            <Skeleton className="h-5 w-32 mb-4"/>

            <div className="space-y-3">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full"/>
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-40"/>
                            <Skeleton className="h-3 w-52"/>
                        </div>
                        <Skeleton className="h-5 w-10 rounded-full"/>
                    </div>
                ))}
            </div>
        </Card>
    );
};
