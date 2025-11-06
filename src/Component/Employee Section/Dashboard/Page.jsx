// src/Component/Employee Section/Dashboard/Page.jsx
import React, {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {format, formatDistanceToNowStrict, parseISO} from "date-fns";
import {http, getUserCtx} from "@/lib/http";
import {cn} from "@/lib/utils";

import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import {Separator} from "@/components/ui/separator";
import {Loader2, RefreshCw, Users, Shield, CheckCircle} from "lucide-react";

// lookups used by the mini details view
import {useDepartmentName, useDesignationName, useSubDepartmentName} from "@/hooks/useOrgLookups";

// ⬇️ Split components
import EmployeeRow from "./EmployeeRow.jsx";
import EditEmployeeDialog from "./EditEmployeeDialog.jsx";

// ---------- utils ----------
const errText = (err, fb = "Request failed") => {
    const d = err?.response?.data?.detail;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join("; ");
    if (typeof d === "string") return d;
    if (d && typeof d === "object") return JSON.stringify(d);
    return err?.response?.data?.message || err?.message || fb;
};

const safeArray = (v) => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);

function initialsFrom(name = "") {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("") || "EM"
    );
}

function StatusDot({ok}) {
    return <span className={cn("inline-flex h-2 w-2 rounded-full", ok ? "bg-green-500" : "bg-red-500")}/>;
}

// Row detail drawer content (kept local to this page)
function EmployeeMini({row}) {
    const d = row?.employee || {};
    const {data: deptName} = useDepartmentName(d?.dept_id);
    const {data: subDeptName} = useSubDepartmentName(d?.sub_dept_id);
    const {data: designationName} = useDesignationName(d?.designation_id);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                    <AvatarFallback>{initialsFrom(d?.full_name || row?.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="text-base font-semibold">{d?.full_name || row?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{row?.email}</div>
                </div>
            </div>
            <Separator/>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                    <div className="text-muted-foreground">Employee ID</div>
                    <div className="font-medium">{d?.employee_id || "—"}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">Role</div>
                    <div className="font-medium">{row?.role || "—"}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{d?.phone || "—"}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">Department</div>
                    <div className="font-medium">{deptName || (d?.dept_id ?? "—")}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">Sub-Department</div>
                    <div className="font-medium">{subDeptName || (d?.sub_dept_id ?? "—")}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">Designation</div>
                    <div className="font-medium">{designationName || (d?.designation_id ?? "—")}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">DOB</div>
                    <div className="font-medium">
                        {d?.date_of_birth ? format(parseISO(d.date_of_birth), "dd MMM yyyy") : "—"}
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="text-muted-foreground">Address</div>
                    <div className="font-medium">{d?.address || "—"}</div>
                </div>
            </div>
        </div>
    );
}

export default function EmployeeDashboard() {
    const {accessToken} = getUserCtx();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [openRow, setOpenRow] = useState(null);
    const [editRow, setEditRow] = useState(null);

    const canRun = Boolean(accessToken);
    const query = useQuery({
        queryKey: ["auth", "users"],
        enabled: canRun,
        queryFn: async () => {
            const res = await http.get("/auth/users", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            const arr = safeArray(res.data);
            // sort newest first by created_at
            return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const users = safeArray(query.data);

    // Unique roles for filter
    const roleOptions = useMemo(() => {
        const set = new Set(users.map((u) => u.role).filter(Boolean));
        return ["ALL", ...Array.from(set)];
    }, [users]);

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        return users.filter((u) => {
            const inSearch =
                !s ||
                u?.email?.toLowerCase().includes(s) ||
                u?.full_name?.toLowerCase().includes(s) ||
                u?.employee?.employee_id?.toLowerCase().includes(s);
            const inRole = roleFilter === "ALL" || u?.role === roleFilter;
            const inStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u?.is_active : !u?.is_active);
            return inSearch && inRole && inStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    const kpis = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.is_active).length;
        const byRole = users.reduce((acc, u) => {
            acc[u.role || "USER"] = (acc[u.role || "USER"] || 0) + 1;
            return acc;
        }, {});
        return {total, active, byRole};
    }, [users]);

    return (
        <div className="space-y-8 p-4">{/* loosen vertical rhythm */}
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Employee Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Overview of all registered users & employee records</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", query.isFetching && "animate-spin")}/>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{/* more gap */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                            <Users className="h-4 w-4"/> Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-4xl font-bold">{kpis.total}</div>
                        <p className="text-xs text-muted-foreground">Across all roles</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                            <CheckCircle className="h-4 w-4"/> Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-4xl font-bold">{kpis.active}</div>
                        <p className="text-xs text-muted-foreground">Currently enabled accounts</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                            <Shield className="h-4 w-4"/> Roles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(kpis.byRole).map(([r, n]) => (
                                <Badge key={r} variant="secondary" className="px-2 py-1 text-xs">
                                    {r}: {n}
                                </Badge>
                            ))}
                            {!Object.keys(kpis.byRole).length &&
                                <span className="text-sm text-muted-foreground">—</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl shadow-sm">
                <CardContent className="pt-6 pb-4">{/* thicker padding */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            className="h-11"
                            placeholder="Search by name / email / employee ID"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Role"/>
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">ALL</SelectItem>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-0 px-6 pt-6">
                    <CardTitle className="text-base">Employees</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-2xl border m-6 overflow-hidden">{/* inner breathing space */}
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-10"/>
                                    <TableHead className="w-28">Emp ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="hidden md:table-cell">Dept</TableHead>
                                    <TableHead className="hidden lg:table-cell">Sub-Dept</TableHead>
                                    <TableHead className="hidden xl:table-cell">Designation</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                                    <TableHead className="w-24">Last Active</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {query.isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={13}>
                                            <div
                                                className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin"/> Loading users…
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!query.isLoading && filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={13}>
                                            <div className="text-center py-16 text-muted-foreground">
                                                No users match your filters.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {filtered.map((u) => (
                                    <EmployeeRow
                                        key={u.user_id}
                                        row={u}
                                        onOpen={() => setOpenRow(u)}
                                        onEdit={() => setEditRow(u)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!openRow} onOpenChange={(v) => !v && setOpenRow(null)}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Employee Details</DialogTitle>
                        <DialogDescription>Quick view of the employee record</DialogDescription>
                    </DialogHeader>
                    {openRow && <EmployeeMini row={openRow}/>}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <EditEmployeeDialog
                row={editRow}
                accessToken={accessToken}
                onClose={() => setEditRow(null)}
                onSaved={() => {
                    setEditRow(null);
                    query.refetch();
                }}
            />
        </div>
    );
}
