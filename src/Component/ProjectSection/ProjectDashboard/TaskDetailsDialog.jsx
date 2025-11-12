import React, {useEffect, useState, useMemo} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Button} from "@/components/ui/button";
import {Clock, MessageSquare, Calendar as CalendarIcon, Trash2, Save, X} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog.tsx";
import {Separator} from "@/components/ui/separator";

import {useUpdateSubProject, useDeleteSubProject} from "@/hooks/useSubProjects.js";
import {useUserById, useProjectById} from "@/hooks/useActiveProjects.js";
import {useUserLabel} from "@/hooks/useOrgLookups.js";

import {ShadcnDateTimePicker} from "@/Utils/ShadcnDateTimePicker.jsx";
import {AssigneeSelect} from "@/Component/ProjectSection/ProjectDashboard/AssigneeSelect.jsx";
import ConfirmDialog from "@/Utils/ConfirmDialog.jsx";

// --- Priority colors (keep in sync with TaskCard) ---
const badgePriorityColors = {
    low: "bg-muted/60 text-muted-foreground border-transparent",
    medium: "bg-warning/10 text-warning border-warning/40",
    important: "bg-info/10 text-info border-info/40",
    urgent: "bg-destructive text-destructive-foreground border-destructive",
};

function getInitials(name = "") {
    return (name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "NA");
}

function parseCreatedOn(dateStr) {
    if (!dateStr) return null;
    let parsedDate = null;

    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
        parsedDate = dateStr;
    } else if (typeof dateStr === "string") {
        const iso = new Date(dateStr);
        if (!isNaN(iso.getTime())) {
            parsedDate = iso;
        } else {
            const [datePart, timePart, meridiem] = dateStr.split(" ");
            if (datePart) {
                const [dd, monStr, yyyy] = datePart.split("-");
                const months = {
                    Jan: 0,
                    Feb: 1,
                    Mar: 2,
                    Apr: 3,
                    May: 4,
                    Jun: 5,
                    Jul: 6,
                    Aug: 7,
                    Sep: 8,
                    Oct: 9,
                    Nov: 10,
                    Dec: 11
                };
                const month = months[monStr];
                if (month !== undefined) {
                    let h = 0, m = 0, s = 0;
                    if (timePart) {
                        const parts = timePart.split(":");
                        h = Number(parts[0] || 0);
                        m = Number(parts[1] || 0);
                        s = Number(parts[2] || 0);
                    }
                    const mer = (meridiem || "").toUpperCase();
                    if (mer === "PM" && h < 12) h += 12;
                    if (mer === "AM" && h === 12) h = 0;
                    parsedDate = new Date(Number(yyyy), month, Number(dd), h, m, s);
                }
            }
        }
    }
    if (parsedDate && !isNaN(parsedDate.getTime())) {
        return new Date(parsedDate.getTime() + 5.5 * 60 * 60 * 1000);
    }
    return null;
}

function calcDaysElapsed(start) {
    if (!start) return null;
    const days = Math.floor((Date.now() - start.getTime()) / 86400000);
    return days >= 0 ? days : 0;
}

function calcDaysRemaining(end) {
    if (!end) return null;
    const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return days > 0 ? days : 0;
}

function formatStatus(status = "") {
    const s = status.toString().trim();
    return s ? s[0].toUpperCase() + s.slice(1) : "";
}

export function TaskDetailsDialog(props) {
    const {
        open, onOpenChange, id, projectId, assignedBy, createdOn, lastModified,
        title, description, status, assigneeId, safePriority, endDate, storyPoints, comments,
    } = props;

    const createdAt = parseCreatedOn(createdOn);
    const updatedAt = parseCreatedOn(lastModified);
    const initialDue = endDate instanceof Date ? endDate : endDate ? parseCreatedOn(endDate) : null;

    const daysElapsed = createdAt ? calcDaysElapsed(createdAt) : null;
    const initialRemaining = initialDue ? calcDaysRemaining(initialDue) : null;

    // editable state
    const [nameInput, setNameInput] = useState(title || "");
    const [descInput, setDescInput] = useState(description || "");
    const [statusInput, setStatusInput] = useState(status || "To Do");
    const [assigneeInput, setAssigneeInput] = useState(assigneeId || null);
    const [deadlineIso, setDeadlineIso] = useState(initialDue ? initialDue.toISOString() : "");

    // confirm delete dialog visibility
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const freshDue = endDate instanceof Date ? endDate : endDate ? parseCreatedOn(endDate) : null;
        setNameInput(title || "");
        setDescInput(description || "");
        setStatusInput(status || "To Do");
        setAssigneeInput(assigneeId || null);
        setDeadlineIso(freshDue ? freshDue.toISOString() : "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, id]);

    // resolve assignee for header pill
    const selectedAssigneeId = assigneeInput || assigneeId || null;
    const {data: assigneeUser} = useUserById(selectedAssigneeId);
    const assigneeName = useMemo(
        () =>
            assigneeUser?.employee?.full_name ||
            assigneeUser?.full_name ||
            (selectedAssigneeId ? `User ${selectedAssigneeId}` : "Unassigned"),
        [assigneeUser, selectedAssigneeId]
    );
    const assigneeInitials = getInitials(assigneeName);

    // recompute remaining
    const currentDue =
        deadlineIso && !Number.isNaN(new Date(deadlineIso).getTime()) ? new Date(deadlineIso) : initialDue;
    const daysRemaining = currentDue != null ? calcDaysRemaining(currentDue) : initialRemaining;

    const {mutate: updateSubProject, isLoading} = useUpdateSubProject();
    const {mutate: deleteSubProject, isLoading: isDeleting} = useDeleteSubProject();

    // Labels
    const {label: assignedByLabel} = useUserLabel(assignedBy);
    const {data: project} = useProjectById(projectId);

    const handleSave = () => {
        const payload = {
            subproject_name: nameInput,
            description: descInput,
            project_status: statusInput,
            assigned_to: assigneeInput || null,
            subproject_deadline: deadlineIso || null,
        };
        updateSubProject({id, data: payload, projectId}, {onSuccess: () => onOpenChange(false)});
    };

    const handleDelete = async () => {
        await deleteSubProject(
            {id, projectId},
            {
                onSuccess: () => {
                    setConfirmOpen(false);
                    onOpenChange(false);
                }
            }
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="
            sm:max-w-5xl p-0 overflow-hidden
            rounded-2xl border border-border/60 shadow-2xl
            bg-gradient-to-b from-background via-background/60 to-muted/30
            backdrop-blur supports-[backdrop-filter]:bg-background/80
          "
                >
                    <DialogHeader
                        className="
              sticky top-0 z-10 bg-card/80 backdrop-blur
              border-b border-border/60 px-6 pt-5 pb-4
            "
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <DialogTitle className="text-xl font-semibold">
                                    <input
                                        className="bg-transparent border-none outline-none p-0 m-0 w-full text-xl font-semibold tracking-tight placeholder:text-muted-foreground/60"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="Untitled sub-project"
                                    />
                                </DialogTitle>

                                <DialogDescription className="mt-2 text-xs flex flex-wrap items-center gap-2">
                                    <span className="text-muted-foreground">Status:</span>
                                    <select
                                        className="text-[10px] px-2 py-1 rounded-md border border-border/60 bg-muted/40 hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                                        value={statusInput}
                                        onChange={(e) => setStatusInput(e.target.value)}
                                    >
                                        <option value="Backlog">Backlog</option>
                                        <option value="To Do">To Do</option>
                                        <option value="Development">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Active">Active</option>
                                    </select>
                                    {!!statusInput && (
                                        <span className="text-[10px] text-muted-foreground">
                      ({formatStatus(statusInput)})
                    </span>
                                    )}
                                </DialogDescription>

                                {/* Meta (IDs removed; show names instead) */}
                                <div
                                    className="mt-2 text-[10px] text-muted-foreground/90 flex flex-wrap gap-x-6 gap-y-1">
                                    {projectId != null && (
                                        <div>
                                            Project:{" "}
                                            <span className="font-medium text-foreground">
                        {project?.name ? `${project.name} (#${projectId})` : `Project (#${projectId})`}
                      </span>
                                        </div>
                                    )}
                                    {assignedBy != null && (
                                        <div>
                                            Assigned By:{" "}
                                            <span className="font-medium text-foreground">
                        {assignedByLabel || `User (#${assignedBy})`}
                      </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="flex flex-col items-end gap-2">
                                <Badge
                                    className={`px-4 py-1 rounded-full text-xs font-semibold capitalize ring-1 ring-inset ring-border/70 ${badgePriorityColors[safePriority]}`}
                                >
                                    {safePriority}
                                </Badge>

                                {daysRemaining != null && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <CalendarIcon className="h-3 w-3"/>
                                        <span>{daysRemaining} days remaining</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-6">
                        {/* Description */}
                        <section
                            className="rounded-xl border border-border/60 bg-card/60 p-4 transition-shadow hover:shadow-sm">
                            <p className="font-semibold mb-2 text-xs text-foreground/90">Description</p>
                            <textarea
                                className="w-full rounded-md text-xs border border-border/60 bg-background/60 px-3 py-2 resize-y placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                rows={3}
                                value={descInput}
                                onChange={(e) => setDescInput(e.target.value)}
                                placeholder="Add a description..."
                            />
                        </section>

                        {/* Assignee + Due date */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className="rounded-xl border border-border/60 bg-card/60 p-4 transition-shadow hover:shadow-sm">
                                <p className="font-semibold text-[11px] mb-3 text-foreground/90">Assignee</p>
                                <div className="flex items-center gap-2 mb-3">
                                    <Avatar className="h-8 w-8 ring-1 ring-border/60">
                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                            {assigneeInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">
                    {assigneeName}
                  </span>
                                </div>
                                <AssigneeSelect
                                    projectId={projectId}
                                    value={assigneeInput}
                                    onChange={setAssigneeInput}
                                />
                            </div>

                            <div
                                className="rounded-xl border border-border/60 bg-card/60 p-4 transition-shadow hover:shadow-sm">
                                <p className="font-semibold text-[11px] mb-3 text-foreground/90">Due date &amp; time</p>
                                <ShadcnDateTimePicker
                                    value={deadlineIso}
                                    onChange={setDeadlineIso}
                                    placeholder="Pick due date & time"
                                    className="h-8 text-[11px]"
                                />
                            </div>
                        </section>

                        {/* System meta */}
                        <section
                            className="rounded-xl border border-border/60 bg-card/60 p-4 transition-shadow hover:shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-muted-foreground">
                                <div>
                                    <p className="font-semibold mb-1 text-foreground/90">Created On</p>
                                    <p className="flex flex-wrap gap-1">
                                        <span>{createdAt ? createdAt.toLocaleString() : "—"}</span>
                                        {daysElapsed != null && <span>• {daysElapsed} days ago</span>}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold mb-1 text-foreground/90">Last Modified</p>
                                    <p>{updatedAt ? updatedAt.toLocaleString() : "—"}</p>
                                </div>
                            </div>
                        </section>


                        {/* Actions */}
                        <div
                            className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={() => setConfirmOpen(true)}
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-4 w-4 mr-2"/>
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>

                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="h-4 w-4 mr-2"/>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="w-full sm:w-auto"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2"/>
                                    {isLoading ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Sub-Project?"
                description="This will permanently remove the sub-project and its related data. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </>
    );
}
