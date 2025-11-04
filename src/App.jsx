import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {ProjectSidebar} from "@/Utils/ProjectSidebar.jsx";
import HeaderBar from "@/Utils/HeaderBar.jsx";

import Index from "@/pages/Index";
import Board from "@/pages/Board";
import Calendar from "@/pages/Calendar";
import Attendance from "@/pages/Attendance";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/Component/auth/LandingPage";
import Org from "@/Component/Organisation/Page";
import DepartmentsPage from "@/Component/Organisation/DepartmentsPage";
import SubDepartmentsPage from "@/Component/Organisation/SubDepartmentsPage.jsx";
import DesignationsPage from "@/Component/Organisation/DesignationsPage.jsx";
import QuickAddPage from "@/Component/Organisation/QuickAddPage.jsx";

import AppBreadcrumbs from "@/Utils/AppBreadcrumbs.jsx";
import {useEffect, useMemo, useState} from "react";
import axios from "axios";
import {
    startTokenRefresher,
    stopTokenRefresher,
} from "@/lib/tokenRefresher.js";

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

/* ------------------ Route Guard -------------------- */
function ProtectedRoute({isAuthed, children}) {
    if (!isAuthed) return <Navigate to="/login" replace/>;
    return children;
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

    // Recompute auth state on tab focus/visibility changes (since sessionStorage has no cross-tab events)
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
                        {/* Header */}
                        <div className="border-b bg-card">
                            <div className="flex items-center justify-between px-4 h-14">
                                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                                    <SidebarTrigger/>
                                    <AppBreadcrumbs/>
                                </div>
                                <HeaderBar setIsAuthenticated={setIsAuthenticated}/>
                            </div>
                        </div>


                        {/* Routes */}
                        <Routes>
                            <Route path="/" element={<Index/>}/>
                            <Route path="/board" element={<Board/>}/>
                            <Route path="/calendar" element={<Calendar/>}/>
                            <Route path="/attendance" element={<Attendance/>}/>

                            <Route path="/team" element={<Org/>}/>
                            <Route path="/team/departments" element={<DepartmentsPage/>} />
                            <Route path="/team/org/sub-departments" element={<SubDepartmentsPage/>}/>
                            <Route path="/team/org/designations" element={<DesignationsPage/>}/>
                            <Route path="/team/org/quick-add" element={<QuickAddPage/>}/>

                            <Route path="*" element={<NotFound/>}/>
                        </Routes>
                    </main>
                </div>
            </SidebarProvider>
        ),
        [setIsAuthenticated]
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <BrowserRouter>
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
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
