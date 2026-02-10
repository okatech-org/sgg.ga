/**
 * SGG Digital — Notifications Temps Réel (Supabase Realtime)
 *
 * Hook qui s'abonne au canal Supabase Realtime pour recevoir
 * les notifications instantanément sans polling.
 *
 * Usage:
 *   const { notifications, unreadCount } = useRealtimeNotifications(userId);
 *
 * Architecture:
 *   - S'abonne à la table `notifications` filtrée par user_id
 *   - INSERT → ajoute la notification dans le state local + toast
 *   - UPDATE → met à jour le statut (lu/non-lu)
 *   - DELETE → supprime du state
 *   - Fallback automatique sur les données du reportingStore si Supabase offline
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useReportingStore } from '@/stores/reportingStore';
import { logger } from '@/services/logger';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
    /** Whether we're using the Supabase channel or fallback */
    isRealtime: boolean;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useRealtimeNotifications(
    userId: string | null
): UseRealtimeNotificationsReturn {
    const [realtimeNotifs, setRealtimeNotifs] = useState<RealtimeNotification[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isRealtime, setIsRealtime] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Fallback: get notifications from the Zustand store
    const storeNotifs = useReportingStore((s) => s.notifications);
    const storeMarkAsRead = useReportingStore((s) => s.markNotificationRead);
    const storeMarkAllAsRead = useReportingStore((s) => s.markAllNotificationsRead);

    // ── Subscribe to Supabase Realtime ────────────────────────────────────
    useEffect(() => {
        if (!userId) return;

        const channelName = `notifications:${userId}`;

        try {
            const channel = supabase
                .channel(channelName)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        const newNotif = payload.new as RealtimeNotification;
                        logger.info('Notification reçue en temps réel', { id: newNotif.id, type: newNotif.type });

                        setRealtimeNotifs((prev) => [newNotif, ...prev]);

                        // Show toast for new notifications
                        const toastFn = newNotif.type === 'error' ? toast.error
                            : newNotif.type === 'warning' ? toast.warning
                                : newNotif.type === 'success' ? toast.success
                                    : toast.info;

                        toastFn(newNotif.titre, {
                            description: newNotif.message,
                            action: newNotif.action_url
                                ? { label: 'Voir', onClick: () => window.location.assign(newNotif.action_url!) }
                                : undefined,
                        });
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        const updated = payload.new as RealtimeNotification;
                        setRealtimeNotifs((prev) =>
                            prev.map((n) => (n.id === updated.id ? updated : n))
                        );
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        const deleted = payload.old as { id: string };
                        setRealtimeNotifs((prev) => prev.filter((n) => n.id !== deleted.id));
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnected(true);
                        setIsRealtime(true);
                        logger.info('Supabase Realtime connecté', { channel: channelName });
                    } else if (status === 'CHANNEL_ERROR') {
                        setIsConnected(false);
                        setIsRealtime(false);
                        logger.warn('Supabase Realtime indisponible, fallback store');
                    }
                });

            channelRef.current = channel;
        } catch (err) {
            logger.warn('Supabase Realtime non configuré, utilisation du store local', {
                error: String(err),
            });
            setIsRealtime(false);
        }

        // Cleanup on unmount or userId change
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
                setIsConnected(false);
            }
        };
    }, [userId]);

    // ── Merge realtime + store notifications ──────────────────────────────
    const notifications: RealtimeNotification[] = isRealtime
        ? realtimeNotifs
        : storeNotifs.map((n) => ({
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

    // ── Actions ─────────────────────────────────────────────────────────────
    const markAsRead = useCallback(
        async (id: string) => {
            if (isRealtime) {
                // Update in Supabase (will trigger realtime UPDATE event)
                // Note: 'notifications' table will be added to Supabase schema
                // For now, the Realtime channel handles INSERT/UPDATE/DELETE at protocol level
                try {
                    const { error } = await (supabase as any)
                        .from('notifications')
                        .update({ lue: true })
                        .eq('id', id);

                    if (error) {
                        logger.error('Erreur mise à jour notification', { error: error.message });
                    }
                } catch (err) {
                    logger.error('Erreur Supabase notification update', { error: String(err) });
                }
            } else {
                // Fallback to store
                storeMarkAsRead(id);
            }

            // Optimistic update
            setRealtimeNotifs((prev) =>
                prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
            );
        },
        [isRealtime, storeMarkAsRead]
    );

    const markAllAsRead = useCallback(async () => {
        if (isRealtime && userId) {
            try {
                const { error } = await (supabase as any)
                    .from('notifications')
                    .update({ lue: true })
                    .eq('user_id', userId)
                    .eq('lue', false);

                if (error) {
                    logger.error('Erreur marquer toutes lues', { error: error.message });
                }
            } catch (err) {
                logger.error('Erreur Supabase notifications markAll', { error: String(err) });
            }
        } else {
            storeMarkAllAsRead();
        }

        // Optimistic update
        setRealtimeNotifs((prev) => prev.map((n) => ({ ...n, lue: true })));
    }, [isRealtime, userId, storeMarkAllAsRead]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isConnected,
        isRealtime,
    };
}
