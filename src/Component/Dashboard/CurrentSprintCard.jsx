import React from "react";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Calendar} from "lucide-react";
import clsx from "clsx";

export const CurrentSprintCard = ({
                                      className,
                                      status = "Active",
                                      dateRange,
                                      remainingText,
                                      progress = 0, // number 0..100
                                      counts = {todo: 0, inProgress: 0, done: 0},
                                      onOpenBoard,
                                  }) => {
    const statusClass =
        status === "Active"
            ? "bg-success text-success-foreground"
            : status === "Planned"
                ? "bg-info text-info-foreground"
                : "bg-muted text-foreground";

    return (
        <Card className={clsx("p-6", className)}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Current Sprint</h2>
                <Badge className={statusClass}>{status}</Badge>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4"/>
                    {dateRange && <span className="text-sm">{dateRange}</span>}
                    {remainingText && (
                        <>
                            <span>•</span>
                            <span className="text-sm">{remainingText}</span>
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{width: `${Math.min(Math.max(progress, 0), 100)}%`}}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">To Do</p>
                        <p className="text-lg font-semibold text-foreground">{counts.todo}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                        <p className="text-lg font-semibold text-info">{counts.inProgress}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Done</p>
                        <p className="text-lg font-semibold text-success">{counts.done}</p>
                    </div>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={onOpenBoard}>
                    Go to Sprint Board
                </Button>
            </div>
        </Card>
    );
};
