import React from "react";
import {format, formatDistanceToNowStrict, parseISO} from "date-fns";
import {Badge} from "@/components/ui/badge";
import {TableRow, TableCell} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useDepartmentName, useDesignationName, useSubDepartmentName} from "@/hooks/useOrgLookups";
import {cn} from "@/lib/utils";

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
    return <span className={cn("inline-flex h-2.5 w-2.5 rounded-full", ok ? "bg-green-500" : "bg-red-500")}/>;
}

export default function EmployeeRow({row, onOpen, onEdit}) {
    const e = row?.employee || {};
    const {data: deptName} = useDepartmentName(e?.dept_id);
    const {data: subDeptName} = useSubDepartmentName(e?.sub_dept_id);
    const {data: designationName} = useDesignationName(e?.designation_id);

    const created = row?.created_at ? parseISO(row.created_at) : null;
    const lastActive = row?.last_active ? parseISO(row.last_active) : null;

    return (
        <TableRow className="hover:bg-muted/30">
            <TableCell>
                <button onClick={onOpen} className="group">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-[10px] group-hover:opacity-70 transition-opacity">
                            {initialsFrom(e?.full_name || row?.full_name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </TableCell>

            <TableCell className="font-medium">{e?.employee_id || "—"}</TableCell>
            <TableCell>{e?.full_name || row?.full_name || "—"}</TableCell>

            <TableCell>
                <Badge variant="outline">{row?.role || "USER"}</Badge>
            </TableCell>

            <TableCell className="hidden md:table-cell">{deptName || (e?.dept_id ?? "—")}</TableCell>
            <TableCell className="hidden lg:table-cell">{subDeptName || (e?.sub_dept_id ?? "—")}</TableCell>
            <TableCell className="hidden xl:table-cell">{designationName || (e?.designation_id ?? "—")}</TableCell>

            <TableCell className="hidden md:table-cell">{row?.email || "—"}</TableCell>
            <TableCell className="hidden lg:table-cell">{e?.phone || "—"}</TableCell>

            <TableCell className="hidden xl:table-cell">
                {created ? format(created, "dd MMM yyyy") : "—"}
            </TableCell>

            <TableCell className="text-xs text-muted-foreground">
                {lastActive ? formatDistanceToNowStrict(lastActive, {addSuffix: true}) : "—"}
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-2">
                    <StatusDot ok={row?.is_active}/>
                    <span className="sr-only">{row?.is_active ? "Active" : "Inactive"}</span>
                </div>
            </TableCell>

            <TableCell>
                <Button size="sm" variant="ghost" className="px-3" onClick={onEdit}>
                    Edit
                </Button>
            </TableCell>
        </TableRow>
    );
}
