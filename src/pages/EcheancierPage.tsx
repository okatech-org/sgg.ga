/**
 * SGG Digital — Échéancier Ministère
 * Tableau des deadlines : reporting mensuel, PTM, Conseil des ministres
 * Code couleur : vert (soumis) / jaune (bientôt) / rouge (dépassé)
 */

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  Scale,
} from 'lucide-react';
import { useDemoUser } from '@/hooks/useDemoUser';
import { DEADLINES_PTM } from '@/hooks/usePTMWorkflow';
import { InfoButton } from '@/components/reporting/InfoButton';

interface DeadlineItem {
  id: string;
  label: string;
  description: string;
  date: string;
  type: 'reporting' | 'ptm' | 'conseil' | 'autre';
  status: 'completed' | 'upcoming' | 'overdue' | 'soon';
  icon: typeof Calendar;
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function EcheancierPage() {
  const { demoUser } = useDemoUser();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Générer les deadlines de l'année
  const deadlines = useMemo((): DeadlineItem[] => {
    const items: DeadlineItem[] = [];
    const deadlineDay = DEADLINES_PTM?.direction || 10;

    // Deadlines reporting mensuel (15 de chaque mois)
    for (let m = 0; m < 12; m++) {
      const deadlineDate = new Date(currentYear, m, 15);
      const isPast = deadlineDate < today;
      const isSoon = !isPast && (deadlineDate.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000;
      const isCompleted = m < currentMonth; // Simplification: mois passés = complétés

      items.push({
        id: `reporting-${m}`,
        label: `Rapport mensuel ${MONTHS[m]} ${currentYear}`,
        description: 'Saisie et soumission du rapport GAR/PAG mensuel',
        date: `15 ${MONTHS[m]} ${currentYear}`,
        type: 'reporting',
        status: isCompleted ? 'completed' : isPast ? 'overdue' : isSoon ? 'soon' : 'upcoming',
        icon: BarChart3,
      });
    }

    // Deadlines PTM (jour variable selon niveau, chaque mois)
    for (let m = 0; m < 12; m++) {
      const deadlineDate = new Date(currentYear, m, deadlineDay);
      const isPast = deadlineDate < today;
      const isSoon = !isPast && (deadlineDate.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000;
      const isCompleted = m < currentMonth;

      items.push({
        id: `ptm-${m}`,
        label: `Transmission PTM ${MONTHS[m]}`,
        description: 'Transmission des initiatives PTM au SG pour consolidation',
        date: `${deadlineDay} ${MONTHS[m]} ${currentYear}`,
        type: 'ptm',
        status: isCompleted ? 'completed' : isPast ? 'overdue' : isSoon ? 'soon' : 'upcoming',
        icon: FileSpreadsheet,
      });
    }

    // Conseils des ministres (hypothétique: 1er et 3ème mercredi)
    const conseilDates = [
      { month: 0, day: 8 }, { month: 0, day: 22 },
      { month: 1, day: 5 }, { month: 1, day: 19 },
      { month: 2, day: 5 }, { month: 2, day: 19 },
      { month: 3, day: 2 }, { month: 3, day: 16 },
      { month: 4, day: 7 }, { month: 4, day: 21 },
      { month: 5, day: 4 }, { month: 5, day: 18 },
      { month: 6, day: 2 }, { month: 6, day: 16 },
      { month: 7, day: 6 }, { month: 7, day: 20 },
      { month: 8, day: 3 }, { month: 8, day: 17 },
      { month: 9, day: 1 }, { month: 9, day: 15 },
      { month: 10, day: 5 }, { month: 10, day: 19 },
      { month: 11, day: 3 }, { month: 11, day: 17 },
    ];

    conseilDates.forEach(({ month, day }, idx) => {
      const conseilDate = new Date(currentYear, month, day);
      const isPast = conseilDate < today;
      const isSoon = !isPast && (conseilDate.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000;

      items.push({
        id: `conseil-${idx}`,
        label: `Conseil des ministres`,
        description: 'Séance du Conseil des ministres',
        date: `${day} ${MONTHS[month]} ${currentYear}`,
        type: 'conseil',
        status: isPast ? 'completed' : isSoon ? 'soon' : 'upcoming',
        icon: Scale,
      });
    });

    // Trier par date
    items.sort((a, b) => {
      const dateA = new Date(a.date.split(' ').reverse().join('-'));
      const dateB = new Date(b.date.split(' ').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    return items;
  }, [currentYear, currentMonth, today]);

  // Stats
  const stats = useMemo(() => {
    const completed = deadlines.filter((d) => d.status === 'completed').length;
    const overdue = deadlines.filter((d) => d.status === 'overdue').length;
    const soon = deadlines.filter((d) => d.status === 'soon').length;
    const upcoming = deadlines.filter((d) => d.status === 'upcoming').length;
    return { completed, overdue, soon, upcoming, total: deadlines.length };
  }, [deadlines]);

  // Filtrer les deadlines proches et en retard (les plus urgentes d'abord)
  const urgentDeadlines = useMemo(() => {
    return deadlines.filter((d) => d.status === 'overdue' || d.status === 'soon');
  }, [deadlines]);

  // Deadlines à venir (prochains 30 jours)
  const upcomingDeadlines = useMemo(() => {
    return deadlines.filter((d) => d.status === 'upcoming').slice(0, 10);
  }, [deadlines]);

  const statusConfig = {
    completed: { label: 'Fait', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle2 },
    soon: { label: 'Bientôt', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400', icon: Clock },
    overdue: { label: 'En retard', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', icon: AlertTriangle },
    upcoming: { label: 'À venir', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', icon: Calendar },
  };

  const typeConfig = {
    reporting: { label: 'GAR/PAG', color: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400' },
    ptm: { label: 'PTM', color: 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' },
    conseil: { label: 'Conseil', color: 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400' },
    autre: { label: 'Autre', color: 'border-gray-300 text-gray-700' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-government-gold" />
            Échéancier ministère
            <InfoButton pageId="echeancier" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toutes les deadlines de reporting, PTM et Conseil des ministres — {currentYear}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase">Complétés</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className={stats.overdue > 0 ? 'border-red-300 dark:border-red-800' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase">En retard</span>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</div>
            </CardContent>
          </Card>
          <Card className={stats.soon > 0 ? 'border-amber-300 dark:border-amber-800' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase">Bientôt</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{stats.soon}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase">À venir</span>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{stats.upcoming}</div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent */}
        {urgentDeadlines.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Deadlines urgentes
              </CardTitle>
              <CardDescription>
                En retard ou dans les 7 prochains jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {urgentDeadlines.map((dl) => {
                  const StatusIcon = statusConfig[dl.status].icon;
                  return (
                    <div
                      key={dl.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${statusConfig[dl.status].color}`}
                    >
                      <StatusIcon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{dl.label}</span>
                          <Badge variant="outline" className={`text-[9px] ${typeConfig[dl.type].color}`}>
                            {typeConfig[dl.type].label}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-80 truncate">{dl.description}</p>
                      </div>
                      <span className="text-xs font-medium whitespace-nowrap">{dl.date}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* À venir */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prochaines échéances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {upcomingDeadlines.map((dl) => {
                const Icon = dl.icon;
                return (
                  <div
                    key={dl.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{dl.label}</span>
                      <Badge variant="outline" className={`ml-2 text-[9px] ${typeConfig[dl.type].color}`}>
                        {typeConfig[dl.type].label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{dl.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
