import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Calendar, ChevronDown, Plus, Pencil, Trash2} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

import ConfirmDialog from "@/Utils/ConfirmDialog";
import {
    useUserById,
    useUpdateProject,
    useDeleteProject,
} from "@/hooks/useActiveProjects";

// ---------- helpers ----------
function parseCreatedOn(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;
    const [datePart, timePart, meridiem] = dateStr.split(" ");
    if (!datePart) return null;

    const [dd, monStr, yyyy] = datePart.split("-");
    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    const month = months[monStr];
    if (month === undefined) return null;

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

    return new Date(Number(yyyy), month, Number(dd), h, m, s);
}

function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
}

function formatRange(start, end) {
    if (!start || !end) return null;
    const startOpts = {month: "short", day: "numeric"};
    const endOpts = {month: "short", day: "numeric", year: "numeric"};
    const startStr = start.toLocaleDateString(undefined, startOpts);
    const endStr = end.toLocaleDateString(undefined, endOpts);
    return `${startStr} - ${endStr}`;
}

function calcDaysRemaining(end) {
    if (!end) return null;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

// ---------- component ----------
export function SprintHeader({
                                 loading,
                                 error,
                                 projects = [],
                                 activeCount = 0,
                                 selectedProject,
                                 onSelectProject,
                                 tasks = [],
                             }) {
    // Metrics
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const storyPoints = tasks.reduce(
        (sum, t) => sum + (t.storyPoints || 0),
        0
    );

    // Project info
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

    // Created by
    const createdById = selectedProject?.createdById;
    const {data: createdByUser} = useUserById(createdById);

    // Dates
    const createdOnStr = selectedProject?.createdOn;
    const startDate = createdOnStr ? parseCreatedOn(createdOnStr) : null;
    const endDate = startDate ? addDays(startDate, 30) : null;
    const dateRange =
        startDate && endDate ? formatRange(startDate, endDate) : null;
    const daysRemaining = endDate ? calcDaysRemaining(endDate) : null;

    // --- Edit / Delete state & mutations ---
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        status: "",
    });

    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();

    // Sync form when project changes or edit dialog opens
    useEffect(() => {
        if (selectedProject && editOpen) {
            setEditForm({
                name: selectedProject.name || "",
                description: selectedProject.description || "",
                status: selectedProject.status || "Active",
            });
        }
    }, [selectedProject, editOpen]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject?.id) return;

        await updateProject.mutateAsync({
            id: selectedProject.id,
            payload: {
                project_name: editForm.name,
                description: editForm.description,
                project_status: editForm.status,
            },
        });

        setEditOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProject?.id) return;
        await deleteProject.mutateAsync(selectedProject.id);
        // after deletion, selection will auto-refresh from query invalidate
        // parent Page component already picks first active project when list changes
    };

    return (
        <>
            <div className="bg-card border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left block */}
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

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loading || !!error || !projects.length}
                                >
                                    <ChevronDown className="h-4 w-4 mr-1"/>
                                    View / Options
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="min-w-[240px]"
                            >
                                {/* Switch project list */}
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Switch Project
                                </DropdownMenuLabel>
                                {projects.map((p) => (
                                    <DropdownMenuItem
                                        key={p.id}
                                        className="flex items-center gap-2"
                                        onClick={() => onSelectProject?.(p.id)}
                                    >
                                        <span className="truncate">{p.name}</span>
                                        {p.id === selectedProject?.id && (
                                            <Badge
                                                variant="outline"
                                                className="ml-auto text-[10px] px-1.5 py-0.5 text-success border-success/40 bg-success/5"
                                            >
                                                Active
                                            </Badge>
                                        )}
                                    </DropdownMenuItem>
                                ))}

                                {/* Actions for current project */}
                                {selectedProject?.id && (
                                    <>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                                            Actions
                                        </DropdownMenuLabel>

                                        <DropdownMenuItem
                                            className="flex items-center gap-2"
                                            onClick={() => setEditOpen(true)}
                                        >
                                            <Pencil className="h-3 w-3"/>
                                            <span>Edit project</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                                            onClick={() => setDeleteOpen(true)}
                                        >
                                            <Trash2 className="h-3 w-3"/>
                                            <span>Delete project</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1"/>
                            Create Task
                        </Button>
                    </div>
                </div>

                {/* Stats */}
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
            </div>

            {/* Edit Project Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                                Update project details. Changes will reflect instantly on the
                                dashboard.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 mt-2">
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Project Name
                                </label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Description
                                </label>
                                <Textarea
                                    rows={3}
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Status
                                </label>
                                <Input
                                    value={editForm.status}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            status: e.target.value,
                                        }))
                                    }
                                    placeholder="Active / Completed / On Hold"
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateProject.isLoading}
                            >
                                {updateProject.isLoading
                                    ? "Saving..."
                                    : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Project Confirm Dialog */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this project?"
                description={`"${selectedProject?.name || "Project"}" will be permanently removed, including its sprint context. This cannot be undone.`}
                confirmText={
                    deleteProject.isLoading ? "Deleting..." : "Delete"
                }
                variant="destructive"
                loading={deleteProject.isLoading}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
