import React, {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import DepartmentSection from "./sections/DepartmentSection.jsx";
import {http, getUserCtx} from "@/lib/http";
import {toArray} from "@/Utils/arrays";
import {errText} from "@/lib/errText";

const qk = {depts: ["org", "departments"]};

// local fetcher
const fetcher = async (url, params) => {
    try {
        const {data} = await http.get(url, {params});
        return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    } catch (e) {
        console.error("GET", url, e?.response?.data || e);
        return [];
    }
};

export default function DepartmentsPage(props) {
    const {
        // optional props from Page.jsx (we still handle edit/delete here)
        departments: departmentsProp,
        loading: loadingProp,
        deptForm: deptFormProp,
        setDeptForm: setDeptFormProp,
        onCreate: onCreateProp,
        onRefresh: onRefreshProp,
    } = props;

    // Are we standalone (no props)? If so, self-fetch.
    const isStandalone = typeof departmentsProp === "undefined";

    const qc = useQueryClient();
    const {userId} = getUserCtx();

    // Standalone state only
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
        queryFn: () => fetcher("org/departments"),
        select: toArray,
    });

    const mCreateDept = useMutation({
        mutationFn: async (payload) =>
            (await http.post("org/departments", {...payload, created_by: Number(userId) || 0})).data,
        onSuccess: (data) => {
            toast.success(`Department "${data.dept_name}" created`);
            qc.invalidateQueries({queryKey: qk.depts});
            setDeptFormLocal((s) => ({...s, dept_name: "", description: ""}));
        },
        onError: (err) => toast.error(errText(err, "Failed to create department")),
    });

    // PUT /org/departments/:id
    const mUpdateDept = useMutation({
        mutationFn: async ({dept_id, payload}) =>
            (
                await http.put(`org/departments/${Number(dept_id)}`, {
                    dept_name: payload.dept_name,
                    description: payload.description,
                    // updated_by: Number(userId) || 0, // add if backend expects
                })
            ).data,
        onSuccess: (data, vars) => {
            toast.success(`Updated “${data?.dept_name || vars?.payload?.dept_name}”`);
            qc.invalidateQueries({queryKey: qk.depts});
        },
        onError: (err) => toast.error(errText(err, "Failed to update department")),
    });

    // DELETE /org/departments/:id
    const [deletingId, setDeletingId] = useState(null);
    const mDeleteDept = useMutation({
        mutationFn: async ({dept_id}) => {
            setDeletingId(Number(dept_id));
            return (await http.delete(`org/departments/${Number(dept_id)}`)).data;
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

    // Wire up sources based on mode
    const departments = isStandalone ? departmentsLocal : departmentsProp;
    const loading = isStandalone ? loadingLocal : !!loadingProp;
    const deptForm = isStandalone ? deptFormLocal : (deptFormProp ?? {dept_name: "", description: ""});
    const setDeptForm = isStandalone ? setDeptFormLocal : (setDeptFormProp ?? (() => {
    }));
    const onCreate = isStandalone ? () => mCreateDept.mutate(deptForm) : (onCreateProp ?? (() => {
    }));
    const onRefresh = isStandalone
        ? () => qc.invalidateQueries({queryKey: qk.depts})
        : (onRefreshProp ?? (() => {
        }));

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Departments</h2>
            <p className="text-muted-foreground mb-6">Create and manage departments.</p>

            <DepartmentSection
                departments={departments}
                loading={loading}
                deptForm={deptForm}
                setDeptForm={setDeptForm}
                onCreate={onCreate}
                onRefresh={onRefresh}
                // edit/delete
                onUpdate={(vars) => mUpdateDept.mutate(vars)}
                updating={mUpdateDept.isPending}
                onDelete={(vars) => mDeleteDept.mutate(vars)}
                deletingId={deletingId}
            />
        </div>
    );
}
