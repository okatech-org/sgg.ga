/**
 * SGG Digital — Tableau de Bord Suivi PTM/PTG 2026
 * Monitoring hiérarchique: Direction → SG → SGG → PM → SGPR
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
import { RUBRIQUE_SHORT_LABELS, STATUT_PTM_LABELS, RUBRIQUE_COLORS } from "@/types/ptm";
import type { StatutPTM } from "@/types/ptm";

// Couleurs pour les 7 statuts principaux du workflow hiérarchique
const HEATMAP_STATUTS: { key: StatutPTM; label: string; bg: string }[] = [
  { key: 'brouillon', label: 'Brouillon', bg: 'bg-gray-300 text-gray-900' },
  { key: 'soumis_sg', label: 'Soumis SG', bg: 'bg-sky-400 text-white' },
  { key: 'consolide_sg', label: 'Consolidé SG', bg: 'bg-blue-500 text-white' },
  { key: 'soumis_sgg', label: 'Soumis SGG', bg: 'bg-indigo-500 text-white' },
  { key: 'consolide_sgg', label: 'Consolidé SGG', bg: 'bg-violet-500 text-white' },
  { key: 'soumis_pm', label: 'Soumis PM', bg: 'bg-amber-500 text-white' },
  { key: 'soumis_sgpr', label: 'Soumis SGPR', bg: 'bg-green-500 text-white' },
];

const REJECT_STATUTS: StatutPTM[] = ['rejete_sg', 'rejete_sgg', 'rejete'];

export default function PTMSuivi() {
  const [annee] = useState(2026);

  // KPI Calculations — hierarchical
  const kpis = useMemo(() => {
    const stats = getPTMStats();

    const transmisesPM = INITIATIVES_PTM.filter(i =>
      ['soumis_pm', 'soumis_sgpr'].includes(i.statut)
    ).length;

    const enCoursChaine = INITIATIVES_PTM.filter(i =>
      ['soumis_sg', 'consolide_sg', 'soumis_sgg', 'consolide_sgg'].includes(i.statut)
    ).length;

    const rejetees = INITIATIVES_PTM.filter(i =>
      i.statut.startsWith('rejete')
    ).length;

    const tauxTransmission = stats.totalInitiatives > 0
      ? Math.round((transmisesPM / stats.totalInitiatives) * 100) : 0;

    return {
      tauxTransmission,
      transmisesPM,
      enCoursChaine,
      rejetees,
      totalInitiatives: stats.totalInitiatives,
      parRubrique: stats.parRubrique,
    };
  }, []);

  // Progression par Rubrique chart
  const progressionData = useMemo(() => {
    const initiatives = INITIATIVES_PTM.reduce((acc, init) => {
      if (!acc[init.rubrique]) {
        acc[init.rubrique] = { total: 0, enCours: 0, transmises: 0 };
      }
      acc[init.rubrique].total++;
      if (!['brouillon', 'rejete_sg', 'rejete_sgg', 'rejete'].includes(init.statut)) {
        acc[init.rubrique].enCours++;
      }
      if (['soumis_pm', 'soumis_sgpr'].includes(init.statut)) {
        acc[init.rubrique].transmises++;
      }
      return acc;
    }, {} as Record<string, { total: number; enCours: number; transmises: number }>);

    return Object.entries(initiatives).map(([rubrique, data]) => ({
      nom: RUBRIQUE_SHORT_LABELS[rubrique as keyof typeof RUBRIQUE_SHORT_LABELS] || rubrique,
      total: data.total,
      enCours: data.enCours,
      transmises: data.transmises,
    }));
  }, []);

  // Distribution pie chart
  const distributionData = useMemo(() => {
    return Object.entries(kpis.parRubrique).map(([rubrique, count]) => ({
      name: RUBRIQUE_SHORT_LABELS[rubrique as keyof typeof RUBRIQUE_SHORT_LABELS] || rubrique,
      value: count,
      color: RUBRIQUE_COLORS[rubrique as keyof typeof RUBRIQUE_COLORS] || '#999',
    }));
  }, [kpis.parRubrique]);

  // Heatmap data: Ministères × Statuts hiérarchiques
  const heatmapData = useMemo(() => {
    return MINISTERES_PTM.map((min) => {
      const ministereInits = INITIATIVES_PTM.filter((i) => i.ministereId === min.id);
      const counts: Record<string, number> = {};

      // Initialize all statuts to 0
      HEATMAP_STATUTS.forEach(s => { counts[s.key] = 0; });
      counts['rejete'] = 0;

      ministereInits.forEach((init) => {
        if (REJECT_STATUTS.includes(init.statut)) {
          counts['rejete'] = (counts['rejete'] || 0) + 1;
        } else {
          counts[init.statut] = (counts[init.statut] || 0) + 1;
        }
      });

      return {
        ministereNom: min.nom,
        ministereSigle: min.sigle,
        counts,
      };
    });
  }, []);

  // Ministères en retard
  const ministeresEnRetard = useMemo(() => {
    const suivi = getSuiviMinisteres();
    return suivi
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
            Suivi Hiérarchique PTM — {annee}
            <InfoButton pageId="ptm-suivi" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tableau de bord de la chaîne Direction → SG → SGG → PM → SGPR
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taux Transmission PM</p>
                  <p className="text-3xl font-bold">{kpis.tauxTransmission}%</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.transmisesPM}/{kpis.totalInitiatives} initiatives
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
                  <p className="text-xs text-muted-foreground">En Cours de Chaîne</p>
                  <p className="text-3xl font-bold">{kpis.enCoursChaine}</p>
                  <p className="text-xs text-muted-foreground">SG → SGG</p>
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
                  <p className="text-3xl font-bold text-status-danger">{kpis.rejetees}</p>
                  <p className="text-xs text-muted-foreground">à corriger</p>
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
                  <p className="text-xs text-muted-foreground">Total Initiatives</p>
                  <p className="text-3xl font-bold">{kpis.totalInitiatives}</p>
                  <p className="text-xs text-muted-foreground">2 ministères, 4 directions</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-government-navy flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
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
                  <XAxis type="number" domain={[0, 'auto']} />
                  <YAxis type="category" dataKey="nom" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="total" name="Total" fill="#9CA3AF" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="enCours" name="En cours de chaîne" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="transmises" name="Transmises PM/SGPR" fill="#10B981" radius={[0, 4, 4, 0]} />
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

        {/* Heatmap: Ministères × Statuts Hiérarchiques */}
        <Card className="shadow-gov">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Heatmap Ministères × Statuts Hiérarchiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header Row */}
                <div className={`grid grid-cols-[150px_repeat(${HEATMAP_STATUTS.length + 1},1fr)] gap-0.5 mb-1`}>
                  <div className="text-xs font-medium text-muted-foreground p-1">Ministère</div>
                  {HEATMAP_STATUTS.map((s) => (
                    <div key={s.key} className="text-[10px] font-medium text-center text-muted-foreground p-1">
                      {s.label}
                    </div>
                  ))}
                  <div className="text-[10px] font-medium text-center text-muted-foreground p-1">Rejeté</div>
                </div>

                {/* Data Rows */}
                {heatmapData.map((row) => (
                  <div key={row.ministereSigle} className={`grid grid-cols-[150px_repeat(${HEATMAP_STATUTS.length + 1},1fr)] gap-0.5 mb-0.5`}>
                    <div className="text-[10px] font-medium p-1 truncate">{row.ministereSigle}</div>
                    {HEATMAP_STATUTS.map((s) => {
                      const count = row.counts[s.key] || 0;
                      return (
                        <TooltipProvider key={s.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "h-8 rounded-sm text-[10px] font-bold flex items-center justify-center cursor-default",
                                  count > 0 ? s.bg : 'bg-muted/30 text-muted-foreground'
                                )}
                              >
                                {count}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">{row.ministereSigle}</p>
                              <p className="text-xs">{s.label}: {count} initiatives</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {/* Rejeté column */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-8 rounded-sm text-[10px] font-bold flex items-center justify-center cursor-default",
                              (row.counts['rejete'] || 0) > 0 ? 'bg-red-500 text-white' : 'bg-muted/30 text-muted-foreground'
                            )}
                          >
                            {row.counts['rejete'] || 0}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-medium">{row.ministereSigle}</p>
                          <p className="text-xs">Rejeté: {row.counts['rejete'] || 0} initiatives</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
              {HEATMAP_STATUTS.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <div className={cn("h-3 w-3 rounded-sm", s.bg)} />
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-500" />
                <span className="text-[10px] text-muted-foreground">Rejeté</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ministères en retard */}
        {ministeresEnRetard.length > 0 && (
          <Card className="shadow-gov border-status-danger/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-status-danger">
                <AlertTriangle className="h-4 w-4" />
                Ministères en Retard (Taux de Transmission {'<'} 50%)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Brouillons</TableHead>
                    <TableHead>Transmis</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
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
