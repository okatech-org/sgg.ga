import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import Nominations from "./pages/Nominations";
import CycleLegislatif from "./pages/CycleLegislatif";
import EGop from "./pages/EGop";
import Institutions from "./pages/Institutions";
import JournalOfficiel from "./pages/JournalOfficiel";
import AdminUsers from "./pages/AdminUsers";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Journal Officiel - accessible to all authenticated users */}
            <Route
              path="/journal-officiel"
              element={
                <ProtectedRoute requiredModule="journalOfficiel">
                  <JournalOfficiel />
                </ProtectedRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredModule="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/gar"
              element={
                <ProtectedRoute requiredModule="gar">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nominations"
              element={
                <ProtectedRoute requiredModule="nominations">
                  <Nominations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cycle-legislatif"
              element={
                <ProtectedRoute requiredModule="cycleLegislatif">
                  <CycleLegislatif />
                </ProtectedRoute>
              }
            />
            <Route
              path="/egop"
              element={
                <ProtectedRoute requiredModule="egop">
                  <EGop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institutions"
              element={
                <ProtectedRoute requiredModule="institutions">
                  <Institutions />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={["admin_sgg"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
