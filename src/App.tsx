import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import GAR from "./pages/GAR";
import { ProfilLayout } from "@/components/profil/ProfilLayout";

// Lazy-loaded profil pages
const MonProfil = lazy(() => import("./pages/profil/MonProfil"));
const EditerProfil = lazy(() => import("./pages/profil/EditerProfil"));
const Securite = lazy(() => import("./pages/profil/Securite"));
const NotificationsProfil = lazy(() => import("./pages/profil/Notifications"));
const HistoriqueConnexions = lazy(() => import("./pages/profil/HistoriqueConnexions"));
const ActiviteRecente = lazy(() => import("./pages/profil/ActiviteRecente"));
const MesAcces = lazy(() => import("./pages/profil/MesAcces"));
const Preferences = lazy(() => import("./pages/profil/Preferences"));
const ExportDonnees = lazy(() => import("./pages/profil/ExportDonnees"));
const Aide = lazy(() => import("./pages/profil/Aide"));
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
import MatriceReporting from "./pages/MatriceReporting";
import SaisieReporting from "./pages/SaisieReporting";
import ValidationReporting from "./pages/ValidationReporting";
import ValidationSGPR from "./pages/ValidationSGPR";
import SuiviRemplissage from "./pages/SuiviRemplissage";
import ExportsReporting from "./pages/ExportsReporting";
import PTMMatrice from "./pages/PTMMatrice";
import PTMSaisie from "./pages/PTMSaisie";
import PTMConsolidation from "./pages/PTMConsolidation";
import PTMValidation from "./pages/PTMValidation";
import PTMSuivi from "./pages/PTMSuivi";
import PTMCoherence from "./pages/PTMCoherence";
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
        <Route path="/ptm" element={<Navigate to="/module/ptmptg" replace />} />
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
        {/* Espace Utilisateur (Mon Compte) */}
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-government-navy" /></div>}>
                <ProfilLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<MonProfil />} />
          <Route path="editer" element={<EditerProfil />} />
          <Route path="securite" element={<Securite />} />
          <Route path="notifications" element={<NotificationsProfil />} />
          <Route path="historique" element={<HistoriqueConnexions />} />
          <Route path="activite" element={<ActiviteRecente />} />
          <Route path="acces" element={<MesAcces />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="export" element={<ExportDonnees />} />
          <Route path="aide" element={<Aide />} />
        </Route>
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

        {/* Matrice Reporting routes */}
        <Route
          path="/matrice-reporting"
          element={
            <ProtectedRoute requiredModule="matriceReporting">
              <MatriceReporting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrice-reporting/saisie"
          element={
            <ProtectedRoute requiredModule="matriceReporting">
              <SaisieReporting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrice-reporting/validation"
          element={
            <ProtectedRoute requiredModule="matriceReporting">
              <ValidationReporting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrice-reporting/validation-sgpr"
          element={
            <ProtectedRoute requiredModule="matriceReporting">
              <ValidationSGPR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrice-reporting/suivi"
          element={
            <ProtectedRoute requiredModule="matriceReporting">
              <SuiviRemplissage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrice-reporting/exports"
          element={
            <ProtectedRoute requiredModule="matriceReporting">
              <ExportsReporting />
            </ProtectedRoute>
          }
        />

        {/* PTM/PTG routes */}
        <Route
          path="/ptm/matrice"
          element={
            <ProtectedRoute requiredModule="ptmptg">
              <PTMMatrice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ptm/saisie"
          element={
            <ProtectedRoute requiredModule="ptmptg">
              <PTMSaisie />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ptm/consolidation"
          element={
            <ProtectedRoute requiredModule="ptmptg">
              <PTMConsolidation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ptm/validation"
          element={
            <ProtectedRoute requiredModule="ptmptg">
              <PTMValidation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ptm/suivi"
          element={
            <ProtectedRoute requiredModule="ptmptg">
              <PTMSuivi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ptm/coherence"
          element={
            <ProtectedRoute requiredModule="ptmptg">
              <PTMCoherence />
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
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
