// src/pages/sections/SubDepartmentSection.jsx
import React, {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {RotateCw, Plus, Search, Building2} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
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
import {safeArray} from "@/Utils/arrays.js";
import DeptFilter from "../filters/DeptFilter.jsx";
import {http} from "@/lib/http";

/* ✅ Robust: always fetch dept name by id; fallbacks included */
function DeptNameCell({deptId, departments}) {
    const id = Number(deptId) || null;
    const localName =
        safeArray(departments).find((d) => Number(d.dept_id) === id)?.dept_name;

    const {data, isLoading, isError} = useQuery({
        queryKey: ["org", "departments", id],
        enabled: Boolean(id),
        queryFn: async () => (await http.get(`/org/departments/${id}`)).data, // ✅ path-param
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
            <span className="h-2 w-2 rounded-full bg-primary/60"/>
            <span className="font-medium">{name}</span>
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
    const subs = safeArray(subDepartments);
    const depts = safeArray(departments);
    const [search, setSearch] = useState("");

    // Map dept_id → dept_name for faster local search
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
            const deptName = (deptNameById.get(Number(s?.dept_id)) || "")
                .toLowerCase()
                .trim();
            return name.includes(q) || desc.includes(q) || deptName.includes(q);
        });
    }, [search, subs, deptNameById]);

    const selectedDeptLabel =
        safeArray(deptOptions).find((o) => o.value === String(deptFilter))?.label ||
        "All";

    const canSubmit =
        Boolean(subDeptForm?.dept_id) &&
        Boolean(subDeptForm?.sub_dept_name?.trim());

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Create form */}
            <Card className="xl:col-span-1 border-dashed">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="rounded-2xl p-2 bg-muted">
                            <Building2 className="h-5 w-5"/>
                        </div>
                        <CardTitle className="text-xl">Create Sub-Department</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Add a sub-department under an existing department. You can provide
                        an optional description to help others identify its scope.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select
                            value={
                                subDeptForm.dept_id ? String(subDeptForm.dept_id) : undefined
                            }
                            onValueChange={(v) =>
                                setSubDeptForm((s) => ({...s, dept_id: Number(v)}))
                            }
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
                                setSubDeptForm((s) => ({
                                    ...s,
                                    sub_dept_name: e.target.value,
                                }))
                            }
                            placeholder="e.g., Backend Team"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Description <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            value={subDeptForm.description}
                            onChange={(e) =>
                                setSubDeptForm((s) => ({...s, description: e.target.value}))
                            }
                            placeholder="Purpose, responsibilities, notes…"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            className="flex-1"
                            disabled={!canSubmit || creating}
                            onClick={onCreate}
                        >
                            <Plus className="mr-2 h-4 w-4"/>
                            {creating ? "Creating…" : "Create"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
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
            <Card className="xl:col-span-2">
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Sub-Departments</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="rounded-full">
                                    {filteredSubs.length} shown
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                  Dept: {selectedDeptLabel}
                </span>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto items-center gap-2">
                            <div className="relative w-full md:w-[260px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    className="pl-8"
                                    placeholder="Search by name, description, or department…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                                size="sm"
                                onClick={onRefresh}
                                disabled={loadingSubs}
                            >
                                <RotateCw className="mr-1 h-4 w-4"/> Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-24">ID</TableHead>
                                    <TableHead>Parent Department Name</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingSubs ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell>
                                                <div className="h-4 w-10 bg-muted rounded"/>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-36 bg-muted rounded"/>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-40 bg-muted rounded"/>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-60 bg-muted rounded"/>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredSubs.length ? (
                                    filteredSubs.map((s) => (
                                        <TableRow key={s.sub_dept_id} className="hover:bg-muted/30">
                                            <TableCell className="text-muted-foreground">
                                                {s.sub_dept_id}
                                            </TableCell>

                                            {/* ✅ FIXED: use s.dept_id not s.dept_name */}
                                            <TableCell>
                                                <DeptNameCell deptId={s.dept_id} departments={depts}/>
                                            </TableCell>

                                            <TableCell className="font-medium">
                                                {s.sub_dept_name}
                                            </TableCell>
                                            <TableCell className="max-w-[420px]">
                        <span className="block truncate text-muted-foreground">
                          {s.description || "—"}
                        </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center">
                                            <div
                                                className="flex flex-col items-center justify-center text-center gap-2">
                                                <div className="rounded-full bg-muted p-3">
                                                    <Building2 className="h-5 w-5 text-muted-foreground"/>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {search
                                                        ? "No sub-departments match your search."
                                                        : "No sub-departments yet."}
                                                </p>
                                                {search && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSearch("")}
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
