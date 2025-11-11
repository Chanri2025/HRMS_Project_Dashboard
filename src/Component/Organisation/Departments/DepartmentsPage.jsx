import React, {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import DepartmentSection from "@/Component/Organisation/Departments/DepartmentSection.jsx";
import {http, getUserCtx} from "@/lib/http.js";
import {toArray} from "@/Utils/arrays.js";
import {errText} from "@/lib/errText.js";

const qk = {depts: ["org", "departments"]};

const fetcher = async (url, params) => {
    try {
        const {data} = await http.get(url, {params});
        return Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];
    } catch (e) {
        console.error("GET", url, e?.response?.data || e);
        return [];
    }
};

export default function DepartmentsPage(props) {
    const {
        departments: departmentsProp,
        loading: loadingProp,
        deptForm: deptFormProp,
        setDeptForm: setDeptFormProp,
        onCreate: onCreateProp,
        onRefresh: onRefreshProp,
    } = props;

    const isStandalone = typeof departmentsProp === "undefined";

    const qc = useQueryClient();
    const {userId} = getUserCtx();

    const [deptFormLocal, setDeptFormLocal] = useState({
        dept_name: "",
        description: "",
        created_by: Number(userId) || 0,
    });

    const {
        data: departmentsLocal = [],
        isLoading: loadingLocal,
    } = useQuery({
        enabled: isStandalone,
        queryKey: qk.depts,
        queryFn: () => fetcher("/org/departments"),
        select: toArray,
    });

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
            setDeptFormLocal((s) => ({...s, dept_name: "", description: ""}));
        },
        onError: (err) =>
            toast.error(errText(err, "Failed to create department")),
    });

    const mUpdateDept = useMutation({
        mutationFn: async ({dept_id, payload}) =>
            (
                await http.put(`/org/departments/${Number(dept_id)}`, {
                    dept_name: payload.dept_name,
                    description: payload.description,
                })
            ).data,
        onSuccess: (data, vars) => {
            toast.success(
                `Updated “${
                    data?.dept_name || vars?.payload?.dept_name || "Department"
                }”`
            );
            qc.invalidateQueries({queryKey: qk.depts});
        },
        onError: (err) =>
            toast.error(errText(err, "Failed to update department")),
    });

    const [deletingId, setDeletingId] = useState(null);

    const mDeleteDept = useMutation({
        mutationFn: async ({dept_id}) => {
            setDeletingId(Number(dept_id));
            return (
                await http.delete(`/org/departments/${Number(dept_id)}`)
            ).data;
        },
        onSuccess: () => {
            toast.success("Department deleted");
            qc.invalidateQueries({queryKey: qk.depts});
            setDeletingId(null);
        },
        onError: (err) => {
            toast.error(errText(err, "Failed to delete department"));
            setDeletingId(null);
        },
    });

    const departments = isStandalone ? departmentsLocal : departmentsProp;
    const loading = isStandalone ? loadingLocal : !!loadingProp;

    const deptForm = isStandalone
        ? deptFormLocal
        : deptFormProp ?? {dept_name: "", description: ""};

    const setDeptForm = isStandalone
        ? setDeptFormLocal
        : setDeptFormProp ?? (() => {
    });

    const onCreate = isStandalone
        ? () => mCreateDept.mutate(deptForm)
        : onCreateProp ?? (() => {
    });

    const onRefresh = isStandalone
        ? () => qc.invalidateQueries({queryKey: qk.depts})
        : onRefreshProp ?? (() => {
    });

    const wrapperClass = isStandalone
        ? "min-h-screen bg-slate-50/70 px-3 py-4 md:px-6 md:py-6"
        : "pt-2";

    return (
        <div className={wrapperClass}>
            {isStandalone && (
                <div className="max-w-6xl mx-auto mb-4">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Departments
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Create, edit & organize your departments in one view.
                    </p>
                </div>
            )}

            <div className={isStandalone ? "max-w-6xl mx-auto" : ""}>
                <DepartmentSection
                    departments={departments}
                    loading={loading}
                    deptForm={deptForm}
                    setDeptForm={setDeptForm}
                    onCreate={onCreate}
                    onRefresh={onRefresh}
                    onUpdate={(vars) => mUpdateDept.mutate(vars)}
                    updating={mUpdateDept.isPending}
                    onDelete={(vars) => mDeleteDept.mutate(vars)}
                    deletingId={deletingId}
                />
            </div>
        </div>
    );
}
