import React, {useMemo, useState} from "react";
import axios from "axios";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {safeArray, toArray} from "@/Utils/arrays.js";
import SubDepartmentSection from "./sections/SubDepartmentSection.jsx";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    subDeptsByDept: (dept_id) => ["org", "sub-departments", {dept_id}],
};
const fetcher = async (url, params) => {
    try {
        const {data} = await axios.get(url, {params});
        return data;
    } catch {
        return [];
    }
};

const SubDepartmentsPage = () => {
    const qc = useQueryClient();
    const [deptFilter, setDeptFilter] = useState("");
    const [subDeptForm, setSubDeptForm] = useState({
        dept_id: "",
        sub_dept_name: "",
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

    const deptOptions = useMemo(
        () => safeArray(departments).map((d) => ({value: String(d.dept_id), label: d.dept_name})),
        [departments]
    );

    const mCreateSubDept = useMutation({
        mutationFn: async (payload) => (await axios.post("/org/sub-departments", payload)).data,
        onSuccess: (data, payload) => {
            toast.success(`Sub-Department "${data.sub_dept_name}" created`);
            qc.invalidateQueries({queryKey: qk.subDeptsAll});
            if (payload.dept_id) qc.invalidateQueries({queryKey: qk.subDeptsByDept(Number(payload.dept_id))});
            setSubDeptForm((s) => ({...s, sub_dept_name: "", description: ""}));
        },
        onError: (err) => toast.error(err?.response?.data?.detail || "Failed to create sub-department"),
    });

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Sub-Departments</h2>
            <p className="text-muted-foreground mb-6">Create and manage sub-departments.</p>

            <SubDepartmentSection
                departments={departments}
                deptOptions={deptOptions}
                subDepartments={subDepartments}
                loadingDepts={loadingDepts}
                loadingSubs={loadingSubs}
                deptFilter={deptFilter}
                setDeptFilter={setDeptFilter}
                subDeptForm={subDeptForm}
                setSubDeptForm={setSubDeptForm}
                onCreate={() => mCreateSubDept.mutate({...subDeptForm})}
                onRefresh={() =>
                    qc.invalidateQueries({
                        queryKey: deptFilter ? qk.subDeptsByDept(Number(deptFilter)) : qk.subDeptsAll,
                    })
                }
            />
        </div>
    );
}
export default SubDepartmentsPage;