import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {RotateCw} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import React from "react";
import {safeArray } from "./arrays.js";

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
                              }) {
    const depts = safeArray(departments);
    const subs = safeArray(subDepartments);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Add Sub-Department</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select
                            value={subDeptForm.dept_id ? String(subDeptForm.dept_id) : undefined}
                            onValueChange={(v) => setSubDeptForm((s) => ({...s, dept_id: Number(v)}))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department"/>
                            </SelectTrigger>
                            <SelectContent>
                                {safeArray(deptOptions).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Sub-Department Name</Label>
                        <Input
                            value={subDeptForm.sub_dept_name}
                            onChange={(e) =>
                                setSubDeptForm((s) => ({...s, sub_dept_name: e.target.value}))
                            }
                            placeholder="e.g., Backend Team"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={subDeptForm.description}
                            onChange={(e) =>
                                setSubDeptForm((s) => ({...s, description: e.target.value}))
                            }
                            placeholder="Optional"
                        />
                    </div>
                    <Button
                        disabled={!subDeptForm.dept_id || !subDeptForm.sub_dept_name}
                        onClick={onCreate}
                        className="w-full"
                    >
                        Create Sub-Department
                    </Button>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Sub-Departments</CardTitle>
                        <div className="flex items-center gap-2">
                            <DeptFilter
                                value={deptFilter}
                                onChange={setDeptFilter}
                                options={deptOptions}
                                loading={loadingDepts}
                            />
                            <Badge variant="secondary">{subs.length}</Badge>
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingSubs}>
                                <RotateCw className="mr-1 h-4 w-4"/>
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subs.map((s) => (
                                <TableRow key={s.sub_dept_id}>
                                    <TableCell className="text-muted-foreground">{s.sub_dept_id}</TableCell>
                                    <TableCell>
                                        {safeArray(depts).find((d) => d.dept_id === s.dept_id)?.dept_name || "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">{s.sub_dept_name}</TableCell>
                                    <TableCell>{s.description || "-"}</TableCell>
                                </TableRow>
                            ))}
                            {!subs.length && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        {loadingSubs ? "Loading..." : "No sub-departments yet."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}