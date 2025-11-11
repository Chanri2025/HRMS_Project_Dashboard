// src/Component/Employee Section/Dashboard/EditEmployeeDialog.jsx
import React, {useMemo, useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Loader2} from "lucide-react";

const safeArray = (v) =>
    Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];

const errText = (err, fb = "Request failed") => {
    const d = err?.response?.data?.detail;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join("; ");
    if (typeof d === "string") return d;
    if (d && typeof d === "object") return JSON.stringify(d);
    return err?.response?.data?.message || err?.message || fb;
};

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

export default function EditEmployeeDialog({
                                               row,
                                               accessToken,
                                               onClose,
                                               onSaved,
                                           }) {
    const open = !!row;
    const e = row?.employee || {};

    // lookups
    const rolesQ = useQuery({
        queryKey: ["roles"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/auth/roles", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return safeArray(res.data).map((r) => r?.role_name || r);
        },
        staleTime: 5 * 60_000,
    });

    const deptsQ = useQuery({
        queryKey: ["org", "departments"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/org/departments", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return safeArray(res.data);
        },
        staleTime: 5 * 60_000,
    });

    const subsQ = useQuery({
        queryKey: ["org", "sub-departments"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/org/sub-departments", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return safeArray(res.data);
        },
        staleTime: 5 * 60_000,
    });

    const designQ = useQuery({
        queryKey: ["org", "designations"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/org/designations", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return safeArray(res.data);
        },
        staleTime: 5 * 60_000,
    });

    const [form, setForm] = useState({
        role: "",
        dept_id: "",
        sub_dept_id: "",
        designation_id: "",
    });

    useEffect(() => {
        if (row) {
            const emp = row.employee || {};
            setForm({
                role: row.role || "",
                dept_id: emp.dept_id ?? "",
                sub_dept_id: emp.sub_dept_id ?? "",
                designation_id: emp.designation_id ?? "",
            });
        }
    }, [row]);

    const loading =
        rolesQ.isLoading ||
        deptsQ.isLoading ||
        subsQ.isLoading ||
        designQ.isLoading;

    const onChange = (patch) =>
        setForm((f) => ({...f, ...patch}));

    const subOptions = useMemo(() => {
        const all = safeArray(subsQ.data);
        if (!form.dept_id) return all;
        return all.filter(
            (s) => String(s.dept_id) === String(form.dept_id)
        );
    }, [subsQ.data, form.dept_id]);

    const save = async () => {
        try {
            const payload = {
                employee_id: e?.employee_id,
                role: form.role,
                work_position: form.role,
                dept_id: form.dept_id || null,
                sub_dept_id: form.sub_dept_id || null,
                designation_id: form.designation_id || null,
            };

            const meId = getUserCtx()?.user?.user_id;
            const isSelf = row?.user_id && row.user_id === meId;

            if (isSelf) {
                await http.patch("/auth/me/profile", payload, {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
            } else {
                await http.patch(`/auth/users/${row?.user_id}`, payload, {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
            }

            onSaved?.();
        } catch (err) {
            console.error(err);
            alert(errText(err, "Update failed"));
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => !v && onClose?.()}
        >
            <DialogContent
                className="max-w-xl rounded-2xl border border-blue-300/60 bg-gradient-to-br from-blue-50 via-white to-sky-100 shadow-2xl">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base text-blue-900">
                        Edit Employee Mapping
                    </DialogTitle>
                    <DialogDescription className="text-[10px] text-slate-500">
                        Update role & organisational mapping. Work position mirrors selected role.
                    </DialogDescription>
                </DialogHeader>

                {!row ? null : loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-500 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600"/>
                        Loading dropdowns…
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Context strip */}
                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                            <Avatar className="h-8 w-8 border border-blue-300 bg-white">
                                <AvatarFallback className="text-[9px] text-blue-700">
                                    {initialsFrom(e?.full_name || row?.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold truncate text-blue-900">
                                    {e?.full_name || row?.full_name || "Employee"}
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">
                                    {row?.email || e?.employee_id || "—"}
                                </div>
                            </div>
                            {e?.employee_id && (
                                <div
                                    className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ID: {e.employee_id}
                                </div>
                            )}
                        </div>

                        {/* Form grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Role */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] text-slate-500">
                                    Role
                                </div>
                                <Select
                                    value={form.role}
                                    onValueChange={(v) => onChange({role: v})}
                                >
                                    <SelectTrigger
                                        className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500">
                                        <SelectValue placeholder="Select role"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(rolesQ.data).map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dept */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] text-slate-500">
                                    Department
                                </div>
                                <Select
                                    value={String(form.dept_id ?? "")}
                                    onValueChange={(v) =>
                                        onChange({dept_id: v, sub_dept_id: ""})
                                    }
                                >
                                    <SelectTrigger
                                        className="h-9 text-xs border-sky-300/70 bg-white focus-visible:ring-sky-500">
                                        <SelectValue placeholder="Select department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(deptsQ.data).map((d) => (
                                            <SelectItem
                                                key={d.dept_id}
                                                value={String(d.dept_id)}
                                            >
                                                {d.dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sub-dept */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] text-slate-500">
                                    Sub-Department
                                </div>
                                <Select
                                    value={String(form.sub_dept_id ?? "")}
                                    onValueChange={(v) =>
                                        onChange({sub_dept_id: v})
                                    }
                                >
                                    <SelectTrigger
                                        className="h-9 text-xs border-sky-300/70 bg-white focus-visible:ring-sky-500">
                                        <SelectValue placeholder="Select sub-department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(subOptions).map((s) => (
                                            <SelectItem
                                                key={s.sub_dept_id}
                                                value={String(s.sub_dept_id)}
                                            >
                                                {s.sub_dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Designation */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] text-slate-500">
                                    Designation
                                </div>
                                <Select
                                    value={String(form.designation_id ?? "")}
                                    onValueChange={(v) =>
                                        onChange({designation_id: v})
                                    }
                                >
                                    <SelectTrigger
                                        className="h-9 text-xs border-violet-300/70 bg-white focus-visible:ring-violet-500">
                                        <SelectValue placeholder="Select designation"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(designQ.data).map((g) => (
                                            <SelectItem
                                                key={g.designation_id}
                                                value={String(g.designation_id)}
                                            >
                                                {g.designation_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={save}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Save changes
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
