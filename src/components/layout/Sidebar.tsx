import { NavLink, useLocation } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  BookOpen,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FolderOpen,
  LucideIcon,
  Scale,
  Building2,
  Table2,
  FileEdit,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Layers,
  BarChart2,
  Shield,
  Gauge,
  GitBranch,
  Bell,
  Upload,
  ShieldAlert,
  PieChart,
  History,
  Server,
  HelpCircle,
  Crown,
  Calendar,
  Contact2,
  Wrench,
  Trophy,
  Activity,
  Clock,
  Kanban,
  Archive,
  Code2,
  Network,
  MessageSquare,
  Globe,
  Star,
  Target,
  GitCompareArrows,
  Flag,
  Workflow,
  Landmark,
  FileBarChart,
  MapPin,
  GanttChart,
  Radio,
  Puzzle,
  Timer,
  Globe2,
  CalendarClock,
  Wallet,
  UsersRound,
  Zap,
  Gavel,
  Eye,
  HeartPulse,
  MapPinned,
  Handshake,
  Heart,
  Megaphone,
  Truck,
  Vote,
  Siren,
  Wheat,
  Briefcase,
  Palmtree,
  CloudRain,
  Newspaper,
  TreePine,
  Mountain,
  Award,
  Building,
  Fish,
  Lightbulb,
  AlertTriangle,
  Wifi,
  Church,
  Home,
  HeartHandshake,
  Search,
  Pin,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useTranslation } from "@/i18n";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  nameKey: string;
  label?: string;        // Fallback label when i18n key not found
  href: string;
  icon: LucideIcon;
  moduleKey: string;
  badge?: number;
  tooltip?: string;      // Description for novice users
  isNew?: boolean;       // Show "Nouveau" badge
}

interface NavSubsection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

interface NavSection {
  titleKey: string;
  label: string;           // Fallback label
  icon?: LucideIcon;       // Section icon
  tooltip?: string;        // Section description
  collapsible?: boolean;
  defaultOpen?: boolean;
  items?: NavItem[];
  subsections?: NavSubsection[];
}

// ── Navigation Structure ──────────────────────────────────────────────────────
//
// Organisation optimisée pour les SG des ministères (utilisateurs principaux).
// Ordre : Mon espace → Reporting → Données sectorielles → Outils → Analyse
//         → Pilotage → Processus SGG → Administration → Aide
// Règle : max 7±2 éléments visibles par section.
// Sous-catégories repliables pour Reporting et Données sectorielles.
//

const navigation: NavSection[] = [
  // ──────────────────────────────────────────────────────
  // 1. ESPACE PERSONNEL — toujours visible, familier
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.mySpace",
    label: "Mon espace",
    icon: User,
    collapsible: false,
    items: [
      { nameKey: "sidebar.overview", label: "Mon tableau de bord", href: "/dashboard", icon: LayoutDashboard, moduleKey: "dashboard", tooltip: "Vue d'ensemble de votre activité et des indicateurs clés" },
      { nameKey: "sidebar.myDashboard", label: "Mes favoris", href: "/mon-dashboard", icon: Star, moduleKey: "dashboard", tooltip: "Vos modules et indicateurs préférés, épinglés ici" },
      { nameKey: "sidebar.notifications", label: "Notifications", href: "/notifications", icon: Bell, moduleKey: "dashboard", tooltip: "Alertes, rappels et messages importants" },
      { nameKey: "sidebar.myProfile", label: "Mon profil", href: "/profil", icon: User, moduleKey: "dashboard", tooltip: "Vos informations personnelles et paramètres de compte" },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 2. REPORTING — cœur de métier SG (subsections GAR + PTM)
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.reporting",
    label: "Reporting",
    icon: Table2,
    tooltip: "Saisie et suivi des rapports ministériels et du programme de travail",
    collapsible: true,
    defaultOpen: true,
    items: [
      { nameKey: "sidebar.monReporting", label: "Mon reporting", href: "/reporting/dashboard", icon: Gauge, moduleKey: "matriceReporting", tooltip: "Vue d'ensemble de la situation de votre ministère", isNew: true },
    ],
    subsections: [
      {
        title: "📊 Reporting mensuel (GAR/PAG)",
        icon: Calendar,
        items: [
          { nameKey: "sidebar.matriceGarPag", label: "Matrice GAR/PAG", href: "/matrice-reporting", icon: Table2, moduleKey: "matriceReporting", tooltip: "Tableau croisé de suivi des résultats par programme" },
          { nameKey: "sidebar.monthlyEntry", label: "Saisie mensuelle", href: "/matrice-reporting/saisie", icon: FileEdit, moduleKey: "matriceReporting", tooltip: "Remplissez les indicateurs de votre ministère chaque mois" },
          { nameKey: "sidebar.validationSGG", label: "Validation SGG", href: "/matrice-reporting/validation", icon: CheckCircle2, moduleKey: "matriceReporting", tooltip: "Le SGG vérifie et valide les rapports soumis" },
          { nameKey: "sidebar.validationSGPR", label: "Validation SGPR", href: "/matrice-reporting/validation-sgpr", icon: ShieldCheck, moduleKey: "matriceReporting", tooltip: "La Présidence valide les rapports stratégiques" },
          { nameKey: "sidebar.completionTracking", label: "Suivi de complétude", href: "/matrice-reporting/suivi", icon: ClipboardList, moduleKey: "matriceReporting", tooltip: "Quels ministères ont soumis leurs rapports ?" },
          { nameKey: "sidebar.exports", label: "Exports", href: "/matrice-reporting/exports", icon: Download, moduleKey: "matriceReporting", tooltip: "Télécharger les données en Excel ou PDF" },
        ],
      },
      {
        title: "📋 PTM/PTG (Programme de Travail)",
        icon: FileSpreadsheet,
        items: [
          { nameKey: "sidebar.matricePTM", label: "Matrice PTM/PTG", href: "/ptm/matrice", icon: FileSpreadsheet, moduleKey: "ptmptg", tooltip: "Programme de Travail Ministériel et Gouvernemental" },
          { nameKey: "sidebar.ptmSaisie", label: "Saisie initiatives", href: "/ptm/saisie", icon: FileEdit, moduleKey: "ptmptg", tooltip: "Créer et compléter les initiatives du programme de travail" },
          { nameKey: "sidebar.ptmConsolidation", label: "Consolidation SG", href: "/ptm/consolidation", icon: Layers, moduleKey: "ptmptg", tooltip: "Le SG consolide les initiatives de son ministère" },
          { nameKey: "sidebar.ptmValidation", label: "Validation SGG", href: "/ptm/validation", icon: ShieldCheck, moduleKey: "ptmptg", tooltip: "Le SGG valide les programmes de travail ministériels" },
          { nameKey: "sidebar.ptmSuivi", label: "Suivi PTM/PTG", href: "/ptm/suivi", icon: ClipboardList, moduleKey: "ptmptg", tooltip: "Tableau de bord de suivi de l'avancement des PTM" },
          { nameKey: "sidebar.ptmCoherence", label: "Cohérence PTM/PAG", href: "/ptm/coherence", icon: GitCompareArrows, moduleKey: "ptmptg", tooltip: "Vérifier l'alignement entre PTM et priorités PAG" },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 3. DONNÉES SECTORIELLES — simplifiées (3 sous-catégories)
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.sectors",
    label: "Données sectorielles",
    icon: PieChart,
    tooltip: "Tableaux de bord par secteur d'activité du pays",
    collapsible: true,
    items: [
      { nameKey: "sidebar.monSecteur", label: "Mon secteur", href: "/mon-secteur", icon: Building2, moduleKey: "dashboard", tooltip: "Données et indicateurs de votre secteur ministériel", isNew: true },
    ],
    subsections: [
      {
        title: "📌 Données transversales",
        icon: Wallet,
        items: [
          { nameKey: "sidebar.budgetDashboard", label: "Budget de l'État", href: "/budget", icon: Wallet, moduleKey: "pilotage", tooltip: "Recettes, dépenses, et exécution du budget national" },
          { nameKey: "sidebar.workforceDashboard", label: "Effectifs publics", href: "/effectifs", icon: UsersRound, moduleKey: "pilotage", tooltip: "Nombre d'agents de la fonction publique par ministère" },
          { nameKey: "sidebar.procurement", label: "Marchés publics", href: "/marches-publics", icon: Gavel, moduleKey: "sector.economy", tooltip: "Appels d'offres, contrats et exécution des marchés de l'État" },
          { nameKey: "sidebar.publicDebt", label: "Dette publique", href: "/dette-publique", icon: Landmark, moduleKey: "sector.economy", tooltip: "Montant, créanciers et soutenabilité de la dette nationale" },
          { nameKey: "sidebar.demography", label: "Démographie", href: "/demographie", icon: Users, moduleKey: "sector.social", tooltip: "Population, naissances, espérance de vie, pyramide des âges" },
          { nameKey: "sidebar.employmentDashboard", label: "Emploi & Formation", href: "/emploi", icon: Briefcase, moduleKey: "sector.social", tooltip: "Taux de chômage, offres d'emploi, formation professionnelle" },
        ],
      },
      {
        title: "💰 Économie & Infrastructure",
        icon: Wallet,
        items: [
          { nameKey: "sidebar.businessRegistry", label: "Commerce & Entreprises", href: "/entreprises", icon: Briefcase, moduleKey: "sector.economy", tooltip: "Registre du commerce — entreprises créées au Gabon" },
          { nameKey: "sidebar.miningDashboard", label: "Mines & Géologie", href: "/mines", icon: Mountain, moduleKey: "sector.economy", tooltip: "Production minière : manganèse, or, permis d'exploitation" },
          { nameKey: "sidebar.energyDashboard", label: "Énergie", href: "/energie", icon: Zap, moduleKey: "sector.economy", tooltip: "Production électrique, barrages, pétrole, énergies renouvelables" },
          { nameKey: "sidebar.telecomDashboard", label: "Télécommunications", href: "/telecom", icon: Wifi, moduleKey: "sector.economy", tooltip: "Opérateurs, couverture réseau, fibre optique, projets numériques" },
          { nameKey: "sidebar.transportDashboard", label: "Transports", href: "/transports", icon: Truck, moduleKey: "sector.economy", tooltip: "Routes, ports, aéroports, réseau de transport national" },
          { nameKey: "sidebar.intellectualProperty", label: "Propriété intellectuelle", href: "/propriete-intellectuelle", icon: Lightbulb, moduleKey: "sector.economy", tooltip: "Brevets, marques et droits d'auteur déposés (OAPI)" },
          { nameKey: "sidebar.agricultureDashboard", label: "Agriculture", href: "/agriculture", icon: Wheat, moduleKey: "sector.territory", tooltip: "Production agricole, sécurité alimentaire, cultures vivrières" },
        ],
      },
      {
        title: "🏛️ Social, Territoire & Souveraineté",
        icon: Shield,
        items: [
          { nameKey: "sidebar.publicHealth", label: "Santé publique", href: "/sante", icon: HeartPulse, moduleKey: "sector.social", tooltip: "Hôpitaux, médecins, maladies, vaccination — santé de la population" },
          { nameKey: "sidebar.educationDashboard", label: "Éducation nationale", href: "/education", icon: GraduationCap, moduleKey: "sector.social", tooltip: "Écoles, élèves, enseignants, taux de réussite" },
          { nameKey: "sidebar.socialProtection", label: "Protection sociale", href: "/protection-sociale", icon: HeartHandshake, moduleKey: "sector.social", tooltip: "CNAMGS, pensions, aides sociales — qui est protégé ?" },
          { nameKey: "sidebar.forestry", label: "Eaux & Forêts", href: "/eaux-forets", icon: TreePine, moduleKey: "sector.territory", tooltip: "Gestion forestière, biodiversité, exploitation du bois" },
          { nameKey: "sidebar.landRegistry", label: "Registre foncier", href: "/foncier", icon: MapPinned, moduleKey: "sector.territory", tooltip: "Qui possède quoi ? Titres fonciers et parcelles cadastrées" },
          { nameKey: "sidebar.housingDashboard", label: "Habitat & Urbanisme", href: "/habitat", icon: Home, moduleKey: "sector.territory", tooltip: "Permis de construire, logements sociaux, aménagement urbain" },
          { nameKey: "sidebar.civilRegistry", label: "État civil", href: "/etat-civil", icon: FileText, moduleKey: "sector.sovereignty", tooltip: "Naissances, mariages, décès — registre officiel des citoyens" },
          { nameKey: "sidebar.electoralRegistry", label: "Registre électoral", href: "/elections", icon: Vote, moduleKey: "sector.sovereignty", tooltip: "Listes électorales, bureaux de vote, résultats" },
          { nameKey: "sidebar.fisheryDashboard", label: "Pêche & Aquaculture", href: "/peche", icon: Fish, moduleKey: "sector.territory", tooltip: "Production halieutique, zones de pêche, licences" },
          { nameKey: "sidebar.tourismDashboard", label: "Tourisme & Culture", href: "/tourisme", icon: Palmtree, moduleKey: "sector.society", tooltip: "Parcs nationaux, hôtels, visiteurs, sites touristiques" },
          { nameKey: "sidebar.associationsRegistry", label: "Associations & ONG", href: "/associations", icon: Heart, moduleKey: "sector.society", tooltip: "Registre des organisations de la société civile" },
          { nameKey: "sidebar.internationalCoop", label: "Coopération internationale", href: "/cooperation", icon: Handshake, moduleKey: "sector.society", tooltip: "Accords, partenariats et aide au développement" },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 4. OUTILS & PRODUCTIVITÉ — priorisés pour SG
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.tools",
    label: "Outils",
    icon: Wrench,
    tooltip: "Outils de travail quotidien : agenda, messagerie, documents",
    collapsible: true,
    items: [
      { nameKey: "sidebar.calendar", label: "Calendrier", href: "/calendar", icon: Calendar, moduleKey: "dashboard", tooltip: "Votre agenda et les événements gouvernementaux" },
      { nameKey: "sidebar.messaging", label: "Messagerie", href: "/messagerie", icon: MessageSquare, moduleKey: "dashboard", tooltip: "Messagerie sécurisée entre agents de l'État" },
      { nameKey: "sidebar.documents", label: "Documents", href: "/documents/app", icon: FileText, moduleKey: "documents", tooltip: "Bibliothèque de documents officiels" },
      { nameKey: "sidebar.contacts", label: "Annuaire", href: "/contacts", icon: Contact2, moduleKey: "dashboard", tooltip: "Coordonnées des institutions et responsables" },
      { nameKey: "sidebar.echeancier", label: "Échéancier ministère", href: "/echeancier", icon: CalendarClock, moduleKey: "dashboard", tooltip: "Deadlines de reporting, jalons PTM et Conseil des ministres", isNew: true },
      { nameKey: "sidebar.modeles", label: "Modèles & Templates", href: "/modeles", icon: Download, moduleKey: "dashboard", tooltip: "Templates officiels : reporting, PTM, notes, courriers", isNew: true },
      { nameKey: "sidebar.kanban", label: "Tableau de tâches", href: "/kanban", icon: Kanban, moduleKey: "dashboard", tooltip: "Organisez vos tâches en colonnes (à faire, en cours, terminé)" },
      { nameKey: "sidebar.archives", label: "Archives", href: "/archives", icon: Archive, moduleKey: "dashboard", tooltip: "Documents historiques et dossiers archivés" },
      { nameKey: "sidebar.geoMap", label: "Carte du Gabon", href: "/carte", icon: Globe, moduleKey: "dashboard", tooltip: "Visualisation géographique des projets et données" },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 5. ANALYSE & STRATÉGIE — allégé pour SG (5 items)
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.analysis",
    label: "Analyse",
    icon: PieChart,
    tooltip: "Outils d'analyse et de performance ministérielle",
    collapsible: true,
    items: [
      { nameKey: "sidebar.execSummary", label: "Synthèse exécutive", href: "/synthese", icon: Crown, moduleKey: "analysis", tooltip: "Résumé pour les décideurs — chiffres clés en une page" },
      { nameKey: "sidebar.performanceMinistere", label: "Performance ministère", href: "/performance", icon: Target, moduleKey: "analysis", tooltip: "Score de performance de votre ministère vs objectifs", isNew: true },
      { nameKey: "sidebar.comparison", label: "Comparatif ministères", href: "/comparatif", icon: GitCompareArrows, moduleKey: "analysis", tooltip: "Comparer les performances entre ministères ou périodes" },
      { nameKey: "sidebar.reportCenter", label: "Centre de rapports", href: "/rapports", icon: FileBarChart, moduleKey: "analysis", tooltip: "Générer des rapports PDF automatiques" },
      { nameKey: "sidebar.strategicWatch", label: "Veille stratégique", href: "/veille", icon: Eye, moduleKey: "analysis", tooltip: "Surveillance de l'environnement international et régional" },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 6. PILOTAGE GOUVERNEMENTAL — déplacé après les 4 volets
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.pilotage",
    label: "Pilotage",
    icon: BarChart3,
    tooltip: "Suivi de l'exécution des politiques et programmes du gouvernement",
    collapsible: true,
    items: [
      { nameKey: "sidebar.garTracking", label: "Suivi GAR / PAG", href: "/gar/app", icon: BarChart3, moduleKey: "gar", tooltip: "Gestion Axée sur les Résultats — suivez l'avancement des projets gouvernementaux" },
      { nameKey: "sidebar.scorecard", label: "Tableau de bord stratégique", href: "/scorecard", icon: Target, moduleKey: "pilotage", tooltip: "Balanced Scorecard — mesure la performance globale du gouvernement" },
      { nameKey: "sidebar.sdgDashboard", label: "Objectifs de Développement (ODD)", href: "/odd", icon: Globe2, moduleKey: "pilotage", tooltip: "Suivi des 17 Objectifs de Développement Durable de l'ONU" },
      { nameKey: "sidebar.provinces", label: "Tableau des provinces", href: "/provinces", icon: MapPin, moduleKey: "pilotage", tooltip: "Indicateurs par province : population, budget, projets" },
      { nameKey: "sidebar.consolidated", label: "Vue consolidée", href: "/consolidated", icon: Crown, moduleKey: "pilotage", tooltip: "Vue synthétique de tous les indicateurs nationaux" },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 7. PROCESSUS INSTITUTIONNELS — déplacé après Pilotage
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.processes",
    label: "Processus SGG",
    icon: Scale,
    tooltip: "Les procédures officielles gérées par le Secrétariat Général du Gouvernement",
    collapsible: true,
    items: [
      { nameKey: "sidebar.legislativeCycle", label: "Cycle législatif", href: "/cycle-legislatif/app", icon: Scale, moduleKey: "cycleLegislatif", tooltip: "Suivi des projets de loi, de leur rédaction à leur promulgation" },
      { nameKey: "sidebar.nominations", label: "Nominations", href: "/nominations/app", icon: Users, moduleKey: "nominations", badge: 5, tooltip: "Propositions et validation des nominations en Conseil des ministres" },
      { nameKey: "sidebar.egop", label: "Courrier gouvernemental", href: "/egop/app", icon: FolderOpen, moduleKey: "egop", tooltip: "EGOP — Gestion du courrier officiel entre institutions" },
      { nameKey: "sidebar.journalOfficiel", label: "Journal Officiel", href: "/journal-officiel/app", icon: BookOpen, moduleKey: "journalOfficiel", tooltip: "Publication officielle des lois, décrets et arrêtés" },
      { nameKey: "sidebar.decisions", label: "Journal des décisions", href: "/decisions", icon: BookOpen, moduleKey: "pilotage", tooltip: "Historique des décisions prises en Conseil des ministres" },
      { nameKey: "sidebar.meetingManager", label: "Réunions", href: "/reunions", icon: CalendarClock, moduleKey: "pilotage", tooltip: "Planification et comptes rendus de réunions officielles" },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 8. ADMINISTRATION SYSTÈME (+ items récupérés d'Analyse)
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.admin",
    label: "Administration",
    icon: Settings,
    tooltip: "Réservé aux administrateurs du SGG — gestion technique de la plateforme",
    collapsible: true,
    items: [
      { nameKey: "admin.monitoring", label: "Monitoring", href: "/admin", icon: BarChart2, moduleKey: "adminUsers", tooltip: "Vue d'ensemble de la santé de la plateforme" },
      { nameKey: "sidebar.userManagement", label: "Gestion des utilisateurs", href: "/admin/users", icon: Users, moduleKey: "adminUsers", tooltip: "Créer, modifier ou désactiver des comptes utilisateurs" },
      { nameKey: "sidebar.sgprDashboard", label: "Tableau SGPR", href: "/dashboard-sgpr", icon: Shield, moduleKey: "adminUsers", tooltip: "Tableau de bord réservé au Secrétariat de la Présidence" },
      { nameKey: "sidebar.permissions", label: "Permissions", href: "/admin/permissions", icon: ShieldAlert, moduleKey: "adminUsers", tooltip: "Qui peut voir quoi ? Gestion des droits d'accès" },
      { nameKey: "sidebar.workflows", label: "Workflows", href: "/workflows", icon: GitBranch, moduleKey: "adminUsers", tooltip: "Circuits de validation et d'approbation automatisés" },
      { nameKey: "sidebar.dataExchange", label: "Import / Export", href: "/data-exchange", icon: Upload, moduleKey: "adminUsers", tooltip: "Importer ou exporter des données en masse" },
      { nameKey: "sidebar.auditLog", label: "Journal d'audit", href: "/audit-log", icon: History, moduleKey: "adminUsers", tooltip: "Qui a fait quoi et quand ? Traçabilité complète" },
      { nameKey: "sidebar.systemStats", label: "Système", href: "/system-stats", icon: Server, moduleKey: "adminUsers", tooltip: "Performances serveur, espace disque, santé technique" },
      { nameKey: "sidebar.apiDocs", label: "Centre API", href: "/api-docs", icon: Code2, moduleKey: "adminUsers", tooltip: "Documentation technique pour les développeurs" },
      { nameKey: "sidebar.adminAdvanced", label: "Admin. avancée", href: "/admin/advanced", icon: Wrench, moduleKey: "adminUsers", tooltip: "Configuration système avancée" },
      // Items récupérés du volet Analyse (outils admin-level)
      { nameKey: "sidebar.analytics", label: "Analytique avancée", href: "/analytics", icon: PieChart, moduleKey: "adminUsers", tooltip: "Tableaux de bord avancés et analyses de données" },
      { nameKey: "sidebar.riskRegister", label: "Registre des risques", href: "/risques", icon: ShieldAlert, moduleKey: "adminUsers", tooltip: "Cartographie des risques et plans de mitigation" },
      { nameKey: "sidebar.kpiBuilder", label: "Constructeur d'indicateurs", href: "/kpi-builder", icon: Target, moduleKey: "adminUsers", tooltip: "Créez vos propres indicateurs de performance personnalisés" },
      { nameKey: "sidebar.autoReports", label: "Rapports automatiques", href: "/auto-reports", icon: Clock, moduleKey: "adminUsers", tooltip: "Rapports générés et envoyés automatiquement chaque semaine" },
      { nameKey: "sidebar.benchmark", label: "Comparaison internationale", href: "/benchmark", icon: Trophy, moduleKey: "adminUsers", tooltip: "Comparer le Gabon avec d'autres pays de la sous-région" },
    ],
  },

  // ──────────────────────────────────────────────────────
  // 9. AIDE & PARAMÈTRES (toujours en bas)
  // ──────────────────────────────────────────────────────
  {
    titleKey: "nav.help",
    label: "Aide",
    icon: HelpCircle,
    collapsible: false,
    items: [
      { nameKey: "sidebar.training", label: "Centre de formation", href: "/formation", icon: GraduationCap, moduleKey: "dashboard", tooltip: "Tutoriels et guides pour apprendre à utiliser la plateforme" },
      { nameKey: "sidebar.help", label: "Aide", href: "/aide", icon: HelpCircle, moduleKey: "dashboard", tooltip: "Questions fréquentes et assistance technique" },
      { nameKey: "sidebar.settings", label: "Paramètres", href: "/parametres", icon: Settings, moduleKey: "parametres", tooltip: "Langue, thème, préférences de notification" },
    ],
  },
];

// ── Collapsible Section Component ────────────────────────────────────────────

function SectionHeader({
  section,
  isOpen,
  onToggle,
}: {
  section: NavSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  if (!section.collapsible) {
    return (
      <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        {section.label}
      </h3>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 mb-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground/90 hover:bg-sidebar-accent/30 rounded-md transition-all duration-200 group"
      title={section.tooltip}
    >
      {section.icon && <section.icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />}
      <span className="flex-1 text-left">{section.label}</span>
      {isOpen ? (
        <ChevronDown className="h-3 w-3 opacity-50" />
      ) : (
        <ChevronRight className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

// ── Subsection Component (for Données Sectorielles) ─────────────────────────

function SubsectionGroup({
  subsection,
  location,
  t,
}: {
  subsection: NavSubsection;
  location: ReturnType<typeof useLocation>;
  t: (key: string) => string;
}) {
  const hasActiveChild = subsection.items.some(
    (item) =>
      location.pathname === item.href ||
      (item.href !== "/" && location.pathname.startsWith(item.href))
  );

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200",
          hasActiveChild
            ? "text-sidebar-foreground bg-sidebar-accent/40"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
        )}
      >
        <span className="flex-1 text-left">{subsection.title}</span>
        <span className="text-[8px] text-sidebar-foreground/40 font-normal mr-1">
          {subsection.items.length}
        </span>
        {isOpen ? (
          <ChevronDown className="h-3 w-3 opacity-40" />
        ) : (
          <ChevronRight className="h-3 w-3 opacity-40" />
        )}
      </button>

      {isOpen && (
        <ul className="mt-0.5 ml-2 pl-2 border-l border-sidebar-border/30 space-y-0.5">
          {subsection.items.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              location={location}
              t={t}
              compact
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Nav Item Link Component ─────────────────────────────────────────────────

function NavItemLink({
  item,
  location,
  t,
  compact = false,
}: {
  item: NavItem;
  location: ReturnType<typeof useLocation>;
  t: (key: string) => string;
  compact?: boolean;
}) {
  const isActive =
    location.pathname === item.href ||
    (item.href !== "/" && location.pathname.startsWith(item.href));

  // Use i18n key, fallback to label
  const translatedName = t(item.nameKey);
  const displayName =
    translatedName !== item.nameKey ? translatedName : item.label || item.nameKey;

  return (
    <li>
      <NavLink
        to={item.href}
        title={item.tooltip}
        className={cn(
          "group relative flex items-center gap-2 rounded-lg transition-all duration-200",
          compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-2 text-sm",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className={cn("flex-shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        <span className="truncate font-medium">{displayName}</span>

        {/* Badge count */}
        {item.badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-status-warning text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}

        {/* "Nouveau" badge */}
        {item.isNew && !isActive && (
          <span className="ml-auto text-[7px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
            New
          </span>
        )}

        {/* Tooltip indicator */}
        {item.tooltip && !isActive && (
          <Info className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-30 transition-opacity flex-shrink-0" />
        )}
      </NavLink>
    </li>
  );
}

// ── Main Sidebar Component ──────────────────────────────────────────────────

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { demoUser, getModuleAccess } = useDemoUser();
  const moduleAccess = getModuleAccess();
  const { t } = useTranslation();

  // Collapsible section state — store which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((section) => {
      initial[section.titleKey] = section.defaultOpen ?? false;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Check if a module is accessible for the current user
  const isModuleAccessible = useCallback(
    (moduleKey: string) => {
      // Sector-level keys (sector.economy, sector.social, etc.) and analysis
      // are accessible if the user has dashboard access or adminUsers access
      if (moduleKey.startsWith("sector.") || moduleKey === "analysis" || moduleKey === "pilotage") {
        const key = "dashboard" as keyof typeof moduleAccess;
        const adminKey = "adminUsers" as keyof typeof moduleAccess;
        return moduleAccess[key] !== false || moduleAccess[adminKey] !== false;
      }
      const key = moduleKey as keyof typeof moduleAccess;
      return moduleAccess[key] !== false;
    },
    [moduleAccess]
  );

  // Filter navigation based on user access
  const filteredNavigation = useMemo(() => {
    return navigation
      .map((section) => {
        // Filter items
        const filteredItems = section.items?.filter((item) =>
          isModuleAccessible(item.moduleKey)
        );

        // Filter subsections
        const filteredSubsections = section.subsections?.map((sub) => ({
          ...sub,
          items: sub.items.filter((item) => isModuleAccessible(item.moduleKey)),
        })).filter((sub) => sub.items.length > 0);

        return {
          ...section,
          items: filteredItems,
          subsections: filteredSubsections,
        };
      })
      .filter(
        (section) =>
          (section.items && section.items.length > 0) ||
          (section.subsections && section.subsections.length > 0)
      );
  }, [isModuleAccessible]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        data-tutorial="sidebar"
        className={cn(
          "fixed left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          demoUser ? "top-7 h-[calc(100vh-1.75rem)]" : "top-0 h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-semibold tracking-wider text-sidebar-foreground/60 leading-tight">{t('sidebar.presidency')}</span>
              <span className="font-serif font-black text-[10px] uppercase leading-none tracking-normal text-sidebar-foreground">{t('sidebar.sggFull')}</span>
              <span className="font-serif font-black text-[9px] uppercase leading-none tracking-[0.1em] text-sidebar-foreground">{t('sidebar.sggSub')}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            onClick={onToggle}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Demo User Badge */}
        {demoUser && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <div className="rounded-lg bg-government-gold/20 px-3 py-2">
              <p className="text-[10px] font-semibold text-government-gold uppercase tracking-wider">
                {t('sidebar.demoMode')}
              </p>
              <p className="text-xs text-sidebar-foreground/80 truncate">
                {demoUser.role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation — scrollable zone */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sidebar-scroll" aria-label={t('nav.dashboard')}>
          {filteredNavigation.map((section) => {
            const sectionOpen = !section.collapsible || openSections[section.titleKey];

            return (
              <div key={section.titleKey} className="mb-4">
                <SectionHeader
                  section={section}
                  isOpen={sectionOpen ?? false}
                  onToggle={() => toggleSection(section.titleKey)}
                />

                {sectionOpen && (
                  <>
                    {/* Regular items */}
                    {section.items && section.items.length > 0 && (
                      <ul className="space-y-0.5">
                        {section.items.map((item) => (
                          <NavItemLink
                            key={item.href}
                            item={item}
                            location={location}
                            t={t}
                          />
                        ))}
                      </ul>
                    )}

                    {/* Subsections (Données sectorielles) */}
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="space-y-0.5 mt-1">
                        {section.subsections.map((sub) => (
                          <SubsectionGroup
                            key={sub.title}
                            subsection={sub}
                            location={location}
                            t={t}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer — fixed at bottom */}
        <div className="flex-shrink-0 border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/70">{t('common.version', { version: '2.1' })}</p>
            <p className="text-[10px] text-sidebar-foreground/50">{t('common.copyright', { year: '2026' })}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
