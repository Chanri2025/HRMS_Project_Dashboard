// src/Component/Employee Section/Dashboard/EmployeeRow.jsx
import React from "react";
import {format, formatDistanceToNowStrict, parseISO} from "date-fns";
import {Badge} from "@/components/ui/badge";
import {TableRow, TableCell} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    useDepartmentName,
    useDesignationName,
    useSubDepartmentName,
} from "@/hooks/useOrgLookups";
import {cn} from "@/lib/utils";
import {Pencil} from "lucide-react";

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

function roleBadgeClass(role = "") {
    const r = role.toUpperCase();
    if (r.includes("SUPER")) {
        return "bg-rose-100 text-rose-700 border-rose-300";
    }
    if (r.includes("ADMIN")) {
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
    }
    if (r.includes("MANAGER")) {
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
    if (r.includes("EMP")) {
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
    }
    return "bg-sky-50 text-sky-700 border-sky-300";
}

export default function EmployeeRow({row, onOpen, onEdit}) {
    const e = row?.employee || {};
    const {data: deptName} = useDepartmentName(e?.dept_id);
    const {data: subDeptName} = useSubDepartmentName(e?.sub_dept_id);
    const {data: designationName} = useDesignationName(e?.designation_id);

    const created = row?.created_at ? parseISO(row.created_at) : null;
    const lastActive = row?.last_active ? parseISO(row.last_active) : null;

    return (
        <TableRow className="hover:bg-blue-400/900 transition-colors text-[10px]">
            {/* Avatar */}
            <TableCell>
                <button
                    onClick={onOpen}
                    className="group focus-visible:outline-none"
                >
                    <Avatar className="h-8 w-8 border border-blue-700/70 bg-blue-50">
                        <AvatarFallback className="text-[9px] text-blue-700 group-hover:opacity-80 transition-opacity">
                            {initialsFrom(e?.full_name || row?.full_name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </TableCell>

            {/* Emp ID */}
            <TableCell className="font-bold font-2xl text-blue-700">
                {e?.employee_id || "—"}
            </TableCell>

            {/* Name */}
            <TableCell className="whitespace-nowrap font-bold font-4xl text-slate-800">
                {e?.full_name || row?.full_name || "—"}
            </TableCell>

            {/* Role */}
            <TableCell>
                <Badge
                    variant="secondary"
                    className={cn(
                        "px-2 py-0.5 text-[9px] border",
                        roleBadgeClass(row?.role || "USER")
                    )}
                >
                    {row?.role || "USER"}
                </Badge>
            </TableCell>

            {/* Dept / Sub / Desig */}
            <TableCell className="hidden md:table-cell text-slate-700">
                {deptName || e?.dept_id || "—"}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-slate-700">
                {subDeptName || e?.sub_dept_id || "—"}
            </TableCell>
            <TableCell className="hidden xl:table-cell max-w-[130px] truncate text-slate-700">
                {designationName || e?.designation_id || "—"}
            </TableCell>

            {/* Email */}
            <TableCell className="hidden md:table-cell max-w-[160px] truncate text-[9px] text-slate-600">
                {row?.email || "—"}
            </TableCell>

            {/* Phone */}
            <TableCell className="hidden lg:table-cell text-slate-700">
                {e?.phone || "—"}
            </TableCell>

            {/* Created */}
            <TableCell className="hidden xl:table-cell text-slate-600">
                {created ? format(created, "dd MMM yyyy") : "—"}
            </TableCell>

            {/* Last Active */}
            <TableCell className="text-[9px] text-slate-500">
                {lastActive
                    ? formatDistanceToNowStrict(lastActive, {
                        addSuffix: true,
                    })
                    : "—"}
            </TableCell>

            {/* Status */}
            <TableCell>
                <div className="flex items-center gap-1.5">
                    <StatusDot ok={row?.is_active}/>
                    <span className="text-[8px] text-slate-500">
                        {row?.is_active ? "Active" : "Inactive"}
                    </span>
                </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-blue-100 hover:text-blue-700"
                    onClick={onEdit}
                >
                    <Pencil className="h-3.5 w-3.5"/>
                </Button>
            </TableCell>
        </TableRow>
    );
}
