// src/App.jsx
import React, {useState, useEffect, useRef} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

import "./App.css";
import NavBar from "./Component/NavBar/NavBar";
import LandingPage from "./Component/LandingPage/LandingPage";
import Error404 from "./Component/Utils/error";
import Menu from "./Component/Menu/Menu";
import SubMenu from "./Component/Menu/SubMenu.jsx";
import EmployeeProfile from "./Component/Employee-Details/EmployeeProfile/EmployeeProfile";
import AddEmployeeForm from "./Component/Employee-Details/AddEmployeeForm/AddEmployeeForm";
import WorkEntryTable from "./Component/Workday/Work-Entry/Page.jsx";
import IndividualWorkEntryTable from "./Component/Workday/Work-Entry/Page.jsx";
import EmployeeListTable from "./Component/Employee-Details/EmployeeListTable/EmployeeListTable";
import ManualAttendanceTable from "./Component/Attendance/ManualAttendanceTable/ManualAttendanceTable";
import MassAttendancePage from "./Component/Attendance/MassEntry/Page.jsx";
import ActiveProject from "./Component/Project/ActiveProjectList/Page.jsx";
import ArchivedProject from "./Component/Project/ArchivedProjectList/Page.jsx";
import ComingSoon from "@/Component/Utils/ComingSoon.jsx";
import ResetPasswordForm from "@/Component/Employee-Details/Reset-Password/Page.jsx";
import Footer from "@/Component/Footer/Footer.jsx";
import {ToastContainer} from "react-toastify";

import axios from "axios";
import {startTokenRefresher} from "@/utils/tokenRefresher";
import {API_URL as RAW_API_URL} from "@/config.js";

// Normalize API base once (trims and removes trailing slash)
const API_BASE_URL = String(RAW_API_URL || "").trim().replace(/\/+$/, "");

function AppRoutes({isAuthenticated, setIsAuthenticated}) {
    const location = useLocation();

    return (
        <>
            {isAuthenticated && <NavBar setIsAuthenticated={setIsAuthenticated}/>}

            <Routes location={location}>
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/menu" replace/>
                        ) : (
                            <LandingPage setIsAuthenticated={setIsAuthenticated}/>
                        )
                    }
                />
                <Route
                    path="/signin"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/menu" replace/>
                        ) : (
                            <LandingPage setIsAuthenticated={setIsAuthenticated}/>
                        )
                    }
                />

                {/* Menu */}
                <Route
                    path="/menu"
                    element={
                        isAuthenticated ? <Menu/> : <Navigate to="/signin" replace/>
                    }
                />
                <Route
                    path="/menu/:menuKey"
                    element={
                        isAuthenticated ? <SubMenu/> : <Navigate to="/signin" replace/>
                    }
                />

                {/* Employee */}
                <Route
                    path="/add-employee"
                    element={
                        isAuthenticated ? (
                            <AddEmployeeForm/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />
                <Route
                    path="/employees/profile"
                    element={
                        isAuthenticated ? (
                            <EmployeeProfile/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />
                <Route
                    path="/employees/all"
                    element={
                        isAuthenticated ? (
                            <EmployeeListTable/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />
                <Route
                    path="/employees/reset-password"
                    element={
                        isAuthenticated ? (
                            <ResetPasswordForm/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />

                {/* Work Day Entries */}
                <Route
                    path="/work-entries-employee"
                    element={
                        isAuthenticated ? (
                            <WorkEntryTable/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />
                <Route
                    path="/work-entry"
                    element={
                        isAuthenticated ? (
                            <IndividualWorkEntryTable/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />

                {/* Attendance */}
                <Route
                    path="/attendance"
                    element={
                        isAuthenticated ? (
                            <ManualAttendanceTable/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />
                <Route
                    path="/attendance/mass-entry"
                    element={
                        isAuthenticated ? (
                            <MassAttendancePage/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />

                {/* Projects */}
                <Route
                    path="/projects/active"
                    element={
                        isAuthenticated ? (
                            <ActiveProject/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />
                <Route
                    path="/projects/achived"
                    element={
                        isAuthenticated ? (
                            <ArchivedProject/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />

                {/* Development / Coming Soon */}
                <Route
                    path="/dev"
                    element={
                        isAuthenticated ? (
                            <ComingSoon/>
                        ) : (
                            <Navigate to="/signin" replace/>
                        )
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Error404/>}/>
            </Routes>

            {/* Persistent footer */}
            {/*<Footer/>*/}
        </>
    );
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => JSON.parse(localStorage.getItem("isAuthenticated")) || false
    );

    // Keep axios Authorization in sync on load (useful when refreshing page)
    useEffect(() => {
        try {
            const raw =
                sessionStorage.getItem("userData") || localStorage.getItem("userData");
            if (raw) {
                const {access_token} = JSON.parse(raw) || {};
                if (access_token) {
                    axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
                }
            }
        } catch (e) {
            console.warn("Failed to set initial Authorization header:", e);
        }
    }, []);

    // Persist auth flag
    useEffect(() => {
        localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    // ⬇️ Start/stop background token refresher (every 10 min) based on auth state
    const stopRefresherRef = useRef(null);
    useEffect(() => {
        // stop any previous refresher
        if (stopRefresherRef.current) {
            stopRefresherRef.current();
            stopRefresherRef.current = null;
        }

        if (isAuthenticated) {
            // runs once immediately, then every 10 minutes in background
            stopRefresherRef.current = startTokenRefresher(API_BASE_URL);
        }

        // on unmount, always cleanup
        return () => {
            if (stopRefresherRef.current) {
                stopRefresherRef.current();
                stopRefresherRef.current = null;
            }
        };
    }, [isAuthenticated]);

    return (
        <>
            <Router>
                <AppRoutes
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                />
            </Router>
            <ToastContainer position="top-right" autoClose={3000}/>
        </>
    );
}
