// src/App.jsx
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
    HashRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";
import {SidebarProvider} from "@/components/ui/sidebar";
import {ProjectSidebar} from "@/Component/ProjectSidebar.jsx";
import RouteAwareHeader from "@/Utils/RouteAwareHeader.jsx";

import Page from "@/Component/Dashboard/Page.jsx";
import ProjectDashboardPage from "@/Component/ProjectSection/ProjectDashboard/Page.jsx";
import ProjectAdd from "@/Component/ProjectSection/ProjectAdd/Page.jsx";
import ScrumPage from "@/Component/ProjectSection/Scrum/Page.jsx";
import Calendar from "@/Component/Calender/Page.jsx";
import Attendance from "@/Component/Attendance/Page.jsx";
import NotFound from "@/Utils/NotFound.jsx";
import LandingPage from "@/Component/auth/LandingPage";
import Org from "@/Component/Organisation/Dashboard/Page.jsx";
import DepartmentsPage from "@/Component/Organisation/Departments/DepartmentsPage.jsx";
import SubDepartmentsPage from "@/Component/Organisation/SubDepartments/SubDepartmentsPage.jsx";
import DesignationsPage from "@/Component/Organisation/Designations/DesignationsPage.jsx";
import QuickAddPage from "@/Component/Organisation/QuickAdd/QuickAddPage.jsx";
import EmployeeDashboard from "@/Component/Employee Section/Dashboard/Page.jsx";
import AddUserForm from "@/Component/Employee Section/Employee/AddUserForm.jsx";
import TeamPerformance from "@/Component/Reports/TeamPerformance/Page.jsx";

import {useEffect, useMemo, useState} from "react";
import axios from "axios";
import {
    startTokenRefresher,
    stopTokenRefresher,
} from "@/lib/tokenRefresher.js";
import {useActiveProjects} from "@/hooks/useActiveProjects.js";
import {getCurrentRole} from "@/Utils/navigation.js";

const queryClient = new QueryClient();
axios.defaults.withCredentials = true;

/* --------------------- Helpers --------------------- */
const getCookie = (name) => {
    const match = document.cookie.match(
        new RegExp("(^|; )" + encodeURIComponent(name) + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : null;
};

const getSessionUser = () => {
    try {
        return JSON.parse(sessionStorage.getItem("userData") || "null");
    } catch {
        return null;
    }
};

const isAuthedNow = () => {
    const user = getSessionUser();
    const at = getCookie("access_token") || user?.access_token;
    return Boolean(user && at);
};

/* ------------------ Route Guards ------------------- */
function ProtectedRoute({isAuthed, children}) {
    if (!isAuthed) return <Navigate to="/login" replace/>;
    return children;
}

/** Role-based gate using session role */
function RoleGate({allowed = [], children}) {
    const role = getCurrentRole(); // reads from sessionStorage
    // allow all if no allowed array provided
    if (!allowed.length || allowed.includes(role)) return children;
    // Blocked → go to NotFound
    return <Navigate to="/404" replace/>;
}

/* --------- /project → redirect to first active project --------- */
function ProjectIndexRedirect() {
    const nav = useNavigate();
    const {activeProjects, isLoading, isError} = useActiveProjects();

    useEffect(() => {
        if (isLoading || isError) return;
        if (activeProjects?.length) {
            nav(`/project/${activeProjects[0].id}`, {replace: true});
        }
    }, [isLoading, isError, activeProjects, nav]);

    return null;
}

/* --------------------- App ------------------------- */
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(isAuthedNow());

    // Keep Axios Authorization header in sync on first load (page refresh)
    useEffect(() => {
        const at = getCookie("access_token") || getSessionUser()?.access_token;
        if (at) {
            axios.defaults.headers.common.Authorization = `Bearer ${at}`;
        } else {
            delete axios.defaults.headers.common.Authorization;
        }
    }, []);

    // Start/stop the background token refresher when auth state changes
    useEffect(() => {
        if (!isAuthenticated) {
            stopTokenRefresher();
            delete axios.defaults.headers.common.Authorization;
            return;
        }
        const stop = startTokenRefresher({
            intervalMs: 5 * 60 * 1000, // 5 minutes
            runImmediately: true,
        });
        return () => stop();
    }, [isAuthenticated]);

    // Recompute auth state on tab focus/visibility changes
    useEffect(() => {
        const syncAuth = () => setIsAuthenticated(isAuthedNow());
        window.addEventListener("focus", syncAuth);
        document.addEventListener("visibilitychange", syncAuth);
        return () => {
            window.removeEventListener("focus", syncAuth);
            document.removeEventListener("visibilitychange", syncAuth);
        };
    }, []);

    // Authenticated shell layout
    const authedLayout = useMemo(
        () => (
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <ProjectSidebar/>
                    <main className="flex-1 overflow-auto">
                        {/* Dynamic header (project-aware on /project/*) */}
                        <RouteAwareHeader/>

                        {/* Routes */}
                        <Routes>
                            {/* Dashboard: everyone */}
                            <Route
                                path="/"
                                element={
                                    <RoleGate
                                        allowed={[
                                            "SUPER-ADMIN",
                                            "ADMIN",
                                            "MANAGER",
                                            "EMPLOYEE",
                                            "USER",
                                        ]}
                                    >
                                        <Page/>
                                    </RoleGate>
                                }
                            />

                            {/* Project canonical routes (SA/ADMIN/MANAGER/EMPLOYEE) */}
                            <Route
                                path="/project"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]}
                                    >
                                        <ProjectIndexRedirect/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/project/:projectId"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]}
                                    >
                                        <ProjectDashboardPage/>
                                    </RoleGate>
                                }
                            />
                            {/* Optional alias /board */}
                            <Route
                                path="/board"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]}
                                    >
                                        <ProjectIndexRedirect/>
                                    </RoleGate>
                                }
                            />

                            {/* Calendar, Attendance → SA/ADMIN/MANAGER */}
                            <Route
                                path="/calendar"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <Calendar/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/attendance"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <Attendance/>
                                    </RoleGate>
                                }
                            />

                            {/* Project tools */}
                            <Route
                                path="/project/add"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "EMPLOYEE", "MANAGER"]}
                                    >
                                        <ProjectAdd/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/project/scrum"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]}
                                    >
                                        <ScrumPage/>
                                    </RoleGate>
                                }
                            />

                            {/* Organisation → SA/ADMIN/MANAGER */}
                            <Route
                                path="/team"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <Org/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/team/departments"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <DepartmentsPage/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/team/org/sub-departments"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <SubDepartmentsPage/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/team/org/designations"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <DesignationsPage/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/team/org/quick-add"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <QuickAddPage/>
                                    </RoleGate>
                                }
                            />

                            {/* Employees Section */}
                            <Route
                                path="/employees-section/dashboard"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <EmployeeDashboard/>
                                    </RoleGate>
                                }
                            />
                            <Route
                                path="/employees-section/add"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <AddUserForm/>
                                    </RoleGate>
                                }
                            />

                            {/* Reports → SA/ADMIN/MANAGER */}
                            <Route
                                path="/reports"
                                element={
                                    <RoleGate
                                        allowed={["SUPER-ADMIN", "ADMIN", "MANAGER"]}
                                    >
                                        <TeamPerformance/>
                                    </RoleGate>
                                }
                            />

                            {/* Not found */}
                            <Route path="/404" element={<NotFound/>}/>
                            <Route path="*" element={<NotFound/>}/>
                        </Routes>
                    </main>
                </div>
            </SidebarProvider>
        ),
        []
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <HashRouter>
                    <Routes>
                        {/* Public route */}
                        <Route
                            path="/login"
                            element={<LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                        />
                        {/* Protected shell (wrap all app pages) */}
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute isAuthed={isAuthenticated}>
                                    {authedLayout}
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </HashRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
