import React, {useState} from "react";
import {RotateCw, Pencil, Trash2} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
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
import {safeArray} from "@/Utils/arrays.js";

export default function DepartmentSection({
                                              departments,
                                              loading,
                                              deptForm,
                                              setDeptForm,
                                              onCreate,
                                              onRefresh,

                                              // NEW for edit/delete
                                              onUpdate,          // ({ dept_id, payload }) => void
                                              updating = false,  // boolean
                                              onDelete,          // ({ dept_id }) => void
                                              deletingId = null, // number | null
                                          }) {
    const depts = safeArray(departments);

    // Safe defaults so component can render even if props are missing
    const form = deptForm ?? {dept_name: "", description: ""};
    const updateForm = setDeptForm ?? (() => {
    });
    const handleCreate = onCreate ?? (() => {
    });
    const handleRefresh = onRefresh ?? (() => {
    });

    // Edit/Delete modal state
    const [editing, setEditing] = useState(null); // { dept_id, dept_name, description }
    const [deleteTarget, setDeleteTarget] = useState(null); // { dept_id, dept_name }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Create form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Add Department</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                                <div className="space-y-2">
                                    <Label>Department Name</Label>
                                    <Input
                                        value={form.dept_name}
                                        onChange={(e) => updateForm((s) => ({...(s || {}), dept_name: e.target.value}))}
                                        placeholder="e.g., Engineering"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={form.description}
                                        onChange={(e) => updateForm((s) => ({
                                            ...(s || {}),
                                            description: e.target.value
                                        }))}
                                        placeholder="Optional"
                                    />
                                </div>
                                <Button disabled={!form.dept_name} onClick={handleCreate} className="w-full">
                                    Create Department
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Table */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Departments</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{depts.length}</Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    aria-label="Refresh departments"
                                >
                                    <RotateCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}/>
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-36 text-right">Actions</TableHead>
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
                                        <TableRow key={d.dept_id}>
                                            <TableCell className="text-muted-foreground">{d.dept_id}</TableCell>
                                            <TableCell className="font-medium">{d.dept_name}</TableCell>
                                            <TableCell>{d.description || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditing({
                                                                dept_id: d.dept_id,
                                                                dept_name: d.dept_name || "",
                                                                description: d.description || "",
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
                                                            dept_id: d.dept_id,
                                                            dept_name: d.dept_name
                                                        })}
                                                        disabled={Number(deletingId) === Number(d.dept_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1"/>
                                                        {Number(deletingId) === Number(d.dept_id) ? "Deleting…" : "Delete"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No departments yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>Update the selected department details.</DialogDescription>
                    </DialogHeader>

                    {editing && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Department Name</Label>
                                <Input
                                    value={editing.dept_name}
                                    onChange={(e) => setEditing((ed) => ({...ed, dept_name: e.target.value}))}
                                    placeholder="e.g., Engineering"
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
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={() =>
                                onUpdate?.({
                                    dept_id: editing.dept_id,
                                    payload: {
                                        dept_name: editing.dept_name?.trim(),
                                        description: editing.description?.trim(),
                                    },
                                })
                            }
                            disabled={updating || !editing?.dept_name?.trim()}
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
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            <span className="font-medium">
                {deleteTarget?.dept_name || `#${deleteTarget?.dept_id}`}
              </span>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => onDelete?.({dept_id: deleteTarget.dept_id})}
                            disabled={Number(deletingId) === Number(deleteTarget?.dept_id)}
                        >
                            {Number(deletingId) === Number(deleteTarget?.dept_id) ? "Deleting…" : "Delete"}
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
                <Skeleton className="h-4 w-40"/>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-[60%]"/>
            </TableCell>
            <TableCell/>
        </TableRow>
    );
}
