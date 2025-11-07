import React from "react";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { format, differenceInDays } from "date-fns";

export function GanttView({ tasks }) {
  const allDates = tasks.flatMap((t) => [t.startDate, t.endDate]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  const getTaskPosition = (task) => {
    const start = differenceInDays(task.startDate, minDate);
    const duration = differenceInDays(task.endDate, task.startDate) + 1;
    return {
      left: `${(start / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const priorityColors = {
    low: "bg-info",
    medium: "bg-warning",
    high: "bg-destructive",
    urgent: "bg-destructive",
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
        {tasks.map((task) => {
          const position = getTaskPosition(task);
          return (
            <div key={task.id} className="relative">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-48 flex-shrink-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignee.name}
                  </p>
                </div>
                <div className="flex-1 relative h-8 bg-muted rounded">
                  <div
                    className={`absolute top-1 bottom-1 ${
                      priorityColors[task.priority]
                    } rounded flex items-center px-2`}
                    style={position}>
                    <Badge variant="secondary" className="text-xs h-5">
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
