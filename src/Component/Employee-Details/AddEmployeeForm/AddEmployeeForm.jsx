import React, {useState, useEffect, useMemo} from "react";
import {toast} from "react-toastify";
import {format} from "date-fns";
import axios from "axios";

import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {API_URL as RAW_API_URL} from "@/config.js";
import {getAccessToken, makeAuthHeaders} from "@/utils/authToken.js";

const API_URL = String(RAW_API_URL || "").replace(/\/+$/, "") + "/";

const WORK_POSITIONS = [
    "Director",
    "Manager",
    "Developer",
    "Designer",
    // …etc
];

const ROLES = ["EMPLOYEE", "MANAGER", "ADMIN", "SUPER-ADMIN"];

// Helper to generate a random 8-character password
function generateRandomPassword(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pw = "";
    for (let i = 0; i < length; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    return pw;
}

// Small helpers for UI formatting
const formatAadhar = (v) =>
    v
        .replace(/\D/g, "")
        .slice(0, 12)
        .replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join("-"));

const formatPhone = (v) => v.replace(/[^\d+()-\s]/g, "").slice(0, 20);

export default function AddEmployeeForm() {
    const [form, setForm] = useState({
        employee_id: "",
        full_name: "",
        email: "",
        phone: "",
        address: "",
        fathers_name: "",
        aadhar_no: "",
        date_of_birth: "",
        work_position: "",
        role: "",
        password: "",
    });

    // "auto" or "custom"
    const [passwordOption, setPasswordOption] = useState("auto");
    const [customPassword, setCustomPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Token indicator for UI
    const accessToken = useMemo(() => getAccessToken(), []);
    const hasToken = Boolean(accessToken);

    // Whenever we switch to "auto", generate a fresh password
    useEffect(() => {
        if (passwordOption === "auto") {
            setForm((f) => ({...f, password: generateRandomPassword()}));
        }
    }, [passwordOption]);

    // Generic setter for text inputs
    const handleChange = (field) => (e) => {
        let val = e.target.value;
        if (field === "aadhar_no") val = formatAadhar(val);
        if (field === "phone") val = formatPhone(val);
        setForm((f) => ({...f, [field]: val}));
    };

    // DatePicker callback -> YYYY-MM-DD
    const handleDateChange = (newDate) => {
        const iso = newDate ? format(new Date(newDate), "yyyy-MM-dd") : "";
        setForm((f) => ({...f, date_of_birth: iso}));
    };

    // CustomSelect callbacks
    const handlePositionChange = (pos) => setForm((f) => ({...f, work_position: pos}));
    const handleRoleChange = (rl) => setForm((f) => ({...f, role: rl}));

    const copyPassword = async () => {
        try {
            const pw = passwordOption === "auto" ? form.password : customPassword.trim();
            await navigator.clipboard.writeText(pw || "");
            toast.info("Password copied");
        } catch {
            toast.warn("Could not copy password");
        }
    };

    // simple front-end validation
    const validate = () => {
        const req = [
            "employee_id",
            "full_name",
            "email",
            "phone",
            "address",
            "fathers_name",
            "aadhar_no",
            "date_of_birth",
            "work_position",
            "role",
        ];
        const errs = {};
        for (const k of req) if (!form[k]) errs[k] = "Required";

        // super-light checks
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
        const aadharDigits = form.aadhar_no.replace(/\D/g, "");
        if (aadharDigits && aadharDigits.length !== 12) errs.aadhar_no = "Aadhar must be 12 digits";
        if (form.phone && form.phone.replace(/\D/g, "").length < 10) errs.phone = "Phone seems too short";

        if (passwordOption === "custom") {
            const p = customPassword.trim();
            if (!p) errs.password = "Please enter a custom password";
            else if (p.length < 6) errs.password = "Min 6 characters";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        // Choose final password
        const password = passwordOption === "auto" ? form.password : customPassword.trim();

        if (!validate()) {
            toast.error("Please fix the highlighted fields");
            return;
        }
        if (!hasToken) {
            toast.error("You are not logged in or token is missing");
            return;
        }

        setSubmitting(true);
        try {
            const url = `${API_URL}auth/users`;
            await axios.post(
                url,
                {...form, password},
                {headers: makeAuthHeaders()} // injects Authorization: Bearer <token> if found
            );

            toast.success("Employee created successfully");

            // Reset form
            setForm({
                employee_id: "",
                full_name: "",
                email: "",
                phone: "",
                address: "",
                fathers_name: "",
                aadhar_no: "",
                date_of_birth: "",
                work_position: "",
                role: "",
                password: "",
            });
            setCustomPassword("");
            setPasswordOption("auto");
            setErrors({});
        } catch (err) {
            console.error(err);
            const apiMsg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create employee";
            toast.error(apiMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const currentPassword = passwordOption === "auto" ? form.password : customPassword;

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-md max-w-5xl mx-auto border border-gray-100"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold">Add New Employee</h2>
                    <p className="text-sm text-gray-500">
                        Create a user + employee in one go. All fields marked <span
                        className="text-red-500">*</span> are required.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Token badge */}
                    {hasToken ? (
                        <span
                            className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Token detected
            </span>
                    ) : (
                        <span
                            className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              No token
            </span>
                    )}

                    {/* Copy password */}
                    {currentPassword ? (
                        <button
                            type="button"
                            onClick={copyPassword}
                            className="text-xs px-3 py-1 rounded border hover:bg-gray-50"
                            title="Copy password"
                        >
                            Copy Password
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Employee ID */}
                <div>
                    <label className="block font-medium mb-1">
                        Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.employee_id}
                        onChange={handleChange("employee_id")}
                        className={`w-full border px-3 py-2 rounded ${errors.employee_id ? "border-red-400" : "border-gray-300"}`}
                        placeholder="e.g., EMP-2025-0001"
                    />
                    {errors.employee_id && <p className="text-xs text-red-600 mt-1">{errors.employee_id}</p>}
                </div>

                {/* Password Choice */}
                <div>
                    <label className="block font-medium mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="pwOpt"
                                value="auto"
                                checked={passwordOption === "auto"}
                                onChange={() => setPasswordOption("auto")}
                                className="mr-2"
                            />
                            Auto-generate
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="pwOpt"
                                value="custom"
                                checked={passwordOption === "custom"}
                                onChange={() => setPasswordOption("custom")}
                                className="mr-2"
                            />
                            Custom
                        </label>
                    </div>
                    {passwordOption === "auto" ? (
                        <input
                            type="text"
                            value={form.password}
                            readOnly
                            className="w-full border px-3 py-2 rounded bg-gray-100 border-gray-300"
                        />
                    ) : (
                        <>
                            <input
                                type="text"
                                value={customPassword}
                                onChange={(e) => setCustomPassword(e.target.value)}
                                placeholder="Enter password"
                                className={`w-full border px-3 py-2 rounded ${errors.password ? "border-red-400" : "border-gray-300"}`}
                            />
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        </>
                    )}
                </div>

                {/* Full Name */}
                <div>
                    <label className="block font-medium mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.full_name}
                        onChange={handleChange("full_name")}
                        className={`w-full border px-3 py-2 rounded ${errors.full_name ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block font-medium mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        className={`w-full border px-3 py-2 rounded ${errors.email ? "border-red-400" : "border-gray-300"}`}
                        placeholder="jane.doe@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block font-medium mb-1">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        className={`w-full border px-3 py-2 rounded ${errors.phone ? "border-red-400" : "border-gray-300"}`}
                        placeholder="+91-9876543210"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                    <label className="block font-medium mb-1">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.address}
                        onChange={handleChange("address")}
                        className={`w-full border px-3 py-2 rounded ${errors.address ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>

                {/* Father’s Name */}
                <div>
                    <label className="block font-medium mb-1">
                        Father’s Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.fathers_name}
                        onChange={handleChange("fathers_name")}
                        className={`w-full border px-3 py-2 rounded ${errors.fathers_name ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.fathers_name && <p className="text-xs text-red-600 mt-1">{errors.fathers_name}</p>}
                </div>

                {/* Aadhar No */}
                <div>
                    <label className="block font-medium mb-1">
                        Aadhar No <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.aadhar_no}
                        onChange={handleChange("aadhar_no")}
                        className={`w-full border px-3 py-2 rounded ${errors.aadhar_no ? "border-red-400" : "border-gray-300"}`}
                        placeholder="XXXX-XXXX-XXXX"
                    />
                    {errors.aadhar_no && <p className="text-xs text-red-600 mt-1">{errors.aadhar_no}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block font-medium mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <BasicDatePicker label="YYYY-MM-DD" value={form.date_of_birth} onChange={handleDateChange}/>
                    {errors.date_of_birth && <p className="text-xs text-red-600 mt-1">{errors.date_of_birth}</p>}
                </div>

                {/* Work Position */}
                <div>
                    <label className="block font-medium mb-1">
                        Work Position <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                        options={WORK_POSITIONS}
                        value={form.work_position}
                        onChange={handlePositionChange}
                        placeholder="Select Position"
                        className="w-full"
                    />
                    {errors.work_position && <p className="text-xs text-red-600 mt-1">{errors.work_position}</p>}
                </div>

                {/* Role */}
                <div>
                    <label className="block font-medium mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                        options={ROLES}
                        value={form.role}
                        onChange={handleRoleChange}
                        placeholder="Select Role"
                        className="w-full"
                    />
                    {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={submitting || !hasToken}
                className={`mt-6 w-full text-white py-3 rounded transition ${
                    submitting || !hasToken ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={!hasToken ? "Login required" : "Add Employee"}
            >
                {submitting ? "Adding..." : !hasToken ? "Login required — cannot submit" : "Add Employee"}
            </button>

            {!hasToken && (
                <p className="text-xs text-gray-500 mt-2">
                    Tip: If your access token is stored as an <code>HttpOnly</code> cookie, the browser can’t read it in
                    JS.
                    In that case, keep an axios interceptor on the backend proxy or use a refresh flow that issues a
                    readable
                    short-lived access token in a non-HttpOnly cookie specifically for frontend calls.
                </p>
            )}
        </form>
    );
}
