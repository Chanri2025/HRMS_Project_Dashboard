import React, {useEffect, useState} from "react";
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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";

import {useCreateSubProject} from "@/hooks/useSubProjects.js";
import {useUserById} from "@/hooks/useActiveProjects.js";
import {ShadcnDateTimePicker} from "@/Utils/ShadcnDateTimePicker.jsx";

// ---------- Helper: show real member name ----------
function MemberName({member}) {
    const id = member?.userId;
    const {data} = useUserById(id);

    const displayName =
        member?.fullName ||
        data?.employee?.full_name ||
        data?.full_name ||
        member?.email ||
        data?.email ||
        `User #${id}`;

    return <span>{displayName}</span>;
}

// ---------- Helper: default form with deadline = today + 30 days ----------
function makeInitialForm() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    d.setHours(12, 0, 0, 0); // noon, arbitrary but sensible

    return {
        subprojectName: "",
        description: "",
        status: "To do",
        assignedBy: "",
        assignedTo: "",
        deadline: d.toISOString(), // ISO string
    };
}

/**
 * Props:
 * - open
 * - onOpenChange(boolean)
 * - projectId (number)
 * - projectMembers: [{ userId, fullName, email, ... }]
 */
export function SubProjectCreateDialog({
                                           open,
                                           onOpenChange,
                                           projectId,
                                           projectMembers = [],
                                       }) {
    const createSubProject = useCreateSubProject();

    const [form, setForm] = useState(makeInitialForm);
    const [errors, setErrors] = useState({});

    // When dialog closes -> reset so next open is treated as "new" with +30 days
    useEffect(() => {
        if (!open) {
            setForm(makeInitialForm());
            setErrors({});
        }
    }, [open]);

    const validate = () => {
        const next = {};
        if (!form.subprojectName.trim()) next.subprojectName = "Required";
        if (!form.description.trim()) next.description = "Required";
        if (!form.status) next.status = "Required";
        if (!form.assignedBy) next.assignedBy = "Required";
        if (!form.assignedTo) next.assignedTo = "Required";
        if (!form.deadline) next.deadline = "Required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId) return;
        if (!validate()) return;

        await createSubProject.mutateAsync({
            project_id: projectId,
            subproject_name: form.subprojectName.trim(),
            description: form.description.trim(),
            project_status: form.status,
            assigned_by: Number(form.assignedBy),
            assigned_to: Number(form.assignedTo),
            subproject_deadline: form.deadline, // ISO string
        });

        onOpenChange?.(false);
    };

    const handleDialogOpenChange = (next) => {
        // prevent closing via backdrop/esc while saving
        if (!next && createSubProject.isLoading) return;
        onOpenChange?.(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit} noValidate>
                    <DialogHeader>
                        <DialogTitle>Create Sub Project</DialogTitle>
                        <DialogDescription>
                            Link a sub project to this project with name, owner,
                            assignee, status and deadline.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-2">
                        {/* Sub Project Name */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Sub Project Name{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Input
                                value={form.subprojectName}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        subprojectName: e.target.value,
                                    }))
                                }
                                placeholder="e.g. Vehicle Routing Optimization"
                            />
                            {errors.subprojectName && (
                                <p className="text-[10px] text-destructive mt-0.5">
                                    {errors.subprojectName}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Description{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Short summary of this sub project"
                            />
                            {errors.description && (
                                <p className="text-[10px] text-destructive mt-0.5">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Status <span className="text-destructive">*</span>
                            </label>
                            <Select
                                value={form.status}
                                onValueChange={(value) =>
                                    setForm((f) => ({...f, status: value}))
                                }
                            >
                                <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue placeholder="Select status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="To do">To Do</SelectItem>
                                    <SelectItem value="Development">
                                        Development
                                    </SelectItem>
                                    <SelectItem value="Testing">
                                        Testing
                                    </SelectItem>
                                    <SelectItem value="Deployment">
                                        Deployment
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-[10px] text-destructive mt-0.5">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        {/* Assigned By */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Assigned By{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Select
                                value={form.assignedBy}
                                onValueChange={(value) =>
                                    setForm((f) => ({...f, assignedBy: value}))
                                }
                                disabled={!projectMembers.length}
                            >
                                <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue
                                        placeholder={
                                            projectMembers.length
                                                ? "Select assigner"
                                                : "No project members"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {projectMembers.map((m) => (
                                        <SelectItem
                                            key={m.userId}
                                            value={String(m.userId)}
                                        >
                                            <MemberName member={m}/>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.assignedBy && (
                                <p className="text-[10px] text-destructive mt-0.5">
                                    {errors.assignedBy}
                                </p>
                            )}
                        </div>

                        {/* Assigned To */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Assigned To{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Select
                                value={form.assignedTo}
                                onValueChange={(value) =>
                                    setForm((f) => ({...f, assignedTo: value}))
                                }
                                disabled={!projectMembers.length}
                            >
                                <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue
                                        placeholder={
                                            projectMembers.length
                                                ? "Select assignee"
                                                : "No project members"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {projectMembers.map((m) => (
                                        <SelectItem
                                            key={m.userId}
                                            value={String(m.userId)}
                                        >
                                            <MemberName member={m}/>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.assignedTo && (
                                <p className="text-[10px] text-destructive mt-0.5">
                                    {errors.assignedTo}
                                </p>
                            )}
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Deadline <span className="text-destructive">*</span>
                            </label>
                            <ShadcnDateTimePicker
                                value={form.deadline}
                                onChange={(iso) =>
                                    setForm((f) => ({
                                        ...f,
                                        deadline: iso || "",
                                    }))
                                }
                                required
                            />
                            {errors.deadline && (
                                <p className="text-[10px] text-destructive mt-0.5">
                                    {errors.deadline}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange?.(false)}
                            disabled={createSubProject.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createSubProject.isLoading}
                        >
                            {createSubProject.isLoading
                                ? "Creating..."
                                : "Create Sub Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
