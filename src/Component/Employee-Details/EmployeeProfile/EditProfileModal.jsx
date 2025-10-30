import React, {useEffect, useState, useRef} from "react";
import {toast} from "react-toastify";

/**
 * Modal for editing profile:
 * - Editable: full_name, photo (via /auth/users/:id & /auth/me/photo)
 * - Employee fields are shown read-only until you add a new backend route
 */
export default function EditProfileModal({
                                             isOpen,
                                             onClose,
                                             profile,
                                             onSaveCore,   // async ({ full_name }) => void
                                             onSavePhoto,  // async (dataUrlOrBase64) => void
                                         }) {
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [previewDataUrl, setPreviewDataUrl] = useState(
        profile?.profile_photo ? `data:image/jpeg;base64,${profile.profile_photo}` : ""
    );
    const [photoBase64, setPhotoBase64] = useState(null);
    const dialogRef = useRef(null);

    const emp = profile?.employee || {};

    useEffect(() => {
        if (isOpen) {
            setFullName(profile?.full_name || "");
            setPreviewDataUrl(
                profile?.profile_photo ? `data:image/jpeg;base64,${profile.profile_photo}` : ""
            );
            setPhotoBase64(null);
        }
    }, [isOpen, profile]);

    // Close on ESC
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const onBackdropClick = (e) => {
        if (e.target === dialogRef.current) onClose();
    };

    const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = String(reader.result || "");
            setPreviewDataUrl(dataUrl);
            const pure = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
            setPhotoBase64(pure);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1) core (name)
            if (fullName && fullName !== profile.full_name) {
                await onSaveCore({full_name: fullName.trim()});
            }
            // 2) photo
            if (photoBase64) {
                await onSavePhoto(`data:image/jpeg;base64,${photoBase64}`);
            }
            toast.success("Profile updated");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.detail || "Update failed");
        }
    };

    return (
        <div
            ref={dialogRef}
            onMouseDown={onBackdropClick}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
            aria-modal="true"
            role="dialog"
        >
            <div
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 animate-fade-in"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-700">Edit Profile</h3>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    {/* Full name (editable) */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mt-1 text-sm border-gray-300"
                            required
                        />
                    </div>

                    {/* Read-only employee fields */}
                    {[
                        ["employee_id", emp.employee_id],
                        ["work_position", emp.work_position],
                        ["date_of_birth", emp.date_of_birth],
                        ["address", emp.address],
                        ["fathers_name", emp.fathers_name],
                        ["aadhar_no", emp.aadhar_no],
                        ["phone", emp.phone],
                    ].map(([label, val]) => (
                        <div key={label}>
                            <label className="block text-sm font-medium text-gray-700">
                                {label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </label>
                            <input
                                type="text"
                                value={val || ""}
                                readOnly
                                className="w-full px-3 py-2 border rounded-md mt-1 text-sm bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    ))}

                    {/* Role display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <input
                            type="text"
                            value={profile.role || ""}
                            readOnly
                            className="w-full px-3 py-2 border rounded-md mt-1 text-sm bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    {/* Photo */}
                    <div className="col-span-2">
                        <label className="block mb-1 font-medium text-gray-600">Update Profile Photo</label>
                        {previewDataUrl ? (
                            <div className="flex items-center gap-4 mb-2">
                                <img
                                    src={previewDataUrl}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-full object-cover border"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewDataUrl("");
                                        setPhotoBase64(null);
                                    }}
                                    className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : null}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Save
                        </button>
                    </div>

                    <p className="col-span-2 text-xs text-gray-500 mt-1">
                        Note: With the current backend routes, only <b>Full Name</b> & <b>Photo</b> can be updated.
                        To allow editing phone/address/Aadhar/position/DOB, add an API like <code>PATCH
                        /auth/employee/me</code>.
                    </p>
                </form>
            </div>
        </div>
    );
}
