import React from "react";
import {Card} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {format, differenceInDays} from "date-fns";
import {useUserById} from "@/hooks/useActiveProjects";

const priorityColors = {
    low: "bg-info",
    medium: "bg-warning",
    high: "bg-destructive",
    urgent: "bg-destructive",
};

function AssigneeLabel({assigneeId}) {
    const {data: user} = useUserById(assigneeId);

    const fullName =
        user?.employee?.full_name ||
        user?.full_name ||
        (assigneeId ? `User ${assigneeId}` : "Unassigned");

    return <span>{fullName}</span>;
}

export function GanttView({tasks = []}) {
    // Handle no tasks gracefully
    if (!tasks.length) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Gantt Chart</h3>
                <p className="text-sm text-muted-foreground">
                    No tasks available for this project.
                </p>
            </Card>
        );
    }

    // Filter tasks that have valid dates
    const datedTasks = tasks.filter(
        (t) =>
            t.startDate instanceof Date &&
            !isNaN(t.startDate) &&
            t.endDate instanceof Date &&
            !isNaN(t.endDate)
    );

    if (!datedTasks.length) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Gantt Chart</h3>
                <p className="text-sm text-muted-foreground">
                    Tasks do not have valid start/end dates to display.
                </p>
            </Card>
        );
    }

    const allDates = datedTasks.flatMap((t) => [t.startDate, t.endDate]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const totalDays = Math.max(differenceInDays(maxDate, minDate) + 1, 1);

    const getTaskPosition = (task) => {
        const start = differenceInDays(task.startDate, minDate);
        const duration = Math.max(
            differenceInDays(task.endDate, task.startDate) + 1,
            1
        );
        return {
            left: `${(start / totalDays) * 100}%`,
            width: `${(duration / totalDays) * 100}%`,
        };
    };

    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gantt Chart</h3>
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{format(minDate, "MMM dd")}</span>
                    <span>→</span>
                    <span>{format(maxDate, "MMM dd")}</span>
                </div>
            </div>

            <div className="space-y-4">
                {datedTasks.map((task) => {
                    const position = getTaskPosition(task);
                    const color =
                        priorityColors[task.priority] || priorityColors.medium;

                    return (
                        <div key={task.id} className="relative">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-56 flex-shrink-0">
                                    <p className="text-sm font-medium truncate">
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        <AssigneeLabel assigneeId={task.assigneeId}/>
                                    </p>
                                </div>
                                <div className="flex-1 relative h-8 bg-muted rounded">
                                    <div
                                        className={`absolute top-1 bottom-1 ${color} rounded flex items-center px-2`}
                                        style={position}
                                    >
                                        <Badge variant="secondary" className="text-[10px] h-5">
                                            {task.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
