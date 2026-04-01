/**
 * SGG Digital — Notifications Temps Réel (Convex Reactive)
 *
 * Hook qui utilise les queries réactives Convex pour recevoir
 * les notifications instantanément sans polling.
 *
 * Usage:
 *   const { notifications, unreadCount } = useRealtimeNotifications(userId);
 *
 * Architecture:
 *   - Convex useQuery = abonnement automatique aux changements
 *   - INSERT/UPDATE/DELETE → recalcul automatique via query réactive
 *   - Fallback automatique sur les données du reportingStore si Convex offline
 */

import { useState, useCallback } from 'react';
import { useReportingStore } from '@/stores/reportingStore';
import { logger } from '@/services/logger';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RealtimeNotification {
    id: string;
    user_id: string;
    titre: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    module: string;
    lue: boolean;
    action_url?: string;
    created_at: string;
}

interface UseRealtimeNotificationsReturn {
    /** Combined notifications (realtime + store) */
    notifications: RealtimeNotification[];
    /** Number of unread notifications */
    unreadCount: number;
    /** Mark a single notification as read */
    markAsRead: (id: string) => Promise<void>;
    /** Mark all notifications as read */
    markAllAsRead: () => Promise<void>;
    /** Whether the realtime connection is active */
    isConnected: boolean;
    /** Whether we're using the Convex reactive or fallback */
    isRealtime: boolean;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useRealtimeNotifications(
    userId: string | null
): UseRealtimeNotificationsReturn {
    // Convex reactive queries will be used when the notifications Convex table is added
    // For now, use the Zustand store fallback
    const [isConnected] = useState(false);
    const [isRealtime] = useState(false);

    // Fallback: get notifications from the Zustand store
    const storeNotifs = useReportingStore((s) => s.notifications);
    const storeMarkAsRead = useReportingStore((s) => s.markNotificationRead);
    const storeMarkAllAsRead = useReportingStore((s) => s.markAllNotificationsRead);

    const notifications: RealtimeNotification[] = storeNotifs.map((n) => ({
        id: n.id,
        user_id: userId || '',
        titre: n.titre,
        message: n.message,
        type: n.type as RealtimeNotification['type'],
        module: 'reporting',
        lue: n.lue,
        action_url: n.lienAction,
        created_at: n.dateCreation,
    }));

    const unreadCount = notifications.filter((n) => !n.lue).length;

    const markAsRead = useCallback(
        async (id: string) => {
            storeMarkAsRead(id);
            logger.info('Notification marquée lue', { id });
        },
        [storeMarkAsRead]
    );

    const markAllAsRead = useCallback(async () => {
        storeMarkAllAsRead();
        logger.info('Toutes les notifications marquées lues');
    }, [storeMarkAllAsRead]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isConnected,
        isRealtime,
    };
}
