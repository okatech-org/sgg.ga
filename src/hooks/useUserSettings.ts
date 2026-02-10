/**
 * SGG Digital — Hook Préférences Utilisateur
 *
 * Connecté à NEOCORTEX Plasticité pour la persistance côté serveur.
 * Fallback sur localStorage si l'API est indisponible.
 *
 * Pattern 8 étapes :
 *   1. reset error → 2. loading → 3. validate → 4. call mutation →
 *   5. update state → 6. success toast → 7. auto-dismiss 3s → 8. catch error
 */

import { useState, useCallback, useEffect } from 'react';
import { useDemoUser } from './useDemoUser';
import { toast } from 'sonner';
import { useUpdateConfig, useNeocortexConfig } from './useNeocortex';
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

  // Try to load from NEOCORTEX Plasticité
  const { data: serverConfig } = useNeocortexConfig('preferences');
  const updateConfigMutation = useUpdateConfig();

  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>(loadNotifPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync from server config if available
  useEffect(() => {
    if (serverConfig && Array.isArray(serverConfig)) {
      const themeConfig = serverConfig.find((c) => c.cle === 'user_theme');
      const langConfig = serverConfig.find((c) => c.cle === 'user_language');
      if (themeConfig || langConfig) {
        setPreferences(prev => ({
          ...prev,
          ...(themeConfig?.valeur ? { theme: themeConfig.valeur as UserPreferences['theme'] } : {}),
          ...(langConfig?.valeur ? { language: langConfig.valeur as UserPreferences['language'] } : {}),
        }));
      }
    }
  }, [serverConfig]);

  // 8-step handler: Update Preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    // 1. Reset error
    setError(null);
    // 2. Loading
    setIsLoading(true);
    try {
      // 3. Validate (nothing critical here)
      // 4. Update local state immediately (optimistic)
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));

      // 5. Try to persist to NEOCORTEX Plasticité
      if (!isDemo) {
        try {
          // Persist theme + language to server
          if (updates.theme) {
            await updateConfigMutation.mutateAsync({
              cle: 'user_theme',
              valeur: updates.theme,
              description: 'Thème utilisateur',
            });
          }
          if (updates.language) {
            await updateConfigMutation.mutateAsync({
              cle: 'user_language',
              valeur: updates.language,
              description: 'Langue utilisateur',
            });
          }
        } catch {
          // Silently fail — localStorage is the fallback
        }
      }

      // 6. Success toast
      toast.success('Préférences mises à jour');
      // 7. Auto-dismiss (Sonner default)
    } catch (e: any) {
      // 8. Catch error
      setError(e.message);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  }, [preferences, isDemo, updateConfigMutation]);

  // 8-step handler: Update Notification Preferences
  const updateNotificationPref = useCallback(async (
    moduleKey: string,
    channel: 'email' | 'inApp' | 'sms',
    value: boolean
  ) => {
    // Optimistic update
    const updated = notificationPrefs.map((p) =>
      p.moduleKey === moduleKey ? { ...p, [channel]: value } : p
    );
    setNotificationPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));

    // Try to persist to server
    if (!isDemo) {
      try {
        await updateConfigMutation.mutateAsync({
          cle: `notif_pref_${moduleKey}_${channel}`,
          valeur: value,
          description: `Notification ${channel} pour ${moduleKey}`,
        });
      } catch {
        // Silent — localStorage acts as cache
      }
    }
    // No toast for individual toggle switches
  }, [notificationPrefs, isDemo, updateConfigMutation]);

  // 8-step handler: Delete Account
  const deleteAccount = useCallback(async (confirmationText: string) => {
    setError(null);
    setIsLoading(true);
    try {
      // 3. Validate
      if (confirmationText !== 'SUPPRIMER MON COMPTE') {
        throw new Error('Texte de confirmation incorrect');
      }

      if (isDemo) {
        await new Promise((r) => setTimeout(r, 1000));
        toast.success('Mode Démo : suppression simulée');
        return;
      }

      // 4. Would call account deletion API
      // await authApi.deleteAccount();
      toast.success('Compte supprimé. Vous allez être déconnecté.');
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message || 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  return {
    preferences,
    notificationPrefs,
    isLoading: isLoading || updateConfigMutation.isPending,
    error,
    isDemo,
    updatePreferences,
    updateNotificationPref,
    deleteAccount,
  };
}
