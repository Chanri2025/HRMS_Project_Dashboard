import React from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Calendar} from "lucide-react";

export function SprintHeaderTitle({
                                      loading,
                                      error,
                                      selectedProject,
                                      activeCount,
                                      createdByUser,
                                      dateRange,
                                      daysRemaining,
                                  }) {
    const projectName =
        loading
            ? "Loading..."
            : error
                ? "Project Unavailable"
                : selectedProject?.name || "No Active Project";

    const projectStatus = selectedProject?.status || "Unknown";
    const statusLower = projectStatus.toLowerCase();

    const statusBadgeClass =
        statusLower === "active"
            ? "bg-success text-success-foreground"
            : statusLower === "completed"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground";

    return (
        <div className="flex items-center gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold text-foreground">
                        {projectName}
                    </h2>

                    {selectedProject && (
                        <Badge variant="default" className={statusBadgeClass}>
                            {projectStatus}
                        </Badge>
                    )}

                    {createdByUser?.full_name && (
                        <span className="text-xs text-muted-foreground">
              Created by {createdByUser.full_name}
            </span>
                    )}

                    {activeCount > 1 && (
                        <Badge
                            variant="outline"
                            className="ml-1 text-xs text-muted-foreground"
                        >
                            {activeCount} active projects
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4"/>
                    <span>{dateRange || "Timeline not available"}</span>
                    {typeof daysRemaining === "number" && (
                        <>
                            <span className="text-muted-foreground/50">•</span>
                            <span>
                {daysRemaining} day
                                {daysRemaining === 1 ? "" : "s"} remaining
              </span>
                        </>
                    )}
                </div>

                {selectedProject?.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {selectedProject.description}
                    </p>
                )}
            </div>
        </div>
    );
}
