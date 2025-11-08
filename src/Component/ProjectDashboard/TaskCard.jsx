import React from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Clock, MessageSquare, Calendar} from "lucide-react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {useUserById} from "@/hooks/useActiveProjects";

// Badge colors per priority
const badgePriorityColors = {
    low: "bg-muted/60 text-muted-foreground border-transparent",
    medium: "bg-warning/10 text-warning border-warning/40",
    important: "bg-info/10 text-info border-info/40",
    urgent: "bg-destructive text-destructive-foreground border-destructive",
};

// Card bg/border per priority (makes cards colorful)
const cardPriorityColors = {
    low: "bg-muted/30 border-transparent",
    medium: "bg-warning/5 border-warning/40",
    important: "bg-info/5 border-info/40",
    urgent: "bg-destructive/5 border-destructive/40",
};

function getInitials(name = "") {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "")
            .join("") || "NA"
    );
}

export function TaskCard({
                             id,
                             title,
                             description,
                             priority,
                             assigneeId,
                             storyPoints,
                             comments,
                             endDate,
                         }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Safe priority fallback
    const safePriority =
        priority === "urgent" ||
        priority === "medium" ||
        priority === "important" ||
        priority === "low"
            ? priority
            : "low";

    // Fetch assignee details (if exists)
    const {data: user} = useUserById(assigneeId);

    const fullName =
        user?.employee?.full_name ||
        user?.full_name ||
        (assigneeId ? `User ${assigneeId}` : "Unassigned");

    const initials = getInitials(fullName);

    const dueLabel =
        endDate instanceof Date && !isNaN(endDate.getTime())
            ? endDate.toLocaleDateString(undefined, {
                month: "short",
                day: "2-digit",
            })
            : null;

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-4 border rounded-xl hover:shadow-md transition-all cursor-move group ${cardPriorityColors[safePriority]}`}
        >
            <div className="space-y-3">
                {/* Title + Priority */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <Badge
                        variant="outline"
                        className={`px-2 py-0.5 text-[10px] font-semibold capitalize ${badgePriorityColors[safePriority]}`}
                    >
                        {safePriority}
                    </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                </p>

                {/* Meta: points, comments, due, assignee */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {storyPoints ? (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3"/>
                                    <span>{storyPoints} pts</span>
                                </div>
                            ) : null}

                            {comments ? (
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3"/>
                                    <span>{comments}</span>
                                </div>
                            ) : null}
                        </div>

                        {dueLabel && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3"/>
                                <span>Due {dueLabel}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-xs text-foreground">
              {fullName}
            </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
