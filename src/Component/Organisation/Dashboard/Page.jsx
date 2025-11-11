// src/pages/Page.jsx
import React, {useMemo, useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import DepartmentsPage from "@/Component/Organisation/Departments/DepartmentsPage.jsx";
import DesignationsPage from "@/Component/Organisation/Designations/DesignationsPage.jsx";
import SubDepartmentsPage from "@/Component/Organisation/SubDepartments/SubDepartmentsPage.jsx";
import QuickAddPage from "@/Component/Organisation/QuickAdd/QuickAddPage.jsx";

import {safeArray, toArray} from "@/Utils/arrays";
import {http, getUserCtx} from "@/lib/http";
import {errText} from "@/lib/errText";

const qk = {
    depts: ["org", "departments"],
    subDeptsAll: ["org", "sub-departments"],
    subDeptsByDept: (dept_id) => ["org", "sub-departments", {dept_id}],
    designationsAll: ["org", "designations"],
    designationsBy: (dept_id, sub_dept_id) => [
        "org",
        "designations",
        {dept_id, sub_dept_id},
    ],
};

const fetcher = async (url, params) => {
    try {
        const {data} = await http.get(`/${url}`, {params});
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    } catch {
        return [];
    }
};

export default function Page() {
    const qc = useQueryClient();
    const {userId} = getUserCtx();

    // Filters
    const [deptFilter, setDeptFilter] = useState("");
    const [subDeptFilter, setSubDeptFilter] = useState("");

    // Forms
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

    const {
        data: departments = [],
        isLoading: loadingDepts,
    } = useQuery({
        queryKey: qk.depts,
        queryFn: () => fetcher("org/departments"),
        select: toArray,
    });

    const {
        data: subDepartments = [],
        isLoading: loadingSubDepts,
    } = useQuery({
        queryKey: deptFilter
            ? qk.subDeptsByDept(Number(deptFilter))
            : qk.subDeptsAll,
        queryFn: () =>
            fetcher(
                deptFilter
                    ? `org/sub-departments/${Number(deptFilter)}`
                    : "org/sub-departments"
            ),
        select: toArray,
    });

    // All sub-depts for dropdowns / mapping
    const {
        data: allSubDepts = [],
        isLoading: loadingAllSubDepts,
    } = useQuery({
        queryKey: qk.subDeptsAll,
        queryFn: () => fetcher("org/sub-departments"),
        select: toArray,
    });

    const {
        data: designations = [],
        isLoading: loadingDesignations,
    } = useQuery({
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

    /* ----------------------------- options ------------------------------- */

    const deptOptions = useMemo(
        () =>
            safeArray(departments).map((d) => ({
                value: String(d.dept_id),
                label: d.dept_name,
            })),
        [departments]
    );

    const subDeptOptions = useMemo(() => {
        const base = deptFilter
            ? safeArray(allSubDepts).filter(
                (s) => Number(s.dept_id) === Number(deptFilter)
            )
            : safeArray(allSubDepts);
        return base.map((s) => ({
            value: String(s.sub_dept_id),
            label: s.sub_dept_name,
        }));
    }, [allSubDepts, deptFilter]);

    const subDeptsForDesignation = useMemo(() => {
        const list = safeArray(allSubDepts);
        if (!designationForm.dept_id) return list;
        return list.filter(
            (s) => Number(s.dept_id) === Number(designationForm.dept_id)
        );
    }, [allSubDepts, designationForm.dept_id]);

    /* ----------------------------- mutations ----------------------------- */

    const mCreateDept = useMutation({
        mutationFn: async (payload) =>
            (
                await http.post("/org/departments", {
                    ...payload,
                    created_by: Number(userId) || 0,
                })
            ).data,
        onSuccess: (data) => {
            toast.success(`Department "${data.dept_name}" created`);
            qc.invalidateQueries({queryKey: qk.depts});
            setDeptForm((s) => ({...s, dept_name: "", description: ""}));
        },
        onError: (err) =>
            toast.error(errText(err, "Failed to create department")),
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
            if (payload.dept_id) {
                qc.invalidateQueries({
                    queryKey: qk.subDeptsByDept(Number(payload.dept_id)),
                });
            }
            setSubDeptForm((s) => ({
                ...s,
                sub_dept_name: "",
                description: "",
            }));
        },
        onError: (err) =>
            toast.error(errText(err, "Failed to create sub-department")),
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
                queryKey: qk.designationsBy(
                    Number(payload.dept_id),
                    Number(payload.sub_dept_id)
                ),
            });
            setDesignationForm((s) => ({
                ...s,
                designation_name: "",
                description: "",
            }));
        },
        onError: (err) =>
            toast.error(errText(err, "Failed to create designation")),
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
        onError: (err) => toast.error(errText(err, "Failed to add all")),
    });

    /* -------------------------------- UI --------------------------------- */

    return (
        <div className="min-h-screen bg-slate-50/60 px-1 py-4 md:px-6 md:py-6">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                        Organization
                    </h2>
                    <p className="text-sm md:text-base text-slate-500 mt-1">
                        Manage departments, sub-departments & designations in one unified
                        workspace.
                    </p>
                </div>

                {/* Glassy shell */}
                <div
                    className="
            bg-white/70 backdrop-blur-xl border border-slate-200/70
            rounded-2xl shadow-[0_18px_60px_rgba(15,23,42,0.06)]
            px-3 py-3 md:px-5 md:py-5
          "
                >
                    <Tabs defaultValue="departments" className="space-y-5">
                        {/* Tabs header - pill style & mobile friendly */}
                        <div className="w-full overflow-x-auto pb-1">
                            <TabsList
                                className="
                  inline-flex h-10 items-center gap-1 rounded-full bg-slate-100/80 p-1
                  shadow-inner border border-slate-200/80
                "
                            >
                                <TabsTrigger
                                    value="departments"
                                    className="px-4 rounded-full data-[state=active]:bg-sky-500 data-[state=active]:text-white text-xs md:text-sm"
                                >
                                    Departments
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sub-departments"
                                    className="px-4 rounded-full data-[state=active]:bg-violet-500 data-[state=active]:text-white text-xs md:text-sm"
                                >
                                    Sub-Departments
                                </TabsTrigger>
                                <TabsTrigger
                                    value="designations"
                                    className="px-4 rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs md:text-sm"
                                >
                                    Designations
                                </TabsTrigger>
                                <TabsTrigger
                                    value="quick-add"
                                    className="px-4 rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs md:text-sm"
                                >
                                    Quick Add
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content */}
                        <TabsContent value="departments" className="mt-2 space-y-4">
                            <DepartmentsPage
                                departments={departments}
                                loading={loadingDepts}
                                deptForm={deptForm}
                                setDeptForm={setDeptForm}
                                onCreate={() => mCreateDept.mutate(deptForm)}
                                onRefresh={() => qInvalidate(qc, qk.depts)}
                            />
                        </TabsContent>

                        <TabsContent value="sub-departments" className="mt-2 space-y-4">
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
                                    qInvalidate(
                                        qc,
                                        deptFilter
                                            ? qk.subDeptsByDept(Number(deptFilter))
                                            : qk.subDeptsAll
                                    )
                                }
                            />
                        </TabsContent>

                        <TabsContent value="designations" className="mt-2 space-y-4">
                            <DesignationsPage
                                departments={departments}
                                subDepartments={allSubDepts}
                                deptOptions={deptOptions}
                                subDeptOptions={subDeptOptions}
                                subDeptsForDesignation={subDeptsForDesignation}
                                designations={designations}
                                loadingDepts={loadingDepts}
                                loadingSubs={loadingAllSubDepts}
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

                        <TabsContent value="quick-add" className="mt-2 space-y-4">
                            <QuickAddPage
                                quickForm={quickForm}
                                setQuickForm={setQuickForm}
                                onSubmit={() => mQuickAdd.mutate(quickForm)}
                                pending={mQuickAdd.isPending}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function qInvalidate(qc, key) {
    qc.invalidateQueries({queryKey: key});
}