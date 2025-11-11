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
                                      progress = 0, // 0..100
                                      counts = {todo: 0, inProgress: 0, done: 0},
                                      onOpenBoard,
                                  }) => {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);

    const statusClass =
        status === "Active"
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : status === "Completed"
                ? "bg-sky-100 text-sky-700 border border-sky-200"
                : status === "Planned"
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200";

    return (
        <Card
            className={clsx(
                "p-6 rounded-2xl border border-slate-200",
                "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
                "shadow-sm transition-all duration-300 hover:shadow-lg",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                    Current Sprint
                </h2>
                <Badge className={clsx("px-3 py-1 text-xs font-semibold rounded-full", statusClass)}>
                    {status}
                </Badge>
            </div>

            <div className="space-y-4">
                {/* Dates */}
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Calendar className="h-4 w-4 text-sky-500"/>
                    {dateRange ? (
                        <span>{dateRange}</span>
                    ) : (
                        <span>No sprint schedule available</span>
                    )}
                    {remainingText && (
                        <>
                            <span>•</span>
                            <span className="font-medium text-slate-800">
                {remainingText}
              </span>
                        </>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-semibold text-slate-900">
              {normalizedProgress}%
            </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className={clsx(
                                "h-2 rounded-full transition-all duration-500",
                                "bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500"
                            )}
                            style={{width: `${normalizedProgress}%`}}
                        />
                    </div>
                </div>

                {/* Counters */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">To Do</p>
                        <p className="text-lg font-semibold text-slate-900">
                            {counts.todo}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">In Progress</p>
                        <p className="text-lg font-semibold text-indigo-600">
                            {counts.inProgress}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Done</p>
                        <p className="text-lg font-semibold text-emerald-600">
                            {counts.done}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <Button
                    variant="outline"
                    className="w-full mt-4 border-sky-300 text-sky-700 hover:bg-sky-50"
                    onClick={onOpenBoard}
                >
                    Go to Project Board
                </Button>
            </div>
        </Card>
    );
};
