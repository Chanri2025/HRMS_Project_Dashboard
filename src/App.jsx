import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectSidebar } from "@/components/ProjectSidebar";

import Index from "@/pages/Index";
import Board from "@/pages/Board";
import Calendar from "@/pages/Calendar";
import Attendance from "@/pages/Attendance";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import { useEffect, useMemo, useState } from "react";

const queryClient = new QueryClient();

// Simple helpers
const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
};

function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUserData());

  // Keep auth state in sync if userData changes in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userData") setIsAuthenticated(!!getUserData());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Layout shown only when authenticated
  const authedLayout = useMemo(
    () => (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <ProjectSidebar />
          <main className="flex-1 overflow-auto">
            <div className="border-b bg-card">
              <div className="flex h-14 items-center px-4">
                <SidebarTrigger />
              </div>
            </div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/board" element={<Board />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/attendance" element={<Attendance />} />
              {/* keep custom routes above the catch-all */}
              <Route path="*" element={<NotFound />} />
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route
              path="/login"
              element={<LandingPage setIsAuthenticated={setIsAuthenticated} />}
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
