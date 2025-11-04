import React, {useMemo, useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {safeArray, toArray} from "@/Utils/arrays.js";
import {http, getUserCtx} from "@/lib/http";
import DesignationSection from "./sections/DesignationSection.jsx";

/* ----------------------------- helpers ----------------------------- */
const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],          // ← single source of truth
    designationsAll: ["org", "designations"],
};

const fetchList = async (url) => {
    try {
        const {data} = await http.get(url);
        return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    } catch {
        return [];
    }
};

// client-side filter
function filterDesignations(list, deptId, subDeptId) {
    let out = safeArray(list);
    if (deptId) out = out.filter((x) => Number(x.dept_id) === Number(deptId));
    if (subDeptId) out = out.filter((x) => Number(x.sub_dept_id) === Number(subDeptId));
    return out;
}

export default function DesignationsPage() {
    const qc = useQueryClient();
    const {userId} = getUserCtx();

    const [deptFilter, setDeptFilter] = useState("");
    const [subDeptFilter, setSubDeptFilter] = useState("");

    const [designationForm, setDesignationForm] = useState({
        dept_id: "",
        sub_dept_id: "",
        designation_name: "",
        description: "",
        created_by: Number(userId) || 0,
    });

    /* ------------------------------ queries ------------------------------ */
    const {data: departments = [], isLoading: loadingDepts} = useQuery({
        queryKey: qk.depts,
        queryFn: () => fetchList("org/departments"),
        select: toArray,
    });

    // 🚩 Always fetch ALL sub-departments once
    const {data: subDepartmentsAll = [], isLoading: loadingSubs} = useQuery({
        queryKey: qk.subDeptsAll,
        queryFn: () => fetchList("org/sub-departments"),
        select: toArray,
    });

    const {data: allDesignations = [], isLoading: loadingDesignations} = useQuery({
        queryKey: qk.designationsAll,
        queryFn: () => fetchList("org/designations"),
        select: toArray,
    });

    const designations = useMemo(
        () => filterDesignations(allDesignations, deptFilter, subDeptFilter),
        [allDesignations, deptFilter, subDeptFilter]
    );

    /* ----------------------------- options ----------------------------- */
    const deptOptions = useMemo(
        () => safeArray(departments).map((d) => ({value: String(d.dept_id), label: d.dept_name})),
        [departments]
    );

    // Filter sub-dept dropdown by selected dept (for the right-side filters)
    const subDeptsForFilter = useMemo(
        () =>
            deptFilter
                ? safeArray(subDepartmentsAll).filter((s) => Number(s.dept_id) === Number(deptFilter))
                : safeArray(subDepartmentsAll),
        [subDepartmentsAll, deptFilter]
    );
    const subDeptOptions = useMemo(
        () => subDeptsForFilter.map((s) => ({value: String(s.sub_dept_id), label: s.sub_dept_name})),
        [subDeptsForFilter]
    );

    // For the Add Designation form
    const subDeptsForDesignation = useMemo(
        () =>
            designationForm.dept_id
                ? safeArray(subDepartmentsAll).filter((s) => Number(s.dept_id) === Number(designationForm.dept_id))
                : [],
        [subDepartmentsAll, designationForm.dept_id]
    );

    /* ----------------------------- mutations ----------------------------- */
    const mCreateDesignation = useMutation({
        mutationFn: async (payload) =>
            (await http.post("org/designations", {
                ...payload,
                dept_id: Number(payload.dept_id),
                sub_dept_id: Number(payload.sub_dept_id),
                created_by: Number(userId) || 0,
            })).data,
        onSuccess: (data) => {
            toast.success(`Designation "${data.designation_name}" created`);
            qc.invalidateQueries({queryKey: qk.designationsAll});
            setDesignationForm((s) => ({...s, designation_name: "", description: ""}));
        },
        onError: (err) => {
            const d = err?.response?.data;
            toast.error(d?.detail || d?.message || err?.message || "Failed to create designation");
        },
    });

    /* -------------------------------- UI --------------------------------- */
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Designations</h2>
            <p className="text-muted-foreground mb-6">Create and manage designations.</p>

            <DesignationSection
                departments={departments}
                // ⬇️ pass ALL sub-departments so names always resolve in the table
                subDepartments={subDepartmentsAll}
                deptOptions={deptOptions}
                subDeptOptions={subDeptOptions}
                subDeptsForDesignation={subDeptsForDesignation}
                designations={designations}
                loadingDepts={loadingDepts}
                loadingSubs={loadingSubs}
                loadingDesignations={loadingDesignations}
                deptFilter={deptFilter}
                setDeptFilter={setDeptFilter}
                subDeptFilter={subDeptFilter}
                setSubDeptFilter={setSubDeptFilter}
                designationForm={designationForm}
                setDesignationForm={setDesignationForm}
                onCreate={() => mCreateDesignation.mutate({...designationForm})}
                onRefresh={() => qc.invalidateQueries({queryKey: qk.designationsAll})}
            />
        </div>
    );
}
