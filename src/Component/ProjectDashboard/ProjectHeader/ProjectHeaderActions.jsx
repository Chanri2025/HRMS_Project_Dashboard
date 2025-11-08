import React, {useEffect, useState, useMemo} from "react";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select.tsx";
import {ChevronDown, Plus, Pencil, Trash2} from "lucide-react";

import ConfirmDialog from "@/Utils/ConfirmDialog.jsx";
import {
    useUpdateProject,
    useDeleteProject,
    useProjectMembers,
    useAddProjectMember,
    useRemoveProjectMember,
    useUserById,
} from "@/hooks/useActiveProjects.js";
import {useDeptMembers} from "@/hooks/useDeptMembers.js";

/** Display pill for a member */
function ProjectMemberPill({member, onRemove}) {
    const needsLookup = !member.fullName && !!member.userId;
    const {data: userData} = useUserById(needsLookup ? member.userId : null);

    const name =
        member.fullName ||
        userData?.full_name ||
        member.email ||
        "Member";

    const email = member.email || userData?.email || "";

    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
      <span>
        {name}
          {email ? ` (${email})` : ""}
      </span>
            <button
                type="button"
                onClick={onRemove}
                className="ml-1 text-[10px] text-destructive hover:underline"
            >
                ✕
            </button>
        </div>
    );
}

export function ProjectHeaderActions({
                                         loading,
                                         error,
                                         projects,
                                         selectedProject,
                                         onSelectProject,
                                     }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        status: "Active",
    });

    const [selectedMemberId, setSelectedMemberId] = useState("");

    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();
    const addMember = useAddProjectMember();
    const removeMember = useRemoveProjectMember();

    const projectId = selectedProject?.id || null;

    const {
        data: projectMembers = [],
        isLoading: membersLoading,
    } = useProjectMembers(projectId);

    const {
        data: deptMembers = [],
        isLoading: deptLoading,
    } = useDeptMembers();

    // Prefill edit form
    useEffect(() => {
        if (selectedProject && editOpen) {
            const statusRaw = (selectedProject.status || "").toLowerCase();
            setEditForm({
                name: selectedProject.name || "",
                description: selectedProject.description || "",
                status: statusRaw === "completed" ? "Completed" : "Active",
            });
        }
    }, [selectedProject, editOpen]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!projectId) return;

        await updateProject.mutateAsync({
            id: projectId,
            payload: {
                project_name: editForm.name,
                description: editForm.description,
                project_status: editForm.status,
            },
        });

        setEditOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (!projectId) return;
        await deleteProject.mutateAsync(projectId);
    };

    // Build options from /auth/members
    const memberOptions = useMemo(() => {
        return (deptMembers || [])
            .map((m) => {
                const rawUserId =
                    m.user_id !== undefined && m.user_id !== null
                        ? m.user_id
                        : m.userId !== undefined && m.userId !== null
                            ? m.userId
                            : m.id !== undefined && m.id !== null
                                ? m.id
                                : null;

                if (rawUserId === null) return null;

                const value = String(rawUserId);

                const label =
                    m.full_name ||
                    m.name ||
                    m.email ||
                    `User #${value}`;

                const subtitle = [m.email, m.phone].filter(Boolean).join(" • ");

                const deptId =
                    m.dept_id ??
                    m.deptId ??
                    undefined;

                const designationId =
                    m.designation_id ??
                    m.designationId ??
                    undefined;

                return {value, label, subtitle, deptId, designationId};
            })
            .filter(Boolean);
    }, [deptMembers]);

    const handleAddMember = () => {
        if (!projectId || !selectedMemberId) return;

        const opt = memberOptions.find((o) => o.value === selectedMemberId);
        if (!opt?.deptId && opt?.deptId !== 0) return; // backend requires dept_id

        addMember.mutate(
            {
                projectId,
                userId: selectedMemberId,
                deptId: opt.deptId,
                designationId: opt.designationId,
            },
            {
                onSuccess: () => setSelectedMemberId(""),
            }
        );
    };

    const handleRemoveMember = (member) => {
        if (!projectId || !member?.userId) return;

        removeMember.mutate({
            projectId,
            userId: member.userId,
        });
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={loading || !!error || !projects?.length}
                        >
                            <ChevronDown className="h-4 w-4 mr-1"/>
                            View / Options
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="min-w-[240px]"
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Switch Project
                        </DropdownMenuLabel>

                        {projects?.map((p) => (
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

            {/* Edit Project Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                                Update project details. Changes will reflect instantly on the dashboard.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 mt-2">
                            {/* Project Name */}
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Project Name
                                </label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm((f) => ({...f, name: e.target.value}))
                                    }
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Description
                                </label>
                                <Textarea
                                    rows={3}
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm((f) => ({...f, description: e.target.value}))
                                    }
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Status
                                </label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(value) =>
                                        setEditForm((f) => ({...f, status: value}))
                                    }
                                >
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="Select status"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Members */}
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Members
                                </label>

                                {membersLoading ? (
                                    <p className="text-xs text-muted-foreground">
                                        Loading members...
                                    </p>
                                ) : projectMembers.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        No members assigned yet.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {projectMembers.map((m) => (
                                            <ProjectMemberPill
                                                key={m.userId || m.email}
                                                member={m}
                                                onRemove={() => handleRemoveMember(m)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Add member */}
                                <div className="mt-3">
                                    <label className="block text-[10px] font-medium mb-1 text-muted-foreground">
                                        Add member from your department
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={selectedMemberId}
                                            onValueChange={setSelectedMemberId}
                                            disabled={deptLoading || !memberOptions.length}
                                        >
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue
                                                    placeholder={
                                                        deptLoading
                                                            ? "Loading members..."
                                                            : memberOptions.length
                                                                ? "Select member"
                                                                : "No members available"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {memberOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                        {opt.subtitle ? ` — ${opt.subtitle}` : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-8"
                                            disabled={!selectedMemberId || addMember.isLoading}
                                            onClick={handleAddMember}
                                        >
                                            {addMember.isLoading ? "Adding..." : "Add"}
                                        </Button>
                                    </div>
                                </div>
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
                                {updateProject.isLoading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this project?"
                description={`"${
                    selectedProject?.name || "Project"
                }" will be permanently removed. This cannot be undone.`}
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
