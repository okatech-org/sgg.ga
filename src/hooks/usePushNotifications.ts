/**
 * SGG Digital — Hook React pour les Notifications Push
 *
 * Fournit l'état des notifications push et les fonctions de gestion
 * pour les composants React.
 */

import { useState, useEffect, useCallback } from 'react';
import pushService, {
    type PushPreferences,
    type NotificationCategory,
    CATEGORY_LABELS,
} from '@/services/pushNotifications';

interface UsePushNotificationsReturn {
    /** Whether Web Push is supported in this browser */
    isSupported: boolean;
    /** Current Notification permission state */
    permission: NotificationPermission;
    /** Whether notifications are fully enabled (permission + user pref) */
    isEnabled: boolean;
    /** User preferences for notifications */
    preferences: PushPreferences;
    /** Request permission from the user */
    requestPermission: () => Promise<NotificationPermission>;
    /** Toggle notifications on/off */
    toggleEnabled: () => void;
    /** Toggle a specific category on/off */
    toggleCategory: (category: NotificationCategory) => void;
    /** Update quiet hours */
    setQuietHours: (start: string, end: string) => void;
    /** Toggle sound */
    toggleSound: () => void;
    /** Send a test notification */
    sendTestNotification: () => Promise<boolean>;
    /** Category labels for UI display */
    categoryLabels: Record<NotificationCategory, string>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [permission, setPermission] = useState<NotificationPermission>(pushService.permission);
    const [preferences, setPreferences] = useState<PushPreferences>(pushService.preferences);
    const [isEnabled, setIsEnabled] = useState(pushService.isEnabled);

    // Sync state with service
    const syncState = useCallback(() => {
        setPermission(pushService.permission);
        setPreferences(pushService.preferences);
        setIsEnabled(pushService.isEnabled);
    }, []);

    useEffect(() => {
        // Listen for permission changes (e.g., user changes permission in browser settings)
        const interval = setInterval(syncState, 5000);
        return () => clearInterval(interval);
    }, [syncState]);

    const requestPermission = useCallback(async () => {
        const result = await pushService.requestPermission();
        syncState();
        return result;
    }, [syncState]);

    const toggleEnabled = useCallback(() => {
        pushService.updatePreferences({ enabled: !preferences.enabled });
        syncState();
    }, [preferences.enabled, syncState]);

    const toggleCategory = useCallback((category: NotificationCategory) => {
        pushService.setCategoryEnabled(category, !preferences.categories[category]);
        syncState();
    }, [preferences.categories, syncState]);

    const setQuietHours = useCallback((start: string, end: string) => {
        pushService.updatePreferences({ quietHoursStart: start, quietHoursEnd: end });
        syncState();
    }, [syncState]);

    const toggleSound = useCallback(() => {
        pushService.updatePreferences({ sound: !preferences.sound });
        syncState();
    }, [preferences.sound, syncState]);

    const sendTestNotification = useCallback(async () => {
        return pushService.notify({
            title: 'Test de Notification',
            body: 'Les notifications push SGG Digital fonctionnent correctement !',
            category: 'info_generale',
            tag: 'test',
        });
    }, []);

    return {
        isSupported: pushService.isSupported,
        permission,
        isEnabled,
        preferences,
        requestPermission,
        toggleEnabled,
        toggleCategory,
        setQuietHours,
        toggleSound,
        sendTestNotification,
        categoryLabels: CATEGORY_LABELS,
    };
}

export default usePushNotifications;
