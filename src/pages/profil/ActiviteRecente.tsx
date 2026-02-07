/**
 * SGG Digital — Activite Recente
 * Timeline des activites recentes de l'utilisateur avec filtres par module et action.
 */

import { useUserActivity } from '@/hooks/useUserActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Send,
  CheckCircle2,
  Eye,
  Edit,
  LogIn,
  Download,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityAction } from '@/types/user-profile';
import type { LucideIcon } from 'lucide-react';

// ─── Icon & Color Maps ─────────────────────────────────────────────────────

const ACTION_ICON_MAP: Record<ActivityAction, LucideIcon> = {
  soumission: Send,
  validation: CheckCircle2,
  consultation: Eye,
  modification: Edit,
  connexion: LogIn,
  export: Download,
};

const ACTION_COLOR_MAP: Record<ActivityAction, string> = {
  soumission: 'bg-blue-100 text-blue-600 border-blue-200',
  validation: 'bg-green-100 text-green-600 border-green-200',
  consultation: 'bg-gray-100 text-gray-600 border-gray-200',
  modification: 'bg-amber-100 text-amber-600 border-amber-200',
  connexion: 'bg-purple-100 text-purple-600 border-purple-200',
  export: 'bg-cyan-100 text-cyan-600 border-cyan-200',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    const now = Date.now();
    const ts = new Date(iso).getTime();
    const diffMs = now - ts;
    const diffH = Math.floor(diffMs / 3_600_000);

    if (diffH < 24) {
      if (diffH < 1) {
        const diffMin = Math.floor(diffMs / 60_000);
        return diffMin < 1 ? "A l'instant" : `Il y a ${diffMin}min`;
      }
      return `Il y a ${diffH}h`;
    }

    if (diffH < 48) {
      return 'Hier';
    }

    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ActiviteRecente() {
  const {
    activities,
    filterModule,
    setFilterModule,
    filterAction,
    setFilterAction,
    modules,
    actions,
    getModuleLabel,
    getActionLabel,
  } = useUserActivity();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-government-navy">
          <Activity className="h-6 w-6 text-government-gold" />
          Activite recente
        </h1>
        <p className="text-muted-foreground mt-1">
          Retrouvez l'ensemble de vos actions recentes sur la plateforme
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-government-navy/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Module filter */}
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Tous les modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action filter */}
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a.key} value={a.key}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-government-navy/10">
        <CardContent className="pt-6">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Aucune activite trouvee.</p>
            </div>
          ) : (
            <div className="relative ml-4">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-6">
                {activities.map((entry) => {
                  const action = entry.action as ActivityAction;
                  const Icon = ACTION_ICON_MAP[action] || Activity;
                  const colorClass =
                    ACTION_COLOR_MAP[action] || 'bg-gray-100 text-gray-600 border-gray-200';

                  return (
                    <div key={entry.id} className="relative flex items-start gap-4">
                      {/* Timeline dot / icon */}
                      <div
                        className={cn(
                          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                          colorClass,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {entry.description}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5 border-government-navy/20 text-government-navy"
                          >
                            {getModuleLabel(entry.module)}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs px-2 py-0.5', colorClass)}
                          >
                            {getActionLabel(entry.action)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
