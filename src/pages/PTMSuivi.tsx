/**
 * SGG Digital — Tableau de Bord Suivi PTM/PTG 2026
 * Monitoring des initiatives gouvernementales: programmation, soumissions, validations, inscriptions PTG
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
  AlertTriangle,
  Send,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BarChart3,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { INITIATIVES_PTM, MINISTERES_PTM, getPTMStats, getSuiviMinisteres } from "@/data/ptmData";
import { RUBRIQUE_SHORT_LABELS, STATUT_PTM_LABELS, RUBRIQUE_COLORS, STATUT_PTM_COLORS } from "@/types/ptm";

const STATUT_COLORS: Record<string, string> = {
  brouillon: '#9CA3AF',
  soumis_sgg: '#3B82F6',
  valide_sgg: '#F59E0B',
  inscrit_ptg: '#10B981',
  rejete: '#EF4444',
};

const HEATMAP_STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-300 text-gray-900',
  soumis_sgg: 'bg-blue-400 text-white',
  valide_sgg: 'bg-amber-400 text-white',
  inscrit_ptg: 'bg-green-500 text-white',
  rejete: 'bg-red-500 text-white',
};

export default function PTMSuivi() {
  const [annee] = useState(2026);

  // KPI Calculations
  const kpis = useMemo(() => {
    const stats = getPTMStats();
    const suivi = getSuiviMinisteres();

    const tauxInscriptionPTG = stats.tauxInscriptionPTG;
    const initiativesInscrites = stats.parStatut.inscrit_ptg;
    const initiativesRejetees = stats.parStatut.rejete;
    const initiativesEnAttente = stats.parStatut.soumis_sgg;

    return {
      tauxInscriptionPTG,
      initiativesInscrites,
      initiativesRejetees,
      initiativesEnAttente,
      totalInitiatives: stats.totalInitiatives,
      parRubrique: stats.parRubrique,
    };
  }, []);

  // Data for Progression par Rubrique chart (3 bars per rubrique)
  const progressionData = useMemo(() => {
    const initiatives = INITIATIVES_PTM.reduce((acc, init) => {
      if (!acc[init.rubrique]) {
        acc[init.rubrique] = { total: 0, soumises: 0, inscrites: 0 };
      }
      acc[init.rubrique].total++;
      if (init.statut !== 'brouillon' && init.statut !== 'rejete') {
        acc[init.rubrique].soumises++;
      }
      if (init.statut === 'inscrit_ptg') {
        acc[init.rubrique].inscrites++;
      }
      return acc;
    }, {} as Record<string, { total: number; soumises: number; inscrites: number }>);

    return Object.entries(initiatives).map(([rubrique, data]) => ({
      nom: RUBRIQUE_SHORT_LABELS[rubrique as keyof typeof RUBRIQUE_SHORT_LABELS] || rubrique,
      total: data.total,
      soumises: data.soumises,
      inscrites: data.inscrites,
    }));
  }, []);

  // Data for distribution pie chart
  const distributionData = useMemo(() => {
    return Object.entries(kpis.parRubrique).map(([rubrique, count]) => ({
      name: RUBRIQUE_SHORT_LABELS[rubrique as keyof typeof RUBRIQUE_SHORT_LABELS] || rubrique,
      value: count,
      color: RUBRIQUE_COLORS[rubrique as keyof typeof RUBRIQUE_COLORS] || '#999',
    }));
  }, [kpis.parRubrique]);

  // Heatmap data: Ministères × Statuts
  const heatmapData = useMemo(() => {
    const suivi = getSuiviMinisteres();
    return suivi.map((min) => {
      const ministereInits = INITIATIVES_PTM.filter((i) => i.ministereId === min.ministereId);
      const statutCounts: Record<string, number> = {
        brouillon: 0,
        soumis_sgg: 0,
        valide_sgg: 0,
        inscrit_ptg: 0,
        rejete: 0,
      };

      ministereInits.forEach((init) => {
        statutCounts[init.statut]++;
      });

      return {
        ministereNom: min.ministereNom,
        ministereSigle: min.ministereSigle,
        ...statutCounts,
      };
    });
  }, []);

  // Ministères en retard (high brouillon or low soumission rate)
  const ministeresEnRetard = useMemo(() => {
    const suivi = getSuiviMinisteres();
    return suivi
      .map((min) => ({
        ...min,
        tauxSoumission: min.tauxSoumission,
      }))
      .filter((m) => m.tauxSoumission < 50 || m.totalInitiatives === 0)
      .sort((a, b) => a.tauxSoumission - b.tauxSoumission);
  }, []);

  const handleRelance = (ministereNom: string) => {
    toast.success(`Relance envoyée à ${ministereNom}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-government-gold" />
            Suivi de la Programmation — PTM/PTG {annee}
            <InfoButton pageId="ptm-suivi" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tableau de bord de pilotage des initiatives gouvernementales et inscriptions au PTG
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taux d'Inscription PTG</p>
                  <p className="text-3xl font-bold">{kpis.tauxInscriptionPTG}%</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.initiativesInscrites}/{kpis.totalInitiatives} initiatives
                  </p>
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
                  <p className="text-xs text-muted-foreground">Initiatives Soumises</p>
                  <p className="text-3xl font-bold">{kpis.initiativesEnAttente}</p>
                  <p className="text-xs text-muted-foreground">en attente SGG</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-info flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Initiatives Rejetées</p>
                  <p className="text-3xl font-bold text-status-danger">{kpis.initiativesRejetees}</p>
                  <p className="text-xs text-muted-foreground">non retenues</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-danger flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Initiatives par Rubrique</p>
                  <p className="text-3xl font-bold">{kpis.totalInitiatives}</p>
                  <p className="text-xs text-muted-foreground">3 rubriques PTM</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-government-navy flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progression par Rubrique */}
          <Card className="shadow-gov">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progression par Rubrique</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 15]} />
                  <YAxis type="category" dataKey="nom" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="total" name="Total" fill="#9CA3AF" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="soumises" name="Soumises" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="inscrites" name="Inscrites PTG" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution pie chart */}
          <Card className="shadow-gov">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribution par Rubrique</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap: Ministères × Statuts */}
        <Card className="shadow-gov">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Heatmap Ministères × Statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header Row */}
                <div className="grid grid-cols-[150px_repeat(5,1fr)] gap-0.5 mb-1">
                  <div className="text-xs font-medium text-muted-foreground p-1">Ministère</div>
                  {['Brouillon', 'Soumis', 'Validé', 'Inscrit PTG', 'Rejeté'].map((label, i) => (
                    <div key={i} className="text-[10px] font-medium text-center text-muted-foreground p-1">
                      {label}
                    </div>
                  ))}
                </div>

                {/* Data Rows */}
                {heatmapData.map((row) => (
                  <div key={row.ministereSigle} className="grid grid-cols-[150px_repeat(5,1fr)] gap-0.5 mb-0.5">
                    <div className="text-[10px] font-medium p-1 truncate">{row.ministereSigle}</div>
                    {(['brouillon', 'soumis_sgg', 'valide_sgg', 'inscrit_ptg', 'rejete'] as const).map((statut) => {
                      const count = row[statut] as number;
                      return (
                        <TooltipProvider key={statut}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "h-8 rounded-sm text-[10px] font-bold flex items-center justify-center cursor-default",
                                  HEATMAP_STATUT_COLORS[statut] || 'bg-muted'
                                )}
                              >
                                {count}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">{row.ministereSigle}</p>
                              <p className="text-xs">{STATUT_PTM_LABELS[statut]}: {count} initiatives</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
              {(['brouillon', 'soumis_sgg', 'valide_sgg', 'inscrit_ptg', 'rejete'] as const).map((statut) => (
                <div key={statut} className="flex items-center gap-1.5">
                  <div className={cn("h-3 w-3 rounded-sm", HEATMAP_STATUT_COLORS[statut])} />
                  <span className="text-[10px] text-muted-foreground">{STATUT_PTM_LABELS[statut]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ministères en retard */}
        {ministeresEnRetard.length > 0 && (
          <Card className="shadow-gov border-status-danger/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-status-danger">
                <AlertTriangle className="h-4 w-4" />
                Ministères en Retard (Taux de Soumission {'<'} 50%)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Total initiatives</TableHead>
                    <TableHead>Brouillons</TableHead>
                    <TableHead>Soumises</TableHead>
                    <TableHead className="text-right">Taux soumission</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ministeresEnRetard.map((m) => (
                    <TableRow key={m.ministereId}>
                      <TableCell className="font-medium">{m.ministereNom}</TableCell>
                      <TableCell>{m.totalInitiatives}</TableCell>
                      <TableCell>{m.brouillons}</TableCell>
                      <TableCell>{m.soumises}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={m.tauxSoumission < 30 ? 'destructive' : 'secondary'}>
                          {m.tauxSoumission}%
                        </Badge>
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
