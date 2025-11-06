import React, {useMemo, useState, useEffect} from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useMe, useUpdateMeProfile} from "@/hooks/useMe";
import {useDepartmentName, useSubDepartmentName, useDesignationName} from "@/hooks/useOrgLookups";

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    if (!parts.length) return "US";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function InfoRow({label, value}) {
    return (
        <div className="grid grid-cols-3 gap-2 py-1">
            <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
            <div className="col-span-2 text-xs md:text-sm text-foreground break-all">
                {value ?? "—"}
            </div>
        </div>
    );
}

export default function UserProfileModal({open, onOpenChange}) {
    const {data, isLoading, isError, error} = useMe(open);
    const update = useUpdateMeProfile();

    const emp = data?.employee || {};
    const fullName = data?.full_name || emp?.full_name || "User";
    const initials = useMemo(() => getInitials(fullName), [fullName]);

    // Lookups (for display of names)
    const {data: deptName} = useDepartmentName(emp?.dept_id);
    const {data: subDeptName} = useSubDepartmentName(emp?.sub_dept_id);
    const {data: designationName} = useDesignationName(emp?.designation_id);

    // -------- Edit mode state --------
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({
        employee_id: "",
        full_name: "",
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

    // hydrate form when data loads or modal opens
    useEffect(() => {
        if (!open || !data) return;
        const e = data.employee || {};
        setForm({
            employee_id: e.employee_id ?? "",
            full_name: e.full_name ?? data.full_name ?? "",
            phone: e.phone ?? "",
            address: e.address ?? "",
            fathers_name: e.fathers_name ?? "",
            aadhar_no: e.aadhar_no ?? "",
            date_of_birth: e.date_of_birth ?? "",
            work_position: e.work_position ?? data.role ?? "",
            card_id: e.card_id ?? "",
            dept_id: e.dept_id ?? "",
            sub_dept_id: e.sub_dept_id ?? "",
            designation_id: e.designation_id ?? "",
        });
    }, [open, data]);

    const onChange = (k) => (e) => {
        const v = e?.target?.value;
        setForm((f) => ({...f, [k]: v}));
    };

    const onCancelEdit = () => {
        setEdit(false);
        // reset back to backend values
        if (data) {
            const e = data.employee || {};
            setForm({
                employee_id: e.employee_id ?? "",
                full_name: e.full_name ?? data.full_name ?? "",
                phone: e.phone ?? "",
                address: e.address ?? "",
                fathers_name: e.fathers_name ?? "",
                aadhar_no: e.aadhar_no ?? "",
                date_of_birth: e.date_of_birth ?? "",
                work_position: e.work_position ?? data.role ?? "",
                card_id: e.card_id ?? "",
                dept_id: e.dept_id ?? "",
                sub_dept_id: e.sub_dept_id ?? "",
                designation_id: e.designation_id ?? "",
            });
        }
    };

    const onSave = async () => {
        // convert numeric ids if user typed strings
        const payload = {
            ...form,
            dept_id: form.dept_id === "" ? null : Number(form.dept_id),
            sub_dept_id: form.sub_dept_id === "" ? null : Number(form.sub_dept_id),
            designation_id: form.designation_id === "" ? null : Number(form.designation_id),
        };
        try {
            await update.mutateAsync(payload);
            setEdit(false);
        } catch (e) {
            // error surfaced below in button disabled state; keep modal open
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (!v) setEdit(false);
            onOpenChange?.(v);
        }}>
            <DialogContent className="max-w-4xl w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pt-5">
                    <div>
                        <DialogTitle>Profile</DialogTitle>
                        <DialogDescription>Your account details</DialogDescription>
                    </div>
                    {!isLoading && !isError && (
                        <div className="flex items-center gap-2">
                            {!edit ? (
                                <Button variant="outline" size="sm" onClick={() => setEdit(true)}>
                                    Edit
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onCancelEdit}
                                        disabled={update.isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onSave}
                                        disabled={update.isPending}
                                    >
                                        {update.isPending ? "Saving..." : "Save"}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </DialogHeader>

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="text-lg font-semibold text-foreground">
                            {fullName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                                {data?.role ?? emp?.work_position ?? "—"}
                            </Badge>
                            {data?.is_active ? (
                                <Badge className="bg-success text-success-foreground text-xs">Active</Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs">Inactive</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <Separator className="my-3"/>

                {/* Loading / Error */}
                {isLoading && (
                    <div className="space-y-2">
                        {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className="h-4 w-full bg-muted rounded animate-pulse"/>
                        ))}
                    </div>
                )}
                {isError && !isLoading && (
                    <div className="text-sm text-destructive">
                        Failed to load profile{error?.message ? `: ${error.message}` : ""}.
                    </div>
                )}

                {/* View / Edit */}
                {!isLoading && !isError && !edit && (
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                        <InfoRow label="Email" value={data?.email}/>
                        <InfoRow label="Last Active" value={data?.last_active}/>
                        <InfoRow label="Employee ID" value={emp?.employee_id}/>
                        <InfoRow label="Phone" value={emp?.phone}/>
                        <InfoRow label="Address" value={emp?.address}/>
                        <InfoRow label="Father's Name" value={emp?.fathers_name}/>
                        <InfoRow label="Aadhar No." value={emp?.aadhar_no}/>
                        <InfoRow label="DOB" value={emp?.date_of_birth}/>
                        <InfoRow label="Card ID" value={emp?.card_id}/>
                        <InfoRow label="Department"
                                 value={deptName || (emp?.dept_id != null ? `ID ${emp?.dept_id}` : "—")}/>
                        <InfoRow label="Sub-Department"
                                 value={subDeptName || (emp?.sub_dept_id != null ? `ID ${emp?.sub_dept_id}` : "—")}/>
                        <InfoRow label="Designation"
                                 value={designationName || (emp?.designation_id != null ? `ID ${emp?.designation_id}` : "—")}/>
                        <InfoRow label="Created" value={data?.created_at}/>
                        <InfoRow label="Updated" value={data?.updated_at}/>
                    </div>
                )}

                {!isLoading && !isError && edit && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Left column */}
                        <div className="space-y-3">
                            <div>
                                <Label>Employee ID</Label>
                                <Input value={form.employee_id} onChange={onChange("employee_id")}/>
                            </div>
                            <div>
                                <Label>Full Name</Label>
                                <Input value={form.full_name} onChange={onChange("full_name")}/>
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={onChange("phone")}/>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input value={form.address} onChange={onChange("address")}/>
                            </div>
                            <div>
                                <Label>Father's Name</Label>
                                <Input value={form.fathers_name} onChange={onChange("fathers_name")}/>
                            </div>
                            <div>
                                <Label>Aadhar No.</Label>
                                <Input value={form.aadhar_no} onChange={onChange("aadhar_no")}/>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-3">
                            <div>
                                <Label>Date of Birth</Label>
                                <Input type="date" value={form.date_of_birth} onChange={onChange("date_of_birth")}/>
                            </div>
                            <div>
                                <Label>Role (Work Position)</Label>
                                <Input value={form.work_position} onChange={onChange("work_position")}/>
                                {/* If you have a fixed set of roles, swap Input for a Select here */}
                            </div>
                            <div>
                                <Label>Card ID</Label>
                                <Input value={form.card_id} onChange={onChange("card_id")}/>
                            </div>
                            <div>
                                <Label>Dept ID</Label>
                                <Input value={form.dept_id} onChange={onChange("dept_id")}/>
                            </div>
                            <div>
                                <Label>Sub Dept ID</Label>
                                <Input value={form.sub_dept_id} onChange={onChange("sub_dept_id")}/>
                            </div>
                            <div>
                                <Label>Designation ID</Label>
                                <Input value={form.designation_id} onChange={onChange("designation_id")}/>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
