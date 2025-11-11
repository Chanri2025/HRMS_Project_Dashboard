// src/pages/sections/SubDepartmentSection.jsx
import React, {useMemo, useState, useEffect} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {
    RotateCw,
    Plus,
    Search,
    Building2,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
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
import {Skeleton} from "@/components/ui/skeleton";
import {safeArray} from "@/Utils/arrays.js";
import DeptFilter from "@/Component/Organisation/Filters/DeptFilter.jsx";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

/** Fetch and render department name from id (with local fallback) */
function DeptNameCell({deptId, departments}) {
    const id = Number(deptId) || null;
    const localName = safeArray(departments).find(
        (d) => Number(d.dept_id) === id
    )?.dept_name;

    const {data, isLoading, isError} = useQuery({
        queryKey: ["org", "departments", id],
        enabled: Boolean(id),
        queryFn: async () => (await http.get(`/org/departments/${id}`)).data,
        staleTime: 5 * 60 * 1000,
    });

    const fetchedName = data?.dept_name;
    const name = fetchedName || localName;

    if (!id) return <span className="text-muted-foreground">—</span>;
    if (!name && isLoading)
        return (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted animate-pulse"/>
                Loading…
            </span>
        );
    if (!name && isError)
        return <span className="text-muted-foreground">#{id}</span>;

    return (
        <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400/80"/>
            <span className="font-medium text-slate-900">{name}</span>
        </div>
    );
}

export default function SubDepartmentSection({
                                                 departments,
                                                 deptOptions,
                                                 subDepartments,
                                                 loadingDepts,
                                                 loadingSubs,
                                                 deptFilter,
                                                 setDeptFilter,
                                                 subDeptForm,
                                                 setSubDeptForm,
                                                 onCreate,
                                                 onRefresh,
                                                 creating = false,
                                             }) {
    const qc = useQueryClient();
    const {userId} = getUserCtx?.() || {};
    const subs = safeArray(subDepartments);
    const depts = safeArray(departments);

    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // pagination: 3 rows per page
    const rowsPerPage = 3;
    const [page, setPage] = useState(1);

    // dept_id → dept_name map for local search
    const deptNameById = useMemo(() => {
        const map = new Map();
        depts.forEach((d) => map.set(Number(d.dept_id), d.dept_name));
        return map;
    }, [depts]);

    const filteredSubs = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return subs;
        return subs.filter((s) => {
            const name = s?.sub_dept_name?.toLowerCase?.() || "";
            const desc = s?.description?.toLowerCase?.() || "";
            const deptName =
                (deptNameById.get(Number(s?.dept_id)) || "")
                    .toLowerCase()
                    .trim();
            return (
                name.includes(q) ||
                desc.includes(q) ||
                deptName.includes(q)
            );
        });
    }, [search, subs, deptNameById]);

    const totalPages =
        Math.max(1, Math.ceil(filteredSubs.length / rowsPerPage));
    const currentPageData = filteredSubs.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // reset to page 1 when filter/search changes
    useEffect(() => {
        setPage(1);
    }, [search, deptFilter, subs.length]);

    const selectedDeptLabel =
        safeArray(deptOptions).find(
            (o) => o.value === String(deptFilter)
        )?.label || "All";

    const canSubmit =
        Boolean(subDeptForm?.dept_id) &&
        Boolean(subDeptForm?.sub_dept_name?.trim());

    /* ----------------------------- mutations ----------------------------- */

    const mUpdate = useMutation({
        mutationFn: async ({sub_dept_id, payload}) => {
            const body = {
                ...payload,
                dept_id: Number(payload.dept_id),
            };
            return (
                await http.put(
                    `/org/sub-departments/${Number(sub_dept_id)}`,
                    body
                )
            ).data;
        },
        onSuccess: (data, vars) => {
            toast.success(
                `Updated “${
                    data?.sub_dept_name ||
                    vars?.payload?.sub_dept_name
                }”`
            );
            qc.invalidateQueries({
                queryKey: ["org", "sub-departments"],
            });
            setEditing(null);
        },
        onError: (err) =>
            toast.error(
                errText(err, "Failed to update sub-department")
            ),
    });

    const mDelete = useMutation({
        mutationFn: async ({sub_dept_id}) =>
            (
                await http.delete(
                    `/org/sub-departments/${Number(sub_dept_id)}`
                )
            ).data,
        onSuccess: (_, vars) => {
            toast.success(
                `Deleted sub-department #${vars.sub_dept_id}`
            );
            qc.invalidateQueries({
                queryKey: ["org", "sub-departments"],
            });
            setDeleteTarget(null);
        },
        onError: (err) =>
            toast.error(
                errText(err, "Failed to delete sub-department")
            ),
    });

    /* -------------------------------- UI --------------------------------- */

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Left: Create form */}
                <Card
                    className="
                        xl:col-span-1
                        relative overflow-hidden
                        border border-violet-100/90
                        bg-gradient-to-br from-violet-50/90 via-white/98 to-slate-50/80
                        backdrop-blur-xl
                        shadow-[0_16px_40px_rgba(15,23,42,0.06)]
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]
                    "
                >
                    <div
                        className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-200/40"/>
                    <div
                        className="pointer-events-none absolute -bottom-10 left-4 h-20 w-20 rounded-full bg-violet-50/40"/>

                    <CardHeader className="space-y-1 relative z-10 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="rounded-2xl p-2 bg-violet-500 text-white shadow-md">
                                <Building2 className="h-4 w-4"/>
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900">
                                    Add Sub-Department
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Nest focused teams under your departments.
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 relative z-10">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Parent Department
                            </Label>
                            <Select
                                value={
                                    subDeptForm.dept_id
                                        ? String(subDeptForm.dept_id)
                                        : undefined
                                }
                                onValueChange={(v) =>
                                    setSubDeptForm((s) => ({
                                        ...s,
                                        dept_id: Number(v),
                                    }))
                                }
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select department"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {safeArray(deptOptions).map((o) => (
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
                            <Label className="text-xs text-slate-600">
                                Sub-Department Name
                            </Label>
                            <Input
                                value={subDeptForm.sub_dept_name}
                                onChange={(e) =>
                                    setSubDeptForm((s) => ({
                                        ...s,
                                        sub_dept_name:
                                        e.target.value,
                                    }))
                                }
                                placeholder="e.g., Backend Team"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Description{" "}
                                <span className="text-[10px] text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                value={subDeptForm.description}
                                onChange={(e) =>
                                    setSubDeptForm((s) => ({
                                        ...s,
                                        description:
                                        e.target.value,
                                    }))
                                }
                                placeholder="Purpose, responsibilities, notes…"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1.5">
                            <Button
                                className="flex-1 h-9 text-xs font-medium bg-violet-500 hover:bg-violet-600"
                                disabled={!canSubmit || creating}
                                onClick={onCreate}
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5"/>
                                {creating ? "Creating…" : "Create"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 text-xs"
                                onClick={() =>
                                    setSubDeptForm((s) => ({
                                        ...s,
                                        sub_dept_name: "",
                                        description: "",
                                    }))
                                }
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Table */}
                <Card
                    className="
                        xl:col-span-2
                        border border-slate-100/90
                        bg-white/95 backdrop-blur-xl
                        shadow-[0_14px_40px_rgba(15,23,42,0.05)]
                        transition-all duration-300
                        hover:shadow-[0_18px_55px_rgba(15,23,42,0.08)]
                    "
                >
                    <CardHeader className="pb-2">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold text-slate-900">
                                    Sub-Departments Overview
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full px-3 py-1 text-[11px] border-violet-200/80 bg-violet-50/70 text-violet-700"
                                    >
                                        {filteredSubs.length} total
                                    </Badge>
                                    <span className="text-[10px] text-slate-500">
                                        Dept: {selectedDeptLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="flex w-full md:w-auto items-center gap-2">
                                <div className="relative w-full md:w-[240px]">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"/>
                                    <Input
                                        className="pl-8 h-9 text-xs"
                                        placeholder="Search by name, description, or department…"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <DeptFilter
                                    value={deptFilter}
                                    onChange={setDeptFilter}
                                    options={deptOptions}
                                    loading={loadingDepts}
                                />

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={onRefresh}
                                    disabled={loadingSubs}
                                    className="h-9 w-9 rounded-full border-slate-200 hover:border-violet-400 hover:bg-violet-50"
                                    aria-label="Refresh sub-departments"
                                >
                                    <RotateCw
                                        className={`h-4 w-4 ${
                                            loadingSubs
                                                ? "animate-spin"
                                                : ""
                                        } text-violet-600`}
                                    />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-xl border border-slate-100/80 overflow-hidden bg-slate-50/40">
                            <Table>
                                <TableHeader className="bg-slate-50/90">
                                    <TableRow>
                                        <TableHead className="w-16 text-[10px] uppercase tracking-wide text-slate-500">
                                            ID
                                        </TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-wide text-slate-500">
                                            Parent Department
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
                                    {loadingSubs ? (
                                        <>
                                            <SkeletonRow/>
                                            <SkeletonRow/>
                                            <SkeletonRow/>
                                        </>
                                    ) : currentPageData.length ? (
                                        currentPageData.map((s) => (
                                            <TableRow
                                                key={s.sub_dept_id}
                                                className="hover:bg-violet-50/40 transition-colors"
                                            >
                                                <TableCell className="text-[11px] text-slate-500">
                                                    {s.sub_dept_id}
                                                </TableCell>
                                                <TableCell>
                                                    <DeptNameCell
                                                        deptId={s.dept_id}
                                                        departments={depts}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-900">
                                                    {s.sub_dept_name}
                                                </TableCell>
                                                <TableCell className="max-w-[420px]">
                                                    <span className="block truncate text-[11px] text-slate-600">
                                                        {s.description || "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-slate-200 hover:border-violet-400 hover:bg-violet-50"
                                                            onClick={() =>
                                                                setEditing({
                                                                    sub_dept_id:
                                                                    s.sub_dept_id,
                                                                    dept_id: Number(
                                                                        s.dept_id
                                                                    ),
                                                                    sub_dept_name:
                                                                        s.sub_dept_name ||
                                                                        "",
                                                                    description:
                                                                        s.description ||
                                                                        "",
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-violet-700"/>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-slate-200 hover:border-rose-400 hover:bg-rose-50"
                                                            onClick={() =>
                                                                setDeleteTarget({
                                                                    sub_dept_id:
                                                                    s.sub_dept_id,
                                                                    name: s.sub_dept_name,
                                                                })
                                                            }
                                                            disabled={
                                                                mDelete.isPending
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
                                                colSpan={5}
                                                className="py-8 text-center text-xs text-slate-500"
                                            >
                                                No sub-departments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {filteredSubs.length > rowsPerPage && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.max(1, p - 1)
                                        )
                                    }
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4"/>
                                </Button>

                                {Array.from(
                                    {length: totalPages},
                                    (_, i) => i + 1
                                ).map((p) => (
                                    <Button
                                        key={p}
                                        variant={
                                            page === p
                                                ? "default"
                                                : "outline"
                                        }
                                        className={`h-8 w-8 text-xs ${
                                            page === p
                                                ? "bg-violet-500 hover:bg-violet-600 text-white"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setPage(p)
                                        }
                                    >
                                        {p}
                                    </Button>
                                ))}

                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(
                                                totalPages,
                                                p + 1
                                            )
                                        )
                                    }
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
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
                        <DialogTitle>Edit Sub-Department</DialogTitle>
                        <DialogDescription>
                            Update the selected sub-department details.
                        </DialogDescription>
                    </DialogHeader>

                    {editing && (
                        <div className="space-y-3 pt-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Parent Department
                                </Label>
                                <Select
                                    value={String(
                                        editing.dept_id || ""
                                    )}
                                    onValueChange={(v) =>
                                        setEditing((e) => ({
                                            ...e,
                                            dept_id: Number(v),
                                        }))
                                    }
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(deptOptions).map(
                                            (o) => (
                                                <SelectItem
                                                    key={
                                                        o.value
                                                    }
                                                    value={
                                                        o.value
                                                    }
                                                >
                                                    {o.label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Sub-Department Name
                                </Label>
                                <Input
                                    value={
                                        editing.sub_dept_name
                                    }
                                    onChange={(e) =>
                                        setEditing((ed) => ({
                                            ...ed,
                                            sub_dept_name:
                                            e.target.value,
                                        }))
                                    }
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Description{" "}
                                    <span className="text-[10px] text-slate-400">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    value={
                                        editing.description
                                    }
                                    onChange={(e) =>
                                        setEditing((ed) => ({
                                            ...ed,
                                            description:
                                            e.target.value,
                                        }))
                                    }
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            className="h-9 text-xs bg-violet-500 hover:bg-violet-600"
                            onClick={() =>
                                mUpdate.mutate({
                                    sub_dept_id:
                                    editing.sub_dept_id,
                                    payload: {
                                        dept_id:
                                        editing.dept_id,
                                        sub_dept_name:
                                            editing.sub_dept_name?.trim(),
                                        description:
                                            editing.description?.trim(),
                                    },
                                })
                            }
                            disabled={
                                mUpdate.isPending ||
                                !editing?.sub_dept_name?.trim() ||
                                !Number.isFinite(
                                    Number(
                                        editing?.dept_id
                                    )
                                )
                            }
                        >
                            {mUpdate.isPending
                                ? "Saving…"
                                : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) =>
                    !open && setDeleteTarget(null)
                }
            >
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>
                            Delete Sub-Department
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will
                            permanently delete{" "}
                            <span className="font-medium text-slate-900">
                                {deleteTarget?.name ||
                                    `#${deleteTarget?.sub_dept_id}`}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="h-9 text-xs"
                            onClick={() =>
                                mDelete.mutate({
                                    sub_dept_id:
                                    deleteTarget.sub_dept_id,
                                })
                            }
                            disabled={mDelete.isPending}
                        >
                            {mDelete.isPending
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
                <Skeleton className="h-4 w-8"/>
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
