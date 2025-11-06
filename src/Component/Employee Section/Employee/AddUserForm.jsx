// src/components/users/AddUserForm.jsx
import React, {useMemo, useEffect} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {format} from "date-fns";
import {useQuery} from "@tanstack/react-query";
import {toast} from "sonner";
import {Loader2} from "lucide-react";

import {http, getUserCtx} from "@/lib/http.js";
import {useMe} from "@/hooks/useMe.js";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

// ----- MUI DatePicker (Day.js adapter) -----
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

// ---------------- Validation ----------------
const aadharRegex = /^\d{4}-\d{4}-\d{4}$/;
const phoneRegex = /^[0-9]{10}$/;

const schema = z.object({
    email: z.string().email("Enter a valid email"),
    full_name: z.string().min(2, "Full name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    profile_photo: z.any().optional(), // optional; we send null in payload
    employee_id: z.string().min(2, "Employee ID is required"),
    card_id: z.string().min(1, "Card ID is required"),
    phone: z.string().regex(phoneRegex, "Phone must be 10 digits"),
    address: z.string().min(3, "Address is required"),
    fathers_name: z.string().min(2, "Father's name is required"),
    aadhar_no: z.string().regex(aadharRegex, "Format: 1234-5678-9012"),
    date_of_birth: z.date({required_error: "Date of birth is required"}),
    // keep work_position in schema but we will auto-fill it from role
    work_position: z.string().min(2, "Work position is required"),
    role_id: z.string().min(1, "Select role"),
    dept_id: z.string().min(1, "Select department"),
    sub_dept_id: z.string().min(1, "Select sub-department"),
    designation_id: z.string().min(1, "Select designation"),
});

export default function AddUserForm({
                                        endpoint = "/auth/users",
                                        test_server = "", // e.g., https://api.example.com
                                        onSuccess,
                                    }) {
    // --- Auth (from your hook/context) ---
    useMe(true); // ensure token/ctx is ready if your hook gates auth
    const {accessToken} = getUserCtx();
    const canFetch = Boolean(accessToken);

    // --- React Hook Form ---
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            full_name: "",
            password: "",
            profile_photo: undefined,
            employee_id: "",
            card_id: "",
            phone: "",
            address: "",
            fathers_name: "",
            aadhar_no: "",
            date_of_birth: undefined,
            work_position: "", // will be auto-set from selected role name
            role_id: "",
            dept_id: "",
            sub_dept_id: "",
            designation_id: "",
        },
    });

    const watchDeptId = form.watch("dept_id");
    const watchSubDeptId = form.watch("sub_dept_id");
    const watchRoleId = form.watch("role_id");

    // ---------- Data queries ----------
    const rolesQuery = useQuery({
        queryKey: ["auth", "roles"],
        enabled: canFetch,
        queryFn: async () => {
            const res = await http.get(`${test_server}/auth/roles`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return Array.isArray(res.data) ? res.data : res.data?.data || [];
        },
        staleTime: 60_000,
    });

    const deptsQuery = useQuery({
        queryKey: ["org", "departments"],
        enabled: canFetch,
        queryFn: async () => {
            const res = await http.get(`${test_server}/org/departments`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 60_000,
    });

    const subsQuery = useQuery({
        queryKey: ["org", "sub-departments"],
        enabled: canFetch,
        queryFn: async () => {
            const res = await http.get(`${test_server}/org/sub-departments`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 60_000,
    });

    const designationsQuery = useQuery({
        queryKey: ["org", "designations"],
        enabled: canFetch,
        queryFn: async () => {
            const res = await http.get(`${test_server}/org/designations`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 60_000,
    });

    // ---------- Auto-copy role -> work_position ----------
    useEffect(() => {
        const roles = rolesQuery.data || [];
        const selected = roles.find((r) => String(r.role_id) === String(watchRoleId));
        const roleName = selected?.role_name || "";
        // Only set if different to avoid unnecessary re-renders
        if (roleName && form.getValues("work_position") !== roleName) {
            form.setValue("work_position", roleName, {shouldValidate: true});
        }
    }, [watchRoleId, rolesQuery.data, form]);

    // ---------- Derived/Filtered lists ----------
    const subOptions = useMemo(() => {
        const all = subsQuery.data || [];
        const dId = Number(watchDeptId);
        if (!dId) return [];
        return all.filter((s) => Number(s.dept_id) === dId);
    }, [subsQuery.data, watchDeptId]);

    const designationOptions = useMemo(() => {
        const all = designationsQuery.data || [];
        const dId = Number(watchDeptId);
        const sId = Number(watchSubDeptId);
        if (!dId || !sId) return [];
        return all.filter(
            (x) => Number(x.dept_id) === dId && Number(x.sub_dept_id) === sId
        );
    }, [designationsQuery.data, watchDeptId, watchSubDeptId]);

    const loading =
        rolesQuery.isLoading ||
        deptsQuery.isLoading ||
        subsQuery.isLoading ||
        designationsQuery.isLoading;

    // ---------- Submit ----------
    const onSubmit = async (values) => {
        try {
            // Make sure work_position mirrors the current role name at submit time too
            const roles = rolesQuery.data || [];
            const selected = roles.find((r) => String(r.role_id) === String(values.role_id));
            const roleName = selected?.role_name || values.work_position || "";

            const payload = {
                email: values.email,
                full_name: values.full_name,
                password: values.password,
                profile_photo: null,
                employee_id: values.employee_id,
                card_id: values.card_id,
                phone: values.phone,
                address: values.address,
                fathers_name: values.fathers_name,
                aadhar_no: values.aadhar_no,
                date_of_birth: format(values.date_of_birth, "yyyy-MM-dd"),
                work_position: roleName, // <-- auto-copied from Role
                role_id: Number(values.role_id),
                dept_id: Number(values.dept_id),
                sub_dept_id: Number(values.sub_dept_id),
                designation_id: Number(values.designation_id),
            };

            await http.post(`${test_server}${endpoint}`, payload, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            toast.success("User added successfully!");
            form.reset();
            onSuccess?.();
        } catch (err) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add user";
            toast.error(String(msg));
        }
    };

    return (
        <div className=" p-6 shadow-sm">
            <h2 className="mb-1 text-xl font-semibold">Add User</h2>
            <p className="mb-6 text-sm text-muted-foreground">
                Fill all required details to create a new user.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="work.rikc@gmail.com" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Full Name */}
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Rik Chowdhury" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="User@12345" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Employee ID */}
                    <FormField
                        control={form.control}
                        name="employee_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Employee ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="EMP2039" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Card ID */}
                    <FormField
                        control={form.control}
                        name="card_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Card ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="519" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="9876543210" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Aadhar */}
                    <FormField
                        control={form.control}
                        name="aadhar_no"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Aadhar No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="1234-5678-9012" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Father's Name */}
                    <FormField
                        control={form.control}
                        name="fathers_name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Father's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Role (IDs only) — also sets work_position automatically */}
                    <FormField
                        control={form.control}
                        name="role_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loading ? "Loading..." : "Select Role"}/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(rolesQuery.data || []).map((r) => (
                                            <SelectItem key={r.role_id} value={String(r.role_id)}>
                                                {r.role_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Department (IDs only) */}
                    <FormField
                        control={form.control}
                        name="dept_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        form.setValue("sub_dept_id", "");
                                        form.setValue("designation_id", "");
                                    }}
                                    value={field.value}
                                    disabled={loading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loading ? "Loading..." : "Select Department"}/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(deptsQuery.data || []).map((d) => (
                                            <SelectItem key={d.dept_id} value={String(d.dept_id)}>
                                                {d.dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Sub-Department (IDs only, filtered by dept) */}
                    <FormField
                        control={form.control}
                        name="sub_dept_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Sub-Department</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        form.setValue("designation_id", "");
                                    }}
                                    value={field.value}
                                    disabled={loading || !watchDeptId}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    !watchDeptId
                                                        ? "Select Department first"
                                                        : loading
                                                            ? "Loading..."
                                                            : "Select Sub-Department"
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subOptions.map((s) => (
                                            <SelectItem key={s.sub_dept_id} value={String(s.sub_dept_id)}>
                                                {s.sub_dept_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Designation (IDs only, filtered by dept + sub-dept) */}
                    <FormField
                        control={form.control}
                        name="designation_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={loading || !watchDeptId || !watchSubDeptId}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    !watchDeptId
                                                        ? "Select Department first"
                                                        : !watchSubDeptId
                                                            ? "Select Sub-Department first"
                                                            : loading
                                                                ? "Loading..."
                                                                : "Select Designation"
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {designationOptions.map((d) => (
                                            <SelectItem key={d.designation_id} value={String(d.designation_id)}>
                                                {d.designation_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Address (full width) */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({field}) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="221B Baker Street, Kolkata" rows={3} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Date of Birth (MUI DatePicker) */}
                    <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({field}) => (
                            <FormItem className="md:col-span-1">
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            format="YYYY-MM-DD"
                                            disableFuture
                                            value={field.value ? dayjs(field.value) : null}
                                            onChange={(val) => {
                                                const d = val?.toDate?.();
                                                field.onChange(d ?? null);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "medium",
                                                    placeholder: "YYYY-MM-DD",
                                                    error: !!form.formState.errors?.date_of_birth,
                                                    helperText: form.formState.errors?.date_of_birth?.message,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={loading}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Saving...
                                </>
                            ) : (
                                "Add User"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
