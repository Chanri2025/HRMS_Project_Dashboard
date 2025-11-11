import React from "react";
import ComingSoonPage from "@/Utils/ComingSoon.jsx";

const TeamPerformance = () => {
    return (
        <ComingSoonPage
            title="Team Performance Reports Coming Soon"
            message="We’re building performance insights for your teams. Check back soon."
            menuPath="/dashboard"          // or wherever your main menu/landing is
            menuLabel="Back to Dashboard"
        />
    );
};

export default TeamPerformance;
