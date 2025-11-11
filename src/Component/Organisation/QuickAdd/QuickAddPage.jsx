import React, {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {http, getUserCtx} from "@/lib/http";
import QuickAddSection from "./QuickAddSection.jsx";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    designationsAll: ["org", "designations"],
};

export default function QuickAddPage() {
    const qc = useQueryClient();
    const {userId} = getUserCtx?.() || {};

    const [quickForm, setQuickForm] = useState({
        dept_name: "",
        dept_description: "",
        sub_dept_name: "",
        sub_dept_description: "",
        designation_name: "",
        designation_description: "",
        created_by: Number(userId) || "system",
    });

    const mQuickAdd = useMutation({
        mutationFn: async (payload) =>
            (
                await http.post("/org/add-all", {
                    ...payload,
                    created_by: Number(userId) || "system",
                })
            ).data,
        onSuccess: ({dept, sub_dept, designation}) => {
            toast.success(
                `Added: ${dept.dept_name} → ${sub_dept.sub_dept_name} → ${designation.designation_name}`
            );
            qc.invalidateQueries({queryKey: qk.depts});
            qc.invalidateQueries({queryKey: qk.subDeptsAll});
            qc.invalidateQueries({queryKey: qk.designationsAll});
            setQuickForm((s) => ({
                ...s,
                dept_name: "",
                dept_description: "",
                sub_dept_name: "",
                sub_dept_description: "",
                designation_name: "",
                designation_description: "",
            }));
        },
        onError: (err) =>
            toast.error(
                err?.response?.data?.detail ||
                "Failed to add all"
            ),
    });

    return (
        <div className="min-h-[50vh] p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-4">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                    Quick Add
                </h2>
                <p className="text-sm md:text-base text-slate-500 mt-1">
                    Create a Department, Sub-Department & Designation in one smooth flow.
                </p>
            </div>
                <QuickAddSection
                    quickForm={quickForm}
                    setQuickForm={setQuickForm}
                    onSubmit={() => mQuickAdd.mutate(quickForm)}
                    pending={mQuickAdd.isPending}
                />
        </div>
    );
}
