/**
 * SGG Digital — Performance Ministère
 * Dashboard de performance dédié au SG
 * Score global, compliance reporting, progrès PTM, tendances
 */

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Award,
} from 'lucide-react';
import { useDemoUser } from '@/hooks/useDemoUser';
import { usePTMStore } from '@/stores/ptmStore';
import { useReportingStore } from '@/stores/reportingStore';
import { MINISTERES_REGISTRY } from '@/config/ministeresRegistry';
import { InfoButton } from '@/components/reporting/InfoButton';

// Données simulées de performance (en production, viendrait de l'API)
const MOCK_MONTHLY_PERF = [
  { mois: 'Sep', score: 72, reporting: 80, ptm: 65 },
  { mois: 'Oct', score: 68, reporting: 75, ptm: 60 },
  { mois: 'Nov', score: 78, reporting: 85, ptm: 70 },
  { mois: 'Déc', score: 82, reporting: 90, ptm: 75 },
  { mois: 'Jan', score: 85, reporting: 88, ptm: 82 },
  { mois: 'Fév', score: 80, reporting: 85, ptm: 78 },
];

const AVG_ALL_MINISTRIES = 71; // Moyenne simulée de tous les ministères

export default function PerformanceMinisterePage() {
  const { demoUser } = useDemoUser();
  const ministereId = demoUser?.ministereId || '';

  const ptmInitiatives = usePTMStore((s) => s.initiatives);
  const rapports = useReportingStore((s) => s.rapports);

  // Trouver le ministère
  const ministere = useMemo(() => {
    if (!ministereId) return null;
    return MINISTERES_REGISTRY.find(
      (m) => m.id === ministereId || m.code === ministereId
    );
  }, [ministereId]);

  // PTM performance
  const ptmPerf = useMemo(() => {
    const mine = ministereId
      ? ptmInitiatives.filter((i) => i.ministereId === ministereId)
      : ptmInitiatives;
    const total = mine.length;
    const soumis = mine.filter((i) =>
      ['soumis_sg', 'consolide_sg', 'soumis_sgg', 'consolide_sgg', 'soumis_pm', 'soumis_sgpr'].includes(i.statut)
    ).length;
    const pct = total > 0 ? Math.round((soumis / total) * 100) : 0;
    return { total, soumis, pct };
  }, [ptmInitiatives, ministereId]);

  // Reporting performance
  const reportPerf = useMemo(() => {
    const mine = ministereId
      ? rapports.filter((r) => r.ministereId === ministereId)
      : rapports;
    const total = mine.length;
    const soumis = mine.filter((r) =>
      ['soumis', 'valide_sgg', 'valide_sgpr'].includes(r.statut)
    ).length;
    const pct = total > 0 ? Math.round((soumis / total) * 100) : 0;
    return { total, soumis, pct };
  }, [rapports, ministereId]);

  // Score global (moyenne pondérée)
  const globalScore = useMemo(() => {
    return Math.round((reportPerf.pct * 0.5 + ptmPerf.pct * 0.5));
  }, [reportPerf.pct, ptmPerf.pct]);

  const lastMonthPerf = MOCK_MONTHLY_PERF[MOCK_MONTHLY_PERF.length - 1];
  const prevMonthPerf = MOCK_MONTHLY_PERF[MOCK_MONTHLY_PERF.length - 2];
  const scoreTrend = lastMonthPerf.score - prevMonthPerf.score;

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-950/30';
    return 'bg-red-50 dark:bg-red-950/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Très bien';
    if (score >= 70) return 'Bien';
    if (score >= 60) return 'Acceptable';
    if (score >= 50) return 'Insuffisant';
    return 'Critique';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-government-gold" />
            Performance ministère
            <InfoButton pageId="performance" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ministere
              ? `Tableau de bord de performance — ${ministere.nom}`
              : 'Score de performance global et tendances de votre ministère'}
          </p>
        </div>

        {/* Score global */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-1 ${getScoreBg(globalScore)}`}>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-government-gold mr-1" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score global</span>
              </div>
              <div className={`text-5xl font-black ${getScoreColor(globalScore)}`}>
                {globalScore}%
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {scoreTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${scoreTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {scoreTrend >= 0 ? '+' : ''}{scoreTrend}pts vs mois précédent
                </span>
              </div>
              <Badge className="mt-3" variant="outline">{getScoreLabel(globalScore)}</Badge>
              <p className="text-xs text-muted-foreground mt-3">
                Moyenne nationale : {AVG_ALL_MINISTRIES}%
                {globalScore > AVG_ALL_MINISTRIES && (
                  <span className="text-emerald-600 font-medium"> (+{globalScore - AVG_ALL_MINISTRIES}pts au-dessus)</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Détail des scores */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Décomposition de la performance</CardTitle>
              <CardDescription>Contribution de chaque composante au score global</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Reporting mensuel */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Reporting mensuel (GAR/PAG)</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(reportPerf.pct)}`}>{reportPerf.pct}%</span>
                </div>
                <Progress value={reportPerf.pct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {reportPerf.soumis}/{reportPerf.total} rapports soumis à temps — Poids: 50%
                </p>
              </div>

              {/* PTM */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Programme de travail (PTM)</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(ptmPerf.pct)}`}>{ptmPerf.pct}%</span>
                </div>
                <Progress value={ptmPerf.pct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {ptmPerf.soumis}/{ptmPerf.total} initiatives soumises — Poids: 50%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tendance mensuelle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>Score de performance des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {MOCK_MONTHLY_PERF.map((m, idx) => {
                const isLast = idx === MOCK_MONTHLY_PERF.length - 1;
                return (
                  <div key={m.mois} className={`text-center p-3 rounded-lg ${isLast ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-muted/50'}`}>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase">{m.mois}</div>
                    <div className={`text-lg font-bold mt-1 ${getScoreColor(m.score)}`}>{m.score}%</div>
                    <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${m.score >= 80 ? 'bg-emerald-500' : m.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comparaison avec la moyenne */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Position par rapport aux autres ministères
            </CardTitle>
            <CardDescription>Comparaison anonymisée avec la moyenne nationale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm">Votre ministère</span>
                  <span className={`text-sm font-bold ${getScoreColor(globalScore)}`}>{globalScore}%</span>
                </div>
                <Progress value={globalScore} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Moyenne nationale</span>
                  <span className="text-sm font-bold text-muted-foreground">{AVG_ALL_MINISTRIES}%</span>
                </div>
                <Progress value={AVG_ALL_MINISTRIES} className="h-3 opacity-50" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                {globalScore >= AVG_ALL_MINISTRIES ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">
                      Votre ministère est <strong className="text-emerald-600">{globalScore - AVG_ALL_MINISTRIES} points au-dessus</strong> de la moyenne nationale
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      Votre ministère est <strong className="text-amber-600">{AVG_ALL_MINISTRIES - globalScore} points en-dessous</strong> de la moyenne nationale
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
