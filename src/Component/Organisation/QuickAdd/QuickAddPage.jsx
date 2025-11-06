import React, {useState} from "react";
import axios from "axios";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import QuickAddSection from "./QuickAddSection.jsx";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    designationsAll: ["org", "designations"],
};

export default function QuickAddPage() {
    const qc = useQueryClient();
    const [quickForm, setQuickForm] = useState({
        dept_name: "",
        dept_description: "",
        sub_dept_name: "",
        sub_dept_description: "",
        designation_name: "",
        designation_description: "",
        created_by: "system",
    });

    const mQuickAdd = useMutation({
        mutationFn: async (payload) => (await axios.post("/org/add-all", payload)).data,
        onSuccess: ({dept, sub_dept, designation}) => {
            toast.success(`Added: ${dept.dept_name} → ${sub_dept.sub_dept_name} → ${designation.designation_name}`);
            qc.invalidateQueries({queryKey: qk.depts});
            qc.invalidateQueries({queryKey: qk.subDeptsAll});
            qc.invalidateQueries({queryKey: qk.designationsAll});
            setQuickForm({
                dept_name: "",
                dept_description: "",
                sub_dept_name: "",
                sub_dept_description: "",
                designation_name: "",
                designation_description: "",
                created_by: "system",
            });
        },
        onError: (err) => toast.error(err?.response?.data?.detail || "Failed to add all"),
    });

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Quick Add</h2>
            <p className="text-muted-foreground mb-6">Create Department → Sub-Department → Designation in one go.</p>

            <QuickAddSection
                quickForm={quickForm}
                setQuickForm={setQuickForm}
                onSubmit={() => mQuickAdd.mutate(quickForm)}
                pending={mQuickAdd.isPending}
            />
        </div>
    );
}
