/**
 * SGG Digital — Page Preferences de Notifications
 * Matrice de preferences par module et canal (email, application, SMS).
 */

import { useUserSettings } from '@/hooks/useUserSettings';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const { notificationPrefs, updateNotificationPref, isDemo } =
    useUserSettings();

  /** Count how many channels are enabled for a given module */
  const enabledCount = (moduleKey: string) => {
    const pref = notificationPrefs.find((p) => p.moduleKey === moduleKey);
    if (!pref) return 0;
    return [pref.email, pref.inApp, pref.sms].filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Preferences de notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Choisissez comment vous souhaitez etre notifie pour chaque module.
          </p>
        </div>
      </div>

      {/* Notification matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Canaux par module</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-2 border-b bg-muted/40 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Module</span>
            <span className="flex items-center justify-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <span className="flex items-center justify-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              App
            </span>
            <span className="flex items-center justify-center gap-1">
              <Smartphone className="h-3.5 w-3.5" />
              SMS
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {notificationPrefs.map((pref, index) => (
              <div
                key={pref.moduleKey}
                className={cn(
                  'grid grid-cols-[1fr_80px_80px_80px] items-center gap-2 px-6 py-3.5 transition-colors',
                  index % 2 === 1 && 'bg-muted/20'
                )}
              >
                {/* Module name + badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {pref.moduleLabel}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-normal"
                  >
                    {enabledCount(pref.moduleKey)}/3
                  </Badge>
                </div>

                {/* Email switch */}
                <div className="flex justify-center">
                  <Switch
                    checked={pref.email}
                    onCheckedChange={(value) =>
                      updateNotificationPref(pref.moduleKey, 'email', value)
                    }
                    className="scale-90"
                  />
                </div>

                {/* In-app switch */}
                <div className="flex justify-center">
                  <Switch
                    checked={pref.inApp}
                    onCheckedChange={(value) =>
                      updateNotificationPref(pref.moduleKey, 'inApp', value)
                    }
                    className="scale-90"
                  />
                </div>

                {/* SMS switch */}
                <div className="flex justify-center">
                  <Switch
                    checked={pref.sms}
                    onCheckedChange={(value) =>
                      updateNotificationPref(pref.moduleKey, 'sms', value)
                    }
                    className="scale-90"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center">
        Les modifications sont enregistrees automatiquement.
      </p>
    </div>
  );
}
