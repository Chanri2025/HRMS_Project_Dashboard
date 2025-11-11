import React, {useEffect, useState, useMemo} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Clock, MessageSquare, Calendar as CalendarIcon} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog.tsx";

import {useUpdateSubProject} from "@/hooks/useSubProjects.js";
import {useUserById} from "@/hooks/useActiveProjects.js";

import {ShadcnDateTimePicker} from "@/Utils/ShadcnDateTimePicker.jsx";
import {AssigneeSelect} from "@/Component/ProjectSection/ProjectDashboard/AssigneeSelect.jsx";

// --- Priority colors (keep in sync with TaskCard) ---
const badgePriorityColors = {
    low: "bg-muted/60 text-muted-foreground border-transparent",
    medium: "bg-warning/10 text-warning border-warning/40",
    important: "bg-info/10 text-info border-info/40",
    urgent: "bg-destructive text-destructive-foreground border-destructive",
};

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
                    Dec: 11,
                };
                const month = months[monStr];
                if (month !== undefined) {
                    let h = 0,
                        m = 0,
                        s = 0;
                    if (timePart) {
                        const parts = timePart.split(":");
                        h = Number(parts[0] || 0);
                        m = Number(parts[1] || 0);
                        s = Number(parts[2] || 0);
                    }
                    const mer = (meridiem || "").toUpperCase();
                    if (mer === "PM" && h < 12) h += 12;
                    if (mer === "AM" && h === 12) h = 0;

                    parsedDate = new Date(
                        Number(yyyy),
                        month,
                        Number(dd),
                        h,
                        m,
                        s
                    );
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
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
}

function calcDaysRemaining(end) {
    if (!end) return null;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

function formatStatus(status = "") {
    const s = status.toString().trim();
    if (!s) return "";
    return s[0].toUpperCase() + s.slice(1);
}

export function TaskDetailsDialog(props) {
    const {
        open,
        onOpenChange,
        id,
        projectId,
        assignedBy,
        createdOn,
        lastModified,
        title,
        description,
        status,
        assigneeId,
        safePriority,
        endDate,
        storyPoints,
        comments,
    } = props;

    const createdAt = parseCreatedOn(createdOn);
    const updatedAt = parseCreatedOn(lastModified);
    const initialDue =
        endDate instanceof Date
            ? endDate
            : endDate
                ? parseCreatedOn(endDate)
                : null;

    const daysElapsed = createdAt ? calcDaysElapsed(createdAt) : null;
    const initialRemaining = initialDue
        ? calcDaysRemaining(initialDue)
        : null;

    // editable state
    const [nameInput, setNameInput] = useState(title || "");
    const [descInput, setDescInput] = useState(description || "");
    const [statusInput, setStatusInput] = useState(status || "To Do");
    const [assigneeInput, setAssigneeInput] = useState(assigneeId || null);
    const [deadlineIso, setDeadlineIso] = useState(
        initialDue ? initialDue.toISOString() : ""
    );

    useEffect(() => {
        if (!open) return;

        const freshDue =
            endDate instanceof Date
                ? endDate
                : endDate
                    ? parseCreatedOn(endDate)
                    : null;

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
        deadlineIso && !Number.isNaN(new Date(deadlineIso).getTime())
            ? new Date(deadlineIso)
            : initialDue;
    const daysRemaining =
        currentDue != null
            ? calcDaysRemaining(currentDue)
            : initialRemaining;

    const {mutate: updateSubProject, isLoading} = useUpdateSubProject();

    const handleSave = () => {
        const payload = {
            subproject_name: nameInput,
            description: descInput,
            project_status: statusInput,
            assigned_to: assigneeInput || null,
            subproject_deadline: deadlineIso || null,
            // project_id / assigned_by / created_on are intentionally not sent
        };

        updateSubProject(
            {id, data: payload, projectId},
            {
                onSuccess: () => onOpenChange(false),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-6 rounded-2xl">
                {/* Header */}
                <DialogHeader className="mb-2 mt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-semibold">
                                <input
                                    className="bg-transparent border-none outline-none p-0 m-0 text-xl font-semibold w-full"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                />
                            </DialogTitle>

                            <DialogDescription className="mt-1 text-xs flex items-center gap-2">
                                <span className="text-muted-foreground">Status:</span>
                                <select
                                    className="border rounded px-2 py-0.5 text-[10px]"
                                    value={statusInput}
                                    onChange={(e) => setStatusInput(e.target.value)}
                                >
                                    <option value="Backlog">Backlog</option>
                                    <option value="To Do">To Do</option>
                                    <option value="Development">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Active">Active</option>
                                </select>
                                {statusInput && (
                                    <span className="text-[10px] text-muted-foreground">
                    ({formatStatus(statusInput)})
                  </span>
                                )}
                            </DialogDescription>

                            {/* IDs & meta */}
                            <div className="mt-2 text-[9px] text-muted-foreground grid grid-cols-3 gap-y-0.5 gap-x-4">
                                <div>
                                    Subproject ID:{" "}
                                    <span className="font-medium">{id}</span>
                                </div>
                                {projectId != null && (
                                    <div>
                                        Project ID:{" "}
                                        <span className="font-medium">{projectId}</span>
                                    </div>
                                )}
                                {assignedBy != null && (
                                    <div>
                                        Assigned By:{" "}
                                        <span className="font-medium">{assignedBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex flex-col items-end gap-2">
                            <Badge
                                className={`px-4 py-1 rounded-full text-xs font-semibold capitalize ${badgePriorityColors[safePriority]}`}
                            >
                                {safePriority}
                            </Badge>

                            {daysRemaining != null && (
                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3"/>
                                    <span>{daysRemaining} days remaining</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="space-y-6 text-sm">
                    {/* Description */}
                    <div>
                        <p className="font-semibold mb-1 text-xs">Description</p>
                        <textarea
                            className="w-full border rounded-md px-3 py-2 text-xs resize-y"
                            rows={3}
                            value={descInput}
                            onChange={(e) => setDescInput(e.target.value)}
                            placeholder="Add a description..."
                        />
                    </div>

                    {/* Assignee + Due date */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="font-semibold text-[11px] mb-2">Assignee</p>

                            <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                        {assigneeInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">
                  {assigneeName}
                </span>
                            </div>

                            {/* Dropdown shows names from project members */}
                            <AssigneeSelect
                                projectId={projectId}
                                value={assigneeInput}
                                onChange={setAssigneeInput}
                            />
                        </div>

                        <div>
                            <p className="font-semibold text-[11px] mb-2">
                                Due date &amp; time
                            </p>
                            <ShadcnDateTimePicker
                                value={deadlineIso}
                                onChange={setDeadlineIso}
                                placeholder="Pick due date & time"
                                className="h-8 text-[11px]"
                            />
                        </div>
                    </div>

                    {/* System meta */}
                    <div className="grid grid-cols-2 gap-8 text-[9px] text-muted-foreground">
                        <div>
                            <p className="font-semibold mb-1">Created On</p>
                            <p>
                                {createdAt ? createdAt.toLocaleString() : "—"}
                                {daysElapsed != null &&
                                    `  •  ${daysElapsed} days ago`}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Last Modified</p>
                            <p>
                                {updatedAt ? updatedAt.toLocaleString() : "—"}
                            </p>
                        </div>
                    </div>

                    {/* Extra meta */}
                    {(storyPoints || comments) && (
                        <div className="flex gap-8 text-[10px] text-muted-foreground">
                            {storyPoints ? (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3"/>
                                    <span>Story Points: {storyPoints}</span>
                                </div>
                            ) : null}
                            {comments ? (
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3"/>
                                    <span>Comments: {comments}</span>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="px-3 py-1.5 text-[10px] rounded-md border border-muted-foreground/20"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-1.5 text-[10px] rounded-md bg-primary text-primary-foreground disabled:opacity-60"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
