import React, {useState} from "react";
import {
    RotateCw,
    Pencil,
    Trash2,
    Building2,
    Plus,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {safeArray} from "@/Utils/arrays";

export default function DepartmentSection({
                                              departments,
                                              loading,
                                              deptForm,
                                              setDeptForm,
                                              onCreate,
                                              onRefresh,
                                              onUpdate,
                                              updating = false,
                                              onDelete,
                                              deletingId = null,
                                          }) {
    const depts = safeArray(departments);

    const form = deptForm ?? {dept_name: "", description: ""};
    const updateForm = setDeptForm ?? (() => {
    });
    const handleCreate = onCreate ?? (() => {
    });
    const handleRefresh = onRefresh ?? (() => {
    });

    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Create form */}
                <Card
                    className={`
                        lg:col-span-1
                        relative overflow-hidden
                        border border-sky-100/90
                        bg-gradient-to-br from-sky-50/80 via-white/90 to-blue-50/70
                        backdrop-blur-xl
                        shadow-[0_16px_40px_rgba(15,23,42,0.06)]
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]
                    `}
                >
                    <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-sky-200/40"/>
                    <div
                        className="pointer-events-none absolute -bottom-10 left-4 h-20 w-20 rounded-full bg-sky-100/40"/>

                    <CardHeader className="relative z-10 pb-3">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-8 w-8 rounded-xl bg-sky-500/90 flex items-center justify-center text-white shadow-md">
                                <Building2 className="h-4 w-4"/>
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900">
                                    Add Department
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Keep your org structured with clear groups.
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Department Name</Label>
                                    <Skeleton className="h-10 w-full rounded-md"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Skeleton className="h-10 w-full rounded-md"/>
                                </div>
                                <Skeleton className="h-10 w-full rounded-md"/>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-600">
                                        Department Name
                                    </Label>
                                    <Input
                                        value={form.dept_name}
                                        onChange={(e) =>
                                            updateForm((s) => ({
                                                ...(s || {}),
                                                dept_name: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g., Engineering"
                                        className="h-10 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-600">
                                        Description
                                    </Label>
                                    <Input
                                        value={form.description}
                                        onChange={(e) =>
                                            updateForm((s) => ({
                                                ...(s || {}),
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="Optional context"
                                        className="h-10 text-sm"
                                    />
                                </div>
                                <Button
                                    disabled={!form.dept_name}
                                    onClick={handleCreate}
                                    className="w-full gap-2 h-10 text-sm font-medium bg-sky-500 hover:bg-sky-600"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Create Department
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Table */}
                <Card
                    className={`
                        lg:col-span-2
                        border border-slate-100/90
                        bg-white/85 backdrop-blur-xl
                        shadow-[0_14px_40px_rgba(15,23,42,0.05)]
                        transition-all duration-300
                        hover:shadow-[0_18px_55px_rgba(15,23,42,0.08)]
                    `}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900">
                                    Departments Overview
                                </CardTitle>
                                <p className="text-[11px] text-slate-500">
                                    View, edit & remove departments in your workspace.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="rounded-full px-3 py-1 text-[11px] border-sky-200/80 bg-sky-50/70 text-sky-700"
                                >
                                    {depts.length} total
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRefresh}
                                    aria-label="Refresh departments"
                                    className="h-9 w-9 rounded-full border-slate-200 hover:border-sky-400 hover:bg-sky-50"
                                >
                                    <RotateCw
                                        className={`h-4 w-4 ${
                                            loading ? "animate-spin" : ""
                                        } text-sky-600`}
                                    />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                        <div className="rounded-xl border border-slate-100/80 bg-slate-50/40 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/90">
                                        <TableHead className="w-20 text-[11px] uppercase tracking-wide text-slate-500">
                                            ID
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">
                                            Name
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">
                                            Description
                                        </TableHead>
                                        <TableHead
                                            className="w-32 text-right text-[11px] uppercase tracking-wide text-slate-500">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {loading ? (
                                        <>
                                            <SkeletonRow/>
                                            <SkeletonRow/>
                                            <SkeletonRow/>
                                        </>
                                    ) : depts.length > 0 ? (
                                        depts.map((d) => (
                                            <TableRow
                                                key={d.dept_id}
                                                className="hover:bg-sky-50/50 transition-colors"
                                            >
                                                <TableCell className="text-xs text-slate-500">
                                                    {d.dept_id}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-slate-900">
                                                    {d.dept_name}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600">
                                                    {d.description || "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-slate-200 hover:border-violet-400 hover:bg-violet-50"
                                                            onClick={() =>
                                                                setEditing({
                                                                    dept_id: d.dept_id,
                                                                    dept_name:
                                                                        d.dept_name ||
                                                                        "",
                                                                    description:
                                                                        d.description ||
                                                                        "",
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-violet-600"/>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-slate-200 hover:border-rose-400 hover:bg-rose-50"
                                                            onClick={() =>
                                                                setDeleteTarget({
                                                                    dept_id: d.dept_id,
                                                                    dept_name:
                                                                    d.dept_name,
                                                                })
                                                            }
                                                            disabled={
                                                                Number(
                                                                    deletingId
                                                                ) ===
                                                                Number(
                                                                    d.dept_id
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-rose-600"/>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-6 text-center text-xs text-slate-500"
                                            >
                                                No departments yet. Create your
                                                first one on the left.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Modal */}
            <Dialog
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Tweak the name or description. Changes apply
                            immediately.
                        </DialogDescription>
                    </DialogHeader>

                    {editing && (
                        <div className="space-y-3 pt-1">
                            <div className="space-y-1.5">
                                <Label>Department Name</Label>
                                <Input
                                    value={editing.dept_name}
                                    onChange={(e) =>
                                        setEditing((ed) => ({
                                            ...ed,
                                            dept_name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Input
                                    value={editing.description}
                                    onChange={(e) =>
                                        setEditing((ed) => ({
                                            ...ed,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() =>
                                onUpdate?.({
                                    dept_id: editing.dept_id,
                                    payload: {
                                        dept_name:
                                            editing.dept_name?.trim(),
                                        description:
                                            editing.description?.trim(),
                                    },
                                })
                            }
                            disabled={
                                updating ||
                                !editing?.dept_name?.trim()
                            }
                        >
                            {updating ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            remove{" "}
                            <span className="font-semibold text-slate-900">
                                {deleteTarget?.dept_name ||
                                    `#${deleteTarget?.dept_id}`}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                onDelete?.({
                                    dept_id: deleteTarget.dept_id,
                                })
                            }
                            disabled={
                                Number(deletingId) ===
                                Number(deleteTarget?.dept_id)
                            }
                        >
                            {Number(deletingId) ===
                            Number(deleteTarget?.dept_id)
                                ? "Deleting…"
                                : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function SkeletonRow() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-4 w-10"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-32"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-40"/>
            </TableCell>
            <TableCell/>
        </TableRow>
    );
}
