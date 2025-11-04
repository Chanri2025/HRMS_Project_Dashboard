import {RotateCw} from "lucide-react";
import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "recharts";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {safeArray} from "@/Component/Organisation/arrays.js";

export default function DepartmentSection({departments, loading, deptForm, setDeptForm, onCreate, onRefresh}) {
    const depts = safeArray(departments);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Add Department</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>Department Name</Label>
                        <Input
                            value={deptForm.dept_name}
                            onChange={(e) => setDeptForm((s) => ({...s, dept_name: e.target.value}))}
                            placeholder="e.g., Engineering"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={deptForm.description}
                            onChange={(e) => setDeptForm((s) => ({...s, description: e.target.value}))}
                            placeholder="Optional"
                        />
                    </div>
                    <Button
                        disabled={!deptForm.dept_name}
                        onClick={onCreate}
                        className="w-full"
                    >
                        Create Department
                    </Button>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Departments</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{depts.length}</Badge>
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {depts.map((d) => (
                                <TableRow key={d.dept_id}>
                                    <TableCell className="text-muted-foreground">{d.dept_id}</TableCell>
                                    <TableCell className="font-medium">{d.dept_name}</TableCell>
                                    <TableCell>{d.description || "-"}</TableCell>
                                </TableRow>
                            ))}
                            {!depts.length && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        {loading ? "Loading..." : "No departments yet."}
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