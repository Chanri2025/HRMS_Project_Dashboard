import React from "react";
import {Card} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {useDroppable} from "@dnd-kit/core";

// ---------- Helper: compute priority from deadline + status ----------
function computePriority(deadline, status) {
    const normalizedStatus = (status || "").toLowerCase().trim();

    // ✅ If task is done/completed/deployed etc → never urgent
    if (
        normalizedStatus === "done" ||
        normalizedStatus === "completed" ||
        normalizedStatus === "deployment" ||
        normalizedStatus === "deployed"
    ) {
        return "low";
    }

    if (!deadline) return "low";

    const now = new Date();
    const dl = new Date(deadline);
    if (isNaN(dl.getTime())) return "low";

    const diffMs = dl.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) return "urgent";
    if (diffDays <= 5) return "medium";
    if (diffDays <= 10) return "important";
    return "low";
}

export function KanbanColumn({
                                 id,
                                 title,
                                 count,
                                 children,
                                 color = "bg-muted",
                             }) {
    const {setNodeRef, isOver} = useDroppable({id});

    // Sort children by earliest deadline + inject priority
    const sortedChildren = React.Children.toArray(children)
        .map((child) => {
            if (!React.isValidElement(child)) return {child, deadline: null, status: null};

            const {
                endDate,
                deadline,
                subproject_deadline,
                subprojectDeadline,
                status,
            } = child.props || {};

            const d =
                endDate ||
                deadline ||
                subproject_deadline ||
                subprojectDeadline ||
                null;

            return {child, deadline: d, status};
        })
        .sort((a, b) => {
            const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return da - db;
        })
        .map(({child, deadline, status}) => {
            if (!React.isValidElement(child)) return child;
            const priority = computePriority(deadline, status);
            return React.cloneElement(child, {priority});
        });

    return (
        <div ref={setNodeRef} className="flex flex-col h-full min-w-[320px]">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}/>
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground">
                        {title}
                    </h3>
                </div>
                <Badge variant="secondary" className="rounded-full">
                    {count}
                </Badge>
            </div>

            <Card
                className={`flex-1 p-4 transition-colors overflow-y-auto scrollbar-hide ${
                    isOver ? "bg-accent/50" : "bg-muted/30"
                }`}
            >
                <div className="space-y-3">{sortedChildren}</div>
            </Card>
        </div>
    );
}
