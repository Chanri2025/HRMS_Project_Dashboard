import React from "react";
import { RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeptFilter from "../filters/DeptFilter.jsx";
import SubDeptFilter from "../filters/SubDeptFilter.jsx";
import { safeArray } from "@/Utils/arrays.js";

export default function DesignationSection({
  departments, subDepartments, deptOptions, subDeptOptions, subDeptsForDesignation,
  designations, loadingDepts, loadingSubs, loadingDesignations,
  deptFilter, setDeptFilter, subDeptFilter, setSubDeptFilter,
  designationForm, setDesignationForm, onCreate, onRefresh,
}) {
  const depts = safeArray(departments);
  const subs  = safeArray(subDepartments);
  const gns   = safeArray(designations);
  const subOptsForDesig = safeArray(subDeptsForDesignation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Add Designation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={designationForm.dept_id ? String(designationForm.dept_id) : undefined}
              onValueChange={(v) => setDesignationForm((s) => ({ ...s, dept_id: Number(v), sub_dept_id: "" }))}
            >
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {safeArray(deptOptions).map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sub-Department</Label>
            <Select
              value={designationForm.sub_dept_id ? String(designationForm.sub_dept_id) : undefined}
              onValueChange={(v) => setDesignationForm((s) => ({ ...s, sub_dept_id: Number(v) }))}
              disabled={!designationForm.dept_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={designationForm.dept_id ? "Select sub-department" : "Select department first"} />
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
              value={designationForm.designation_name}
              onChange={(e) => setDesignationForm((s) => ({ ...s, designation_name: e.target.value }))}
              placeholder="e.g., Senior Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={designationForm.description}
              onChange={(e) => setDesignationForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <Button
            className="w-full"
            disabled={!designationForm.dept_id || !designationForm.sub_dept_id || !designationForm.designation_name}
            onClick={onCreate}
          >
            Create Designation
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Designations</CardTitle>
            <div className="flex items-center gap-2">
              <DeptFilter
                value={deptFilter}
                onChange={(v) => { setDeptFilter(v); setSubDeptFilter(""); }}
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
                <RotateCw className="mr-1 h-4 w-4" /> Refresh
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
                <TableHead>Sub-Department</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gns.map((g) => {
                const deptName = safeArray(depts).find((d) => d.dept_id === g.dept_id)?.dept_name || "-";
                const subName  = safeArray(subs).find((s) => s.sub_dept_id === g.sub_dept_id)?.sub_dept_name || "-";
                return (
                  <TableRow key={g.designation_id}>
                    <TableCell className="text-muted-foreground">{g.designation_id}</TableCell>
                    <TableCell>{deptName}</TableCell>
                    <TableCell>{subName}</TableCell>
                    <TableCell className="font-medium">{g.designation_name}</TableCell>
                    <TableCell>{g.description || "-"}</TableCell>
                  </TableRow>
                );
              })}
              {!gns.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {loadingDesignations ? "Loading..." : "No designations yet."}
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
