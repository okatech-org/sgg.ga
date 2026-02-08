/**
 * SGG Digital — Tableau de Bord Suivi du Remplissage
 * Monitoring temps réel du taux de remplissage de la matrice
 * DYNAMIQUE — Calculé depuis le Store Zustand
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Send,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InfoButton } from "@/components/reporting/InfoButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  PILIERS,
  PROGRAMMES,
} from "@/data/reportingData";
import { useReportingStore } from "@/stores/reportingStore";

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const MOIS_COURTS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

const HEATMAP_COLORS: Record<string, string> = {
  valide: 'bg-status-success text-white',
  soumis: 'bg-status-warning text-white',
  brouillon: 'bg-orange-400 text-white',
  non_saisi: 'bg-status-danger text-white',
  non_applicable: 'bg-muted text-muted-foreground',
};

export default function SuiviRemplissage() {
  const [mois, setMois] = useState("1");
  const [annee, setAnnee] = useState("2026");

  // Store Zustand
  const rapports = useReportingStore((state) => state.rapports);
  const computeSuiviRemplissage = useReportingStore(
    (state) => state.computeSuiviRemplissage,
  );

  const moisNum = parseInt(mois);
  const anneeNum = parseInt(annee);

  // Suivi dynamique depuis le store
  const suiviMinisteres = useMemo(
    () => computeSuiviRemplissage(moisNum, anneeNum),
    [computeSuiviRemplissage, moisNum, anneeNum, rapports],
  );

  // KPI dynamiques
  const kpis = useMemo(() => {
    const rapportsCeMois = rapports.filter(
      (r) => r.periodeMois === moisNum && r.periodeAnnee === anneeNum,
    );
    const valides = rapportsCeMois.filter(
      (r) => r.statutValidation === 'valide_sgpr',
    );
    const enRetard = suiviMinisteres.filter(
      (s) => s.statut === 'non_saisi' && s.joursRetard > 0,
    );
    const rapportsAvecExec = rapportsCeMois.filter(
      (r) => r.pctExecutionFinanciere > 0,
    );
    const moyExec =
      rapportsAvecExec.length > 0
        ? Math.round(
          rapportsAvecExec.reduce(
            (s, r) => s + r.pctExecutionFinanciere,
            0,
          ) / rapportsAvecExec.length,
        )
        : 0;
    const tauxRemplissage = PROGRAMMES.length > 0
      ? Math.round((rapportsCeMois.length / PROGRAMMES.length) * 100)
      : 0;

    return {
      tauxRemplissage,
      rapportsCeMois: rapportsCeMois.length,
      totalProgrammes: PROGRAMMES.length,
      rapportsValides: valides.length,
      ministeresEnRetard: enRetard.length,
      moyExecFinanciere: moyExec,
    };
  }, [rapports, suiviMinisteres, moisNum, anneeNum]);

  // Données par pilier pour le bar chart
  const pilierData = useMemo(() => {
    return PILIERS.map((pilier) => {
      const progs = PROGRAMMES.filter((p) => p.pilierId === pilier.id);
      const raps = progs
        .map((p) =>
          rapports.find(
            (r) =>
              r.programmeId === p.id &&
              r.periodeMois === moisNum &&
              r.periodeAnnee === anneeNum,
          ),
        )
        .filter(Boolean);

      const execFin =
        raps.length > 0
          ? Math.round(
            raps.reduce(
              (s, r) => s + (r?.pctExecutionFinanciere ?? 0),
              0,
            ) / raps.length,
          )
          : 0;
      const physique =
        raps.length > 0
          ? Math.round(
            raps.reduce(
              (s, r) => s + (r?.pctAvancementPhysique ?? 0),
              0,
            ) / raps.length,
          )
          : 0;

      return {
        nom: pilier.nom.split(' ')[0],
        nomComplet: pilier.nom,
        execFinanciere: execFin,
        avancementPhysique: physique,
        remplissage: progs.length > 0
          ? Math.round((raps.length / progs.length) * 100)
          : 0,
        couleur: pilier.couleur,
      };
    });
  }, [rapports, moisNum, anneeNum]);

  // Données trend (simulation 6 mois précédents + mois actuel dynamique)
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      let m = moisNum - i;
      let a = anneeNum;
      if (m <= 0) {
        m += 12;
        a -= 1;
      }
      const count = rapports.filter(
        (r) => r.periodeMois === m && r.periodeAnnee === a,
      ).length;
      const taux = PROGRAMMES.length > 0
        ? Math.round((count / PROGRAMMES.length) * 100)
        : 0;
      months.push({
        mois: MOIS_COURTS[m - 1],
        taux,
      });
    }
    return months;
  }, [rapports, moisNum, anneeNum]);

  // Ministères en retard
  const ministeresEnRetard = useMemo(() => {
    return suiviMinisteres
      .filter((s) => s.statut === 'non_saisi' && s.joursRetard > 0)
      .sort((a, b) => b.joursRetard - a.joursRetard);
  }, [suiviMinisteres]);

  const handleRelance = (ministereNom: string) => {
    toast.success(`Relance envoyée à ${ministereNom}`);
  };

  // Heatmap 12 mois pour chaque ministère
  const heatmapMinisteres = useMemo(() => {
    // Unique ministères from suiviMinisteres
    const unique = new Map<string, { id: string; nom: string; sigle: string }>();
    suiviMinisteres.forEach((s) => {
      if (!unique.has(s.ministereId)) {
        unique.set(s.ministereId, {
          id: s.ministereId,
          nom: s.ministereNom,
          sigle: s.ministereSigle,
        });
      }
    });
    return Array.from(unique.values());
  }, [suiviMinisteres]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-government-gold" />
              Suivi du Remplissage — {MOIS_LABELS[moisNum - 1]} {anneeNum}
              <InfoButton pageId="suivi-remplissage" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord de pilotage du reporting GAR mensuel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={mois} onValueChange={setMois}>
              <SelectTrigger className="w-[140px]">
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
            <Select value={annee} onValueChange={setAnnee}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taux de Remplissage</p>
                  <p className="text-3xl font-bold">{kpis.tauxRemplissage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.rapportsCeMois}/{kpis.totalProgrammes} programmes
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-government-navy flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rapports Validés</p>
                  <p className="text-3xl font-bold">{kpis.rapportsValides}</p>
                  <p className="text-xs text-muted-foreground">validés SGPR ce mois</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-success flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ministères en Retard</p>
                  <p className="text-3xl font-bold text-status-danger">
                    {kpis.ministeresEnRetard}
                  </p>
                  <p className="text-xs text-muted-foreground">&gt;5 jours après deadline</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-danger flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Exéc. Financière Moy.</p>
                  <p className="text-3xl font-bold">{kpis.moyExecFinanciere}%</p>
                  <p className="text-xs text-muted-foreground">moyenne tous programmes</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-warning flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card className="shadow-gov">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Heatmap Remplissage par Ministère — {MOIS_LABELS[moisNum - 1]} {anneeNum}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Rows from computed suivi */}
                {suiviMinisteres.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Aucune donnée pour cette période
                  </div>
                ) : (
                  <div className="space-y-1">
                    {suiviMinisteres.map((ministere) => {
                      const statut = ministere.statut;
                      return (
                        <TooltipProvider key={ministere.ministereId}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="grid grid-cols-[180px_1fr_80px_80px] gap-2 items-center">
                                <div className="text-xs font-medium truncate">
                                  {ministere.ministereSigle}
                                </div>
                                <div className="w-full bg-muted rounded-sm overflow-hidden h-6">
                                  <div
                                    className={cn(
                                      "h-full rounded-sm flex items-center justify-center text-[10px] font-medium transition-all",
                                      HEATMAP_COLORS[statut] || 'bg-muted',
                                    )}
                                    style={{
                                      width: `${Math.max(ministere.tauxCompletude, 5)}%`,
                                    }}
                                  >
                                    {ministere.tauxCompletude > 20 && `${ministere.tauxCompletude}%`}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    statut === 'valide'
                                      ? 'default'
                                      : statut === 'non_saisi'
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                  className="text-[10px] justify-center"
                                >
                                  {statut.replace('_', ' ')}
                                </Badge>
                                <div className="text-[10px] text-right tabular-nums text-muted-foreground">
                                  {ministere.joursRetard > 0
                                    ? <span className="text-status-danger font-medium">-{ministere.joursRetard}j</span>
                                    : '—'}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">{ministere.ministereNom}</p>
                              <p className="text-xs">
                                Statut: {statut.replace('_', ' ')} | Complétude: {ministere.tauxCompletude}%
                              </p>
                              {ministere.joursRetard > 0 && (
                                <p className="text-xs text-status-danger">
                                  Retard: {ministere.joursRetard} jour(s)
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {/* Légende */}
            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t">
              {Object.entries(HEATMAP_COLORS)
                .filter(([key]) => key !== 'non_applicable')
                .map(([key, color]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={cn("h-3 w-3 rounded-sm", color)} />
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {key.replace('_', ' ')}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progression par pilier */}
          <Card className="shadow-gov">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progression par Pilier</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pilierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="nom"
                    width={80}
                    tick={{ fontSize: 11 }}
                  />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    dataKey="execFinanciere"
                    name="% Exec. Financière"
                    fill="#8B5CF6"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="avancementPhysique"
                    name="% Avancement Physique"
                    fill="#3B82F6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tendance mensuelle */}
          <Card className="shadow-gov">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tendance Taux de Remplissage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="taux"
                    name="Taux remplissage"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ministères en retard */}
        {ministeresEnRetard.length > 0 && (
          <Card className="shadow-gov border-status-danger/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-status-danger">
                <AlertTriangle className="h-4 w-4" />
                Ministères en Retard ({ministeresEnRetard.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Jours de retard</TableHead>
                    <TableHead>Complétude</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ministeresEnRetard.map((m) => (
                    <TableRow key={m.ministereId}>
                      <TableCell className="font-medium">{m.ministereNom}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{m.joursRetard} jours</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.tauxCompletude}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRelance(m.ministereNom)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Relancer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
