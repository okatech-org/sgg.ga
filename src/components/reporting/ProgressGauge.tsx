/**
 * SGG Digital — Jauge de progression linéaire
 */

import { cn } from '@/lib/utils';

interface ProgressGaugeProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

function getColorClass(pct: number): string {
  if (pct < 30) return 'bg-status-danger';
  if (pct < 70) return 'bg-status-warning';
  return 'bg-status-success';
}

export function ProgressGauge({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  label,
  className,
}: ProgressGaugeProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorClass = getColorClass(pct);

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showLabel && (
            <span className="font-medium tabular-nums">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-muted overflow-hidden', heightClass)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressGauge;
