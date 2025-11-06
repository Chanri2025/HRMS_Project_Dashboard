import React, {useMemo, useState} from "react";
import {RotateCw, Pencil, Trash2, Building2} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
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
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import DeptFilter from "../filters/DeptFilter.jsx";
import SubDeptFilter from "../filters/SubDeptFilter.jsx";
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

                                               // NEW props injected from page-level for edit/delete:
                                               onUpdate,   // ({ designation_id, payload }) => Promise
                                               updating,   // boolean
                                               onDelete,   // ({ designation_id }) => Promise
                                               deletingId, // number | null
                                           }) {
    const depts = safeArray(departments);
    const subs = safeArray(subDepartments);
    const gns = safeArray(designations);
    const subOptsForDesig = safeArray(subDeptsForDesignation);

    // Modal states
    const [editing, setEditing] = useState(null); // { designation_id, dept_id, sub_dept_id, designation_name, description }
    const [deleteTarget, setDeleteTarget] = useState(null); // { designation_id, designation_name }

    // Derived options (for the EDIT modal, dependent on selected dept in that modal)
    const editSubOptions = useMemo(() => {
        if (!editing?.dept_id) return [];
        return subs
            .filter(s => Number(s.dept_id) === Number(editing.dept_id))
            .map(s => ({value: String(s.sub_dept_id), label: s.sub_dept_name}));
    }, [editing?.dept_id, subs]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Create form */}
            <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Add Designation</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select
                            value={designationForm.dept_id ? String(designationForm.dept_id) : undefined}
                            onValueChange={(v) =>
                                setDesignationForm((s) => ({...s, dept_id: Number(v) || "", sub_dept_id: ""}))
                            }
                        >
                            <SelectTrigger><SelectValue placeholder="Select department"/></SelectTrigger>
                            <SelectContent>
                                {safeArray(deptOptions).map((o) => (
                                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Sub-Department</Label>
                        <Select
                            value={designationForm.sub_dept_id ? String(designationForm.sub_dept_id) : undefined}
                            onValueChange={(v) => setDesignationForm((s) => ({...s, sub_dept_id: Number(v) || ""}))}
                            disabled={!designationForm.dept_id}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={designationForm.dept_id ? "Select sub-department" : "Select department first"}/>
                            </SelectTrigger>
                            <SelectContent>
                                {subOptsForDesig.map((o) => (
                                    <SelectItem key={o.sub_dept_id} value={String(o.sub_dept_id)}>
                                        {o.sub_dept_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Designation Name</Label>
                        <Input
                            value={designationForm.designation_name || ""}
                            onChange={(e) => setDesignationForm((s) => ({...s, designation_name: e.target.value}))}
                            placeholder="e.g., Senior Engineer"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={designationForm.description || ""}
                            onChange={(e) => setDesignationForm((s) => ({...s, description: e.target.value}))}
                            placeholder="Optional"
                        />
                    </div>
                    <Button
                        className="w-full"
                        disabled={
                            !designationForm.dept_id ||
                            !designationForm.sub_dept_id ||
                            !designationForm.designation_name
                        }
                        onClick={onCreate}
                    >
                        Create Designation
                    </Button>
                </CardContent>
            </Card>

            {/* Right: Table */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Designations</CardTitle>
                        <div className="flex items-center gap-2">
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
                            <Badge variant="secondary">{gns.length}</Badge>
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingDesignations}>
                                <RotateCw className="mr-1 h-4 w-4"/> Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">ID</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Sub-Department</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-36 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gns.map((g) => {
                                const deptName = depts.find((d) => Number(d.dept_id) === Number(g.dept_id))?.dept_name || "-";
                                const subName = subs.find((s) => Number(s.sub_dept_id) === Number(g.sub_dept_id))?.sub_dept_name || "-";
                                return (
                                    <TableRow key={g.designation_id}>
                                        <TableCell className="text-muted-foreground">{g.designation_id}</TableCell>
                                        <TableCell>{deptName}</TableCell>
                                        <TableCell>{subName}</TableCell>
                                        <TableCell className="font-medium">{g.designation_name}</TableCell>
                                        <TableCell>{g.description || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setEditing({
                                                            designation_id: g.designation_id,
                                                            dept_id: Number(g.dept_id),
                                                            sub_dept_id: Number(g.sub_dept_id),
                                                            designation_name: g.designation_name || "",
                                                            description: g.description || "",
                                                        })
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4 mr-1"/>
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setDeleteTarget({
                                                        designation_id: g.designation_id,
                                                        designation_name: g.designation_name
                                                    })}
                                                    disabled={Number(deletingId) === Number(g.designation_id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1"/>
                                                    {Number(deletingId) === Number(g.designation_id) ? "Deleting…" : "Delete"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!gns.length && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        {loadingDesignations ? "Loading..." : "No designations yet."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Edit Designation</DialogTitle>
                        <DialogDescription>Update the selected designation details.</DialogDescription>
                    </DialogHeader>

                    {editing && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select
                                    value={String(editing.dept_id || "")}
                                    onValueChange={(v) => {
                                        const nv = Number(v) || "";
                                        setEditing((e) => ({...e, dept_id: nv, sub_dept_id: ""}));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(deptOptions).map((o) => (
                                            <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Sub-Department</Label>
                                <Select
                                    value={editing.sub_dept_id ? String(editing.sub_dept_id) : undefined}
                                    onValueChange={(v) => setEditing((e) => ({...e, sub_dept_id: Number(v) || ""}))}
                                    disabled={!editing.dept_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={editing.dept_id ? "Select sub-department" : "Select department first"}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editSubOptions.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Designation Name</Label>
                                <Input
                                    value={editing.designation_name}
                                    onChange={(e) => setEditing((ed) => ({...ed, designation_name: e.target.value}))}
                                    placeholder="e.g., Senior Engineer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={editing.description}
                                    onChange={(e) => setEditing((ed) => ({...ed, description: e.target.value}))}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() =>
                                onUpdate?.({
                                    designation_id: editing.designation_id,
                                    payload: {
                                        dept_id: Number(editing.dept_id),
                                        sub_dept_id: Number(editing.sub_dept_id),
                                        designation_name: editing.designation_name?.trim(),
                                        description: editing.description?.trim(),
                                    },
                                })
                            }
                            disabled={
                                updating ||
                                !editing?.designation_name?.trim() ||
                                !Number.isFinite(Number(editing?.dept_id)) ||
                                !Number.isFinite(Number(editing?.sub_dept_id))
                            }
                        >
                            {updating ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Delete Designation</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            <span
                                className="font-medium">{deleteTarget?.designation_name || `#${deleteTarget?.designation_id}`}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => onDelete?.({designation_id: deleteTarget.designation_id})}
                            disabled={Number(deletingId) === Number(deleteTarget?.designation_id)}
                        >
                            {Number(deletingId) === Number(deleteTarget?.designation_id) ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
