import React from "react";

export default function ProfileView({profile, onEdit}) {
    const emp = profile?.employee || {};
    return (
        <div className="text-gray-800">
            <div className="profile-content-grid">
                <div className="profile-column">
                    <p><strong>Name:</strong> {profile.full_name}</p>
                    <p><strong>Employee ID:</strong> {emp.employee_id || "-"}</p>
                    <p><strong>Position:</strong> {emp.work_position || "-"}</p>
                    <p>
                        <strong>DOB:</strong> {emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString() : "-"}
                    </p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Address:</strong> {emp.address || "-"}</p>
                </div>
                <div className="profile-divider"/>
                <div className="profile-column">
                    <p><strong>Father's Name:</strong> {emp.fathers_name || "-"}</p>
                    <p><strong>Aadhar No.:</strong> {emp.aadhar_no || "-"}</p>
                    <p><strong>Phone:</strong> {emp.phone || "-"}</p>
                    <p><strong>Role:</strong> {profile.role || "-"}</p>
                </div>
            </div>

            <div className="text-center mt-4">
                <button
                    onClick={onEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
}
