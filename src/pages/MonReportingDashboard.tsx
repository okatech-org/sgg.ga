/**
 * SGG Digital — Mon Reporting Dashboard
 * Vue d'ensemble personnalisée pour le SG : reporting mensuel + PTM
 * Lit depuis reportingStore + ptmStore
 */

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Gauge,
  FileEdit,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useDemoUser } from '@/hooks/useDemoUser';
import { usePTMStore } from '@/stores/ptmStore';
import { useReportingStore } from '@/stores/reportingStore';
import { DEADLINES_PTM } from '@/hooks/usePTMWorkflow';
import { InfoButton } from '@/components/reporting/InfoButton';

export default function MonReportingDashboard() {
  const { demoUser } = useDemoUser();
  const ministereId = demoUser?.ministereId || '';

  // PTM Store
  const ptmInitiatives = usePTMStore((s) => s.initiatives);
  const ptmNotifications = usePTMStore((s) => s.notifications);

  // Reporting Store
  const rapports = useReportingStore((s) => s.rapports);

  // PTM stats pour ce ministère
  const ptmStats = useMemo(() => {
    const mine = ministereId
      ? ptmInitiatives.filter((i) => i.ministereId === ministereId)
      : ptmInitiatives;
    const total = mine.length;
    const brouillons = mine.filter((i) => i.statut === 'brouillon').length;
    const soumis = mine.filter((i) =>
      ['soumis_sg', 'consolide_sg', 'soumis_sgg', 'consolide_sgg', 'soumis_pm', 'soumis_sgpr'].includes(i.statut)
    ).length;
    const rejetes = mine.filter((i) => i.statut.startsWith('rejete')).length;
    const completePct = total > 0 ? Math.round((soumis / total) * 100) : 0;
    return { total, brouillons, soumis, rejetes, completePct, initiatives: mine };
  }, [ptmInitiatives, ministereId]);

  // Reporting stats pour ce ministère
  const reportingStats = useMemo(() => {
    const mine = ministereId
      ? rapports.filter((r) => r.ministereId === ministereId)
      : rapports;
    const total = mine.length;
    const soumis = mine.filter((r) => r.statut === 'soumis' || r.statut === 'valide_sgg' || r.statut === 'valide_sgpr').length;
    const brouillons = mine.filter((r) => r.statut === 'brouillon').length;
    const rejetes = mine.filter((r) => r.statut === 'rejete').length;
    const completePct = total > 0 ? Math.round((soumis / total) * 100) : 0;
    return { total, soumis, brouillons, rejetes, completePct };
  }, [rapports, ministereId]);

  // Deadline PTM
  const today = new Date();
  const currentDay = today.getDate();
  const deadlinePTM = DEADLINES_PTM?.direction || 10;
  const joursRestantsPTM = deadlinePTM - currentDay;

  // Notifications non lues
  const unreadNotifs = useMemo(() => {
    return ptmNotifications.filter((n) => !n.lue).length;
  }, [ptmNotifications]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="h-6 w-6 text-government-gold" />
            Mon Reporting
            <InfoButton pageId="mon-reporting" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble de la situation de votre ministère — reporting mensuel et PTM
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reporting mensuel */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reporting mensuel</span>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{reportingStats.completePct}%</div>
              <Progress value={reportingStats.completePct} className="h-1.5 mt-2" />
              <p className="text-xs text-muted-foreground mt-1.5">
                {reportingStats.soumis}/{reportingStats.total} rapports soumis
              </p>
            </CardContent>
          </Card>

          {/* PTM initiatives */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Initiatives PTM</span>
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold">{ptmStats.soumis}/{ptmStats.total}</div>
              <Progress value={ptmStats.completePct} className="h-1.5 mt-2" />
              <p className="text-xs text-muted-foreground mt-1.5">
                {ptmStats.brouillons} brouillon(s), {ptmStats.rejetes} rejeté(s)
              </p>
            </CardContent>
          </Card>

          {/* Deadline */}
          <Card className={joursRestantsPTM <= 3 ? 'border-red-300 dark:border-red-800' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prochaine deadline</span>
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {joursRestantsPTM > 0 ? `${joursRestantsPTM}j` : 'Dépassée'}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Transmission PTM au SG avant le {deadlinePTM}
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertes</span>
                {unreadNotifs > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="text-2xl font-bold">{unreadNotifs + ptmStats.rejetes + reportingStats.rejetes}</div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {ptmStats.rejetes > 0 && `${ptmStats.rejetes} PTM rejeté(s) · `}
                {unreadNotifs} notification(s) non lue(s)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Double panneau : Reporting mensuel + PTM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reporting mensuel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Reporting mensuel (GAR/PAG)
              </CardTitle>
              <CardDescription>
                Suivi des rapports mensuels de votre ministère
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{reportingStats.soumis}</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase">Soumis</div>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{reportingStats.brouillons}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase">Brouillons</div>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                  <div className="text-lg font-bold text-red-700 dark:text-red-300">{reportingStats.rejetes}</div>
                  <div className="text-[10px] text-red-600 dark:text-red-400 uppercase">Rejetés</div>
                </div>
              </div>
              <NavLink to="/matrice-reporting/saisie">
                <Button variant="outline" className="w-full mt-2">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Accéder à la saisie mensuelle
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </NavLink>
            </CardContent>
          </Card>

          {/* PTM/PTG */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                PTM/PTG (Programme de Travail)
              </CardTitle>
              <CardDescription>
                État des initiatives du programme de travail ministériel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{ptmStats.soumis}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Soumis</div>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{ptmStats.brouillons}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase">Brouillons</div>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                  <div className="text-lg font-bold text-red-700 dark:text-red-300">{ptmStats.rejetes}</div>
                  <div className="text-[10px] text-red-600 dark:text-red-400 uppercase">Rejetés</div>
                </div>
              </div>
              <NavLink to="/ptm/saisie">
                <Button variant="outline" className="w-full mt-2">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Accéder à la saisie PTM
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </NavLink>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NavLink to="/matrice-reporting/saisie">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <FileEdit className="h-5 w-5 text-blue-500" />
                  <span className="text-xs">Saisie mensuelle</span>
                </Button>
              </NavLink>
              <NavLink to="/ptm/saisie">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs">Nouvelle initiative PTM</span>
                </Button>
              </NavLink>
              <NavLink to="/matrice-reporting/exports">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <Send className="h-5 w-5 text-purple-500" />
                  <span className="text-xs">Exporter les données</span>
                </Button>
              </NavLink>
              <NavLink to="/echeancier">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="text-xs">Voir l'échéancier</span>
                </Button>
              </NavLink>
            </div>
          </CardContent>
        </Card>

        {/* Items en attente */}
        {(ptmStats.rejetes > 0 || reportingStats.rejetes > 0) && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                Éléments nécessitant votre attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ptmStats.rejetes > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">PTM</Badge>
                      <span className="text-sm">{ptmStats.rejetes} initiative(s) PTM rejetée(s) — à corriger et resoumettre</span>
                    </div>
                    <NavLink to="/ptm/saisie">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </NavLink>
                  </div>
                )}
                {reportingStats.rejetes > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">GAR</Badge>
                      <span className="text-sm">{reportingStats.rejetes} rapport(s) mensuel(s) rejeté(s) — à corriger</span>
                    </div>
                    <NavLink to="/matrice-reporting/saisie">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </NavLink>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
