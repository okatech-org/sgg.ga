/**
 * SGG Digital — Timeline verticale d'historique de validation
 */

import {
  FileEdit,
  Send,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HistoriqueModification } from '@/types/reporting';

interface ValidationTimelineProps {
  historique: HistoriqueModification[];
  className?: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  statutValidation: Send,
  valide_sgg: CheckCircle2,
  valide_sgpr: ShieldCheck,
  rejete: XCircle,
  brouillon: FileEdit,
};

const ACTION_COLORS: Record<string, string> = {
  soumis: 'text-status-info border-status-info bg-status-info/10',
  valide_sgg: 'text-status-warning border-status-warning bg-status-warning/10',
  valide_sgpr: 'text-status-success border-status-success bg-status-success/10',
  rejete: 'text-status-danger border-status-danger bg-status-danger/10',
  brouillon: 'text-muted-foreground border-muted bg-muted',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

function formatChange(item: HistoriqueModification): string {
  if (item.champModifie === 'statutValidation') {
    return `Statut: ${item.ancienneValeur} → ${item.nouvelleValeur}`;
  }
  return `${item.champModifie}: ${item.ancienneValeur} → ${item.nouvelleValeur}`;
}

export function ValidationTimeline({ historique, className }: ValidationTimelineProps) {
  const sorted = [...historique].sort(
    (a, b) => new Date(b.modifieLe).getTime() - new Date(a.modifieLe).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground py-4', className)}>
        Aucun historique de modification.
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      <h4 className="text-sm font-semibold mb-3">Historique de validation</h4>
      <div className="relative border-l-2 border-muted pl-6 space-y-4">
        {sorted.map((item) => {
          const newVal = item.nouvelleValeur;
          const Icon = ACTION_ICONS[newVal] || ACTION_ICONS[item.champModifie] || Edit3;
          const colorClass = ACTION_COLORS[newVal] || ACTION_COLORS.brouillon;

          return (
            <div key={item.id} className="relative">
              {/* Dot */}
              <div
                className={cn(
                  'absolute -left-[calc(1.5rem+5px)] flex h-6 w-6 items-center justify-center rounded-full border-2',
                  colorClass
                )}
              >
                <Icon className="h-3 w-3" />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-0.5 pb-2 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.modifieParNom}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.modifieLe)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatChange(item)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ValidationTimeline;
