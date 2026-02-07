/**
 * SGG Digital — Badge de statut pour les initiatives PTM
 * Affiche le statut avec icône et couleurs spécifiques à chaque état
 */

import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  CircleDot,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatutPTM } from '@/types/ptm';
import {
  STATUT_PTM_LABELS,
  STATUT_PTM_COLORS,
} from '@/types/ptm';

const STATUT_ICONS: Record<StatutPTM, React.ElementType> = {
  brouillon: CircleDot,
  soumis_sgg: Send,
  valide_sgg: CheckCircle2,
  inscrit_ptg: ShieldCheck,
  rejete: XCircle,
};

interface PTMStatutBadgeProps {
  statut: StatutPTM;
  size?: 'sm' | 'md';
  className?: string;
}

export function PTMStatutBadge({
  statut,
  size = 'sm',
  className,
}: PTMStatutBadgeProps) {
  const Icon = STATUT_ICONS[statut];
  const label = STATUT_PTM_LABELS[statut];
  const colors = STATUT_PTM_COLORS[statut];

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

export default PTMStatutBadge;
