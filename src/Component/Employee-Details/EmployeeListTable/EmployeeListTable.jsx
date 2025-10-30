import React, {useEffect, useRef, useState} from "react";
import {CSVLink} from "react-csv";
import {FaSearch, FaDownload} from "react-icons/fa";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import axiosClient from "@/utils/axiosClient.js"; // 👈 use new axios instance

const normalizeUser = (u = {}) => {
    const e = u.employee || {};
    const roles = Array.isArray(u.roles) ? u.roles : [];

    return {
        user_id: u.user_id ?? u.id ?? null,
        employee_id: e.employee_id ?? u.employee_id ?? "",
        full_name: u.full_name ?? e.full_name ?? u.name ?? "",
        email: u.email ?? "",
        role: u.role ?? roles[0] ?? "",
        phone: e.phone ?? "",
        work_position: e.work_position ?? "",
        address: e.address ?? "",
        fathers_name: e.fathers_name ?? "",
        aadhar_no: e.aadhar_no ?? "",
    };
};

const EmployeeListTable = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [sortAsc, setSortAsc] = useState(true);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/auth/users"); // 👈 now auto token handled
            const rawData = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.users)
                    ? res.data.users
                    : Array.isArray(res.data?.data)
                        ? res.data.data
                        : [];

            let list = rawData.map(normalizeUser);

            // Client-side search
            if (search) {
                const term = search.toLowerCase();
                list = list.filter(
                    (emp) =>
                        (emp.employee_id || "").toLowerCase().includes(term) ||
                        (emp.full_name || "").toLowerCase().includes(term)
                );
            }

            // Sort by name
            list.sort((a, b) =>
                sortAsc
                    ? (a.full_name || "").localeCompare(b.full_name || "")
                    : (b.full_name || "").localeCompare(a.full_name || "")
            );

            setEmployees(list);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [search, sortAsc]);

    const toggleSort = () => setSortAsc((s) => !s);

    const csvHeaders = [
        {label: "Employee ID", key: "employee_id"},
        {label: "Full Name", key: "full_name"},
        {label: "Email", key: "email"},
        {label: "Phone", key: "phone"},
        {label: "Role", key: "role"},
        {label: "Work Position", key: "work_position"},
        {label: "Address", key: "address"},
        {label: "Father's Name", key: "fathers_name"},
        {label: "Aadhar No", key: "aadhar_no"},
    ];

    const columns = [
        {header: "Employee ID", accessor: "employee_id"},
        {header: "Full Name", accessor: "full_name"},
        {header: "Email", accessor: "email"},
        {header: "Role", accessor: "role"},
    ];

    return (
        <div className="p-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-xl font-bold">All Employees</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"/>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by ID or name"
                            className="pl-9 pr-3 py-2 border rounded-md focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={toggleSort}
                        className="px-3 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Sort: {sortAsc ? "A→Z" : "Z→A"}
                    </button>
                    <CSVLink
                        data={employees}
                        headers={csvHeaders}
                        filename="employees.csv"
                        className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50"
                    >
                        <FaDownload/>
                        <span>CSV</span>
                    </CSVLink>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"/>
                </div>
            ) : (
                <CommonTable title="" columns={columns} data={employees} footer={null}/>
            )}
        </div>
    );
};

export default EmployeeListTable;
