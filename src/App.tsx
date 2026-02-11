import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/i18n";
import { SkipLinks, useAccessibilityShortcuts } from "@/components/a11y/Accessibility";
import { lazy, Suspense } from "react";

// ── Eagerly loaded (entry points) ─────────────────────────────────────────────
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";

// ── Loading spinner for Suspense ──────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-government-navy" />
  </div>
);

// ── Lazy-loaded pages (code splitting) ────────────────────────────────────────
const Dashboard = lazy(() => import("./pages/Dashboard"));
const GAR = lazy(() => import("./pages/GAR"));
const Nominations = lazy(() => import("./pages/Nominations"));
const CycleLegislatif = lazy(() => import("./pages/CycleLegislatif"));
const EGop = lazy(() => import("./pages/EGop"));
const Institutions = lazy(() => import("./pages/Institutions"));
const JournalOfficiel = lazy(() => import("./pages/JournalOfficiel"));
const JournalOfficielApp = lazy(() => import("./pages/JournalOfficielApp"));
const Documents = lazy(() => import("./pages/Documents"));
const Rapports = lazy(() => import("./pages/Rapports"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Modules = lazy(() => import("./pages/Modules"));
const ModuleLandingPage = lazy(() => import("./pages/ModuleLanding"));
const PAG2026 = lazy(() => import("./pages/PAG2026"));
const MatriceReporting = lazy(() => import("./pages/MatriceReporting"));
const SaisieReporting = lazy(() => import("./pages/SaisieReporting"));
const ValidationReporting = lazy(() => import("./pages/ValidationReporting"));
const ValidationSGPR = lazy(() => import("./pages/ValidationSGPR"));
const SuiviRemplissage = lazy(() => import("./pages/SuiviRemplissage"));
const ExportsReporting = lazy(() => import("./pages/ExportsReporting"));
const PTMMatrice = lazy(() => import("./pages/PTMMatrice"));
const PTMSaisie = lazy(() => import("./pages/PTMSaisie"));
const PTMConsolidation = lazy(() => import("./pages/PTMConsolidation"));
const PTMValidation = lazy(() => import("./pages/PTMValidation"));
const PTMSuivi = lazy(() => import("./pages/PTMSuivi"));
const PTMCoherence = lazy(() => import("./pages/PTMCoherence"));
const Formation = lazy(() => import("./pages/Formation"));
const Parametres = lazy(() => import("./pages/Parametres"));
const DashboardSGPR = lazy(() => import("./pages/DashboardSGPR"));
const MonitoringDashboard = lazy(() => import("./pages/MonitoringDashboard"));
const AdminPermissions = lazy(() => import("./pages/AdminPermissions"));
const WorkflowPage = lazy(() => import("./pages/WorkflowPage"));
const DataExchangePage = lazy(() => import("./pages/DataExchangePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const SystemStatsPage = lazy(() => import("./pages/SystemStatsPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const ConsolidatedDashboard = lazy(() => import("./pages/ConsolidatedDashboard"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const AdminAdvancedPage = lazy(() => import("./pages/AdminAdvancedPage"));
const BenchmarkPage = lazy(() => import("./pages/BenchmarkPage"));
const AutoReportsPage = lazy(() => import("./pages/AutoReportsPage"));
const LiveActivityPage = lazy(() => import("./pages/LiveActivityPage"));
const KanbanPage = lazy(() => import("./pages/KanbanPage"));
const ArchivesPage = lazy(() => import("./pages/ArchivesPage"));
const ApiDocsPage = lazy(() => import("./pages/ApiDocsPage"));
const OrgChartPage = lazy(() => import("./pages/OrgChartPage"));
const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const ChangelogPage = lazy(() => import("./pages/ChangelogPage"));
const GeoMapPage = lazy(() => import("./pages/GeoMapPage"));
const SurveysPage = lazy(() => import("./pages/SurveysPage"));
const PersonalDashboardPage = lazy(() => import("./pages/PersonalDashboardPage"));
const KPIBuilderPage = lazy(() => import("./pages/KPIBuilderPage"));
const DocManagerPage = lazy(() => import("./pages/DocManagerPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const OKRPage = lazy(() => import("./pages/OKRPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const MinistryDashPage = lazy(() => import("./pages/MinistryDashPage"));
const WorkflowBuilderPage = lazy(() => import("./pages/WorkflowBuilderPage"));
const InstitutionDirectoryPage = lazy(() => import("./pages/InstitutionDirectoryPage"));
const ExecutiveSummaryPage = lazy(() => import("./pages/ExecutiveSummaryPage"));
const RiskRegisterPage = lazy(() => import("./pages/RiskRegisterPage"));
const ProvinceDashPage = lazy(() => import("./pages/ProvinceDashPage"));
const ReportCenterPage = lazy(() => import("./pages/ReportCenterPage"));
const StrategicPlanningPage = lazy(() => import("./pages/StrategicPlanningPage"));
const BalancedScorecardPage = lazy(() => import("./pages/BalancedScorecardPage"));
const DecisionLogPage = lazy(() => import("./pages/DecisionLogPage"));
const TrainingCenterPage = lazy(() => import("./pages/TrainingCenterPage"));
const CitizenPortalPage = lazy(() => import("./pages/CitizenPortalPage"));
const LiveDashboardPage = lazy(() => import("./pages/LiveDashboardPage"));
const AlertCenterPage = lazy(() => import("./pages/AlertCenterPage"));
const SkillsMatrixPage = lazy(() => import("./pages/SkillsMatrixPage"));
const SLADashboardPage = lazy(() => import("./pages/SLADashboardPage"));
const ComplianceAuditPage = lazy(() => import("./pages/ComplianceAuditPage"));
const SDGDashboardPage = lazy(() => import("./pages/SDGDashboardPage"));
const MeetingManagerPage = lazy(() => import("./pages/MeetingManagerPage"));
const BudgetDashboardPage = lazy(() => import("./pages/BudgetDashboardPage"));
const GrievanceCenterPage = lazy(() => import("./pages/GrievanceCenterPage"));
const WorkforceDashboardPage = lazy(() => import("./pages/WorkforceDashboardPage"));
const EnergyDashboardPage = lazy(() => import("./pages/EnergyDashboardPage"));
const ProcurementPage = lazy(() => import("./pages/ProcurementPage"));
const StrategicWatchPage = lazy(() => import("./pages/StrategicWatchPage"));
const PublicHealthPage = lazy(() => import("./pages/PublicHealthPage"));
const LandRegistryPage = lazy(() => import("./pages/LandRegistryPage"));
const InternationalCoopPage = lazy(() => import("./pages/InternationalCoopPage"));
const EducationDashboardPage = lazy(() => import("./pages/EducationDashboardPage"));
const NGORegistryPage = lazy(() => import("./pages/NGORegistryPage"));
const GovCommunicationPage = lazy(() => import("./pages/GovCommunicationPage"));
const TransportDashboardPage = lazy(() => import("./pages/TransportDashboardPage"));
const ElectoralRegistryPage = lazy(() => import("./pages/ElectoralRegistryPage"));
const RiskManagementPage = lazy(() => import("./pages/RiskManagementPage"));
const AgricultureDashboardPage = lazy(() => import("./pages/AgricultureDashboardPage"));
const BusinessRegistryPage = lazy(() => import("./pages/BusinessRegistryPage"));
const LegalDocumentationPage = lazy(() => import("./pages/LegalDocumentationPage"));
const TourismDashboardPage = lazy(() => import("./pages/TourismDashboardPage"));
const CyberSecurityPage = lazy(() => import("./pages/CyberSecurityPage"));
const DemographyPage = lazy(() => import("./pages/DemographyPage"));
const EmploymentDashboardPage = lazy(() => import("./pages/EmploymentDashboardPage"));
const CivilRegistryPage = lazy(() => import("./pages/CivilRegistryPage"));
const MeteorologyCenterPage = lazy(() => import("./pages/MeteorologyCenterPage"));
const MediaRegistryPage = lazy(() => import("./pages/MediaRegistryPage"));
const ForestryPage = lazy(() => import("./pages/ForestryPage"));
const MiningDashboardPage = lazy(() => import("./pages/MiningDashboardPage"));
const DiplomaRegistryPage = lazy(() => import("./pages/DiplomaRegistryPage"));
const PublicPropertyPage = lazy(() => import("./pages/PublicPropertyPage"));
const FisheryDashboardPage = lazy(() => import("./pages/FisheryDashboardPage"));
const IntellectualPropertyPage = lazy(() => import("./pages/IntellectualPropertyPage"));
const DisasterManagementPage = lazy(() => import("./pages/DisasterManagementPage"));
const AssociationsRegistryPage = lazy(() => import("./pages/AssociationsRegistryPage"));
const PublicDebtPage = lazy(() => import("./pages/PublicDebtPage"));
const TelecomDashboardPage = lazy(() => import("./pages/TelecomDashboardPage"));
const ReligiousRegistryPage = lazy(() => import("./pages/ReligiousRegistryPage"));
const MigrationDashboardPage = lazy(() => import("./pages/MigrationDashboardPage"));
const HousingDashboardPage = lazy(() => import("./pages/HousingDashboardPage"));
const SportsDashboardPage = lazy(() => import("./pages/SportsDashboardPage"));
const SocialProtectionPage = lazy(() => import("./pages/SocialProtectionPage"));

// ── Lazy-loaded profil pages ──────────────────────────────────────────────────
import { ProfilLayout } from "@/components/profil/ProfilLayout";
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

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
                <Suspense fallback={<PageLoader />}>
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

          {/* Système routes */}
          <Route
            path="/formation"
            element={
              <ProtectedRoute requiredModule="formation">
                <Formation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parametres"
            element={
              <ProtectedRoute requiredModule="parametres">
                <Parametres />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />


          {/* SGPR Dashboard */}
          <Route
            path="/dashboard-sgpr"
            element={
              <ProtectedRoute requiredRoles={["sgpr", "admin_sgg"]}>
                <DashboardSGPR />
              </ProtectedRoute>
            }
          />

          {/* Monitoring Dashboard */}
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <MonitoringDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Permissions */}
          <Route
            path="/admin/permissions"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <AdminPermissions />
              </ProtectedRoute>
            }
          />

          {/* Workflows */}
          <Route
            path="/workflows"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg", "sgpr", "sg_ministere"]}>
                <WorkflowPage />
              </ProtectedRoute>
            }
          />

          {/* Data Import/Export */}
          <Route
            path="/data-exchange"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <DataExchangePage />
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg", "sgpr"]}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Audit Log */}
          <Route
            path="/audit-log"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />

          {/* System Stats */}
          <Route
            path="/system-stats"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <SystemStatsPage />
              </ProtectedRoute>
            }
          />

          {/* Help Center */}
          <Route
            path="/aide"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />

          {/* Consolidated Dashboard */}
          <Route
            path="/consolidated"
            element={
              <ProtectedRoute requiredModule="consolidated">
                <ConsolidatedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Calendar */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Contacts */}
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <ContactsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Advanced */}
          <Route
            path="/admin/advanced"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <AdminAdvancedPage />
              </ProtectedRoute>
            }
          />

          {/* Benchmark Ministères */}
          <Route
            path="/benchmark"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg", "sgpr"]}>
                <BenchmarkPage />
              </ProtectedRoute>
            }
          />

          {/* Rapports Automatisés */}
          <Route
            path="/auto-reports"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <AutoReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Activité Temps Réel */}
          <Route
            path="/live-activity"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <LiveActivityPage />
              </ProtectedRoute>
            }
          />

          {/* Kanban */}
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <KanbanPage />
              </ProtectedRoute>
            }
          />

          {/* Archives */}
          <Route
            path="/archives"
            element={
              <ProtectedRoute>
                <ArchivesPage />
              </ProtectedRoute>
            }
          />

          {/* API Docs */}
          <Route
            path="/api-docs"
            element={
              <ProtectedRoute requiredRoles={["admin_sgg"]}>
                <ApiDocsPage />
              </ProtectedRoute>
            }
          />

          {/* Org Chart */}
          <Route
            path="/organigramme"
            element={
              <ProtectedRoute>
                <OrgChartPage />
              </ProtectedRoute>
            }
          />

          {/* Messaging */}
          <Route
            path="/messagerie"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />

          {/* Changelog */}
          <Route
            path="/changelog"
            element={
              <ProtectedRoute>
                <ChangelogPage />
              </ProtectedRoute>
            }
          />

          {/* Geo Map */}
          <Route
            path="/carte"
            element={
              <ProtectedRoute>
                <GeoMapPage />
              </ProtectedRoute>
            }
          />

          {/* Surveys */}
          <Route
            path="/sondages"
            element={
              <ProtectedRoute>
                <SurveysPage />
              </ProtectedRoute>
            }
          />

          {/* Personal Dashboard */}
          <Route
            path="/mon-dashboard"
            element={
              <ProtectedRoute>
                <PersonalDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* KPI Builder */}
          <Route
            path="/kpi-builder"
            element={
              <ProtectedRoute>
                <KPIBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Doc Manager */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocManagerPage />
              </ProtectedRoute>
            }
          />

          {/* Comparison */}
          <Route
            path="/comparatif"
            element={
              <ProtectedRoute>
                <ComparisonPage />
              </ProtectedRoute>
            }
          />

          {/* OKR */}
          <Route
            path="/okr"
            element={
              <ProtectedRoute>
                <OKRPage />
              </ProtectedRoute>
            }
          />

          {/* Alerts */}
          <Route
            path="/alertes"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />

          {/* Ministry Dashboard */}
          <Route
            path="/ministere"
            element={
              <ProtectedRoute>
                <MinistryDashPage />
              </ProtectedRoute>
            }
          />

          {/* Workflow Builder (distinct from /workflows admin page) */}
          <Route
            path="/workflow-builder"
            element={
              <ProtectedRoute>
                <WorkflowBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Institution Directory */}
          <Route
            path="/annuaire-institutions"
            element={
              <ProtectedRoute>
                <InstitutionDirectoryPage />
              </ProtectedRoute>
            }
          />

          {/* Executive Summary */}
          <Route
            path="/synthese"
            element={
              <ProtectedRoute>
                <ExecutiveSummaryPage />
              </ProtectedRoute>
            }
          />

          {/* Risk Register */}
          <Route
            path="/risques"
            element={
              <ProtectedRoute>
                <RiskRegisterPage />
              </ProtectedRoute>
            }
          />

          {/* Province Dashboard */}
          <Route
            path="/provinces"
            element={
              <ProtectedRoute>
                <ProvinceDashPage />
              </ProtectedRoute>
            }
          />

          {/* Report Center */}
          <Route
            path="/rapports"
            element={
              <ProtectedRoute>
                <ReportCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Strategic Planning */}
          <Route
            path="/planning"
            element={
              <ProtectedRoute>
                <StrategicPlanningPage />
              </ProtectedRoute>
            }
          />

          {/* Balanced Scorecard */}
          <Route
            path="/scorecard"
            element={
              <ProtectedRoute>
                <BalancedScorecardPage />
              </ProtectedRoute>
            }
          />

          {/* Decision Log */}
          <Route
            path="/decisions"
            element={
              <ProtectedRoute>
                <DecisionLogPage />
              </ProtectedRoute>
            }
          />

          {/* Training Center */}
          <Route
            path="/formations"
            element={
              <ProtectedRoute>
                <TrainingCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Citizen Portal */}
          <Route
            path="/portail-citoyen"
            element={
              <ProtectedRoute>
                <CitizenPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Live Dashboard */}
          <Route
            path="/live"
            element={
              <ProtectedRoute>
                <LiveDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Alert Center (distinct from /alertes basic page) */}
          <Route
            path="/centre-alertes"
            element={
              <ProtectedRoute>
                <AlertCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Skills Matrix */}
          <Route
            path="/competences"
            element={
              <ProtectedRoute>
                <SkillsMatrixPage />
              </ProtectedRoute>
            }
          />

          {/* SLA Dashboard */}
          <Route
            path="/sla"
            element={
              <ProtectedRoute>
                <SLADashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Compliance Audit */}
          <Route
            path="/conformite"
            element={
              <ProtectedRoute>
                <ComplianceAuditPage />
              </ProtectedRoute>
            }
          />

          {/* SDG Dashboard */}
          <Route
            path="/odd"
            element={
              <ProtectedRoute>
                <SDGDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Meeting Manager */}
          <Route
            path="/reunions"
            element={
              <ProtectedRoute>
                <MeetingManagerPage />
              </ProtectedRoute>
            }
          />

          {/* Budget Dashboard */}
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <BudgetDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Grievance Center */}
          <Route
            path="/reclamations"
            element={
              <ProtectedRoute>
                <GrievanceCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Workforce Dashboard */}
          <Route
            path="/effectifs"
            element={
              <ProtectedRoute>
                <WorkforceDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Energy Dashboard */}
          <Route
            path="/energie"
            element={
              <ProtectedRoute>
                <EnergyDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Procurement */}
          <Route
            path="/marches-publics"
            element={
              <ProtectedRoute>
                <ProcurementPage />
              </ProtectedRoute>
            }
          />

          {/* Strategic Watch */}
          <Route
            path="/veille"
            element={
              <ProtectedRoute>
                <StrategicWatchPage />
              </ProtectedRoute>
            }
          />

          {/* Public Health */}
          <Route
            path="/sante"
            element={
              <ProtectedRoute>
                <PublicHealthPage />
              </ProtectedRoute>
            }
          />

          {/* Land Registry */}
          <Route
            path="/foncier"
            element={
              <ProtectedRoute>
                <LandRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* International Cooperation */}
          <Route
            path="/cooperation"
            element={
              <ProtectedRoute>
                <InternationalCoopPage />
              </ProtectedRoute>
            }
          />

          {/* Education Dashboard */}
          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <EducationDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* NGO Registry */}
          <Route
            path="/associations"
            element={
              <ProtectedRoute>
                <NGORegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Gov Communication */}
          <Route
            path="/communication"
            element={
              <ProtectedRoute>
                <GovCommunicationPage />
              </ProtectedRoute>
            }
          />

          {/* Transport Dashboard */}
          <Route
            path="/transports"
            element={
              <ProtectedRoute>
                <TransportDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Electoral Registry */}
          <Route
            path="/elections"
            element={
              <ProtectedRoute>
                <ElectoralRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Risk Management */}
          <Route
            path="/gestion-risques"
            element={
              <ProtectedRoute>
                <RiskManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Agriculture Dashboard */}
          <Route
            path="/agriculture"
            element={
              <ProtectedRoute>
                <AgricultureDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Business Registry */}
          <Route
            path="/entreprises"
            element={
              <ProtectedRoute>
                <BusinessRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Legal Documentation */}
          <Route
            path="/juridique"
            element={
              <ProtectedRoute>
                <LegalDocumentationPage />
              </ProtectedRoute>
            }
          />

          {/* Tourism Dashboard */}
          <Route
            path="/tourisme"
            element={
              <ProtectedRoute>
                <TourismDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Cyber Security */}
          <Route
            path="/cybersecurite"
            element={
              <ProtectedRoute>
                <CyberSecurityPage />
              </ProtectedRoute>
            }
          />

          {/* Demography */}
          <Route
            path="/demographie"
            element={
              <ProtectedRoute>
                <DemographyPage />
              </ProtectedRoute>
            }
          />

          {/* Employment Dashboard */}
          <Route
            path="/emploi"
            element={
              <ProtectedRoute>
                <EmploymentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Civil Registry */}
          <Route
            path="/etat-civil"
            element={
              <ProtectedRoute>
                <CivilRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Meteorology Center */}
          <Route
            path="/meteo"
            element={
              <ProtectedRoute>
                <MeteorologyCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Media Registry */}
          <Route
            path="/medias"
            element={
              <ProtectedRoute>
                <MediaRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Forestry */}
          <Route
            path="/eaux-forets"
            element={
              <ProtectedRoute>
                <ForestryPage />
              </ProtectedRoute>
            }
          />

          {/* Mining Dashboard */}
          <Route
            path="/mines"
            element={
              <ProtectedRoute>
                <MiningDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Diploma Registry */}
          <Route
            path="/diplomes"
            element={
              <ProtectedRoute>
                <DiplomaRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Public Property */}
          <Route
            path="/patrimoine"
            element={
              <ProtectedRoute>
                <PublicPropertyPage />
              </ProtectedRoute>
            }
          />

          {/* Fishery Dashboard */}
          <Route
            path="/peche"
            element={
              <ProtectedRoute>
                <FisheryDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Intellectual Property */}
          <Route
            path="/propriete-intellectuelle"
            element={
              <ProtectedRoute>
                <IntellectualPropertyPage />
              </ProtectedRoute>
            }
          />

          {/* Disaster Management */}
          <Route
            path="/catastrophes"
            element={
              <ProtectedRoute>
                <DisasterManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Associations Registry (distinct from /associations NGO page) */}
          <Route
            path="/registre-associations"
            element={
              <ProtectedRoute>
                <AssociationsRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Public Debt */}
          <Route
            path="/dette-publique"
            element={
              <ProtectedRoute>
                <PublicDebtPage />
              </ProtectedRoute>
            }
          />

          {/* Telecom Dashboard */}
          <Route
            path="/telecom"
            element={
              <ProtectedRoute>
                <TelecomDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Religious Registry */}
          <Route
            path="/cultes"
            element={
              <ProtectedRoute>
                <ReligiousRegistryPage />
              </ProtectedRoute>
            }
          />

          {/* Migration Dashboard */}
          <Route
            path="/migrations"
            element={
              <ProtectedRoute>
                <MigrationDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Housing Dashboard */}
          <Route
            path="/habitat"
            element={
              <ProtectedRoute>
                <HousingDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Sports Dashboard */}
          <Route
            path="/sports"
            element={
              <ProtectedRoute>
                <SportsDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Social Protection */}
          <Route
            path="/protection-sociale"
            element={
              <ProtectedRoute>
                <SocialProtectionPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => {
  useAccessibilityShortcuts();

  return (
    <ErrorBoundary>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <SkipLinks />
                <Toaster />
                <Sonner />
                <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <AnimatedRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
};

export default App;
