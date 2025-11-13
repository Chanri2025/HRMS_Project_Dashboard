import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {parseCreatedOn, formatISTDateTime} from "@/Utils/Timestamp.helpers.js";

function ScrumDetailsModal({open, onOpenChange, row, userMap}) {
    if (!row) return null;

    const formatEventTime = (at) => {
        if (!at) return "-";
        const d = parseCreatedOn(at);
        return d ? formatISTDateTime(d) : "-";
    };

    const statusPillClasses = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "running") return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (s === "paused") return "bg-amber-50 text-amber-800 border-amber-200";
        if (s === "completed") return "bg-sky-50 text-sky-800 border-sky-200";
        return "bg-muted text-muted-foreground border-muted";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    max-w-4xl w-full
                    sm:max-h-[80vh] max-h-[90vh]
                    flex flex-col
                    p-4 sm:p-6
                "
            >
                {/* HEADER */}
                <DialogHeader className="mb-2 shrink-0">
                    <DialogTitle className="text-xl font-semibold">
                        Scrum Details
                    </DialogTitle>
                    <DialogDescription>
                        Full activity log and context for this daily scrum.
                    </DialogDescription>
                </DialogHeader>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-6 text-sm text-foreground">

                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-medium bg-muted/40 border-muted">
                                {row.userName}
                            </Badge>

                            <Badge variant="outline" className="font-normal bg-muted/30 border-dashed">
                                {row.subprojectLabel}
                            </Badge>

                            <Badge variant="outline" className={statusPillClasses(row.scrumStatus)}>
                                {row.scrumStatus || "No status"}
                            </Badge>

                            {row.workHoursDisplay && (
                                <Badge
                                    variant="outline"
                                    className="font-normal bg-sky-50/80 border-sky-100 text-sky-700"
                                >
                                    Work: {row.workHoursDisplay}
                                </Badge>
                            )}
                        </div>

                        <Separator/>

                        {/* DATE BLOCK */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg bg-muted/40 p-3">
                                <div className="text-xs text-muted-foreground">Created at</div>
                                <div className="font-medium">{row.createdDisplay}</div>
                            </div>

                            <div className="rounded-lg bg-muted/40 p-3">
                                <div className="text-xs text-muted-foreground">Last action</div>
                                <div className="font-medium">{row.lastActionDisplay}</div>
                            </div>

                            <div className="rounded-lg bg-muted/40 p-3">
                                <div className="text-xs text-muted-foreground">ETA Date</div>
                                <div className="font-medium">{row.eta_date || "—"}</div>
                            </div>
                        </div>

                        {/* TASK + CONCERN */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border bg-card/60 p-3">
                                <div className="text-xs text-muted-foreground mb-1">Today's Task</div>
                                <div className="whitespace-pre-wrap">{row.today_task || "—"}</div>
                            </div>

                            <div className="rounded-lg border bg-card/60 p-3">
                                <div className="text-xs text-muted-foreground mb-1">Concern</div>
                                <div className="whitespace-pre-wrap">{row.concern || "—"}</div>
                            </div>
                        </div>

                        {/* DEPENDENCIES */}
                        <div className="rounded-lg border bg-card/60 p-3">
                            <div className="text-xs text-muted-foreground mb-1">Dependencies</div>

                            {row.dependencies?.length > 0 ? (
                                <ul className="space-y-1 text-xs">
                                    {row.dependencies.map((d, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium">
                                                {userMap?.get(d.user_id) || `User ${d.user_id}`}:
                                            </span>{" "}
                                            {d.description}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-xs text-muted-foreground">No dependencies</div>
                            )}
                        </div>

                        {/* STATUS EVENTS — TIMELINE */}
                        <div className="rounded-lg border bg-card/60 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-muted-foreground">Status Events</div>

                                {!!row.status_events?.length && (
                                    <span className="text-[11px] text-muted-foreground">
                                        {row.status_events.length} update
                                        {row.status_events.length > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            {row.status_events?.length > 0 ? (
                                <div className="max-h-60 overflow-auto pr-1">
                                    <div className="relative pl-4">

                                        {/* Vertical timeline line */}
                                        <div className="absolute left-[6px] top-0 bottom-0 w-[2px] bg-gradient-to-b
                                            from-primary/40 via-muted-foreground/30 to-transparent"/>

                                        <div className="space-y-3">
                                            {row.status_events.map((ev, idx) => (
                                                <div key={idx} className="relative flex gap-3">

                                                    {/* Timeline dot */}
                                                    <div
                                                        className="mt-2 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-sm"/>

                                                    {/* Event Card */}
                                                    <div className="flex-1 rounded-md bg-muted/40 px-3 py-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`h-5 px-2 text-[11px] font-semibold ${statusPillClasses(
                                                                    ev.status
                                                                )}`}
                                                            >
                                                                {ev.status}
                                                            </Badge>

                                                            <span className="text-[11px] text-muted-foreground">
                                                                {formatEventTime(ev.at)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                                                            by user <span className="font-medium">{ev.actor_id}</span>
                                                        </div>

                                                        {ev.note && (
                                                            <div className="mt-1 text-xs">{ev.note}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>  // ✅ ✔️ THIS CLOSING DIV WAS MISSING
                            ) : (
                                <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                                    No status history available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ScrumDetailsModal;
