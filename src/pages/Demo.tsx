/**
 * SGG Digital — Page Comptes de Démonstration
 * Layout en flux schématisant le processus SGG :
 * Présidence → Gouvernement → SGG → Ministères/Directions → Institutions → Public
 * Cartes compactes avec bouton "i" pour détails
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Crown,
  Building2,
  Users,
  Scale,
  BookOpen,
  Globe,
  Briefcase,
  GraduationCap,
  FileText,
  ArrowLeft,
  LogIn,
  Shield,
  Landmark,
  Gavel,
  Settings,
  Eye,
  Info,
  Sparkles,
  ArrowDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface DemoAccount {
  id: string;
  title: string;
  shortTitle?: string;
  role: string;
  institution: string;
  email?: string;
  description: string;
  icon: React.ElementType;
  flowLevel: FlowLevel;
  intensity: number;
  access: string[];
  ministereId?: string;
}

type FlowLevel =
  | "presidence"      // Président, VP de la République
  | "gouvernement"    // VPG, Ministres
  | "sgg"             // SGG admin/directeur
  | "ministeres"      // SG Ministères
  | "directions"      // Directions sous tutelle
  | "institutions"    // Assemblée, Sénat, Conseil d'État, CC, DGJO, SGPR
  | "public";         // Citoyens, Professionnels

// ─── DATA ───────────────────────────────────────────────────────────────────

const demoAccounts: DemoAccount[] = [
  // ═══ PRÉSIDENCE ═══
  {
    id: "president",
    title: "Président de la République",
    shortTitle: "Président",
    role: "Autorité Suprême",
    institution: "Présidence de la République",
    description: "Destinataire final de tous les processus. Signe les décrets de nomination, promulgue les lois, préside le Conseil des Ministres, et reçoit les rapports de performance consolidés. Vision stratégique complète.",
    icon: Crown,
    flowLevel: "presidence",
    intensity: 5,
    access: ["Tableau de Bord Exécutif", "Nominations", "Promulgation des lois", "Conseil des Ministres", "Rapports GAR/PAT", "Vue Consolidée", "Cycle Législatif", "Synthèse Exécutive", "Journal Officiel", "Matrice Reporting", "Données Sectorielles"],
  },
  {
    id: "vice-president",
    title: "Vice-Président de la République",
    shortTitle: "VP République",
    role: "Vice-Présidence de la République",
    institution: "Présidence de la République",
    description: "Peut présider le Conseil des Ministres en l'absence du Président. Accès aux rapports de synthèse, suivi des priorités présidentielles et vue consolidée.",
    icon: Crown,
    flowLevel: "presidence",
    intensity: 5,
    access: ["Conseil des Ministres", "Tableau de Bord", "Vue Consolidée", "Rapports GAR/PAT", "Cycle Législatif", "Synthèse Exécutive", "Nominations", "e-GOP", "Matrice Reporting", "Données Sectorielles", "Journal Officiel"],
  },
  // ═══ GOUVERNEMENT ═══
  {
    id: "premier-ministre",
    title: "Vice-Président du Gouvernement",
    shortTitle: "VPG",
    role: "Chef du Gouvernement",
    institution: "Vice-Présidence du Gouvernement",
    description: "Coordonne l'action des ministres, préside les conseils interministériels. Suivi opérationnel du PAG. Consolide le PTM et transmet au SGPR.",
    icon: Building2,
    flowLevel: "gouvernement",
    intensity: 4,
    access: ["Nominations (contresigne)", "Suivi GAR / PAG", "Cycle Législatif", "e-GOP / Conseil des Ministres", "Matrice Reporting", "Vue Consolidée", "Synthèse Exécutive", "Données Sectorielles"],
  },
  {
    id: "ministre",
    title: "Ministre Sectoriel",
    shortTitle: "Ministre",
    role: "Membre du Gouvernement",
    institution: "Ministère (ex: Économie)",
    description: "Propose les textes et nominations. Consultation des matrices de reporting et suivi sectoriel.",
    icon: Briefcase,
    flowLevel: "gouvernement",
    intensity: 4,
    access: ["Nominations (propose)", "Suivi GAR", "Cycle Législatif (rédige)", "e-GOP / Conseil des Ministres", "Matrice Reporting", "Données Sectorielles"],
  },
  // ═══ SGG (centre du processus) ═══
  {
    id: "sgg-admin",
    title: "Administrateur SGG",
    shortTitle: "Admin SGG",
    role: "Admin Système",
    institution: "SGG — DCSI",
    email: "admin.systeme@sgg.ga",
    description: "Configuration complète de la plateforme. Accès à tous les modules, gestion des utilisateurs et des rôles.",
    icon: Settings,
    flowLevel: "sgg",
    intensity: 5,
    access: ["Administration", "Nominations", "Suivi GAR", "Journal Officiel", "Cycle Législatif", "e-GOP", "Institutions", "Matrice Reporting", "Vue Consolidée", "Synthèse Exécutive", "Données Sectorielles"],
  },
  {
    id: "sgg-directeur",
    title: "Directeur SGG",
    shortTitle: "Dir. SGG",
    role: "Direction",
    institution: "SGG",
    email: "jp.nzoghe@sgg.ga",
    description: "Lecture et édition sur périmètre. Validation des rapports ministériels, consolidation PTM des ministères et suivi des indicateurs.",
    icon: GraduationCap,
    flowLevel: "sgg",
    intensity: 4,
    access: ["Nominations", "Suivi GAR", "Cycle Législatif", "e-GOP", "Matrice Reporting", "Vue Consolidée", "Synthèse Exécutive", "Données Sectorielles"],
  },
  // ═══ SG MINISTÈRES ═══
  {
    id: "sg-ministere",
    title: "SG Min. Énergie et Eau",
    shortTitle: "SG Énergie",
    role: "Interface Opérationnelle",
    institution: "Ministère de l'Énergie et de l'Eau",
    ministereId: "min-energie",
    description: "SG du Ministère de l'Énergie — pilote de 2 programmes PAG (Électricité & Eau Potable). Saisie des rapports mensuels. Consolide les PTM de ses directions.",
    icon: Users,
    flowLevel: "ministeres",
    intensity: 4,
    access: ["Saisie GAR", "Nominations (signale)", "Institutions", "Matrice Reporting", "Données Sectorielles"],
  },
  {
    id: "sg-ministere",
    title: "SG Min. Santé",
    shortTitle: "SG Santé",
    role: "Interface Opérationnelle",
    institution: "Ministère de la Santé",
    ministereId: "min-sante",
    description: "SG du Ministère de la Santé — pilote du programme CSU et co-responsable sur le programme Eau Potable.",
    icon: Users,
    flowLevel: "ministeres",
    intensity: 4,
    access: ["Saisie GAR", "Nominations (signale)", "Institutions", "Matrice Reporting", "Données Sectorielles"],
  },
  {
    id: "sg-ministere",
    title: "SG Min. Défense",
    shortTitle: "SG Défense",
    role: "Interface Opérationnelle",
    institution: "Ministère de la Défense Nationale",
    ministereId: "min-defense",
    description: "SG du Ministère de la Défense — co-responsable sur les programmes Routes et Justice & Sécurité.",
    icon: Users,
    flowLevel: "ministeres",
    intensity: 4,
    access: ["Saisie GAR", "Nominations (signale)", "Institutions", "Matrice Reporting", "Données Sectorielles"],
  },
  {
    id: "sg-ministere-fp",
    title: "SG Min. Fonction Publique",
    shortTitle: "SG Fonc. Pub.",
    role: "Interface Opérationnelle",
    institution: "Ministère de la Fonction Publique",
    ministereId: "min-fonction-publique",
    description: "SG du Ministère de la Fonction Publique — consolide les matrices des directions (DGFP, ENAP) et transmet au SGG.",
    icon: Users,
    flowLevel: "ministeres",
    intensity: 4,
    access: ["Saisie GAR", "Nominations (signale)", "Institutions", "Matrice Reporting", "Données Sectorielles"],
  },
  // ═══ DIRECTIONS SOUS TUTELLE ═══
  {
    id: "directeur-cgi",
    title: "Dir. CGI (Éco Numérique)",
    shortTitle: "Dir. CGI",
    role: "Direction sous tutelle",
    institution: "Centre Gabonais d'Informatique",
    ministereId: "min-numerique",
    description: "Directeur du CGI — remplit la matrice PTM pour sa direction et la transmet au SG du ministère.",
    icon: Layers,
    flowLevel: "directions",
    intensity: 3,
    access: ["Saisie PTM", "Matrice PTM Direction"],
  },
  {
    id: "directeur-dgpn",
    title: "Dir. DGPN (Éco Numérique)",
    shortTitle: "Dir. DGPN",
    role: "Direction sous tutelle",
    institution: "Dir. Générale Programmation Numérique",
    ministereId: "min-numerique",
    description: "Directeur de la DGPN — saisit les initiatives numériques et les transmet au SG.",
    icon: Layers,
    flowLevel: "directions",
    intensity: 3,
    access: ["Saisie PTM", "Matrice PTM Direction"],
  },
  // ═══ INSTITUTIONS ═══
  {
    id: "sgpr",
    title: "SGPR",
    shortTitle: "SGPR",
    role: "Secrétariat Général Présidence",
    institution: "Présidence de la République",
    description: "Coordination stratégique, transmission des dossiers. Validation des matrices de reporting au niveau SGPR.",
    icon: Shield,
    flowLevel: "institutions",
    intensity: 5,
    access: ["Nominations", "Suivi GAR", "e-GOP", "Matrice Reporting", "Vue Consolidée", "Synthèse Exécutive", "Données Sectorielles"],
  },
  {
    id: "assemblee",
    title: "Assemblée Nationale",
    shortTitle: "Assemblée",
    role: "Chambre Législative",
    institution: "Parlement",
    description: "Réception et examen des projets de loi. Suivi du cycle législatif complet.",
    icon: Landmark,
    flowLevel: "institutions",
    intensity: 4,
    access: ["Cycle Législatif (examen et vote)", "Journal Officiel"],
  },
  {
    id: "senat",
    title: "Sénat",
    shortTitle: "Sénat",
    role: "Chambre Haute",
    institution: "Parlement",
    description: "Réception des projets de loi adoptés par l'Assemblée. Examen en seconde lecture.",
    icon: Landmark,
    flowLevel: "institutions",
    intensity: 4,
    access: ["Cycle Législatif (examen seconde lecture)", "Journal Officiel"],
  },
  {
    id: "conseil-etat",
    title: "Conseil d'État",
    shortTitle: "Conseil d'État",
    role: "Juridiction Administrative",
    institution: "Conseil d'État",
    description: "Avis consultatifs sur les projets de textes législatifs et réglementaires.",
    icon: Gavel,
    flowLevel: "institutions",
    intensity: 4,
    access: ["Cycle Législatif (avis juridique)", "Journal Officiel"],
  },
  {
    id: "cour-constitutionnelle",
    title: "Cour Constitutionnelle",
    shortTitle: "Cour Const.",
    role: "Contrôle Constitutionnel",
    institution: "Cour Constitutionnelle",
    description: "Contrôle de constitutionnalité des lois et ordonnances. Garant de la constitutionnalité.",
    icon: Scale,
    flowLevel: "institutions",
    intensity: 3,
    access: ["Cycle Législatif (contrôle constitutionnel)", "Journal Officiel"],
  },
  {
    id: "dgjo",
    title: "Direction Journal Officiel",
    shortTitle: "DGJO",
    role: "Publication",
    institution: "DGJO (rattachée SGG)",
    email: "direction@jo.ga",
    description: "Publication et gestion du Journal Officiel. Consolidation des textes législatifs et réglementaires.",
    icon: BookOpen,
    flowLevel: "institutions",
    intensity: 5,
    access: ["Journal Officiel (publication)", "Archivage", "Consolidation Textes"],
  },
  // ═══ PUBLIC ═══
  {
    id: "citoyen",
    title: "Citoyen",
    shortTitle: "Citoyen",
    role: "Accès Public",
    institution: "Grand Public",
    description: "Consultation du Journal Officiel et recherche de textes publiés. Accès en lecture libre.",
    icon: Globe,
    flowLevel: "public",
    intensity: 2,
    access: ["Journal Officiel (consultation publique)"],
  },
  {
    id: "professionnel-droit",
    title: "Professionnel du Droit",
    shortTitle: "Pro. Droit",
    role: "Accès Public",
    institution: "Avocats, Notaires, Juristes",
    description: "Consultation avancée des textes juridiques avec filtres et recherche full-text. Accès API.",
    icon: FileText,
    flowLevel: "public",
    intensity: 2,
    access: ["Journal Officiel (consultation avancée)", "Recherche Full-text", "API"],
  },
];

// Flow level config — ordered to show the process chain
const flowConfig: Record<FlowLevel, {
  label: string;
  sublabel: string;
  color: string;
  accent: string;
  bgCard: string;
  borderCard: string;
  icon: React.ElementType;
}> = {
  presidence: {
    label: "Présidence",
    sublabel: "Destinataire final",
    color: "bg-amber-600 text-white",
    accent: "bg-amber-600",
    bgCard: "bg-amber-50 dark:bg-amber-950/20",
    borderCard: "border-amber-200 dark:border-amber-800/40",
    icon: Crown,
  },
  gouvernement: {
    label: "Gouvernement",
    sublabel: "Chef du Gouvernement & Ministres",
    color: "bg-government-navy text-white",
    accent: "bg-government-navy",
    bgCard: "bg-blue-50 dark:bg-blue-950/20",
    borderCard: "border-blue-200 dark:border-blue-800/40",
    icon: Building2,
  },
  sgg: {
    label: "SGG",
    sublabel: "Centre de coordination",
    color: "bg-indigo-600 text-white",
    accent: "bg-indigo-600",
    bgCard: "bg-indigo-50 dark:bg-indigo-950/20",
    borderCard: "border-indigo-200 dark:border-indigo-800/40",
    icon: Settings,
  },
  ministeres: {
    label: "SG Ministères",
    sublabel: "Consolident les directions → poussent au SGG",
    color: "bg-sky-600 text-white",
    accent: "bg-sky-600",
    bgCard: "bg-sky-50 dark:bg-sky-950/20",
    borderCard: "border-sky-200 dark:border-sky-800/40",
    icon: Users,
  },
  directions: {
    label: "Directions",
    sublabel: "Remplissent la matrice PTM → poussent au SG",
    color: "bg-teal-600 text-white",
    accent: "bg-teal-600",
    bgCard: "bg-teal-50 dark:bg-teal-950/20",
    borderCard: "border-teal-200 dark:border-teal-800/40",
    icon: Layers,
  },
  institutions: {
    label: "Institutions",
    sublabel: "Parlement, Juridictions, SGPR, DGJO",
    color: "bg-emerald-600 text-white",
    accent: "bg-emerald-600",
    bgCard: "bg-emerald-50 dark:bg-emerald-950/20",
    borderCard: "border-emerald-200 dark:border-emerald-800/40",
    icon: Landmark,
  },
  public: {
    label: "Accès Public",
    sublabel: "Citoyens & Professionnels",
    color: "bg-gray-600 text-white",
    accent: "bg-gray-600",
    bgCard: "bg-gray-50 dark:bg-gray-950/20",
    borderCard: "border-gray-200 dark:border-gray-700/40",
    icon: Eye,
  },
};

const FLOW_ORDER: FlowLevel[] = [
  "presidence",
  "gouvernement",
  "sgg",
  "ministeres",
  "directions",
  "institutions",
  "public",
];

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Demo() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const flowGroups = useMemo(() => {
    return FLOW_ORDER
      .map((level) => ({
        level,
        config: flowConfig[level],
        accounts: demoAccounts.filter((a) => a.flowLevel === level),
      }))
      .filter((g) => g.accounts.length > 0);
  }, []);

  const handleDemoAccess = (account: DemoAccount) => {
    const key = account.ministereId || account.id;
    setLoadingId(key);
    sessionStorage.setItem(
      "demoUser",
      JSON.stringify({
        id: account.id,
        title: account.title,
        role: account.role,
        institution: account.institution,
        email: account.email,
        access: account.access,
        category: account.flowLevel,
        ministereId: account.ministereId || undefined,
      })
    );
    setTimeout(() => {
      switch (account.flowLevel) {
        case "public":
          navigate("/journal-officiel");
          break;
        default:
          navigate("/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-background dark:from-gray-950 dark:to-background">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img
              src="/emblem_gabon.png"
              alt="Emblème du Gabon"
              className="h-8 w-8 object-contain shrink-0"
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                Présidence de la République
              </span>
              <span className="font-serif font-bold text-xs uppercase text-foreground">
                SGG Digital
              </span>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">
            <Sparkles className="h-3 w-3 mr-1" />
            Mode Démo
          </Badge>
        </div>
      </header>

      {/* ── HERO (compact) ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-government-navy text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDAgTDQwIDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Comptes de Démonstration
          </h1>
          <p className="text-white/70 max-w-2xl text-sm leading-relaxed">
            Choisissez un profil pour explorer SGG Digital. Les comptes sont organisés selon le processus gouvernemental — du sommet de l'État jusqu'au citoyen.
          </p>
        </div>
      </section>

      {/* ── FLOW CHAIN ─────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-2">
          {flowGroups.map((group, groupIndex) => {
            const isCenter = group.level === "sgg";
            return (
              <div key={group.level}>
                {/* Arrow connector between levels */}
                {groupIndex > 0 && (
                  <div className="flex justify-center py-1">
                    <div className="flex flex-col items-center">
                      <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  </div>
                )}

                {/* Level section */}
                <div
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    isCenter
                      ? "ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/30"
                      : "",
                    group.config.bgCard,
                    group.config.borderCard
                  )}
                >
                  {/* Level header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold", group.config.color)}>
                      <group.config.icon className="h-3.5 w-3.5" />
                      {group.config.label}
                    </div>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      {group.config.sublabel}
                    </span>
                    {isCenter && (
                      <Badge className="ml-auto bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700">
                        Centre du processus
                      </Badge>
                    )}
                  </div>

                  {/* Cards grid */}
                  <div className={cn(
                    "grid gap-2",
                    group.accounts.length <= 2
                      ? "grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto"
                      : group.accounts.length <= 4
                        ? "grid-cols-2 sm:grid-cols-4"
                        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                  )}>
                    {group.accounts.map((account) => {
                      const accountKey = account.ministereId || account.id;
                      const isLoading = loadingId === accountKey;

                      return (
                        <CompactCard
                          key={`${accountKey}-${account.title}`}
                          account={account}
                          accent={group.config.accent}
                          isLoading={isLoading}
                          disabled={!!loadingId}
                          onConnect={() => handleDemoAccess(account)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-8 pb-4">
          SGG Digital — Mode Démonstration — Les données affichées sont fictives
        </p>
      </main>
    </div>
  );
}

// ─── COMPACT CARD WITH INFO BUTTON ──────────────────────────────────────────

function CompactCard({
  account,
  accent,
  isLoading,
  disabled,
  onConnect,
}: {
  account: DemoAccount;
  accent: string;
  isLoading: boolean;
  disabled: boolean;
  onConnect: () => void;
}) {
  const Icon = account.icon;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 cursor-pointer border",
        isLoading
          ? "ring-2 ring-government-gold scale-[0.97] opacity-80"
          : "hover:shadow-md hover:border-government-gold/40 hover:-translate-y-0.5"
      )}
      onClick={() => !disabled && onConnect()}
    >
      {/* Accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", accent, "group-hover:h-1 transition-all")} />

      <CardContent className="p-3 pt-3">
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 group-hover:scale-105 transition-transform">
            <Icon className="h-4 w-4 text-foreground/70" />
          </div>

          {/* Title + role */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs leading-tight text-foreground truncate">
              {account.shortTitle || account.title}
            </h3>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {account.role}
            </p>
          </div>

          {/* Info button */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Plus d'informations"
              >
                <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-72 p-0"
              side="top"
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">{account.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{account.institution}</p>
                  {account.email && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{account.email}</p>
                  )}
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] mb-2">{account.role}</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {account.description}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Accès aux modules
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {account.access.map((acc) => (
                      <span
                        key={acc}
                        className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Connect button */}
        <Button
          variant="default"
          size="sm"
          className={cn(
            "w-full mt-2.5 h-7 text-[11px] font-medium transition-all",
            "bg-government-navy hover:bg-government-navy/90 text-white",
          )}
          disabled={disabled}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connexion...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <LogIn className="h-3 w-3" />
              Se connecter
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
