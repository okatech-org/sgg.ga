/**
 * SGG Digital — Hook Préférences Utilisateur
 */

import { useState, useCallback } from 'react';
import { useDemoUser } from './useDemoUser';
import { toast } from 'sonner';
import type { UserPreferences, NotificationPreference } from '@/types/user-profile';

const STORAGE_KEY = 'sgg-user-preferences';
const NOTIF_KEY = 'sgg-notification-preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'fr',
  timezone: 'Africa/Libreville',
  dateFormat: 'DD/MM/YYYY',
  tableDensity: 'normal',
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPreference[] = [
  { moduleKey: 'matriceReporting', moduleLabel: 'Matrice Reporting (GAR)', email: true, inApp: true, sms: false },
  { moduleKey: 'ptmptg', moduleLabel: 'PTM / PTG', email: true, inApp: true, sms: false },
  { moduleKey: 'nominations', moduleLabel: 'Nominations', email: true, inApp: true, sms: true },
  { moduleKey: 'cycleLegislatif', moduleLabel: 'Cycle Législatif', email: false, inApp: true, sms: false },
  { moduleKey: 'egop', moduleLabel: 'e-GOP', email: false, inApp: true, sms: false },
  { moduleKey: 'journalOfficiel', moduleLabel: 'Journal Officiel', email: true, inApp: true, sms: false },
  { moduleKey: 'documents', moduleLabel: 'Documents', email: false, inApp: true, sms: false },
  { moduleKey: 'securite', moduleLabel: 'Sécurité du compte', email: true, inApp: true, sms: true },
];

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function loadNotifPreferences(): NotificationPreference[] {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_PREFS;
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function useUserSettings() {
  const { demoUser } = useDemoUser();
  const isDemo = !!demoUser;

  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>(loadNotifPreferences);
  const [isLoading, setIsLoading] = useState(false);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      toast.success('Préférences mises à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  }, [preferences]);

  const updateNotificationPref = useCallback(async (
    moduleKey: string,
    channel: 'email' | 'inApp' | 'sms',
    value: boolean
  ) => {
    const updated = notificationPrefs.map((p) =>
      p.moduleKey === moduleKey ? { ...p, [channel]: value } : p
    );
    setNotificationPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    // Pas de toast pour l'auto-save sur les switches
  }, [notificationPrefs]);

  return {
    preferences,
    notificationPrefs,
    isLoading,
    isDemo,
    updatePreferences,
    updateNotificationPref,
  };
}
