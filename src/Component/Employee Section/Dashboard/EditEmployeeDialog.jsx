// src/Component/Employee Section/Dashboard/EditEmployeeDialog.jsx
import React, {useMemo, useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";
import {toast} from "sonner";
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
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Loader2} from "lucide-react";
import {useEditUser} from "@/hooks/useEditUser";

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

function yyyyMmDd(s) {
    if (!s) return "";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s).slice(0, 10);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function EditEmployeeDialog({
                                               row,
                                               accessToken,
                                               onClose,
                                               onSaved,
                                           }) {
    const open = !!row;
    const u = row || {};
    const e = u.employee || {};

    // current signed-in user (for updated_by)
    const me = getUserCtx(); // { userId, accessToken, ... }

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
        // user fields
        email: "",
        full_name: "",
        is_active: true,
        role: "",

        // employee fields
        employee_id: "",
        emp_full_name: "",
        phone: "",
        address: "",
        fathers_name: "",
        aadhar_no: "",
        date_of_birth: "",
        work_position: "",
        card_id: "",
        dept_id: "",
        sub_dept_id: "",
        designation_id: "",
    });

    useEffect(() => {
        if (!row) return;
        setForm({
            email: u.email || "",
            full_name: u.full_name || "",
            is_active: Boolean(u.is_active),
            role: u.role || "",

            employee_id: e.employee_id || "",
            emp_full_name: e.full_name || u.full_name || "",
            phone: e.phone || "",
            address: e.address || "",
            fathers_name: e.fathers_name || "",
            aadhar_no: e.aadhar_no || "",
            date_of_birth: yyyyMmDd(e.date_of_birth),
            work_position: e.work_position || u.role || "",
            card_id: e.card_id || "",
            dept_id: e.dept_id ?? "",
            sub_dept_id: e.sub_dept_id ?? "",
            designation_id: e.designation_id ?? "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row]);

    const loading =
        rolesQ.isLoading || deptsQ.isLoading || subsQ.isLoading || designQ.isLoading;

    const onChange = (patch) => setForm((f) => ({...f, ...patch}));

    const subOptions = useMemo(() => {
        const all = safeArray(subsQ.data);
        if (!form.dept_id) return all;
        return all.filter((s) => String(s.dept_id) === String(form.dept_id));
    }, [subsQ.data, form.dept_id]);

    const editUser = useEditUser({
        onSuccess: () => {
            toast.success("Employee updated", {
                description: `${form.emp_full_name || form.full_name || "Employee"} was saved successfully.`,
            });
            onSaved?.();
        },
        onError: (message) => {
            toast.error("Update failed", {
                description: message || "Unable to update employee details.",
            });
        },
    });

    const save = () => {
        editUser.mutate({
            userId: u.user_id,
            patch: {
                // user-level
                email: form.email || undefined,
                full_name: form.full_name || undefined,
                is_active: Boolean(form.is_active),
                role: form.role || undefined,

                // employee-level
                employee_id: form.employee_id || undefined,
                full_name: form.emp_full_name || undefined, // employee.full_name
                phone: form.phone || undefined,
                address: form.address || undefined,
                fathers_name: form.fathers_name || undefined,
                aadhar_no: form.aadhar_no || undefined,
                date_of_birth: form.date_of_birth || undefined, // YYYY-MM-DD
                work_position: form.work_position || form.role || undefined,
                card_id: form.card_id || undefined,
                dept_id: form.dept_id || null,
                sub_dept_id: form.sub_dept_id || null,
                designation_id: form.designation_id || null,

                // auditing
                updated_by: me?.userId ?? null, // 👈 add signed-in user_id
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
            {/* Explicit width + breathing space + scroll containment */}
            <DialogContent
                className="
          my-8
          w-[96vw] md:w-[820px] lg:w-[980px]
          max-w-none
          max-h-[88vh] overflow-y-auto
          rounded-2xl border border-blue-300/60
          bg-gradient-to-br from-blue-50 via-white to-sky-100
          shadow-2xl p-6 md:p-8
        "
            >
                <DialogHeader className="pb-4 border-b border-blue-100 mb-4">
                    <DialogTitle className="text-base text-blue-900">
                        Edit User & Employee Details
                    </DialogTitle>
                    <DialogDescription className="text-[10px] text-slate-500">
                        Update account info, role, and full employee profile in one place.
                    </DialogDescription>
                </DialogHeader>

                {!row ? null : loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-500 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600"/>
                        Loading dropdowns…
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Context strip */}
                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                            <Avatar className="h-8 w-8 border border-blue-300 bg-white">
                                <AvatarFallback className="text-[9px] text-blue-700">
                                    {initialsFrom(e?.full_name || u?.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold truncate text-blue-900">
                                    {e?.full_name || u?.full_name || "Employee"}
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">
                                    {u?.email || e?.employee_id || "—"}
                                </div>
                            </div>
                            {e?.employee_id && (
                                <div
                                    className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ID: {e.employee_id}
                                </div>
                            )}
                        </div>

                        {/* User-level fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-[10px] text-slate-500">Email</Label>
                                <Input
                                    value={form.email}
                                    onChange={(e) => onChange({email: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Active</Label>
                                <Select
                                    value={form.is_active ? "true" : "false"}
                                    onValueChange={(v) => onChange({is_active: v === "true"})}
                                >
                                    <SelectTrigger
                                        className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-[10px] text-slate-500">
                                    User Full Name
                                </Label>
                                <Input
                                    value={form.full_name}
                                    onChange={(e) => onChange({full_name: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="User full name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Role</Label>
                                <Select
                                    value={form.role}
                                    onValueChange={(v) => onChange({role: v, work_position: v})}
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
                        </div>

                        {/* Employee-level fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">
                                    Employee ID
                                </Label>
                                <Input
                                    value={form.employee_id}
                                    onChange={(e) => onChange({employee_id: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="EMPxxxx"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-[10px] text-slate-500">
                                    Employee Full Name
                                </Label>
                                <Input
                                    value={form.emp_full_name}
                                    onChange={(e) => onChange({emp_full_name: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="Employee full name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Phone</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => onChange({phone: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="+91 ..."
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-[10px] text-slate-500">Address</Label>
                                <Textarea
                                    value={form.address}
                                    onChange={(e) => onChange({address: e.target.value})}
                                    className="min-h-[38px] text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="Address"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">
                                    Father's Name
                                </Label>
                                <Input
                                    value={form.fathers_name}
                                    onChange={(e) => onChange({fathers_name: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Aadhar No.</Label>
                                <Input
                                    value={form.aadhar_no}
                                    onChange={(e) => onChange({aadhar_no: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="XXXX-XXXX-XXXX"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">
                                    Date of Birth
                                </Label>
                                <Input
                                    type="date"
                                    value={form.date_of_birth}
                                    onChange={(e) => onChange({date_of_birth: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">
                                    Work Position
                                </Label>
                                <Input
                                    value={form.work_position}
                                    onChange={(e) => onChange({work_position: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                    placeholder="(defaults to Role)"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Card ID</Label>
                                <Input
                                    value={form.card_id}
                                    onChange={(e) => onChange({card_id: e.target.value})}
                                    className="h-9 text-xs border-blue-300/70 bg-white focus-visible:ring-blue-500"
                                />
                            </div>

                            {/* Org mapping */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Department</Label>
                                <Select
                                    value={String(form.dept_id ?? "")}
                                    onValueChange={(v) => onChange({dept_id: v, sub_dept_id: ""})}
                                >
                                    <SelectTrigger
                                        className="h-9 text-xs border-sky-300/70 bg-white focus-visible:ring-sky-500">
                                        <SelectValue placeholder="Select department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(deptsQ.data).map((d) => (
                                            <SelectItem key={d.dept_id} value={String(d.dept_id)}>
                                                {d.dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">
                                    Sub-Department
                                </Label>
                                <Select
                                    value={String(form.sub_dept_id ?? "")}
                                    onValueChange={(v) => onChange({sub_dept_id: v})}
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

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-500">Designation</Label>
                                <Select
                                    value={String(form.designation_id ?? "")}
                                    onValueChange={(v) => onChange({designation_id: v})}
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
                                disabled={editUser.isPending}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {editUser.isPending ? (
                                    <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    Saving…
                  </span>
                                ) : (
                                    "Save changes"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
