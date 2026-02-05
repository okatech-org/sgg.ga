import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import Profil from "./pages/Profil";
import GAR from "./pages/GAR";
import Nominations from "./pages/Nominations";
import CycleLegislatif from "./pages/CycleLegislatif";
import EGop from "./pages/EGop";
import Institutions from "./pages/Institutions";
import JournalOfficiel from "./pages/JournalOfficiel";
import JournalOfficielApp from "./pages/JournalOfficielApp";
import Documents from "./pages/Documents";
import Rapports from "./pages/Rapports";
import AdminUsers from "./pages/AdminUsers";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Modules from "./pages/Modules";
import ModuleLandingPage from "./pages/ModuleLanding";
import PAG2026 from "./pages/PAG2026";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/about" element={<About />} />
        <Route path="/pag-2026" element={<PAG2026 />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public Module Landing Pages */}
        <Route path="/gar" element={<Navigate to="/module/gar" replace />} />
        <Route path="/nominations" element={<Navigate to="/module/nominations" replace />} />
        <Route path="/cycle-legislatif" element={<Navigate to="/module/cycleLegislatif" replace />} />
        <Route path="/egop" element={<Navigate to="/module/egop" replace />} />
        <Route path="/institutions" element={<Navigate to="/module/institutions" replace />} />
        <Route path="/module/:moduleId" element={<ModuleLandingPage />} />

        <Route path="/journal-officiel" element={<JournalOfficiel />} />

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
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gar"
          element={
            <ProtectedRoute requiredModule="gar">
              <GAR />
            </ProtectedRoute>
          }
        />
        {/* New Protected App Routes */}
        <Route
          path="/gar/app"
          element={
            <ProtectedRoute requiredModule="gar">
              <GAR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nominations/app"
          element={
            <ProtectedRoute requiredModule="nominations">
              <Nominations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cycle-legislatif/app"
          element={
            <ProtectedRoute requiredModule="cycleLegislatif">
              <CycleLegislatif />
            </ProtectedRoute>
          }
        />
        <Route
          path="/egop/app"
          element={
            <ProtectedRoute requiredModule="egop">
              <EGop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions/app"
          element={
            <ProtectedRoute requiredModule="institutions">
              <Institutions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-officiel/app"
          element={
            <ProtectedRoute requiredModule="journalOfficiel">
              <JournalOfficielApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/app"
          element={
            <ProtectedRoute requiredModule="documents">
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rapports/app"
          element={
            <ProtectedRoute requiredModule="rapports">
              <Rapports />
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
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
