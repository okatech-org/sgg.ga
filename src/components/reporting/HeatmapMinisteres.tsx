/**
 * SGG Digital — Heatmap de remplissage par ministère
 * Grille CSS: ministères × 12 mois
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SuiviMinistere } from '@/types/reporting';

interface HeatmapMinisteresProps {
  data: SuiviMinistere[];
  annee: number;
  className?: string;
}

const MOIS_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

const STATUT_COLORS: Record<string, string> = {
  valide: 'bg-status-success',
  soumis: 'bg-yellow-400 dark:bg-yellow-500',
  brouillon: 'bg-orange-400 dark:bg-orange-500',
  non_saisi: 'bg-status-danger',
  non_applicable: 'bg-gray-300 dark:bg-gray-600',
};

const STATUT_LABELS: Record<string, string> = {
  valide: 'Validé',
  soumis: 'Soumis',
  brouillon: 'Brouillon',
  non_saisi: 'Non saisi',
  non_applicable: 'Non applicable',
};

interface MinistereRow {
  sigle: string;
  nom: string;
  moisData: Map<number, SuiviMinistere>;
}

export function HeatmapMinisteres({ data, annee, className }: HeatmapMinisteresProps) {
  const rows = useMemo(() => {
    const ministereMap = new Map<string, MinistereRow>();

    for (const item of data) {
      if (item.annee !== annee) continue;

      if (!ministereMap.has(item.ministereId)) {
        ministereMap.set(item.ministereId, {
          sigle: item.ministereSigle,
          nom: item.ministereNom,
          moisData: new Map(),
        });
      }
      ministereMap.get(item.ministereId)!.moisData.set(item.mois, item);
    }

    return Array.from(ministereMap.values()).sort((a, b) =>
      a.sigle.localeCompare(b.sigle)
    );
  }, [data, annee]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Heatmap Remplissage par Ministère
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={200}>
          <div className="overflow-x-auto">
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: 'minmax(80px, 150px) repeat(12, minmax(36px, 1fr))',
              }}
            >
              {/* Header row */}
              <div className="flex items-center px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Ministère
              </div>
              {MOIS_LABELS.map((mois) => (
                <div
                  key={mois}
                  className="flex items-center justify-center py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {mois}
                </div>
              ))}

              {/* Data rows */}
              {rows.map((row) => (
                <React.Fragment key={row.sigle}>
                  <div className="flex items-center truncate px-2 py-1 text-xs font-medium text-foreground">
                    {row.sigle}
                  </div>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mois) => {
                    const cellData = row.moisData.get(mois);
                    const statut = cellData?.statut || 'non_saisi';
                    const colorClass = STATUT_COLORS[statut] || STATUT_COLORS.non_saisi;

                    return (
                      <Tooltip key={mois}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'h-8 rounded-sm cursor-default transition-opacity hover:opacity-80',
                              colorClass
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">{row.nom}</span>
                            <span>{MOIS_LABELS[mois - 1]} {annee}</span>
                            <span>Statut: {STATUT_LABELS[statut]}</span>
                            {cellData && cellData.joursRetard > 0 && (
                              <span className="text-status-danger">
                                Retard: {cellData.joursRetard} jour{cellData.joursRetard > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3">
            {Object.entries(STATUT_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn('h-3 w-3 rounded-sm', STATUT_COLORS[key])} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

export default HeatmapMinisteres;
