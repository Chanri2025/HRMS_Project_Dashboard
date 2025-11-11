import React, {useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Clock, MessageSquare, Calendar} from "lucide-react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {useUserById} from "@/hooks/useActiveProjects";
import {TaskDetailsDialog} from "./TaskDetailsDialog.jsx";

// ----- Styles ----- //

const badgePriorityColors = {
    low: "bg-slate-50 text-slate-600 border-slate-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    important: "bg-sky-50 text-sky-700 border-sky-200",
    urgent: "bg-rose-500 text-white border-rose-500",
};

const priorityGlassStyles = {
    low: {
        gradient: "from-slate-50 via-slate-50 to-sky-50",
        border: "border-slate-200/70",
    },
    medium: {
        gradient: "from-amber-50 via-yellow-50 to-orange-50",
        border: "border-amber-200/70",
    },
    important: {
        gradient: "from-sky-50 via-sky-50 to-indigo-50",
        border: "border-sky-200/70",
    },
    urgent: {
        gradient: "from-rose-50 via-rose-50 to-red-50",
        border: "border-rose-200/80",
    },
};

// ----- Helpers ----- //

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

// ----- Component ----- //

export function TaskCard(props) {
    const {
        id,
        title,
        description = "",
        priority = "low",
        assigneeId,
        storyPoints,
        comments,
        endDate,
        status = "",
        projectId,
        assignedBy,
        createdOn,
        lastModified,
    } = props;

    const [open, setOpen] = useState(false);

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

    // Safe priority
    const safePriority =
        priority === "urgent" ||
        priority === "medium" ||
        priority === "important" ||
        priority === "low"
            ? priority
            : "low";

    const glass = priorityGlassStyles[safePriority];

    // Assignee
    const {data: user} = useUserById(assigneeId);
    const fullName =
        user?.employee?.full_name ||
        user?.full_name ||
        (assigneeId ? `User ${assigneeId}` : "Unassigned");
    const initials = getInitials(fullName);

    // Due date visibility
    const normalizedStatus = status.toLowerCase();
    const hideDueForStatuses = ["done", "completed", "deployment", "deployed"];

    const isValidDate =
        endDate instanceof Date && !isNaN(endDate.getTime());

    const shouldShowDue =
        isValidDate && !hideDueForStatuses.includes(normalizedStatus);

    const dueLabel = shouldShowDue
        ? endDate.toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
        })
        : null;

    const handleClick = (e) => {
        if (isDragging) return;
        e.stopPropagation();
        setOpen(true);
    };

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={handleClick}
                className={`
          relative overflow-hidden group cursor-move
          p-4 rounded-2xl
          bg-gradient-to-br ${glass.gradient}
          ${glass.border}
          backdrop-blur-md
          shadow-[0_4px_10px_rgba(15,23,42,0.04)]
          hover:shadow-md hover:-translate-y-[2px]
          transition-all duration-200
        `}
            >
                {/* Frosted overlay for glass effect */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/55"/>

                {/* Content */}
                <div className="relative z-10 space-y-3">
                    {/* Title + Priority */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                            {title}
                        </h3>
                        <Badge
                            variant="outline"
                            className={`
                px-2 py-0.5 text-[10px] font-semibold capitalize
                rounded-full shadow-sm
                ${badgePriorityColors[safePriority]}
              `}
                        >
                            {safePriority}
                        </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2">
                        {description}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                            <div className="flex items-center gap-3">
                                {storyPoints ? (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-slate-400"/>
                                        <span>{storyPoints} pts</span>
                                    </div>
                                ) : null}

                                {comments ? (
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3 text-slate-400"/>
                                        <span>{comments}</span>
                                    </div>
                                ) : null}
                            </div>

                            {dueLabel && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-sky-400"/>
                                    <span>Due {dueLabel}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-sky-500 text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline text-[10px] text-slate-700 max-w-[120px] truncate">
                {fullName}
              </span>
                        </div>
                    </div>
                </div>

                {/* Subtle inner rim */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/60"/>
            </Card>

            {/* Details dialog */}
            <TaskDetailsDialog
                open={open}
                onOpenChange={setOpen}
                id={id}
                projectId={projectId}
                assignedBy={assignedBy}
                createdOn={createdOn}
                lastModified={lastModified}
                title={title}
                description={description}
                status={status}
                assigneeId={assigneeId}
                safePriority={safePriority}
                fullName={fullName}
                initials={initials}
                endDate={endDate}
                storyPoints={storyPoints}
                comments={comments}
            />
        </>
    );
}
