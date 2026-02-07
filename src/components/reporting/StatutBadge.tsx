/**
 * SGG Digital — Badge de statut pour la matrice reporting
 */

import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Ban,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatutProgramme, StatutValidation } from '@/types/reporting';
import {
  STATUT_PROGRAMME_LABELS,
  STATUT_PROGRAMME_COLORS,
  STATUT_VALIDATION_LABELS,
  STATUT_VALIDATION_COLORS,
} from '@/types/reporting';

const PROGRAMME_ICONS: Record<StatutProgramme, React.ElementType> = {
  en_cours: PlayCircle,
  en_preparation: Clock,
  retard: AlertTriangle,
  termine: CheckCircle2,
  bloque: Ban,
};

const VALIDATION_ICONS: Record<StatutValidation, React.ElementType> = {
  brouillon: CircleDot,
  soumis: Send,
  valide_sgg: CheckCircle2,
  valide_sgpr: ShieldCheck,
  rejete: XCircle,
};

interface StatutBadgeProps {
  type: 'programme' | 'validation';
  statut: StatutProgramme | StatutValidation;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatutBadge({ type, statut: value, size = 'sm', className }: StatutBadgeProps) {
  if (type === 'programme') {
    const statut = value as StatutProgramme;
    const Icon = PROGRAMME_ICONS[statut];
    const label = STATUT_PROGRAMME_LABELS[statut];
    const colors = STATUT_PROGRAMME_COLORS[statut];

    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1 font-medium',
          colors,
          size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
          statut === 'retard' && 'animate-pulse',
          className
        )}
      >
        <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        {label}
      </Badge>
    );
  }

  const statut = value as StatutValidation;
  const Icon = VALIDATION_ICONS[statut];
  const label = STATUT_VALIDATION_LABELS[statut];
  const colors = STATUT_VALIDATION_COLORS[statut];

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        colors,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
        statut === 'rejete' && 'animate-pulse',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </Badge>
  );
}

export default StatutBadge;
