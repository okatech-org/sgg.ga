/**
 * SGG Digital — Centre de Notifications Reporting
 */

import { useMemo } from 'react';
import {
  Bell,
  CalendarClock,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Send,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Banknote,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NotificationReporting, NotificationType } from '@/types/reporting';

interface NotificationCenterProps {
  notifications: NotificationReporting[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  ouverture_periode: CalendarClock,
  rappel_mi_periode: Clock,
  deadline_approche: AlertTriangle,
  deadline_depassee: AlertOctagon,
  rapport_soumis: Send,
  rapport_valide_sgg: CheckCircle2,
  rapport_valide_sgpr: ShieldCheck,
  rapport_rejete: XCircle,
  anomalie_detectee: AlertCircle,
  gel_credits: Banknote,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  ouverture_periode: 'text-status-info',
  rappel_mi_periode: 'text-status-warning',
  deadline_approche: 'text-status-warning',
  deadline_depassee: 'text-status-danger',
  rapport_soumis: 'text-status-info',
  rapport_valide_sgg: 'text-status-warning',
  rapport_valide_sgpr: 'text-status-success',
  rapport_rejete: 'text-status-danger',
  anomalie_detectee: 'text-status-danger',
  gel_credits: 'text-status-danger',
};

function formatNotifDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  className,
}: NotificationCenterProps) {
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.lue).length,
    [notifications]
  );

  const displayed = notifications.slice(0, 20);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onMarkAllRead();
              }}
              className="text-xs font-normal text-primary hover:underline"
            >
              Marquer tout comme lu
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {displayed.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          displayed.map((notif) => {
            const Icon = NOTIFICATION_ICONS[notif.type];
            const colorClass = NOTIFICATION_COLORS[notif.type];

            return (
              <DropdownMenuItem
                key={notif.id}
                className={cn(
                  'flex items-start gap-3 px-3 py-2.5 cursor-pointer',
                  !notif.lue && 'bg-accent/50'
                )}
                onClick={() => {
                  if (!notif.lue && onMarkRead) onMarkRead(notif.id);
                }}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted',
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        !notif.lue ? 'font-semibold' : 'font-medium'
                      )}
                    >
                      {notif.titre}
                    </span>
                    {!notif.lue && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-status-info" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatNotifDate(notif.dateCreation)}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationCenter;
