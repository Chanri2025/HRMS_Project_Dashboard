// src/pages/sections/DepartmentSection.jsx
import React from "react";
import {RotateCw} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";
import {safeArray} from "@/Utils/arrays.js";

export default function DepartmentSection({
                                              departments,
                                              loading,
                                              deptForm,
                                              setDeptForm,
                                              onCreate,
                                              onRefresh,
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

    return (
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
                                    onChange={(e) =>
                                        updateForm((s) => ({...(s || {}), dept_name: e.target.value}))
                                    }
                                    placeholder="e.g., Engineering"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={form.description}
                                    onChange={(e) =>
                                        updateForm((s) => ({...(s || {}), description: e.target.value}))
                                    }
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

                            {/* Always clickable; show spinner when loading */}
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
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                // Skeleton rows while loading
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
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No departments yet.
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
        </TableRow>
    );
}
