// src/Component/Employee Section/Dashboard/Page.jsx
import React, {useMemo, useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {format, parseISO} from "date-fns";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {Separator} from "@/components/ui/separator";
import {
    Loader2,
    RefreshCw,
    Users,
    Shield,
    CheckCircle2,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    useDepartmentName,
    useDesignationName,
    useSubDepartmentName,
} from "@/hooks/useOrgLookups";

import EmployeeRow from "./EmployeeRow.jsx";
import EditEmployeeDialog from "./EditEmployeeDialog.jsx";

// ---------- utils ----------
const safeArray = (v) =>
    Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];

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
    return (
        <span
            className={cn(
                "inline-flex h-2 w-2 rounded-full",
                ok ? "bg-emerald-500" : "bg-rose-500"
            )}
        />
    );
}

// Mini details view
function EmployeeMini({row}) {
    const d = row?.employee || {};
    const {data: deptName} = useDepartmentName(d?.dept_id);
    const {data: subDeptName} = useSubDepartmentName(d?.sub_dept_id);
    const {data: designationName} = useDesignationName(d?.designation_id);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-blue-400/50 bg-blue-50">
                    <AvatarFallback className="text-blue-600 font-semibold">
                        {initialsFrom(d?.full_name || row?.full_name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="text-base font-semibold">
                        {d?.full_name || row?.full_name}
                    </div>
                    <div className="text-xs text-slate-500">
                        {row?.email || "No email"}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                        {row?.role && (
                            <Badge
                                variant="secondary"
                                className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-300/70"
                            >
                                {row.role}
                            </Badge>
                        )}
                        {row?.is_active && (
                            <Badge
                                variant="secondary"
                                className="px-1.5 py-0.5 flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200"
                            >
                                <StatusDot ok/>
                                Active
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <Separator className="bg-blue-100"/>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                    <div className="text-slate-500">Employee ID</div>
                    <div className="font-semibold text-blue-700">
                        {d?.employee_id || "—"}
                    </div>
                </div>
                <div>
                    <div className="text-slate-500">Phone</div>
                    <div className="font-medium">{d?.phone || "—"}</div>
                </div>
                <div>
                    <div className="text-slate-500">Department</div>
                    <div className="font-medium">
                        {deptName || d?.dept_id || "—"}
                    </div>
                </div>
                <div>
                    <div className="text-slate-500">Sub-Department</div>
                    <div className="font-medium">
                        {subDeptName || d?.sub_dept_id || "—"}
                    </div>
                </div>
                <div>
                    <div className="text-slate-500">Designation</div>
                    <div className="font-medium">
                        {designationName || d?.designation_id || "—"}
                    </div>
                </div>
                <div>
                    <div className="text-slate-500">DOB</div>
                    <div className="font-medium">
                        {d?.date_of_birth
                            ? format(parseISO(d.date_of_birth), "dd MMM yyyy")
                            : "—"}
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="text-slate-500">Address</div>
                    <div className="font-medium line-clamp-2">
                        {d?.address || "—"}
                    </div>
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

    // -------- Pagination state --------
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const canRun = Boolean(accessToken);

    const query = useQuery({
        queryKey: ["auth", "users"],
        enabled: canRun,
        queryFn: async () => {
            const res = await http.get("/auth/users", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            const arr = safeArray(res.data);
            return arr.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const users = safeArray(query.data);

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
            const inStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" ? u?.is_active : !u?.is_active);
            return inSearch && inRole && inStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    // Reset to first page when filters/search/data change
    useEffect(() => {
        setPage(1);
    }, [search, roleFilter, statusFilter, users.length]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const startIndex = (page - 1) * pageSize;
    const currentRows = filtered.slice(startIndex, startIndex + pageSize);

    const kpis = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.is_active).length;
        const byRole = users.reduce((acc, u) => {
            acc[u.role || "USER"] = (acc[u.role || "USER"] || 0) + 1;
            return acc;
        }, {});
        return {total, active, byRole};
    }, [users]);

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-100">
            <div className="max-w-8xl mx-auto p-4 md:p-6 space-y-8">
                {/* Header */}
                <div
                    className="rounded-2xl p-5 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-sky-400/20 border border-blue-300/20 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl text-bold md:text-3xl font-semibold tracking-normal text-blue-950">
                            Employee Dashboard
                        </h1>
                        <p className="text-xs md:text-sm text-slate-700">
                            Colorful view of your teams, roles & access.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => query.refetch()}
                            disabled={query.isFetching}
                            className="gap-2 border-blue-400/60 text-blue-700 hover:bg-blue-50"
                        >
                            <RefreshCw
                                className={cn(
                                    "h-4 w-4",
                                    query.isFetching && "animate-spin"
                                )}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-l from-blue-600/20 to-blue-800/20">
                        <CardHeader className="pb-1">
                            <CardTitle className="flex items-center gap-2 text-m font-bold text-blue-800">
                                <Users className="h-6 w-6"/>
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="text-4xl font-semibold text-blue-900">
                                {kpis.total}
                            </div>
                            <p className="text-m text-blue-900">
                                All registered accounts across your org.
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="rounded-2xl shadow-md border-0 bg-gradient-to-l from-emerald-600/20 to-emerald-800/20">
                        <CardHeader className="pb-1">
                            <CardTitle className="flex items-center gap-2 text-m font-bold text-emerald-800">
                                <CheckCircle2 className="h-6 w-6"/>
                                Active Accounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="text-4xl font-semibold text-emerald-900">
                                {kpis.active}
                            </div>
                            <p className="text-m text-emerald-900">
                                Users currently enabled for system access.
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-violet-800/20 to-pink-700/20">
                        <CardHeader className="pb-1">
                            <CardTitle className="flex items-center gap-2 text-m font-bold text-violet-800">
                                <Shield className="h-6 w-6"/>
                                Role Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(kpis.byRole).length ? (
                                    Object.entries(kpis.byRole).map(([r, n]) => (
                                        <Badge
                                            key={r}
                                            variant="primary"
                                            className={cn(
                                                "mt-5 px-2 py-0.5 text-l border-0",
                                                r.toUpperCase().includes("SUPER")
                                                    ? "bg-rose-100 text-rose-700"
                                                    : r
                                                        .toUpperCase()
                                                        .includes("ADMIN")
                                                        ? "bg-indigo-100 text-indigo-700"
                                                        : r
                                                            .toUpperCase()
                                                            .includes("MANAGER")
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-sky-100 text-sky-800"
                                            )}
                                        >
                                            {r}: {n}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-[10px] text-violet-900/80">
                    No roles available.
                  </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card
                    className="rounded-2xl shadow-sm border-0 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-sky-400/20 backdrop-blur-s pt-5 pb-5">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-3 text-s font-medium text-blue-800">
                            <Filter className="h-6 w-6"/>
                            Use filters to quickly find specific employees.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500"/>
                                <Input
                                    className="h-10 pl-9 text-sm border-blue-300/60 bg-white focus-visible:ring-blue-500"
                                    placeholder="Search by name, email, or employee ID"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger
                                    className="h-10 text-sm border-blue-300/60 bg-white focus-visible:ring-blue-500">
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

                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger
                                    className="h-10 text-sm border-blue-300/60 bg-white focus-visible:ring-blue-500">
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
                <Card
                    className="rounded-2xl shadow-md border-0 bg-gradient-to-b from-blue-600/20 via-indigo-500/20 to-sky-400/20 pb-5 pt-2">
                    <CardHeader className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-m font-bold text-blue-900">
                            <Users className="h-6 w-6"/>
                            Employees
                        </CardTitle>
                        <div className="text-m text-bold">
                            Showing{" "}
                            <span className="font-bold text-blue-700">
                {filtered.length}
              </span>{" "}
                            of{" "}
                            <span className="font-bold text-blue-700">
                {users.length}
              </span>{" "}
                            records
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div
                            className="m-4 rounded-2xl border border-blue-100 overflow-hidden bg-gradient-to-b from-white to-blue-50/40">
                            <div className="max-h-[520px] overflow-auto">
                                <Table>
                                    <TableHeader className="bg-blue-50 sticky top-0 z-10">
                                        <TableRow className="text-sm text-black">
                                            <TableHead className="w-10"/>
                                            <TableHead className="w-24">Emp ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Dept
                                            </TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Sub-Dept
                                            </TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Designation
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Email
                                            </TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Phone
                                            </TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Created
                                            </TableHead>
                                            <TableHead className="w-24">
                                                Last Active
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-20 text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {query.isLoading && (
                                            <TableRow>
                                                <TableCell colSpan={13}>
                                                    <div
                                                        className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
                                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600"/>
                                                        Loading users…
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!query.isLoading &&
                                            filtered.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={13}>
                                                        <div className="text-center py-14 text-slate-500 text-sm">
                                                            No users match the current filters.
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                        {!query.isLoading &&
                                            filtered.length > 0 &&
                                            currentRows.map((u) => (
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
                        </div>

                        {/* Pagination Bar */}
                        {filtered.length > 0 && (
                            <div
                                className="px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs mt-2">
                                <div className="text-[10px] md:text-xs text-slate-600">
                                    Showing{" "}
                                    <span className="font-semibold text-blue-700">
                    {startIndex + 1}
                  </span>{" "}
                                    to{" "}
                                    <span className="font-semibold text-blue-700">
                    {Math.min(
                        startIndex + pageSize,
                        filtered.length
                    )}
                  </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-blue-700">
                    {filtered.length}
                  </span>{" "}
                                    filtered records
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePrev}
                                        disabled={page === 1}
                                        className="h-7 w-7 border-blue-300/70 text-blue-700 bg-white/70 hover:bg-blue-50"
                                    >
                                        <ChevronLeft className="h-4 w-4"/>
                                    </Button>
                                    <div
                                        className="px-2 text-[10px] md:text-xs font-medium text-blue-900 bg-white/60 rounded-full border border-blue-200">
                                        Page{" "}
                                        <span className="font-semibold">{page}</span>{" "}
                                        of{" "}
                                        <span className="font-semibold">
                      {totalPages}
                    </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNext}
                                        disabled={page === totalPages}
                                        className="h-7 w-7 border-blue-300/70 text-blue-700 bg-white/70 hover:bg-blue-50"
                                    >
                                        <ChevronRight className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detail Dialog */}
                <Dialog
                    open={!!openRow}
                    onOpenChange={(v) => !v && setOpenRow(null)}
                >
                    <DialogContent
                        className="max-w-xl rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-xl">
                        <DialogHeader>
                            <DialogTitle className="text-base text-blue-900">
                                Employee Details
                            </DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-500">
                                Quick colorful snapshot of the selected employee.
                            </DialogDescription>
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
        </div>
    );
}
