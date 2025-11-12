import React from "react";
import ComingSoonPage from "@/Utils/ComingSoon.jsx";

const TeamPerformance = () => {
    return (
        <ComingSoonPage
            title="Attendance Module Coming Soon"
            message="We’re working on it. Check back soon."
            menuPath="/dashboard"          // or wherever your main menu/landing is
            menuLabel="Back to Dashboard"
        />
    );
};

export default TeamPerformance;
