import React from "react";

export function ProjectHeaderStats({
                                      totalTasks,
                                      doneTasks,
                                      inProgressTasks,
                                      storyPoints,
                                  }) {
    return (
        <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
            </div>
            <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold text-success">{doneTasks}</p>
            </div>
            <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold text-info">
                    {inProgressTasks}
                </p>
            </div>
            <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Story Points</p>
                <p className="text-2xl font-bold text-foreground">
                    {storyPoints}
                </p>
            </div>
        </div>
    );
}
