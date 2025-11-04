import React, {useMemo, useState} from "react";
import axios from "axios";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {safeArray, toArray} from "@/Utils/arrays.js";
import DesignationSection from "./sections/DesignationSection.jsx";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    subDeptsByDept: (dept_id) => ["org", "sub-departments", {dept_id}],
    designationsAll: ["org", "designations"],
    designationsBy: (dept_id, sub_dept_id) => ["org", "designations", {dept_id, sub_dept_id}],
};
const fetcher = async (url, params) => {
    try {
        const {data} = await axios.get(url, {params});
        return data;
    } catch {
        return [];
    }
};

export default function DesignationsPage() {
    const qc = useQueryClient();

    const [deptFilter, setDeptFilter] = useState("");
    const [subDeptFilter, setSubDeptFilter] = useState("");
    const [designationForm, setDesignationForm] = useState({
        dept_id: "",
        sub_dept_id: "",
        designation_name: "",
        description: "",
        created_by: "system",
    });

    const {data: departments = [], isLoading: loadingDepts} = useQuery({
        queryKey: qk.depts,
        queryFn: () => fetcher("/org/departments"),
        select: toArray,
    });

    const {data: subDepartments = [], isLoading: loadingSubs} = useQuery({
        queryKey: deptFilter ? qk.subDeptsByDept(Number(deptFilter)) : qk.subDeptsAll,
        queryFn: () => fetcher("/org/sub-departments", deptFilter ? {dept_id: Number(deptFilter)} : undefined),
        select: toArray,
    });

    const {data: designations = [], isLoading: loadingDesignations} = useQuery({
        queryKey: deptFilter || subDeptFilter
            ? qk.designationsBy(deptFilter ? Number(deptFilter) : undefined, subDeptFilter ? Number(subDeptFilter) : undefined)
            : qk.designationsAll,
        queryFn: () => fetcher("/org/designations", {
            ...(deptFilter ? {dept_id: Number(deptFilter)} : {}),
            ...(subDeptFilter ? {sub_dept_id: Number(subDeptFilter)} : {}),
        }),
        select: toArray,
    });

    const {data: subDeptsForDesignation = []} = useQuery({
        enabled: Boolean(designationForm.dept_id),
        queryKey: qk.subDeptsByDept(Number(designationForm.dept_id || 0)),
        queryFn: () => fetcher("/org/sub-departments", {dept_id: Number(designationForm.dept_id)}),
        select: toArray,
    });

    const deptOptions = useMemo(
        () => safeArray(departments).map((d) => ({value: String(d.dept_id), label: d.dept_name})),
        [departments]
    );
    const subDeptOptions = useMemo(
        () => safeArray(subDepartments).map((s) => ({value: String(s.sub_dept_id), label: s.sub_dept_name})),
        [subDepartments]
    );

    const mCreateDesignation = useMutation({
        mutationFn: async (payload) => (await axios.post("/org/designations", payload)).data,
        onSuccess: (data, payload) => {
            toast.success(`Designation "${data.designation_name}" created`);
            qc.invalidateQueries({queryKey: qk.designationsAll});
            qc.invalidateQueries({
                queryKey: qk.designationsBy(Number(payload.dept_id), Number(payload.sub_dept_id)),
            });
            setDesignationForm((s) => ({...s, designation_name: "", description: ""}));
        },
        onError: (err) => toast.error(err?.response?.data?.detail || "Failed to create designation"),
    });

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Designations</h2>
            <p className="text-muted-foreground mb-6">Create and manage designations.</p>

            <DesignationSection
                departments={departments}
                subDepartments={subDepartments}
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
                onRefresh={() =>
                    qc.invalidateQueries({
                        queryKey:
                            deptFilter || subDeptFilter
                                ? qk.designationsBy(
                                    deptFilter ? Number(deptFilter) : undefined,
                                    subDeptFilter ? Number(subDeptFilter) : undefined
                                )
                                : qk.designationsAll,
                    })
                }
            />
        </div>
    );
}
