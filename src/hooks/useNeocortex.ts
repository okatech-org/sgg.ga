/**
 * 🧠 NEOCORTEX — Hooks React Query
 * Connecte le frontend au système nerveux digital.
 * Pattern 8 étapes : reset → loading → validate → call → update → toast → dismiss → catch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    neocortexApi,
    type NeocortexDashboard,
    type NeocortexNotification,
    type HistoriqueAction,
    type DecisionResult,
    type ConfigSysteme,
    type MetriqueSysteme,
} from '@/services/api';

// ============================================================================
// 📊 DASHBOARD NEOCORTEX (admin)
// ============================================================================

export function useNeocortexDashboard() {
    return useQuery({
        queryKey: ['neocortex', 'dashboard'],
        queryFn: async () => {
            const res = await neocortexApi.getDashboard();
            if (!res.success) throw new Error(res.error?.message || 'Dashboard indisponible');
            return res.data as NeocortexDashboard;
        },
        staleTime: 30_000,         // 30s
        refetchInterval: 60_000,   // refresh toutes les minutes
    });
}

// ============================================================================
// 💓 SIGNAUX (Limbique — admin)
// ============================================================================

export function useSignaux(limit = 50) {
    return useQuery({
        queryKey: ['neocortex', 'signaux', limit],
        queryFn: async () => {
            const res = await neocortexApi.getSignaux(limit);
            if (!res.success) throw new Error(res.error?.message || 'Signaux indisponibles');
            return res.data || [];
        },
        staleTime: 10_000,
        refetchInterval: 15_000,
    });
}

// ============================================================================
// 📚 HISTORIQUE (Hippocampe)
// ============================================================================

export function useHistorique(filters: {
    entiteType?: string;
    entiteId?: string;
    userId?: string;
    categorie?: string;
    action?: string;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
} = {}) {
    return useQuery({
        queryKey: ['neocortex', 'historique', filters],
        queryFn: async () => {
            const res = await neocortexApi.getHistorique(filters);
            if (!res.success) throw new Error(res.error?.message || 'Historique indisponible');
            return res.data as {
                actions: HistoriqueAction[];
                total: number;
                page: number;
                totalPages: number;
            };
        },
        staleTime: 30_000,
    });
}

export function useHistoriqueEntite(entiteType: string, entiteId: string) {
    return useQuery({
        queryKey: ['neocortex', 'historique', entiteType, entiteId],
        queryFn: async () => {
            const res = await neocortexApi.getHistoriqueEntite(entiteType, entiteId);
            if (!res.success) throw new Error(res.error?.message);
            return res.data as HistoriqueAction[];
        },
        enabled: !!entiteType && !!entiteId,
        staleTime: 60_000,
    });
}

// ============================================================================
// 🔧 CONFIG (Plasticité)
// ============================================================================

export function useNeocortexConfig(categorie?: string) {
    return useQuery({
        queryKey: ['neocortex', 'config', categorie],
        queryFn: async () => {
            const res = await neocortexApi.getConfig(categorie);
            if (!res.success) throw new Error(res.error?.message);
            return res.data as ConfigSysteme[];
        },
        staleTime: 5 * 60_000,
    });
}

export function useUpdateConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ cle, valeur, description }: {
            cle: string;
            valeur: unknown;
            description?: string;
        }) => {
            const res = await neocortexApi.updateConfig(cle, valeur, description);
            if (!res.success) throw new Error(res.error?.message || 'Erreur de mise à jour');
            return res.data;
        },
        onSuccess: (_, { cle }) => {
            queryClient.invalidateQueries({ queryKey: ['neocortex', 'config'] });
            toast.success(`Configuration "${cle}" mise à jour`);
            setTimeout(() => { }, 3000); // auto-dismiss handled by Sonner
        },
        onError: (error: Error) => {
            toast.error(`Erreur : ${error.message}`);
        },
    });
}

// ============================================================================
// 🎯 DÉCISIONS (Préfrontal)
// ============================================================================

export function useValidateTransition() {
    return useMutation({
        mutationFn: async ({ module, statutActuel, nouveauStatut }: {
            module: string;
            statutActuel: string;
            nouveauStatut: string;
        }) => {
            const res = await neocortexApi.validateTransition(module, statutActuel, nouveauStatut);
            if (!res.success) throw new Error(res.error?.message);
            return res.data;
        },
    });
}

export function useAutoApprobation() {
    return useMutation({
        mutationFn: async (data: {
            module: string;
            entiteId: string;
            completude: number;
            delai?: number;
            historique?: number;
            conformite: number;
            urgence?: number;
        }) => {
            const res = await neocortexApi.evaluerAutoApprobation(data);
            if (!res.success) throw new Error(res.error?.message);
            return res.data as DecisionResult;
        },
        onSuccess: (data) => {
            const label = data.decision === 'approve' ? '✅ Auto-approuvé'
                : data.decision === 'reject' ? '❌ Rejeté'
                    : '🔍 Revue requise';
            toast.success(`${label} (score: ${(data.score * 100).toFixed(0)}%)`);
        },
    });
}

// ============================================================================
// 👂 NOTIFICATIONS (Auditif)
// ============================================================================

export function useNotifications(options: {
    nonLues?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
} = {}) {
    return useQuery({
        queryKey: ['neocortex', 'notifications', options],
        queryFn: async () => {
            const res = await neocortexApi.getNotifications(options);
            if (!res.success) throw new Error(res.error?.message);
            return res.data as {
                notifications: NeocortexNotification[];
                totalNonLues: number;
            };
        },
        staleTime: 15_000,
        refetchInterval: 30_000, // poll every 30s for new notifs
    });
}

export function useNotificationsCount() {
    return useQuery({
        queryKey: ['neocortex', 'notifications', 'count'],
        queryFn: async () => {
            const res = await neocortexApi.getNotificationsCount();
            if (!res.success) return 0;
            return (res.data as { nonLues: number }).nonLues;
        },
        staleTime: 10_000,
        refetchInterval: 20_000,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await neocortexApi.markNotificationRead(id);
            if (!res.success) throw new Error(res.error?.message);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neocortex', 'notifications'] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await neocortexApi.markAllNotificationsRead();
            if (!res.success) throw new Error(res.error?.message);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['neocortex', 'notifications'] });
            toast.success(`${(data as { marquees: number }).marquees} notifications marquées comme lues`);
        },
    });
}

// ============================================================================
// 📈 MÉTRIQUES
// ============================================================================

export function useMetriques(filters: {
    nom?: string;
    periode?: string;
    limit?: number;
} = {}) {
    return useQuery({
        queryKey: ['neocortex', 'metriques', filters],
        queryFn: async () => {
            const res = await neocortexApi.getMetriques(filters);
            if (!res.success) throw new Error(res.error?.message);
            return res.data as MetriqueSysteme[];
        },
        staleTime: 60_000,
        refetchInterval: 5 * 60_000,
    });
}

// ============================================================================
// 🧬 POIDS ADAPTATIFS
// ============================================================================

export function usePoidsAdaptatifs(signalType: string) {
    return useQuery({
        queryKey: ['neocortex', 'poids', signalType],
        queryFn: async () => {
            const res = await neocortexApi.getPoidsAdaptatifs(signalType);
            if (!res.success) throw new Error(res.error?.message);
            return res.data as Array<{ regle: string; poids: number; reussites: number; echecs: number }>;
        },
        enabled: !!signalType,
        staleTime: 5 * 60_000,
    });
}
