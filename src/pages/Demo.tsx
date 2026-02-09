/**
 * SGG Digital — Page Comptes de Démonstration
 * UX améliorée : recherche, filtres par catégorie, cartes adaptatives,
 * textes non tronqués, animations de feedback, responsive complet
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  LogIn,
  Shield,
  Landmark,
  Gavel,
  Settings,
  Eye,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface DemoAccount {
  id: string;
  title: string;
  role: string;
  institution: string;
  email?: string;
  description: string;
  icon: React.ElementType;
  category: DemoCategory;
  intensity: number;
  access: string[];
  /** ID du ministère rattaché (pour sg-ministere / ministre) */
  ministereId?: string;
}

type DemoCategory = "executif" | "presidence" | "legislatif" | "juridictionnel" | "administratif" | "public";

// ─── DATA ───────────────────────────────────────────────────────────────────

const demoAccounts: DemoAccount[] = [
  {
    id: "president",
    title: "President de la Republique",
    role: "Autorite Supreme",
    institution: "Presidence de la Republique",
    description: "Destinataire des dossiers, autorite supreme. Vision globale de tous les indicateurs de performance et pilotage strategique.",
    icon: Crown,
    category: "executif",
    intensity: 5,
    access: ["Tableau de Bord Executif", "Nominations", "Decisions"],
  },
  {
    id: "vice-president",
    title: "Vice-President de la Republique",
    role: "Vice-Presidence",
    institution: "Presidence de la Republique",
    description: "Peut presider le Conseil des Ministres. Acces aux rapports de synthese et suivi des priorites presidentielles.",
    icon: Crown,
    category: "executif",
    intensity: 5,
    access: ["Conseil des Ministres", "Tableau de Bord"],
  },
  {
    id: "premier-ministre",
    title: "Premier Ministre",
    role: "Chef du Gouvernement",
    institution: "Primature",
    description: "Coordonne l'action des ministres, preside les conseils interministeriels. Suivi operationnel du PAG.",
    icon: Building2,
    category: "executif",
    intensity: 4,
    access: ["Conseils Interministeriels", "Coordination", "Reporting"],
  },
  {
    id: "ministre",
    title: "Ministre Sectoriel",
    role: "Membre du Gouvernement",
    institution: "Ministere (ex: Economie)",
    description: "Propose les textes et nominations. Consultation des matrices de reporting et suivi sectoriel.",
    icon: Briefcase,
    category: "executif",
    intensity: 4,
    access: ["Propositions", "Nominations", "Reporting GAR", "Matrice Reporting"],
  },
  {
    id: "sg-ministere",
    title: "SG Min. Énergie et Eau",
    role: "Interface Operationnelle",
    institution: "Ministère de l'Énergie et de l'Eau",
    ministereId: "min-energie",
    description: "SG du Ministère de l'Énergie — pilote de 2 programmes PAG (Électricité & Eau Potable). Saisie des rapports mensuels.",
    icon: Users,
    category: "executif",
    intensity: 4,
    access: ["Saisie GAR", "Suivi Nominations", "Documents", "Matrice Reporting"],
  },
  {
    id: "sg-ministere",
    title: "SG Min. Santé",
    role: "Interface Operationnelle",
    institution: "Ministère de la Santé",
    ministereId: "min-sante",
    description: "SG du Ministère de la Santé — pilote du programme CSU et co-responsable sur le programme Eau Potable.",
    icon: Users,
    category: "executif",
    intensity: 4,
    access: ["Saisie GAR", "Suivi Nominations", "Documents", "Matrice Reporting"],
  },
  {
    id: "sg-ministere",
    title: "SG Min. Défense",
    role: "Interface Operationnelle",
    institution: "Ministère de la Défense Nationale",
    ministereId: "min-defense",
    description: "SG du Ministère de la Défense — co-responsable sur les programmes Routes et Justice & Sécurité.",
    icon: Users,
    category: "executif",
    intensity: 4,
    access: ["Saisie GAR", "Suivi Nominations", "Documents", "Matrice Reporting"],
  },
  // ===== PERSONAS PTM — Directions sous tutelle =====
  {
    id: "directeur-cgi",
    title: "Dir. CGI (Éco Numérique)",
    role: "Direction sous tutelle",
    institution: "Centre Gabonais d'Informatique",
    ministereId: "min-numerique",
    description: "Directeur du CGI — remplit la matrice PTM pour sa direction et la transmet au SG du ministère.",
    icon: Users,
    category: "executif",
    intensity: 3,
    access: ["Saisie PTM", "Matrice PTM Direction"],
  },
  {
    id: "directeur-dgpn",
    title: "Dir. DGPN (Éco Numérique)",
    role: "Direction sous tutelle",
    institution: "Direction Générale de la Programmation Numérique",
    ministereId: "min-numerique",
    description: "Directeur de la DGPN — saisit les initiatives numériques et les transmet au SG.",
    icon: Users,
    category: "executif",
    intensity: 3,
    access: ["Saisie PTM", "Matrice PTM Direction"],
  },
  {
    id: "sg-ministere-fp",
    title: "SG Min. Fonction Publique",
    role: "Interface Opérationnelle",
    institution: "Ministère de la Fonction Publique",
    ministereId: "min-fonction-publique",
    description: "SG du Ministère de la Fonction Publique — consolide les matrices des directions (DGFP, ENAP) et transmet au SGG.",
    icon: Users,
    category: "executif",
    intensity: 4,
    access: ["Consolidation PTM", "Saisie GAR", "Documents", "Matrice Reporting"],
  },
  {
    id: "sgpr",
    title: "SGPR",
    role: "Secretariat General Presidence",
    institution: "Presidence de la Republique",
    description: "Coordination strategique, transmission des dossiers. Validation des matrices de reporting au niveau SGPR.",
    icon: Shield,
    category: "presidence",
    intensity: 5,
    access: ["Lecture Complete", "Arbitrages", "Decisions Presidentielles", "Matrice SGPR"],
  },
  {
    id: "assemblee",
    title: "Assemblee Nationale",
    role: "Chambre Legislative",
    institution: "Parlement",
    description: "Reception et examen des projets de loi. Suivi du cycle legislatif complet.",
    icon: Landmark,
    category: "legislatif",
    intensity: 4,
    access: ["Projets de Loi", "Suivi Legislatif"],
  },
  {
    id: "senat",
    title: "Senat",
    role: "Chambre Haute",
    institution: "Parlement",
    description: "Reception des projets de loi adoptes par l'Assemblee. Examen en seconde lecture.",
    icon: Landmark,
    category: "legislatif",
    intensity: 4,
    access: ["Projets de Loi", "Suivi Legislatif"],
  },
  {
    id: "conseil-etat",
    title: "Conseil d'Etat",
    role: "Juridiction Administrative",
    institution: "Conseil d'Etat",
    description: "Avis consultatifs sur les projets de textes legislatifs et reglementaires.",
    icon: Gavel,
    category: "juridictionnel",
    intensity: 4,
    access: ["Consultation Textes", "Avis Juridiques"],
  },
  {
    id: "cour-constitutionnelle",
    title: "Cour Constitutionnelle",
    role: "Controle Constitutionnel",
    institution: "Cour Constitutionnelle",
    description: "Controle de constitutionnalite des lois et ordonnances. Garant de la constitutionnalite.",
    icon: Scale,
    category: "juridictionnel",
    intensity: 3,
    access: ["Controle Constitutionnel", "Textes"],
  },
  {
    id: "sgg-admin",
    title: "Administrateur SGG",
    role: "Admin Systeme",
    institution: "SGG — DCSI",
    email: "admin.systeme@sgg.ga",
    description: "Configuration complete de la plateforme. Acces a tous les modules, gestion des utilisateurs et des roles.",
    icon: Settings,
    category: "administratif",
    intensity: 5,
    access: ["Configuration", "Tous Modules", "Administration", "Matrice Admin"],
  },
  {
    id: "sgg-directeur",
    title: "Directeur SGG",
    role: "Direction",
    institution: "SGG",
    email: "jp.nzoghe@sgg.ga",
    description: "Lecture et edition sur perimetre. Validation des rapports ministeriels et suivi des indicateurs.",
    icon: GraduationCap,
    category: "administratif",
    intensity: 4,
    access: ["Lecture", "Edition Perimetre", "Validation", "Matrice Validation"],
  },
  {
    id: "dgjo",
    title: "Direction Journal Officiel",
    role: "Publication",
    institution: "DGJO (rattachee SGG)",
    email: "direction@jo.ga",
    description: "Publication et gestion du Journal Officiel. Consolidation des textes legislatifs et reglementaires.",
    icon: BookOpen,
    category: "administratif",
    intensity: 5,
    access: ["Publication JO", "Consolidation Textes", "Archives"],
  },
  {
    id: "citoyen",
    title: "Citoyen",
    role: "Acces Public",
    institution: "Grand Public",
    description: "Consultation du Journal Officiel et recherche de textes publies. Acces en lecture libre.",
    icon: Globe,
    category: "public",
    intensity: 2,
    access: ["Journal Officiel", "Recherche Textes"],
  },
  {
    id: "professionnel-droit",
    title: "Professionnel du Droit",
    role: "Acces Public",
    institution: "Avocats, Notaires, Juristes",
    description: "Consultation avancee des textes juridiques avec filtres et recherche full-text. Acces API.",
    icon: FileText,
    category: "public",
    intensity: 2,
    access: ["Journal Officiel", "Recherche Avancee", "API"],
  },
];

const categoryConfig: Record<DemoCategory, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
}> = {
  executif: {
    label: "Executif",
    color: "bg-government-navy text-white",
    bgColor: "bg-government-navy/5",
    borderColor: "border-government-navy/20",
    icon: Crown,
    description: "Gouvernement et ministeres",
  },
  presidence: {
    label: "Presidence",
    color: "bg-amber-500 text-white",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Shield,
    description: "Coordination strategique",
  },
  legislatif: {
    label: "Legislatif",
    color: "bg-blue-600 text-white",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Landmark,
    description: "Parlement et chambres",
  },
  juridictionnel: {
    label: "Juridictionnel",
    color: "bg-emerald-600 text-white",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Gavel,
    description: "Juridictions et controle",
  },
  administratif: {
    label: "Administratif SGG",
    color: "bg-indigo-600 text-white",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: Settings,
    description: "Equipe technique SGG",
  },
  public: {
    label: "Acces Public",
    color: "bg-gray-600 text-white",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Eye,
    description: "Citoyens et professionnels",
  },
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Demo() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<DemoCategory | "all">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    let accounts = demoAccounts;

    if (activeCategory !== "all") {
      accounts = accounts.filter((a) => a.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      accounts = accounts.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.institution.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.access.some((acc) => acc.toLowerCase().includes(q))
      );
    }

    return accounts;
  }, [search, activeCategory]);

  // Group by category
  const groupedAccounts = useMemo(() => {
    const categories = Object.keys(categoryConfig) as DemoCategory[];
    return categories
      .map((cat) => ({
        category: cat,
        config: categoryConfig[cat],
        accounts: filteredAccounts.filter((a) => a.category === cat),
      }))
      .filter((g) => g.accounts.length > 0);
  }, [filteredAccounts]);

  const handleDemoAccess = (account: DemoAccount) => {
    setLoadingId(account.ministereId || account.id);
    sessionStorage.setItem(
      "demoUser",
      JSON.stringify({
        id: account.id,
        title: account.title,
        role: account.role,
        institution: account.institution,
        email: account.email,
        access: account.access,
        category: account.category,
        ministereId: account.ministereId || undefined,
      })
    );

    // Slight delay for visual feedback
    setTimeout(() => {
      switch (account.category) {
        case "public":
          navigate("/journal-officiel");
          break;
        default:
          navigate("/dashboard");
      }
    }, 400);
  };

  const totalCount = demoAccounts.length;
  const filteredCount = filteredAccounts.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-background dark:from-gray-950 dark:to-background">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img
              src="/emblem_gabon.png"
              alt="Embleme du Gabon"
              className="h-8 w-8 object-contain shrink-0"
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                Presidence de la Republique
              </span>
              <span className="font-serif font-bold text-xs uppercase text-foreground">
                SGG Digital
              </span>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">
            <Sparkles className="h-3 w-3 mr-1" />
            Mode Demo
          </Badge>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-government-navy text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDAgTDQwIDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Comptes de Demonstration
          </h1>
          <p className="text-white/70 max-w-2xl text-sm sm:text-base leading-relaxed">
            Explorez SGG Digital selon differents profils. Chaque compte offre
            une vue adaptee au role institutionnel avec des donnees fictives.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {Object.entries(categoryConfig).map(([key, cfg]) => {
              const count = demoAccounts.filter((a) => a.category === key).length;
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-white/80"
                >
                  <cfg.icon className="h-3 w-3" />
                  <span>{cfg.label}</span>
                  <span className="bg-white/20 rounded-full px-1.5 text-[10px] font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FILTERS ───────────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un compte, role, institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeCategory === "all"
                    ? "bg-government-navy text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Tous ({totalCount})
              </button>
              {(Object.entries(categoryConfig) as [DemoCategory, typeof categoryConfig[DemoCategory]][]).map(
                ([key, cfg]) => {
                  const count = demoAccounts.filter((a) => a.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                        activeCategory === key
                          ? cn(cfg.color, "shadow-sm")
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <cfg.icon className="h-3 w-3" />
                      {cfg.label} ({count})
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Active filters info */}
          {(search || activeCategory !== "all") && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>
                {filteredCount} resultat{filteredCount > 1 ? "s" : ""}
                {filteredCount < totalCount && ` sur ${totalCount}`}
              </span>
              {(search || activeCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                  className="text-government-navy hover:underline font-medium"
                >
                  Reinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ACCOUNTS GRID ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {filteredCount === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucun compte trouve</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Essayez un autre terme de recherche ou categorie.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
            >
              Voir tous les comptes
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedAccounts.map((group) => (
              <section key={group.category}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold",
                      group.config.color
                    )}
                  >
                    <group.config.icon className="h-4 w-4" />
                    {group.config.label}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {group.config.description} — {group.accounts.length} compte{group.accounts.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Cards grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.accounts.map((account) => {
                    const accountKey = account.ministereId || account.id;
                    const isLoading = loadingId === accountKey;

                    return (
                      <Card
                        key={accountKey}
                        className={cn(
                          "group relative overflow-hidden transition-all duration-300 cursor-pointer border",
                          group.config.borderColor,
                          isLoading
                            ? "ring-2 ring-government-gold scale-[0.98] opacity-80"
                            : "hover:shadow-lg hover:border-government-gold/40 hover:-translate-y-0.5"
                        )}
                        onClick={() => !loadingId && handleDemoAccess(account)}
                      >
                        {/* Category accent bar */}
                        <div
                          className={cn(
                            "absolute top-0 left-0 right-0 h-1 transition-all",
                            group.config.color.replace("text-white", ""),
                            "group-hover:h-1.5"
                          )}
                        />

                        <CardContent className="p-4 pt-5">
                          {/* Top row: icon + title + intensity */}
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                                group.config.bgColor,
                                "group-hover:scale-105"
                              )}
                            >
                              <account.icon className="h-5 w-5 text-foreground/70" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm leading-tight text-foreground">
                                {account.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {account.institution}
                              </p>
                            </div>
                            {/* Intensity stars */}
                            <div className="shrink-0 flex gap-px">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "text-[10px] leading-none",
                                    i <= account.intensity
                                      ? "text-amber-500"
                                      : "text-gray-300 dark:text-gray-700"
                                  )}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Role badge */}
                          <div className="mt-2.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-medium",
                                group.config.borderColor
                              )}
                            >
                              {account.role}
                            </Badge>
                          </div>

                          {/* Description — never truncated */}
                          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                            {account.description}
                          </p>

                          {/* Access badges — wrap freely, never truncated */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {account.access.map((acc) => (
                              <span
                                key={acc}
                                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                              >
                                {acc}
                              </span>
                            ))}
                          </div>

                          {/* Email if available */}
                          {account.email && (
                            <p className="text-[10px] text-muted-foreground/60 mt-2 truncate">
                              {account.email}
                            </p>
                          )}

                          {/* CTA Button */}
                          <Button
                            variant="default"
                            size="sm"
                            className={cn(
                              "w-full mt-3 h-9 text-xs font-medium transition-all",
                              "bg-government-navy hover:bg-government-navy/90 text-white",
                              "group-hover:shadow-sm"
                            )}
                            disabled={!!loadingId}
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Connexion...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <LogIn className="h-3.5 w-3.5" />
                                Se connecter
                                <ChevronRight className="h-3 w-3 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </span>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ── LEGEND ────────────────────────────────────────────────── */}
        <div className="mt-10 p-5 rounded-xl bg-muted/40 border">
          <h3 className="font-semibold text-sm mb-3">Legende — Intensite de Relation avec le SGG</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            {[
              { stars: 5, label: "Tres etroite" },
              { stars: 4, label: "Frequente" },
              { stars: 3, label: "Reguliere" },
              { stars: 2, label: "Occasionnelle" },
            ].map(({ stars, label }) => (
              <div key={stars} className="flex items-center gap-2">
                <div className="flex gap-px">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-xs",
                        i <= stars ? "text-amber-500" : "text-gray-300 dark:text-gray-700"
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/50 mt-8 pb-4">
          SGG Digital — Mode Demonstration — Les donnees affichees sont fictives
        </p>
      </main>
    </div>
  );
}
