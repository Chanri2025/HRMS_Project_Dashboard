// src/Component/Employee Section/Dashboard/EditEmployeeDialog.jsx
import React, {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {http, getUserCtx} from "@/lib/http";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";

const safeArray = (v) => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);
const errText = (err, fb = "Request failed") => {
    const d = err?.response?.data?.detail;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join("; ");
    if (typeof d === "string") return d;
    if (d && typeof d === "object") return JSON.stringify(d);
    return err?.response?.data?.message || err?.message || fb;
};

export default function EditEmployeeDialog({row, accessToken, onClose, onSaved}) {
    const open = !!row;
    const e = row?.employee || {};

    // lookups
    const rolesQ = useQuery({
        queryKey: ["roles"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/auth/roles", {headers: {Authorization: `Bearer ${accessToken}`}});
            return safeArray(res.data).map((r) => r?.role_name || r);
        },
        staleTime: 5 * 60_000,
    });

    const deptsQ = useQuery({
        queryKey: ["org", "departments"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/org/departments", {headers: {Authorization: `Bearer ${accessToken}`}});
            return safeArray(res.data);
        },
        staleTime: 5 * 60_000,
    });

    const subsQ = useQuery({
        queryKey: ["org", "sub-departments"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/org/sub-departments", {headers: {Authorization: `Bearer ${accessToken}`}});
            return safeArray(res.data);
        },
        staleTime: 5 * 60_000,
    });

    const designQ = useQuery({
        queryKey: ["org", "designations"],
        enabled: open,
        queryFn: async () => {
            const res = await http.get("/org/designations", {headers: {Authorization: `Bearer ${accessToken}`}});
            return safeArray(res.data);
        },
        staleTime: 5 * 60_000,
    });

    const [form, setForm] = useState(() => ({
        role: row?.role || "",
        dept_id: e?.dept_id ?? "",
        sub_dept_id: e?.sub_dept_id ?? "",
        designation_id: e?.designation_id ?? "",
    }));

    const loading = rolesQ.isLoading || deptsQ.isLoading || subsQ.isLoading || designQ.isLoading;
    const onChange = (patch) => setForm((f) => ({...f, ...patch}));

    const subOptions = useMemo(() => {
        const all = safeArray(subsQ.data);
        if (!form.dept_id) return all;
        return all.filter((s) => String(s.dept_id) === String(form.dept_id));
    }, [subsQ.data, form.dept_id]);

    const save = async () => {
        try {
            const payload = {
                employee_id: e?.employee_id,
                role: form.role,
                work_position: form.role, // mirror role
                dept_id: form.dept_id || null,
                sub_dept_id: form.sub_dept_id || null,
                designation_id: form.designation_id || null,
            };

            const meId = getUserCtx()?.user?.user_id;
            const isSelf = row?.user_id && row.user_id === meId;

            if (isSelf) {
                await http.patch("/auth/me/profile", payload, {headers: {Authorization: `Bearer ${accessToken}`}});
            } else {
                await http.patch(`/auth/users/${row?.user_id}`, payload, {headers: {Authorization: `Bearer ${accessToken}`}});
            }

            onSaved?.();
        } catch (err) {
            console.error(err);
            alert(errText(err, "Update failed"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-w-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update role and org mapping. Work position mirrors role automatically.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin"/> Loading form…
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Role</div>
                                <Select value={form.role} onValueChange={(v) => onChange({role: v})}>
                                    <SelectTrigger className="h-11">
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

                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Department</div>
                                <Select
                                    value={String(form.dept_id ?? "")}
                                    onValueChange={(v) => onChange({dept_id: v, sub_dept_id: ""})}
                                >
                                    <SelectTrigger className="h-11">
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

                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Sub-Department</div>
                                <Select value={String(form.sub_dept_id ?? "")}
                                        onValueChange={(v) => onChange({sub_dept_id: v})}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select sub-department"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(subOptions).map((s) => (
                                            <SelectItem key={s.sub_dept_id} value={String(s.sub_dept_id)}>
                                                {s.sub_dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Designation</div>
                                <Select
                                    value={String(form.designation_id ?? "")}
                                    onValueChange={(v) => onChange({designation_id: v})}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select designation"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeArray(designQ.data).map((g) => (
                                            <SelectItem key={g.designation_id} value={String(g.designation_id)}>
                                                {g.designation_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={save}>Save changes</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
