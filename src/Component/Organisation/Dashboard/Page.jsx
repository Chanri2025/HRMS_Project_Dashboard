// src/pages/Page.jsx
import React, {useMemo, useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

import DepartmentsPage from "../Departments/DepartmentsPage.jsx";
import DesignationsPage from "../Designations/DesignationsPage.jsx";
import SubDepartmentsPage from "../SubDepartments/SubDepartmentsPage.jsx";
import QuickAddPage from "../QuickAdd/QuickAddPage.jsx";

import {safeArray, toArray} from "@/Utils/arrays";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    subDeptsByDept: (dept_id) => ["org", "sub-departments", {dept_id}],
    designationsAll: ["org", "designations"],
    designationsBy: (dept_id, sub_dept_id) => ["org", "designations", {dept_id, sub_dept_id}],
};

const fetcher = async (url, params) => {
    try {
        const {data} = await http.get(`/${url}`, {params}); // ensure leading slash once
        return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    } catch {
        return [];
    }
};

export default function Page() {
    const qc = useQueryClient();
    const {userId} = getUserCtx(); // from sessionStorage

    // Filters
    const [deptFilter, setDeptFilter] = useState("");
    const [subDeptFilter, setSubDeptFilter] = useState("");

    // Forms (created_by must be integer)
    const [deptForm, setDeptForm] = useState({
        dept_name: "",
        description: "",
        created_by: Number(userId) || 0,
    });
    const [subDeptForm, setSubDeptForm] = useState({
        dept_id: "",
        sub_dept_name: "",
        description: "",
        created_by: Number(userId) || 0,
    });
    const [designationForm, setDesignationForm] = useState({
        dept_id: "",
        sub_dept_id: "",
        designation_name: "",
        description: "",
        created_by: Number(userId) || 0,
    });
    const [quickForm, setQuickForm] = useState({
        dept_name: "",
        dept_description: "",
        sub_dept_name: "",
        sub_dept_description: "",
        designation_name: "",
        designation_description: "",
        created_by: Number(userId) || 0,
    });

    /* ------------------------------ queries ------------------------------ */
    const {data: departments = [], isLoading: loadingDepts} = useQuery({
        queryKey: qk.depts,
        queryFn: () => fetcher("org/departments"),
        select: toArray,
    });

    // Sub-departments for the Sub-Departments tab/list (dept-filtered via path param)
    const {data: subDepartments = [], isLoading: loadingSubDepts} = useQuery({
        queryKey: deptFilter ? qk.subDeptsByDept(Number(deptFilter)) : qk.subDeptsAll,
        queryFn: () =>
            fetcher(deptFilter ? `org/sub-departments/${Number(deptFilter)}` : "org/sub-departments"),
        select: toArray,
    });

    // Always fetch ALL sub-departments once (source of truth for names & dropdowns)
    const {data: allSubDepts = [], isLoading: loadingAllSubDepts} = useQuery({
        queryKey: qk.subDeptsAll,
        queryFn: () => fetcher("org/sub-departments"),
        select: toArray,
    });

    const {data: designations = [], isLoading: loadingDesignations} = useQuery({
        queryKey:
            deptFilter || subDeptFilter
                ? qk.designationsBy(
                    deptFilter ? Number(deptFilter) : undefined,
                    subDeptFilter ? Number(subDeptFilter) : undefined
                )
                : qk.designationsAll,
        queryFn: () =>
            fetcher("org/designations", {
                ...(deptFilter ? {dept_id: Number(deptFilter)} : {}),
                ...(subDeptFilter ? {sub_dept_id: Number(subDeptFilter)} : {}),
            }),
        select: toArray,
    });

    // sub-dept options for Designation form (filter by chosen dept)
    const subDeptsForDesignation = useMemo(() => {
        const list = safeArray(allSubDepts);
        if (!designationForm.dept_id) return list;
        return list.filter((s) => Number(s.dept_id) === Number(designationForm.dept_id));
    }, [allSubDepts, designationForm.dept_id]);

    /* ----------------------------- options ------------------------------- */
    const deptOptions = useMemo(
        () => safeArray(departments).map((d) => ({value: String(d.dept_id), label: d.dept_name})),
        [departments]
    );

    const subDeptOptions = useMemo(() => {
        const base = deptFilter
            ? safeArray(allSubDepts).filter((s) => Number(s.dept_id) === Number(deptFilter))
            : safeArray(allSubDepts);
        return base.map((s) => ({value: String(s.sub_dept_id), label: s.sub_dept_name}));
    }, [allSubDepts, deptFilter]);

    /* ----------------------------- mutations ----------------------------- */
    const mCreateDept = useMutation({
        mutationFn: async (payload) =>
            (await http.post("/org/departments", {...payload, created_by: Number(userId) || 0})).data,
        onSuccess: (data) => {
            toast.success(`Department "${data.dept_name}" created`);
            qc.invalidateQueries({queryKey: qk.depts});
            setDeptForm((s) => ({...s, dept_name: "", description: ""}));
        },
        onError: (err) => toast.error(errText(err, "Failed to create department")),
    });

    const mCreateSubDept = useMutation({
        mutationFn: async (payload) =>
            (
                await http.post("/org/sub-departments", {
                    ...payload,
                    dept_id: Number(payload.dept_id),
                    created_by: Number(userId) || 0,
                })
            ).data,
        onSuccess: (data, payload) => {
            toast.success(`Sub-Department "${data.sub_dept_name}" created`);
            qc.invalidateQueries({queryKey: qk.subDeptsAll});
            if (payload.dept_id)
                qc.invalidateQueries({queryKey: qk.subDeptsByDept(Number(payload.dept_id))});
            setSubDeptForm((s) => ({...s, sub_dept_name: "", description: ""}));
        },
        onError: (err) => toast.error(errText(err, "Failed to create sub-department")),
    });

    const mCreateDesignation = useMutation({
        mutationFn: async (payload) =>
            (
                await http.post("/org/designations", {
                    ...payload,
                    dept_id: Number(payload.dept_id),
                    sub_dept_id: Number(payload.sub_dept_id),
                    created_by: Number(userId) || 0,
                })
            ).data,
        onSuccess: (data, payload) => {
            toast.success(`Designation "${data.designation_name}" created`);
            qc.invalidateQueries({queryKey: qk.designationsAll});
            qc.invalidateQueries({
                queryKey: qk.designationsBy(Number(payload.dept_id), Number(payload.sub_dept_id)),
            });
            setDesignationForm((s) => ({...s, designation_name: "", description: ""}));
        },
        onError: (err) => toast.error(errText(err, "Failed to create designation")),
    });

    const mQuickAdd = useMutation({
        mutationFn: async (payload) =>
            (
                await http.post("/org/add-all", {
                    ...payload,
                    created_by: Number(userId) || 0,
                })
            ).data,
        onSuccess: ({dept, sub_dept, designation}) => {
            toast.success(`Added: ${dept.dept_name} → ${sub_dept.sub_dept_name} → ${designation.designation_name}`);
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
        onError: (err) => toast.error(errText(err, "Failed to add all")),
    });

    /* -------------------------------- UI --------------------------------- */
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
                <p className="text-muted-foreground">Manage Departments, Sub-Departments, and Designations.</p>
            </div>

            <Tabs defaultValue="departments" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="sub-departments">Sub-Departments</TabsTrigger>
                    <TabsTrigger value="designations">Designations</TabsTrigger>
                    <TabsTrigger value="quick-add">Quick Add</TabsTrigger>
                </TabsList>

                <TabsContent value="departments">
                    <DepartmentsPage
                        departments={departments}
                        loading={loadingDepts}
                        deptForm={deptForm}
                        setDeptForm={setDeptForm}
                        onCreate={() => mCreateDept.mutate(deptForm)}
                        onRefresh={() => qInvalidate(qc, qk.depts)}
                    />
                </TabsContent>

                <TabsContent value="sub-departments">
                    <SubDepartmentsPage
                        departments={departments}
                        deptOptions={deptOptions}
                        subDepartments={subDepartments}
                        loadingDepts={loadingDepts}
                        loadingSubs={loadingSubDepts}
                        deptFilter={deptFilter}
                        setDeptFilter={setDeptFilter}
                        subDeptForm={subDeptForm}
                        setSubDeptForm={setSubDeptForm}
                        onCreate={() => mCreateSubDept.mutate(subDeptForm)}
                        onRefresh={() =>
                            qInvalidate(qc, deptFilter ? qk.subDeptsByDept(Number(deptFilter)) : qk.subDeptsAll)
                        }
                    />
                </TabsContent>

                <TabsContent value="designations">
                    <DesignationsPage
                        departments={departments}
                        subDepartments={allSubDepts}            // pass ALL for name resolution
                        deptOptions={deptOptions}
                        subDeptOptions={subDeptOptions}
                        subDeptsForDesignation={subDeptsForDesignation}
                        designations={designations}
                        loadingDepts={loadingDepts}
                        loadingSubs={loadingAllSubDepts}        // use "all" loading for right panel
                        loadingDesignations={loadingDesignations}
                        deptFilter={deptFilter}
                        setDeptFilter={setDeptFilter}
                        subDeptFilter={subDeptFilter}
                        setSubDeptFilter={setSubDeptFilter}
                        designationForm={designationForm}
                        setDesignationForm={setDesignationForm}
                        onCreate={() => mCreateDesignation.mutate(designationForm)}
                        onRefresh={() =>
                            qInvalidate(
                                qc,
                                deptFilter || subDeptFilter
                                    ? qk.designationsBy(
                                        deptFilter ? Number(deptFilter) : undefined,
                                        subDeptFilter ? Number(subDeptFilter) : undefined
                                    )
                                    : qk.designationsAll
                            )
                        }
                    />
                </TabsContent>

                <TabsContent value="quick-add">
                    <QuickAddPage
                        quickForm={quickForm}
                        setQuickForm={setQuickForm}
                        onSubmit={() => mQuickAdd.mutate(quickForm)}
                        pending={mQuickAdd.isPending}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function qInvalidate(qc, key) {
    qc.invalidateQueries({queryKey: key});
}
