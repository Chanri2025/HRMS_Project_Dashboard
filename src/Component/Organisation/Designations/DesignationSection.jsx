import React, {useMemo, useState} from "react";
import {
    RotateCw,
    Pencil,
    Trash2,
    Building2,
    BadgeCheck,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import DeptFilter from "@/Component/Organisation/Filters/DeptFilter.jsx";
import SubDeptFilter from "@/Component/Organisation/Filters/SubDeptFilter.jsx";
import {Skeleton} from "@/components/ui/skeleton";
import {safeArray} from "@/Utils/arrays.js";

export default function DesignationSection({
                                               departments,
                                               subDepartments,
                                               deptOptions,
                                               subDeptOptions,
                                               subDeptsForDesignation,
                                               designations,
                                               loadingDepts,
                                               loadingSubs,
                                               loadingDesignations,
                                               deptFilter,
                                               setDeptFilter,
                                               subDeptFilter,
                                               setSubDeptFilter,
                                               designationForm,
                                               setDesignationForm,
                                               onCreate,
                                               onRefresh,
                                               onUpdate,
                                               updating,
                                               onDelete,
                                               deletingId,
                                           }) {
    const depts = safeArray(departments);
    const subs = safeArray(subDepartments);
    const gns = safeArray(designations);
    const subOptsForDesig = safeArray(subDeptsForDesignation);

    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const editSubOptions = useMemo(() => {
        if (!editing?.dept_id) return [];
        return subs
            .filter((s) => Number(s.dept_id) === Number(editing.dept_id))
            .map((s) => ({
                value: String(s.sub_dept_id),
                label: s.sub_dept_name,
            }));
    }, [editing?.dept_id, subs]);

    const isCreateLoading = loadingDepts || loadingSubs;
    const isTableLoading = loadingDesignations;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Create Designation */}
            <Card
                className={`
                    lg:col-span-1
                    relative overflow-hidden
                    border border-emerald-100/90
                    bg-gradient-to-br from-emerald-50/90 via-white/98 to-sky-50/70
                    backdrop-blur-xl
                    shadow-[0_16px_40px_rgba(15,23,42,0.06)]
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]
                `}
            >
                <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-200/40"/>
                <div
                    className="pointer-events-none absolute -bottom-10 left-4 h-20 w-20 rounded-full bg-emerald-50/40"/>

                <CardHeader className="relative z-10 pb-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                            <BadgeCheck className="h-4 w-4"/>
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Add Designation
                            </CardTitle>
                            <p className="text-xs text-slate-500">
                                Attach roles to the right department & sub-department.
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-3">
                    {isCreateLoading ? (
                        <div className="space-y-3">
                            <SkeletonBlock label="Department"/>
                            <SkeletonBlock label="Sub-Department"/>
                            <SkeletonBlock label="Designation Name"/>
                            <SkeletonBlock label="Description"/>
                            <Skeleton className="h-9 w-full rounded-md"/>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">
                                    Department
                                </Label>
                                <Select
                                    value={
                                        designationForm.dept_id
                                            ? String(designationForm.dept_id)
                                            : undefined
                                    }
                                    onValueChange={(v) =>
                                        setDesignationForm((s) => ({
                                            ...s,
                                            dept_id: Number(v) || "",
                                            sub_dept_id: "",
                                        }))
                                    }
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(deptOptions).map((o) => (
                                            <SelectItem key={o.value} value={String(o.value)}>
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">
                                    Sub-Department
                                </Label>
                                <Select
                                    value={
                                        designationForm.sub_dept_id
                                            ? String(designationForm.sub_dept_id)
                                            : undefined
                                    }
                                    onValueChange={(v) =>
                                        setDesignationForm((s) => ({
                                            ...s,
                                            sub_dept_id: Number(v) || "",
                                        }))
                                    }
                                    disabled={!designationForm.dept_id}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue
                                            placeholder={
                                                designationForm.dept_id
                                                    ? "Select sub-department"
                                                    : "Select department first"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subOptsForDesig.map((o) => (
                                            <SelectItem
                                                key={o.sub_dept_id}
                                                value={String(o.sub_dept_id)}
                                            >
                                                {o.sub_dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">
                                    Designation Name
                                </Label>
                                <Input
                                    value={designationForm.designation_name || ""}
                                    onChange={(e) =>
                                        setDesignationForm((s) => ({
                                            ...s,
                                            designation_name: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., Senior Engineer"
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">
                                    Description
                                </Label>
                                <Input
                                    value={designationForm.description || ""}
                                    onChange={(e) =>
                                        setDesignationForm((s) => ({
                                            ...s,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Optional"
                                    className="h-9 text-xs"
                                />
                            </div>

                            <Button
                                className="w-full h-9 text-xs font-medium bg-emerald-500 hover:bg-emerald-600"
                                disabled={
                                    !designationForm.dept_id ||
                                    !designationForm.sub_dept_id ||
                                    !designationForm.designation_name
                                }
                                onClick={onCreate}
                            >
                                Create Designation
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Right: Designations Table */}
            <Card
                className={`
                    lg:col-span-2
                    border border-slate-100/90
                    bg-white/95 backdrop-blur-xl
                    shadow-[0_14px_40px_rgba(15,23,42,0.05)]
                    transition-all duration-300
                    hover:shadow-[0_18px_55px_rgba(15,23,42,0.08)]
                `}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Designations Overview
                            </CardTitle>
                            <p className="text-[11px] text-slate-500">
                                Filter and manage role mappings across your organisation.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <DeptFilter
                                value={deptFilter}
                                onChange={(v) => {
                                    setDeptFilter(v);
                                    setSubDeptFilter("");
                                }}
                                options={deptOptions}
                                loading={loadingDepts}
                            />
                            <SubDeptFilter
                                value={subDeptFilter}
                                onChange={setSubDeptFilter}
                                options={subDeptOptions}
                                disabled={!deptFilter}
                                loading={loadingSubs}
                            />
                            <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1 text-[11px] border-emerald-200/80 bg-emerald-50/80 text-emerald-700"
                            >
                                {gns.length} total
                            </Badge>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onRefresh}
                                disabled={isTableLoading}
                                className="h-9 w-9 rounded-full border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                                aria-label="Refresh designations"
                            >
                                <RotateCw
                                    className={`h-4 w-4 ${
                                        isTableLoading ? "animate-spin" : ""
                                    } text-emerald-600`}
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
                                    <TableHead className="w-16 text-[10px] uppercase tracking-wide text-slate-500">
                                        ID
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wide text-slate-500">
                                        Department
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wide text-slate-500">
                                        Sub-Department
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wide text-slate-500">
                                        Name
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wide text-slate-500">
                                        Description
                                    </TableHead>
                                    <TableHead
                                        className="w-32 text-right text-[10px] uppercase tracking-wide text-slate-500">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isTableLoading ? (
                                    <>
                                        <SkeletonRow/>
                                        <SkeletonRow/>
                                        <SkeletonRow/>
                                    </>
                                ) : gns.length > 0 ? (
                                    gns.map((g) => {
                                        const deptName =
                                            depts.find(
                                                (d) =>
                                                    Number(d.dept_id) ===
                                                    Number(g.dept_id)
                                            )?.dept_name || "—";
                                        const subName =
                                            subs.find(
                                                (s) =>
                                                    Number(
                                                        s.sub_dept_id
                                                    ) ===
                                                    Number(g.sub_dept_id)
                                            )?.sub_dept_name || "—";

                                        return (
                                            <TableRow
                                                key={g.designation_id}
                                                className="hover:bg-emerald-50/40 transition-colors"
                                            >
                                                <TableCell className="text-[11px] text-slate-500">
                                                    {g.designation_id}
                                                </TableCell>
                                                <TableCell className="text-[11px] text-slate-700">
                                                    {deptName}
                                                </TableCell>
                                                <TableCell className="text-[11px] text-slate-700">
                                                    {subName}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-900">
                                                    {g.designation_name}
                                                </TableCell>
                                                <TableCell className="text-[11px] text-slate-600 max-w-xs truncate">
                                                    {g.description || "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                                                            onClick={() =>
                                                                setEditing({
                                                                    designation_id:
                                                                    g.designation_id,
                                                                    dept_id: Number(
                                                                        g.dept_id
                                                                    ),
                                                                    sub_dept_id:
                                                                        Number(
                                                                            g.sub_dept_id
                                                                        ),
                                                                    designation_name:
                                                                        g.designation_name ||
                                                                        "",
                                                                    description:
                                                                        g.description ||
                                                                        "",
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-emerald-700"/>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-slate-200 hover:border-rose-400 hover:bg-rose-50"
                                                            onClick={() =>
                                                                setDeleteTarget({
                                                                    designation_id:
                                                                    g.designation_id,
                                                                    designation_name:
                                                                    g.designation_name,
                                                                })
                                                            }
                                                            disabled={
                                                                Number(
                                                                    deletingId
                                                                ) ===
                                                                Number(
                                                                    g.designation_id
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-rose-600"/>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-6 text-center text-xs text-slate-500"
                                        >
                                            No designations yet. Create one using the panel on
                                            the left.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Dialog
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Edit Designation</DialogTitle>
                        <DialogDescription>
                            Update the mapping and title for this designation.
                        </DialogDescription>
                    </DialogHeader>

                    {editing && (
                        <div className="space-y-3 pt-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Department</Label>
                                <Select
                                    value={String(editing.dept_id || "")}
                                    onValueChange={(v) => {
                                        const nv = Number(v) || "";
                                        setEditing((e) => ({
                                            ...e,
                                            dept_id: nv,
                                            sub_dept_id: "",
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(deptOptions).map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={String(o.value)}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Sub-Department</Label>
                                <Select
                                    value={
                                        editing.sub_dept_id
                                            ? String(editing.sub_dept_id)
                                            : undefined
                                    }
                                    onValueChange={(v) =>
                                        setEditing((e) => ({
                                            ...e,
                                            sub_dept_id: Number(v) || "",
                                        }))
                                    }
                                    disabled={!editing.dept_id}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue
                                            placeholder={
                                                editing.dept_id
                                                    ? "Select sub-department"
                                                    : "Select department first"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editSubOptions.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Designation Name
                                </Label>
                                <Input
                                    value={editing.designation_name}
                                    onChange={(e) =>
                                        setEditing((ed) => ({
                                            ...ed,
                                            designation_name:
                                            e.target.value,
                                        }))
                                    }
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Description
                                </Label>
                                <Input
                                    value={editing.description}
                                    onChange={(e) =>
                                        setEditing((ed) => ({
                                            ...ed,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="outline" className="h-9 text-xs">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            className="h-9 text-xs bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => {
                                if (!editing) return;
                                onUpdate?.({
                                    designation_id: editing.designation_id,
                                    payload: {
                                        dept_id: Number(editing.dept_id),
                                        sub_dept_id: Number(
                                            editing.sub_dept_id
                                        ),
                                        designation_name:
                                            editing.designation_name?.trim(),
                                        description:
                                            editing.description?.trim(),
                                    },
                                });
                                setEditing(null);
                            }}
                            disabled={
                                updating ||
                                !editing?.designation_name?.trim() ||
                                !Number.isFinite(Number(editing?.dept_id)) ||
                                !Number.isFinite(
                                    Number(editing?.sub_dept_id)
                                )
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
                        <DialogTitle>Delete Designation</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            remove{" "}
                            <span className="font-semibold text-slate-900">
                                {deleteTarget?.designation_name ||
                                    `#${deleteTarget?.designation_id}`}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="h-9 text-xs">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="h-9 text-xs"
                            onClick={() => {
                                if (!deleteTarget) return;
                                onDelete?.({
                                    designation_id:
                                    deleteTarget.designation_id,
                                });
                                setDeleteTarget(null);
                            }}
                            disabled={
                                Number(deletingId) ===
                                Number(deleteTarget?.designation_id)
                            }
                        >
                            {Number(deletingId) ===
                            Number(deleteTarget?.designation_id)
                                ? "Deleting…"
                                : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SkeletonBlock({label}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">{label}</Label>
            <Skeleton className="h-9 w-full rounded-md"/>
        </div>
    );
}

function SkeletonRow() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-4 w-8"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-24"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-24"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-28"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-40"/>
            </TableCell>
            <TableCell className="text-right">
                <Skeleton className="h-7 w-16 ml-auto"/>
            </TableCell>
        </TableRow>
    );
}
