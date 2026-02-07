/**
 * SGG Digital — Tableau de Bord Suivi du Remplissage
 * Monitoring temps réel du taux de remplissage de la matrice
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RAPPORTS_MENSUELS,
  SUIVI_MINISTERES,
  GOUVERNANCES,
} from "@/data/reportingData";

const MOIS_COURTS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const HEATMAP_COLORS: Record<string, string> = {
  valide: 'bg-status-success text-white',
  soumis: 'bg-status-warning text-white',
  brouillon: 'bg-orange-400 text-white',
  non_saisi: 'bg-status-danger text-white',
  non_applicable: 'bg-muted text-muted-foreground',
};

export default function SuiviRemplissage() {
  const [annee] = useState(2026);

  // KPI
  const kpis = useMemo(() => {
    const rapportsCeMois = RAPPORTS_MENSUELS.filter(r => r.periodeMois === 1 && r.periodeAnnee === 2026);
    const valides = rapportsCeMois.filter(r => r.statutValidation === 'valide_sgpr');
    const ministeresData = SUIVI_MINISTERES.filter(s => s.mois === 1 && s.annee === 2026);
    const enRetard = ministeresData.filter(s => s.statut === 'non_saisi' && s.joursRetard > 0);
    const rapportsAvecExec = rapportsCeMois.filter(r => r.pctExecutionFinanciere > 0);
    const moyExec = rapportsAvecExec.length > 0
      ? Math.round(rapportsAvecExec.reduce((s, r) => s + r.pctExecutionFinanciere, 0) / rapportsAvecExec.length)
      : 0;
    const tauxRemplissage = Math.round((rapportsCeMois.length / PROGRAMMES.length) * 100);

    return {
      tauxRemplissage,
      rapportsCeMois: rapportsCeMois.length,
      totalProgrammes: PROGRAMMES.length,
      rapportsValides: valides.length,
      ministeresEnRetard: enRetard.length,
      moyExecFinanciere: moyExec,
    };
  }, []);

  // Données par pilier pour le bar chart
  const pilierData = useMemo(() => {
    return PILIERS.map((pilier) => {
      const progs = PROGRAMMES.filter(p => p.pilierId === pilier.id);
      const rapports = progs
        .map(p => RAPPORTS_MENSUELS.find(r => r.programmeId === p.id && r.periodeMois === 1 && r.periodeAnnee === 2026))
        .filter(Boolean);

      const execFin = rapports.length > 0
        ? Math.round(rapports.reduce((s, r) => s + (r?.pctExecutionFinanciere ?? 0), 0) / rapports.length)
        : 0;
      const physique = rapports.length > 0
        ? Math.round(rapports.reduce((s, r) => s + (r?.pctAvancementPhysique ?? 0), 0) / rapports.length)
        : 0;

      return {
        nom: pilier.nom.split(' ')[0],
        nomComplet: pilier.nom,
        execFinanciere: execFin,
        avancementPhysique: physique,
        remplissage: Math.round((rapports.length / progs.length) * 100),
        couleur: pilier.couleur,
      };
    });
  }, []);

  // Données trend (simulation 6 mois)
  const trendData = useMemo(() => {
    return [
      { mois: 'Août', taux: 45 },
      { mois: 'Sep', taux: 58 },
      { mois: 'Oct', taux: 62 },
      { mois: 'Nov', taux: 70 },
      { mois: 'Déc', taux: 75 },
      { mois: 'Jan', taux: kpis.tauxRemplissage },
    ];
  }, [kpis.tauxRemplissage]);

  // Ministères en retard
  const ministeresEnRetard = useMemo(() => {
    return SUIVI_MINISTERES
      .filter(s => s.mois === 1 && s.annee === 2026 && s.statut === 'non_saisi')
      .sort((a, b) => b.joursRetard - a.joursRetard);
  }, []);

  const handleRelance = (ministereNom: string) => {
    toast.success(`Relance envoyée à ${ministereNom}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-government-gold" />
            Suivi du Remplissage — Janvier {annee}
            <InfoButton pageId="suivi-remplissage" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tableau de bord de pilotage du reporting GAR mensuel
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taux de Remplissage</p>
                  <p className="text-3xl font-bold">{kpis.tauxRemplissage}%</p>
                  <p className="text-xs text-muted-foreground">{kpis.rapportsCeMois}/{kpis.totalProgrammes} programmes</p>
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
                  <p className="text-3xl font-bold text-status-danger">{kpis.ministeresEnRetard}</p>
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
              Heatmap Remplissage par Ministère
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-[180px_repeat(12,1fr)] gap-0.5 mb-1">
                  <div className="text-xs font-medium text-muted-foreground p-1">Ministère</div>
                  {MOIS_COURTS.map((m, i) => (
                    <div key={i} className="text-[10px] font-medium text-center text-muted-foreground p-1">
                      {m}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {SUIVI_MINISTERES.filter((s, i, arr) => {
                  // Unique ministries
                  return arr.findIndex(x => x.ministereId === s.ministereId) === i;
                }).map((ministere) => (
                  <div key={ministere.ministereId} className="grid grid-cols-[180px_repeat(12,1fr)] gap-0.5 mb-0.5">
                    <div className="text-[10px] font-medium p-1 truncate">{ministere.ministereSigle}</div>
                    {Array.from({ length: 12 }, (_, mois) => {
                      const data = SUIVI_MINISTERES.find(
                        s => s.ministereId === ministere.ministereId && s.mois === mois + 1 && s.annee === annee
                      );
                      const statut = data?.statut ?? (mois + 1 > 1 ? 'non_applicable' : 'non_saisi');
                      return (
                        <TooltipProvider key={mois}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "h-6 rounded-sm text-[8px] flex items-center justify-center cursor-default",
                                  HEATMAP_COLORS[statut] || 'bg-muted'
                                )}
                              >
                                {statut === 'valide' ? '✓' : statut === 'non_saisi' ? '✗' : ''}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">{ministere.ministereNom}</p>
                              <p className="text-xs">{MOIS_COURTS[mois]} {annee}: {statut.replace('_', ' ')}</p>
                              {data?.joursRetard ? <p className="text-xs text-status-danger">Retard: {data.joursRetard}j</p> : null}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {/* Légende */}
            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t">
              {Object.entries(HEATMAP_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={cn("h-3 w-3 rounded-sm", color)} />
                  <span className="text-[10px] text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
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
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="nom" width={80} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="execFinanciere" name="% Exec. Financière" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avancementPhysique" name="% Avancement Physique" fill="#3B82F6" radius={[0, 4, 4, 0]} />
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
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
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
                Ministères en Retard
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
                      <TableCell className="text-muted-foreground">{m.tauxCompletude}%</TableCell>
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
