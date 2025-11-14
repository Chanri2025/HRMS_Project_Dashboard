// src/Component/ProjectSection/ScrumDashboard/ScrumTableSection.jsx
import React from "react";
import {CommonTableCard} from "@/Utils/CommonTableCard";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {PlayCircle, PauseCircle, CheckCircle2, Loader2} from "lucide-react";
import {statusClassFor} from "@/Component/ProjectSection/ScrumDashboard/scrumUtils.js";

export function ScrumTableSection({
                                      data,
                                      isLoading,
                                      isError,
                                      emptyText = "No scrums found.",
                                      lifecycleMutation,
                                      onOpenDetails,
                                      userMap,
                                  }) {
    const handleLifecycle = (row, action) => {
        if (!row?.id) return;
        lifecycleMutation.mutate({
            scrumId: row.id,
            action,
            note:
                action === "start"
                    ? "Started from dashboard"
                    : action === "pause"
                        ? "Paused from dashboard"
                        : action === "end"
                            ? "Completed from dashboard"
                            : undefined,
        });
    };

    const columns = [
        {
            key: "created_at",
            header: "Date & Time",
            render: (row) => row.createdDisplay,
        },
        {
            key: "user",
            header: "User",
            render: (row) => (
                <Badge variant="outline" className="font-normal">
                    {row.userName}
                </Badge>
            ),
        },
        {
            key: "subproject",
            header: "Sub-Project",
            render: (row) => (
                <span className="text-sm text-foreground">
                    {row.subprojectLabel}
                </span>
            ),
        },
        {
            key: "today_task",
            header: "Today Task",
            render: (row) => (
                <span className="whitespace-pre-wrap">
                    {row.today_task}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${statusClassFor(
                            row.scrumStatus
                        )}`}
                    >
                        {row.scrumStatus || "—"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                        Last: {row.lastActionDisplay}
                    </span>
                </div>
            ),
        },
        {
            key: "work_hours",
            header: "Work Hours",
            render: (row) => {
                if (!row.workHoursDisplay) {
                    return (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    );
                }
                return (
                    <span className="text-sm font-medium">
                        {row.workHoursDisplay}
                    </span>
                );
            },
        },
        {
            key: "dependencies",
            header: "Dependencies",
            render: (row) => {
                if (!row.dependencies || row.dependencies.length === 0) {
                    return (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    );
                }

                return (
                    <div className="space-y-1 text-xs">
                        {row.dependencies.map((d, idx) => {
                            const depName =
                                userMap.get(d.user_id) ||
                                `User ${d.user_id}`;
                            return (
                                <div key={idx}>
                                    <span className="font-medium">
                                        {depName}:
                                    </span>{" "}
                                    {d.description}
                                </div>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            key: "concern",
            header: "Concern",
            render: (row) => (
                <span className="whitespace-pre-wrap">
                    {row.concern || "—"}
                </span>
            ),
        },
        {
            key: "lifecycle",
            header: "State",
            render: (row) => {
                const status = (row.scrumStatus || "").toLowerCase();
                const isThisRowUpdating =
                    lifecycleMutation.isPending &&
                    lifecycleMutation.variables?.scrumId === row.id;

                const renderIcon = (Icon) =>
                    isThisRowUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <Icon className="h-5 w-5"/>
                    );

                // Completed → only a disabled check
                if (status === "completed") {
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="opacity-60"
                                title="Completed"
                            >
                                <CheckCircle2 className="h-5 w-5"/>
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        {/* Play / Pause */}
                        {status === "running" ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isThisRowUpdating}
                                onClick={() =>
                                    handleLifecycle(row, "pause")
                                }
                                title="Pause"
                            >
                                {renderIcon(PauseCircle)}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isThisRowUpdating}
                                onClick={() =>
                                    handleLifecycle(row, "start")
                                }
                                title="Start"
                            >
                                {renderIcon(PlayCircle)}
                            </Button>
                        )}

                        {/* Done */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isThisRowUpdating}
                            onClick={() => handleLifecycle(row, "end")}
                            title="Mark completed"
                        >
                            <CheckCircle2 className="h-5 w-5"/>
                        </Button>
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: "Details",
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenDetails(row)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <CommonTableCard
            columns={columns}
            data={data}
            isLoading={isLoading}
            isError={isError}
            emptyText={emptyText}
        />
    );
}
