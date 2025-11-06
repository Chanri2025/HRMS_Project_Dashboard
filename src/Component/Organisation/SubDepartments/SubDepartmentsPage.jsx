// src/pages/SubDepartmentsPage.jsx
import React, {useMemo, useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {safeArray, toArray} from "@/Utils/arrays.js";
import {http, getUserCtx} from "@/lib/http.js";
import {errText} from "@/lib/errText.js";
import SubDepartmentSection from "./SubDepartmentSection.jsx";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    subDeptsByDept: (dept_id) => ["org", "sub-departments", Number(dept_id)],
};

const fetchDepartments = async () => (await http.get("/org/departments")).data;

/** Use /org/sub-departments/:dept_id when filtering, else /org/sub-departments */
const fetchSubDepartments = async (deptFilter) => {
    const url = deptFilter
        ? `/org/sub-departments/${Number(deptFilter)}`
        : `/org/sub-departments`;
    const {data} = await http.get(url);
    return data;
};

export default function SubDepartmentsPage() {
    const qc = useQueryClient();
    const {userId} = getUserCtx?.() || {};

    const [deptFilter, setDeptFilter] = useState("");
    const [subDeptForm, setSubDeptForm] = useState({
        dept_id: "",
        sub_dept_name: "",
        description: "",
        created_by: Number(userId) || 0, // ← from session_storage
    });

    const {data: departments = [], isLoading: loadingDepts} = useQuery({
        queryKey: qk.depts,
        queryFn: fetchDepartments,
        select: toArray,
    });

    const {data: subDepartments = [], isLoading: loadingSubs} = useQuery({
        queryKey: deptFilter ? qk.subDeptsByDept(deptFilter) : qk.subDeptsAll,
        queryFn: () => fetchSubDepartments(deptFilter),
        select: toArray,
    });

    const deptOptions = useMemo(
        () =>
            safeArray(departments).map((d) => ({
                value: String(d.dept_id),
                label: d.dept_name,
            })),
        [departments]
    );

    const mCreateSubDept = useMutation({
        mutationFn: async (payload) => {
            const body = {
                ...payload,
                dept_id: Number(payload.dept_id),
                created_by: Number(userId) || 0,
            };
            return (await http.post("/org/sub-departments", body)).data;
        },
        onSuccess: (data, payload) => {
            toast.success(`Sub-Department “${data.sub_dept_name}” created`);
            qc.invalidateQueries({queryKey: qk.subDeptsAll});
            if (payload.dept_id) {
                qc.invalidateQueries({
                    queryKey: qk.subDeptsByDept(payload.dept_id),
                });
            }
            setSubDeptForm((s) => ({...s, sub_dept_name: "", description: ""}));
        },
        onError: (err) => toast.error(errText(err, "Failed to create sub-department")),
    });

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Sub-Departments</h2>
                <p className="text-muted-foreground">
                    Create and manage sub-departments under existing departments.
                </p>
            </div>

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
                        queryKey: deptFilter ? qk.subDeptsByDept(deptFilter) : qk.subDeptsAll,
                    })
                }
                creating={mCreateSubDept.isPending}
            />
        </div>
    );
}
