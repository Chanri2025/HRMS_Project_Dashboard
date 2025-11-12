// src/routes/RoleGuard.jsx
import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import {getCurrentRole} from "@/Utils/navigation.js";

export default function RoleGuard({allowed = [], children, fallback = "/404"}) {
    const role = getCurrentRole();
    const location = useLocation();

    if (allowed.length && !allowed.includes(role)) {
        return <Navigate to={fallback} replace state={{from: location}}/>;
    }
    return children;
}
