/**
 * SGG Digital — Recherche Globale (Command Palette)
 * Composant de recherche rapide accessible via Ctrl+K / ⌘K
 * Permet de naviguer vers n'importe quelle page, action ou document.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    FileText,
    BookOpen,
    Building2,
    FolderOpen,
    Scale,
    Settings,
    GraduationCap,
    Table2,
    FileSpreadsheet,
    User,
    Shield,
    ClipboardCheck,
    Download,
    Search,
    Gauge,
    GitBranch,
    Bell,
    PieChart,
    ShieldAlert,
    Upload,
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
    ClipboardList,
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
    MessageCircle,
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
    ShieldCheck,
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
    Home as HomeIcon,
    HeartHandshake,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";

interface SearchItem {
    id: string;
    label: string;
    description?: string;
    href: string;
    icon: React.ElementType;
    moduleKey: string;
    group: string;
}

const searchableItems: SearchItem[] = [
    // Navigation principale
    { id: "dashboard", label: "Tableau de Bord", description: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard, moduleKey: "dashboard", group: "Navigation" },
    { id: "gar", label: "Suivi GAR", description: "Gestion Axée sur les Résultats", href: "/gar/app", icon: BarChart3, moduleKey: "gar", group: "Navigation" },
    { id: "nominations", label: "Nominations", description: "Dossiers de nomination", href: "/nominations/app", icon: Users, moduleKey: "nominations", group: "Navigation" },
    { id: "jo", label: "Journal Officiel", description: "Textes officiels publiés", href: "/journal-officiel/app", icon: BookOpen, moduleKey: "journalOfficiel", group: "Navigation" },
    { id: "institutions", label: "Institutions", description: "Annuaire institutionnel", href: "/institutions/app", icon: Building2, moduleKey: "institutions", group: "Navigation" },
    { id: "egop", label: "e-GOP", description: "Conseil des Ministres", href: "/egop/app", icon: FolderOpen, moduleKey: "egop", group: "Navigation" },
    { id: "cycle-leg", label: "Cycle Législatif", description: "Processus législatif", href: "/cycle-legislatif/app", icon: Scale, moduleKey: "cycleLegislatif", group: "Navigation" },
    { id: "notifications", label: "Notifications", description: "Centre de notifications unifié", href: "/notifications", icon: Bell, moduleKey: "dashboard", group: "Navigation" },

    // Reporting
    { id: "matrice", label: "Matrice GAR/PAG", description: "Matrice de reporting", href: "/matrice-reporting", icon: Table2, moduleKey: "matriceReporting", group: "Reporting" },
    { id: "saisie", label: "Saisie Mensuelle", description: "Saisir un rapport mensuel", href: "/matrice-reporting/saisie", icon: FileText, moduleKey: "matriceReporting", group: "Reporting" },
    { id: "exports", label: "Exports Reporting", description: "Exporter en PDF / Excel", href: "/matrice-reporting/exports", icon: Download, moduleKey: "matriceReporting", group: "Reporting" },

    // Programmation
    { id: "ptm", label: "Matrice PTM", description: "Programme de Travail du Ministère", href: "/ptm/matrice", icon: FileSpreadsheet, moduleKey: "ptmptg", group: "Programmation" },
    { id: "ptm-saisie", label: "Saisie PTM", description: "Nouvelles initiatives", href: "/ptm/saisie", icon: FileText, moduleKey: "ptmptg", group: "Programmation" },

    // Publications
    { id: "documents", label: "Documents", description: "Bibliothèque documentaire", href: "/documents/app", icon: FileText, moduleKey: "documents", group: "Publications" },
    { id: "rapports", label: "Rapports", description: "Rapports institutionnels", href: "/rapports/app", icon: ClipboardCheck, moduleKey: "rapports", group: "Publications" },

    // Compte & Système
    { id: "profil", label: "Mon Profil", description: "Informations personnelles", href: "/profil", icon: User, moduleKey: "dashboard", group: "Compte" },
    { id: "securite", label: "Sécurité", description: "Mot de passe et 2FA", href: "/profil/securite", icon: Shield, moduleKey: "dashboard", group: "Compte" },
    { id: "formation", label: "Formation & Guides", description: "Documentation et tutoriels", href: "/formation", icon: GraduationCap, moduleKey: "formation", group: "Système" },
    { id: "parametres", label: "Paramètres", description: "Configuration système", href: "/parametres", icon: Settings, moduleKey: "parametres", group: "Système" },

    // Administration
    { id: "admin-users", label: "Gestion Utilisateurs", description: "Administration des comptes", href: "/admin/users", icon: Users, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-permissions", label: "Gestion Permissions", description: "Matrice rôles et droits d'accès", href: "/admin/permissions", icon: ShieldAlert, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-workflows", label: "Workflows", description: "Circuits d'approbation visuels", href: "/workflows", icon: GitBranch, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-data", label: "Import / Export", description: "Import et export de données", href: "/data-exchange", icon: Upload, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-analytics", label: "Analytique", description: "Dashboard analytique avancé", href: "/analytics", icon: PieChart, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-monitoring", label: "Monitoring", description: "Performance et Web Vitals", href: "/monitoring", icon: Gauge, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-audit", label: "Journal d'Audit", description: "Historique complet des actions", href: "/audit-log", icon: History, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-system", label: "Statistiques Système", description: "Santé et métriques serveur", href: "/system-stats", icon: Server, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-consolidated", label: "Vue Consolidée", description: "Synthèse exécutive multi-module", href: "/consolidated", icon: Crown, moduleKey: "adminUsers", group: "Administration" },
    { id: "aide", label: "Centre d'Aide", description: "FAQ, guides et raccourcis clavier", href: "/aide", icon: HelpCircle, moduleKey: "dashboard", group: "Système" },
    { id: "calendar", label: "Calendrier", description: "Planning institutionnel mensuel", href: "/calendar", icon: Calendar, moduleKey: "dashboard", group: "Système" },
    { id: "contacts", label: "Annuaire", description: "Répertoire des contacts plateforme", href: "/contacts", icon: Contact2, moduleKey: "dashboard", group: "Système" },
    { id: "admin-advanced", label: "Admin. Avancée", description: "Maintenance, feature flags, cache", href: "/admin/advanced", icon: Wrench, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-benchmark", label: "Benchmark Ministères", description: "Classement et comparaison des performances", href: "/benchmark", icon: Trophy, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-auto-reports", label: "Rapports Automatisés", description: "Planification et génération automatique", href: "/auto-reports", icon: Clock, moduleKey: "adminUsers", group: "Administration" },
    { id: "admin-live-activity", label: "Activité Temps Réel", description: "Flux en direct des actions plateforme", href: "/live-activity", icon: Activity, moduleKey: "adminUsers", group: "Administration" },
    { id: "kanban", label: "Tableau Kanban", description: "Gestion visuelle des tâches", href: "/kanban", icon: Kanban, moduleKey: "dashboard", group: "Système" },
    { id: "archives", label: "Archives & Corbeille", description: "Éléments archivés et supprimés", href: "/archives", icon: Archive, moduleKey: "dashboard", group: "Système" },
    { id: "admin-api-docs", label: "Centre API", description: "Documentation endpoints développeur", href: "/api-docs", icon: Code2, moduleKey: "adminUsers", group: "Administration" },
    { id: "organigramme", label: "Organigramme", description: "Hiérarchie institutionnelle", href: "/organigramme", icon: Network, moduleKey: "dashboard", group: "Système" },
    { id: "messagerie", label: "Messagerie", description: "Conversations internes", href: "/messagerie", icon: MessageSquare, moduleKey: "dashboard", group: "Système" },
    { id: "changelog", label: "Changelog", description: "Historique des versions", href: "/changelog", icon: History, moduleKey: "dashboard", group: "Système" },
    { id: "geo-map", label: "Carte des Institutions", description: "Répartition géographique par province", href: "/carte", icon: Globe, moduleKey: "dashboard", group: "Système" },
    { id: "surveys", label: "Sondages & Enquêtes", description: "Votes et retours internes", href: "/sondages", icon: ClipboardList, moduleKey: "dashboard", group: "Système" },
    { id: "my-dashboard", label: "Mon Dashboard", description: "Tableau de bord personnalisé", href: "/mon-dashboard", icon: Star, moduleKey: "dashboard", group: "Système" },
    { id: "kpi-builder", label: "KPI Builder", description: "Constructeur d'indicateurs personnalisés", href: "/kpi-builder", icon: Target, moduleKey: "adminUsers", group: "Administration" },
    { id: "doc-manager", label: "Gestion Documentaire", description: "Centre de documents avec métadonnées", href: "/documents", icon: FolderOpen, moduleKey: "adminUsers", group: "Administration" },
    { id: "comparison", label: "Tableau Comparatif", description: "Comparaison multi-périodes", href: "/comparatif", icon: GitCompareArrows, moduleKey: "adminUsers", group: "Administration" },
    { id: "okr", label: "OKR — Objectifs", description: "Objectifs et résultats clés", href: "/okr", icon: Flag, moduleKey: "dashboard", group: "Système" },
    { id: "alertes", label: "Alertes & Escalades", description: "Gestion des alertes et incidents", href: "/alertes", icon: Bell, moduleKey: "dashboard", group: "Système" },
    { id: "ministry-dash", label: "Dashboard Ministère", description: "Vue détaillée par ministère", href: "/ministere", icon: Building2, moduleKey: "dashboard", group: "Système" },
    { id: "workflows", label: "Workflow Builder", description: "Processus administratifs", href: "/workflows", icon: Workflow, moduleKey: "adminUsers", group: "Administration" },
    { id: "institution-dir", label: "Annuaire Institutionnel", description: "Répertoire des institutions", href: "/annuaire-institutions", icon: Landmark, moduleKey: "adminUsers", group: "Administration" },
    { id: "exec-summary", label: "Synthèse Exécutive", description: "Vue d'ensemble pour le SG", href: "/synthese", icon: Crown, moduleKey: "adminUsers", group: "Administration" },
    { id: "risk-register", label: "Registre des Risques", description: "Cartographie et suivi des risques", href: "/risques", icon: ShieldAlert, moduleKey: "adminUsers", group: "Administration" },
    { id: "provinces", label: "Dashboard Provinces", description: "Performance par province", href: "/provinces", icon: MapPin, moduleKey: "adminUsers", group: "Administration" },
    { id: "report-center", label: "Centre de Rapports", description: "Génération et téléchargement", href: "/rapports", icon: FileBarChart, moduleKey: "adminUsers", group: "Administration" },
    { id: "planning", label: "Planning Stratégique", description: "Timeline projets et jalons", href: "/planning", icon: GanttChart, moduleKey: "adminUsers", group: "Administration" },
    { id: "scorecard", label: "Balanced Scorecard", description: "4 perspectives stratégiques", href: "/scorecard", icon: Target, moduleKey: "adminUsers", group: "Administration" },
    { id: "decisions", label: "Journal des Décisions", description: "Registre chronologique des décisions", href: "/decisions", icon: BookOpen, moduleKey: "adminUsers", group: "Administration" },
    { id: "training-center", label: "Centre de Formations", description: "E-learning agents publics", href: "/formations", icon: GraduationCap, moduleKey: "dashboard", group: "Système" },
    { id: "citizen-portal", label: "Portail Citoyen", description: "Transparence et données ouvertes", href: "/portail-citoyen", icon: Globe, moduleKey: "dashboard", group: "Système" },
    { id: "live-dash", label: "Activité Temps Réel", description: "Flux d'événements en direct", href: "/live", icon: Radio, moduleKey: "adminUsers", group: "Administration" },
    { id: "alert-center", label: "Centre d'Alertes", description: "Alertes critiques et suivi", href: "/alertes", icon: Bell, moduleKey: "adminUsers", group: "Administration" },
    { id: "skills-matrix", label: "Matrice Compétences", description: "Cartographie compétences agents", href: "/competences", icon: Puzzle, moduleKey: "adminUsers", group: "Administration" },
    { id: "sla-dashboard", label: "Tableau SLA", description: "Engagements de service", href: "/sla", icon: Timer, moduleKey: "adminUsers", group: "Administration" },
    { id: "compliance-audit", label: "Audit Conformité", description: "Conformité réglementaire ministères", href: "/conformite", icon: ClipboardCheck, moduleKey: "adminUsers", group: "Administration" },
    { id: "sdg-dashboard", label: "Indicateurs ODD", description: "17 objectifs développement durable", href: "/odd", icon: Globe2, moduleKey: "adminUsers", group: "Administration" },
    { id: "meeting-manager", label: "Gestionnaire Réunions", description: "Conseil des Ministres et comités", href: "/reunions", icon: CalendarClock, moduleKey: "adminUsers", group: "Administration" },
    { id: "budget-dashboard", label: "Tableau Budgétaire", description: "Exécution budgétaire loi de finances", href: "/budget", icon: Wallet, moduleKey: "adminUsers", group: "Administration" },
    { id: "grievance-center", label: "Réclamations Citoyennes", description: "Doléances et suivi citoyen", href: "/reclamations", icon: MessageCircle, moduleKey: "adminUsers", group: "Administration" },
    { id: "workforce-dashboard", label: "Tableau des Effectifs", description: "Ressources humaines fonction publique", href: "/effectifs", icon: UsersRound, moduleKey: "adminUsers", group: "Administration" },
    { id: "energy-dashboard", label: "Tableau Énergétique", description: "Production et consommation énergie", href: "/energie", icon: Zap, moduleKey: "adminUsers", group: "Administration" },
    { id: "procurement", label: "Marchés Publics", description: "Appels d'offres et contrats", href: "/marches-publics", icon: Gavel, moduleKey: "adminUsers", group: "Administration" },
    { id: "strategic-watch", label: "Veille Stratégique", description: "Intelligence PESTLE gouvernementale", href: "/veille", icon: Eye, moduleKey: "adminUsers", group: "Administration" },
    { id: "public-health", label: "Santé Publique", description: "Indicateurs sanitaires nationaux", href: "/sante", icon: HeartPulse, moduleKey: "adminUsers", group: "Administration" },
    { id: "land-registry", label: "Registre Foncier", description: "Titres fonciers et cadastre", href: "/foncier", icon: MapPinned, moduleKey: "adminUsers", group: "Administration" },
    { id: "international-coop", label: "Coopération Internationale", description: "Partenaires et projets bilatéraux", href: "/cooperation", icon: Handshake, moduleKey: "adminUsers", group: "Administration" },
    { id: "education-dashboard", label: "Éducation Nationale", description: "Établissements, examens, effectifs scolaires", href: "/education", icon: GraduationCap, moduleKey: "adminUsers", group: "Administration" },
    { id: "ngo-registry", label: "Associations & ONG", description: "Registre officiel de la société civile", href: "/associations", icon: Heart, moduleKey: "adminUsers", group: "Administration" },
    { id: "gov-communication", label: "Communication Gouvernementale", description: "Communiqués, discours, conférences", href: "/communication", icon: Megaphone, moduleKey: "adminUsers", group: "Administration" },
    { id: "transport-dashboard", label: "Transports & Infrastructures", description: "Routes, aéroports, ports, projets", href: "/transports", icon: Truck, moduleKey: "adminUsers", group: "Administration" },
    { id: "electoral-registry", label: "Registre Électoral", description: "Inscrits, bureaux de vote, calendrier", href: "/elections", icon: Vote, moduleKey: "adminUsers", group: "Administration" },
    { id: "risk-management", label: "Gestion des Risques", description: "Alertes, catastrophes, capacité de réponse", href: "/gestion-risques", icon: Siren, moduleKey: "adminUsers", group: "Administration" },
    { id: "agriculture-dashboard", label: "Agriculture", description: "Filières, importations, projets agricoles", href: "/agriculture", icon: Wheat, moduleKey: "adminUsers", group: "Administration" },
    { id: "business-registry", label: "Registre du Commerce", description: "Entreprises, RCCM, secteurs d'activité", href: "/entreprises", icon: Briefcase, moduleKey: "adminUsers", group: "Administration" },
    { id: "legal-documentation", label: "Documentation Juridique", description: "Lois, décrets, ordonnances, JO", href: "/juridique", icon: BookOpen, moduleKey: "adminUsers", group: "Administration" },
    { id: "tourism-dashboard", label: "Tourisme & Culture", description: "Parcs nationaux, patrimoine, fréquentation", href: "/tourisme", icon: Palmtree, moduleKey: "adminUsers", group: "Administration" },
    { id: "cyber-security", label: "Cybersécurité Nationale", description: "Incidents, menaces, infrastructures critiques", href: "/cybersecurite", icon: ShieldCheck, moduleKey: "adminUsers", group: "Administration" },
    { id: "demography", label: "Démographie", description: "Population, recensement, indicateurs", href: "/demographie", icon: Users, moduleKey: "adminUsers", group: "Administration" },
    { id: "employment-dashboard", label: "Emploi & Formation", description: "Chômage, secteurs, programmes insertion", href: "/emploi", icon: Briefcase, moduleKey: "adminUsers", group: "Administration" },
    { id: "civil-registry", label: "État Civil", description: "Naissances, mariages, décès, centres", href: "/etat-civil", icon: FileText, moduleKey: "adminUsers", group: "Administration" },
    { id: "meteorology-center", label: "Centre Météo", description: "Temps réel, climat, alertes météo", href: "/meteo", icon: CloudRain, moduleKey: "adminUsers", group: "Administration" },
    { id: "media-registry", label: "Registre des Médias", description: "Presse, TV, radio, médias en ligne", href: "/medias", icon: Newspaper, moduleKey: "adminUsers", group: "Administration" },
    { id: "forestry", label: "Eaux & Forêts", description: "Forêts, concessions, bois, biodiversité", href: "/eaux-forets", icon: TreePine, moduleKey: "adminUsers", group: "Administration" },
    { id: "mining-dashboard", label: "Mines & Géologie", description: "Manganèse, or, fer, permis miniers", href: "/mines", icon: Mountain, moduleKey: "adminUsers", group: "Administration" },
    { id: "diploma-registry", label: "Registre des Diplômes", description: "Universités, certifications, CAMES", href: "/diplomes", icon: Award, moduleKey: "adminUsers", group: "Administration" },
    { id: "public-property", label: "Patrimoine Public", description: "Bâtiments, véhicules, inventaire État", href: "/patrimoine", icon: Building, moduleKey: "adminUsers", group: "Administration" },
    { id: "fishery-dashboard", label: "Pêche & Aquaculture", description: "Production halieutique, zones, espèces", href: "/peche", icon: Fish, moduleKey: "adminUsers", group: "Administration" },
    { id: "intellectual-property", label: "Propriété Intellectuelle", description: "Brevets, marques, droits auteur, OAPI", href: "/propriete-intellectuelle", icon: Lightbulb, moduleKey: "adminUsers", group: "Administration" },
    { id: "disaster-management", label: "Catastrophes Naturelles", description: "Inondations, alertes, capacité réponse", href: "/catastrophes", icon: AlertTriangle, moduleKey: "adminUsers", group: "Administration" },
    { id: "associations-registry", label: "Associations & ONG", description: "Société civile, ONG, syndicats", href: "/associations", icon: Heart, moduleKey: "adminUsers", group: "Administration" },
    { id: "public-debt", label: "Dette Publique", description: "Encours, créanciers, soutenabilité", href: "/dette-publique", icon: Landmark, moduleKey: "adminUsers", group: "Administration" },
    { id: "telecom-dashboard", label: "Télécommunications", description: "Opérateurs, couverture, fibre, projets numériques", href: "/telecom", icon: Wifi, moduleKey: "adminUsers", group: "Administration" },
    { id: "religious-registry", label: "Cultes & Confessions", description: "Églises, mosquées, temples, agrément", href: "/cultes", icon: Church, moduleKey: "adminUsers", group: "Administration" },
    { id: "migration-dashboard", label: "Migrations & Réfugiés", description: "Immigration, titres séjour, frontières", href: "/migrations", icon: Globe, moduleKey: "adminUsers", group: "Administration" },
    { id: "housing-dashboard", label: "Habitat & Urbanisme", description: "Permis construire, logements sociaux, SDAU", href: "/habitat", icon: HomeIcon, moduleKey: "adminUsers", group: "Administration" },
    { id: "sports-dashboard", label: "Sports & Jeunesse", description: "Fédérations, infrastructures, programmes jeunesse", href: "/sports", icon: Trophy, moduleKey: "adminUsers", group: "Administration" },
    { id: "social-protection", label: "Protection Sociale", description: "CNAMGS, pensions, filets sociaux, CSU", href: "/protection-sociale", icon: HeartHandshake, moduleKey: "adminUsers", group: "Administration" },
];

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { getModuleAccess } = useDemoUser();
    const moduleAccess = getModuleAccess();

    // Keyboard shortcut: Ctrl+K / ⌘K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Filter items based on module access
    const filteredItems = useMemo(() => {
        return searchableItems.filter((item) => {
            const key = item.moduleKey as keyof typeof moduleAccess;
            return moduleAccess[key] !== false;
        });
    }, [moduleAccess]);

    // Group items
    const groupedItems = useMemo(() => {
        const groups: Record<string, SearchItem[]> = {};
        filteredItems.forEach((item) => {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
        });
        return groups;
    }, [filteredItems]);

    const handleSelect = useCallback(
        (href: string) => {
            setOpen(false);
            navigate(href);
        },
        [navigate]
    );

    return (
        <>
            {/* Trigger button in header */}
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 min-w-[300px] hover:bg-muted/80 transition-colors cursor-pointer group"
            >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1 text-left">
                    Rechercher...
                </span>
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Command palette dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Rechercher une page, un module..." />
                <CommandList>
                    <CommandEmpty>
                        Aucun résultat trouvé.
                    </CommandEmpty>

                    {Object.entries(groupedItems).map(([group, items], groupIndex) => (
                        <div key={group}>
                            {groupIndex > 0 && <CommandSeparator />}
                            <CommandGroup heading={group}>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={`${item.label} ${item.description || ""}`}
                                        onSelect={() => handleSelect(item.href)}
                                        className="cursor-pointer"
                                    >
                                        <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span>{item.label}</span>
                                            {item.description && (
                                                <span className="text-xs text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </div>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    );
}
