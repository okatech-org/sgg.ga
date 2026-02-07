/**
 * SGG Digital — Page Matrice de Reporting PAG 2026
 * Vue principale avec tableau, filtres, statistiques et panneau de détail
 */

import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table2,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Search,
  FileSpreadsheet,
  FileText,
  FileDown,
  X,
  RotateCcw,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  Send,
  ShieldCheck,
  CircleDot,
  Activity,
  Target,
  CalendarDays,
  Building2,
  Users,
  Briefcase,
  Scale,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoUser } from "@/hooks/useDemoUser";
import { InfoButton } from "@/components/reporting/InfoButton";
import { useMatricePermissions } from "@/hooks/useMatricePermissions";
import { MatriceTable } from "@/components/reporting/MatriceTable";
import { StatutBadge } from "@/components/reporting/StatutBadge";
import { ProgressGauge } from "@/components/reporting/ProgressGauge";
import {
  PILIERS,
  PROGRAMMES,
  GOUVERNANCES,
  RAPPORTS_MENSUELS,
} from "@/data/reportingData";
import type {
  MatriceReportingRow,
  StatutProgramme,
  StatutValidation,
} from "@/types/reporting";
import {
  STATUT_PROGRAMME_LABELS,
  STATUT_VALIDATION_LABELS,
} from "@/types/reporting";

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Icône de statut validation pour le panneau détail
const VALIDATION_STEPS = [
  { key: 'brouillon', label: 'Brouillon', icon: CircleDot },
  { key: 'soumis', label: 'Soumis', icon: Send },
  { key: 'valide_sgg', label: 'Validé SGG', icon: CheckCircle2 },
  { key: 'valide_sgpr', label: 'Validé SGPR', icon: ShieldCheck },
] as const;

export default function MatriceReporting() {
  const { demoUser } = useDemoUser();
  const permissions = useMatricePermissions();

  // Filtres
  const [mois, setMois] = useState(1);
  const [annee, setAnnee] = useState(2026);
  const [pilierId, setPilierId] = useState<string>("all");
  const [statutProgramme, setStatutProgramme] = useState<string>("all");
  const [ministereId, setMinistereId] = useState<string>("all");
  const [recherche, setRecherche] = useState("");

  // Panneau de détail
  const [selectedRow, setSelectedRow] = useState<MatriceReportingRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Construire les données de la matrice
  const matriceData: MatriceReportingRow[] = useMemo(() => {
    return PROGRAMMES.map((prog) => {
      const pilier = PILIERS.find((p) => p.id === prog.pilierId)!;
      const gouvernance = GOUVERNANCES.find((g) => g.programmeId === prog.id)!;
      const rapport = RAPPORTS_MENSUELS.find(
        (r) => r.programmeId === prog.id && r.periodeMois === mois && r.periodeAnnee === annee
      ) || null;

      return { programme: prog, pilier, gouvernance, rapport };
    });
  }, [mois, annee]);

  // Filtrage
  const filteredData = useMemo(() => {
    let data = matriceData;

    if (pilierId !== "all") {
      data = data.filter((r) => r.pilier.id === parseInt(pilierId));
    }

    if (statutProgramme !== "all") {
      data = data.filter((r) => r.rapport?.statutProgramme === statutProgramme);
    }

    if (ministereId !== "all") {
      data = data.filter((r) => r.gouvernance.ministerePiloteId === ministereId);
    }

    if (recherche) {
      const q = recherche.toLowerCase();
      data = data.filter(
        (r) =>
          r.programme.libelleProgramme.toLowerCase().includes(q) ||
          r.programme.objectifStrategique.toLowerCase().includes(q) ||
          r.gouvernance.ministerePiloteNom.toLowerCase().includes(q) ||
          r.rapport?.activitesRealisees?.toLowerCase().includes(q)
      );
    }

    return data;
  }, [matriceData, pilierId, statutProgramme, ministereId, recherche]);

  // Statistiques
  const stats = useMemo(() => {
    const rapports = filteredData.filter(r => r.rapport);
    const totalBudget = filteredData.reduce((s, r) => s + (r.rapport?.budgetMdFcfa ?? 0), 0);
    const totalDecaisse = filteredData.reduce((s, r) => s + (r.rapport?.decaisseMdFcfa ?? 0), 0);
    const moyExecFin = rapports.length > 0
      ? Math.round(rapports.reduce((s, r) => s + (r.rapport?.pctExecutionFinanciere ?? 0), 0) / rapports.length)
      : 0;
    const moyPhysique = rapports.length > 0
      ? Math.round(rapports.reduce((s, r) => s + (r.rapport?.pctAvancementPhysique ?? 0), 0) / rapports.length)
      : 0;
    const valides = rapports.filter(r => r.rapport?.statutValidation === 'valide_sgpr').length;
    const enRetard = rapports.filter(r => r.rapport?.statutProgramme === 'retard').length;
    const soumis = rapports.filter(r => r.rapport?.statutValidation === 'soumis').length;
    const brouillons = rapports.filter(r => r.rapport?.statutValidation === 'brouillon').length;
    const sansRapport = filteredData.filter(r => !r.rapport).length;

    return {
      totalProgrammes: filteredData.length,
      totalBudget,
      totalDecaisse,
      moyExecFin,
      moyPhysique,
      rapportsValides: valides,
      rapportsEnRetard: enRetard,
      rapportsSoumis: soumis,
      rapportsBrouillons: brouillons,
      sansRapport,
    };
  }, [filteredData]);

  // Ministères uniques pour le filtre
  const ministeres = useMemo(() => {
    const seen = new Map<string, string>();
    GOUVERNANCES.forEach((g) => {
      if (!seen.has(g.ministerePiloteId)) {
        seen.set(g.ministerePiloteId, g.ministerePiloteNom);
      }
    });
    return Array.from(seen.entries()).map(([id, nom]) => ({ id, nom }));
  }, []);

  // Nombre de filtres actifs
  const activeFiltersCount = [
    pilierId !== "all",
    statutProgramme !== "all",
    ministereId !== "all",
    recherche.length > 0,
  ].filter(Boolean).length;

  const resetFilters = useCallback(() => {
    setPilierId("all");
    setStatutProgramme("all");
    setMinistereId("all");
    setRecherche("");
  }, []);

  const handleRowClick = useCallback((programmeId: string) => {
    const row = filteredData.find(r => r.programme.id === programmeId);
    if (row) {
      setSelectedRow(row);
      setDetailOpen(true);
    }
  }, [filteredData]);

  // Déterminer l'étape de validation atteinte
  function getValidationStepIndex(statut?: StatutValidation): number {
    if (!statut) return -1;
    const idx = VALIDATION_STEPS.findIndex(s => s.key === statut);
    return idx;
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Table2 className="h-6 w-6 text-government-gold" />
              Matrice de Reporting — PAG 2026
              <InfoButton pageId="matrice-reporting" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadre de Suivi-Évaluation et Gestion Axée sur les Résultats (GAR)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {demoUser && (
              <Badge variant="outline" className="border-government-gold text-government-gold">
                {demoUser.role}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel complet
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF synthèse
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileDown className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sélecteur de période — Style calendrier */}
        <Card className="border-dashed">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Période :</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (mois === 1) { setMois(12); setAnnee(a => a - 1); }
                    else setMois(m => m - 1);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Select value={String(mois)} onValueChange={(v) => setMois(parseInt(v))}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOIS_LABELS.map((label, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(annee)} onValueChange={(v) => setAnnee(parseInt(v))}>
                  <SelectTrigger className="w-[90px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (mois === 12) { setMois(1); setAnnee(a => a + 1); }
                    else setMois(m => m + 1);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Badge className="bg-government-navy text-white">
                {MOIS_LABELS[mois - 1]} {annee}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques — Design amélioré avec sous-infos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Total programmes */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Programmes</p>
                  <p className="text-2xl font-bold">{stats.totalProgrammes}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {stats.rapportsValides} validés
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Send className="h-3 w-3 text-blue-500" />
                      {stats.rapportsSoumis} soumis
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-government-navy/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-government-navy" />
                </div>
              </div>
              {/* Mini barre : validés / total */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${stats.totalProgrammes > 0 ? (stats.rapportsValides / stats.totalProgrammes) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.totalProgrammes > 0 ? Math.round((stats.rapportsValides / stats.totalProgrammes) * 100) : 0}% validés
              </p>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Budget Total</p>
                  <p className="text-2xl font-bold">{stats.totalBudget.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-1">Md FCFA</span></p>
                  <p className="text-[10px] text-muted-foreground">
                    Décaissé : {stats.totalDecaisse.toFixed(1)} Md
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${stats.totalBudget > 0 ? (stats.totalDecaisse / stats.totalBudget) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.totalBudget > 0 ? Math.round((stats.totalDecaisse / stats.totalBudget) * 100) : 0}% décaissé
              </p>
            </CardContent>
          </Card>

          {/* Exécution financière */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Exec. Financière</p>
                  <p className="text-2xl font-bold">{stats.moyExecFin}<span className="text-sm font-normal text-muted-foreground ml-1">%</span></p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {stats.moyExecFin >= 50 ? (
                      <><TrendingUp className="h-3 w-3 text-green-500" /> Bonne dynamique</>
                    ) : stats.moyExecFin >= 25 ? (
                      <><Activity className="h-3 w-3 text-amber-500" /> En progression</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 text-red-500" /> À accélérer</>
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    stats.moyExecFin >= 50 ? "bg-green-500" : stats.moyExecFin >= 25 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${stats.moyExecFin}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Avancement physique */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Avanc. Physique</p>
                  <p className="text-2xl font-bold">{stats.moyPhysique}<span className="text-sm font-normal text-muted-foreground ml-1">%</span></p>
                  <p className="text-[10px] text-muted-foreground">
                    Moyenne sur {filteredData.filter(r => r.rapport).length} rapports
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    stats.moyPhysique >= 50 ? "bg-green-500" : stats.moyPhysique >= 25 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${stats.moyPhysique}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Workflow */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Statut Rapports</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                            {stats.rapportsValides}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Validés SGPR</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                            {stats.rapportsSoumis}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Soumis</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800">
                            {stats.rapportsBrouillons}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Brouillons</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                            {stats.sansRapport}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Sans rapport</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              {/* Barre segmentée */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
                {stats.totalProgrammes > 0 && (
                  <>
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(stats.rapportsValides / stats.totalProgrammes) * 100}%` }} />
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(stats.rapportsSoumis / stats.totalProgrammes) * 100}%` }} />
                    <div className="h-full bg-gray-400 transition-all duration-500" style={{ width: `${(stats.rapportsBrouillons / stats.totalProgrammes) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-1.5 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Validés</span>
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Soumis</span>
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Brouillon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Légende des Piliers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Piliers :</span>
          {PILIERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPilierId(pilierId === String(p.id) ? "all" : String(p.id))}
              className={cn(
                "flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border transition-all cursor-pointer",
                pilierId === String(p.id)
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.couleur }}
              />
              {p.nom}
            </button>
          ))}
        </div>

        {/* Filtres — Améliorés avec tags actifs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Filtres</span>
                {activeFiltersCount > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-government-navy">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Select value={statutProgramme} onValueChange={setStatutProgramme}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Tous statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  {Object.entries(STATUT_PROGRAMME_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ministereId} onValueChange={setMinistereId}>
                <SelectTrigger className="w-[220px] h-8 text-xs">
                  <SelectValue placeholder="Tous ministères" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ministères</SelectItem>
                  {ministeres.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un programme, ministère..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
                {recherche && (
                  <button
                    onClick={() => setRecherche("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Réinitialiser
                  </Button>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {filteredData.length} programme{filteredData.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Tags des filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                <span className="text-[10px] text-muted-foreground">Filtres actifs :</span>
                {pilierId !== "all" && (
                  <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                    Pilier : {PILIERS.find(p => p.id === parseInt(pilierId))?.nom}
                    <button onClick={() => setPilierId("all")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {statutProgramme !== "all" && (
                  <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                    Statut : {STATUT_PROGRAMME_LABELS[statutProgramme as StatutProgramme]}
                    <button onClick={() => setStatutProgramme("all")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {ministereId !== "all" && (
                  <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                    Ministère : {ministeres.find(m => m.id === ministereId)?.nom}
                    <button onClick={() => setMinistereId("all")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {recherche && (
                  <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                    Recherche : "{recherche}"
                    <button onClick={() => setRecherche("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card className="shadow-gov overflow-hidden">
          <MatriceTable data={filteredData} onRowClick={handleRowClick} />
        </Card>

        {/* Panneau de Détail (Sheet) */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent className="w-[480px] sm:max-w-[520px] overflow-y-auto">
            {selectedRow && (
              <>
                <SheetHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedRow.pilier.couleur }}
                    />
                    <Badge variant="outline" className="text-[10px]">
                      {selectedRow.programme.codeProgramme}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedRow.pilier.nom}
                    </Badge>
                  </div>
                  <SheetTitle className="text-lg leading-tight">
                    {selectedRow.programme.libelleProgramme}
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-5">
                  {/* Cadrage stratégique */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      Cadrage Stratégique
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Mesure présidentielle</span>
                        <p className="mt-0.5">{selectedRow.programme.mesurePresidentielle}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Objectif stratégique</span>
                        <p className="mt-0.5">{selectedRow.programme.objectifStrategique}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Résultats attendus</span>
                        <p className="mt-0.5">{selectedRow.programme.resultatsAttendus}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Gouvernance */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      Gouvernance
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Ministère pilote</span>
                        <p className="mt-0.5 font-medium">{selectedRow.gouvernance.ministerePiloteNom}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Co-responsables</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRow.gouvernance.ministeresCoResponsables.map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{m}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Partenaires (PTF)</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRow.gouvernance.partenairesPTF.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRow.rapport && (
                    <>
                      <Separator />

                      {/* Suivi opérationnel */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5" />
                          Suivi Opérationnel — {MOIS_LABELS[mois - 1]} {annee}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground">Activités réalisées</span>
                            <p className="mt-0.5 text-sm leading-relaxed">{selectedRow.rapport.activitesRealisees}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Statut :</span>
                            <StatutBadge type="programme" statut={selectedRow.rapport.statutProgramme} size="md" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Financier */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          Suivi Financier
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-lg font-bold">{selectedRow.rapport.budgetMdFcfa}</p>
                            <p className="text-[10px] text-muted-foreground">Budget (Md)</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-lg font-bold">{selectedRow.rapport.engageMdFcfa}</p>
                            <p className="text-[10px] text-muted-foreground">Engagé (Md)</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-lg font-bold">{selectedRow.rapport.decaisseMdFcfa}</p>
                            <p className="text-[10px] text-muted-foreground">Décaissé (Md)</p>
                          </div>
                        </div>
                        <ProgressGauge
                          value={selectedRow.rapport.pctExecutionFinanciere}
                          label="Exécution financière"
                          size="md"
                        />
                        <ProgressGauge
                          value={selectedRow.rapport.pctAvancementPhysique}
                          label="Avancement physique"
                          size="md"
                        />
                      </div>

                      <Separator />

                      {/* KPI & Observations */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Performance
                        </h3>
                        {selectedRow.rapport.indicateursKpi && (
                          <div>
                            <span className="text-xs text-muted-foreground">Indicateurs KPI</span>
                            <p className="mt-0.5 text-sm">{selectedRow.rapport.indicateursKpi}</p>
                          </div>
                        )}
                        {selectedRow.rapport.encadrementJuridique && (
                          <div>
                            <span className="text-xs text-muted-foreground">Encadrement juridique</span>
                            <p className="mt-0.5 text-sm">{selectedRow.rapport.encadrementJuridique}</p>
                          </div>
                        )}
                        {selectedRow.rapport.observationsContraintes && (
                          <div>
                            <span className="text-xs text-muted-foreground">Observations / Contraintes</span>
                            <p className="mt-0.5 text-sm leading-relaxed">{selectedRow.rapport.observationsContraintes}</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Workflow de validation visuel */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Workflow de Validation
                        </h3>
                        <div className="relative flex items-center justify-between px-2">
                          {/* Ligne de connexion */}
                          <div className="absolute top-4 left-8 right-8 h-0.5 bg-muted" />
                          <div
                            className="absolute top-4 left-8 h-0.5 bg-green-500 transition-all duration-500"
                            style={{
                              width: `${Math.max(0, getValidationStepIndex(selectedRow.rapport.statutValidation)) / (VALIDATION_STEPS.length - 1) * (100 - 16)}%`,
                            }}
                          />

                          {VALIDATION_STEPS.map((step, i) => {
                            const currentIdx = getValidationStepIndex(selectedRow.rapport!.statutValidation);
                            const isActive = i <= currentIdx;
                            const isCurrent = i === currentIdx;
                            const StepIcon = step.icon;

                            return (
                              <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                                <div className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                                  isCurrent
                                    ? "bg-green-500 text-white ring-2 ring-green-200 dark:ring-green-800"
                                    : isActive
                                    ? "bg-green-500 text-white"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                <span className={cn(
                                  "text-[10px] whitespace-nowrap",
                                  isActive ? "font-medium" : "text-muted-foreground"
                                )}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {selectedRow.rapport.statutValidation === 'rejete' && (
                          <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm text-red-700 dark:text-red-400">
                            <span className="font-medium">Rejeté</span>
                            {selectedRow.rapport.motifRejet && (
                              <p className="text-xs mt-1">{selectedRow.rapport.motifRejet}</p>
                            )}
                          </div>
                        )}

                        {selectedRow.rapport.commentaireValidation && (
                          <div className="p-2 rounded-lg bg-muted/50 text-xs">
                            <span className="text-muted-foreground">Commentaire :</span>{" "}
                            {selectedRow.rapport.commentaireValidation}
                          </div>
                        )}

                        {/* Dates de validation */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {selectedRow.rapport.dateValidationSGG && (
                            <div className="p-2 rounded bg-muted/30">
                              <span className="text-muted-foreground">Validé SGG</span>
                              <p className="font-medium">{new Date(selectedRow.rapport.dateValidationSGG).toLocaleDateString('fr-FR')}</p>
                              <p className="text-muted-foreground">{selectedRow.rapport.valideSGGParNom}</p>
                            </div>
                          )}
                          {selectedRow.rapport.dateValidationSGPR && (
                            <div className="p-2 rounded bg-muted/30">
                              <span className="text-muted-foreground">Validé SGPR</span>
                              <p className="font-medium">{new Date(selectedRow.rapport.dateValidationSGPR).toLocaleDateString('fr-FR')}</p>
                              <p className="text-muted-foreground">{selectedRow.rapport.valideSGPRParNom}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedRow.rapport && (
                    <>
                      <Separator />
                      <div className="text-center py-8">
                        <Clock className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Aucun rapport pour {MOIS_LABELS[mois - 1]} {annee}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Le ministère pilote n'a pas encore soumis de rapport pour cette période.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
