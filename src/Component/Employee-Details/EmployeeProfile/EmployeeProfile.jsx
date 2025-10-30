import React, {useState, useEffect} from "react";
import {useProfile} from "./useProfile";
import ProfileView from "./ProfileView.jsx";
import EditProfileModal from "./EditProfileModal";

export default function EmployeeProfile() {
    const {profile, loading, updateCore, updatePhoto} = useProfile();
    const [flip, setFlip] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 200);
        return () => clearTimeout(t);
    }, []);

    if (loading || !profile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"/>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent px-4">
            <div
                className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4 border border-gray-200 animate-fade-in overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Profile</h2>

                {profile.profile_photo && (
                    <div className="flex justify-center mb-4">
                        <div
                            className={`flip360-container ${loaded ? "loaded" : ""} ${flip ? "flip" : ""}`}
                            onClick={() => setFlip(!flip)}
                        >
                            <img
                                src={`data:image/jpeg;base64,${profile.profile_photo}`}
                                alt="Profile"
                                className="w-28 h-28 rounded-full border-2 border-blue-500 shadow-md object-cover"
                            />
                        </div>
                    </div>
                )}

                <ProfileView profile={profile} onEdit={() => setModalOpen(true)}/>
            </div>

            <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                profile={profile}
                onSaveCore={updateCore}
                onSavePhoto={updatePhoto}
            />
        </div>
    );
}
