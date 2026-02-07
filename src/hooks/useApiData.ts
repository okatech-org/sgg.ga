/**
 * SGG Digital - Hooks API avec React Query
 * Gestion du cache et des états de chargement
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    garApi,
    institutionsApi,
    nominationsApi,
    joApi,
    authApi,
    type PrioritePAG,
    type ObjectifGAR,
    type RapportGAR,
    type DashboardGAR,
    type Institution,
    type Nomination,
    type TexteJO,
} from '@/services/api';

// ============================================================================
// GAR HOOKS (Gestion Axée sur les Résultats)
// ============================================================================

/**
 * Hook pour récupérer les 8 priorités PAG (PUBLIC - pas d'auth requise)
 * Utilisé pour la page PAG 2026 publique
 */
export function usePrioritiesPublic() {
    return useQuery({
        queryKey: ['gar', 'priorities', 'public'],
        queryFn: async () => {
            const response = await garApi.getPrioritiesPublic();
            if (!response.success) throw new Error(response.error?.message);
            return response.data as PrioritePAG[];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes pour données publiques
        gcTime: 60 * 60 * 1000, // 1 heure de cache
    });
}

/**
 * Hook pour les stats publiques du PAG
 */
export function usePublicStats(annee?: number) {
    return useQuery({
        queryKey: ['gar', 'stats', 'public', annee || new Date().getFullYear()],
        queryFn: async () => {
            const response = await garApi.getPublicStats(annee);
            if (!response.success) throw new Error(response.error?.message);
            return response.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Hook pour récupérer les 8 priorités PAG (AUTH - requiert authentification)
 */
export function usePriorities() {
    return useQuery({
        queryKey: ['gar', 'priorities'],
        queryFn: async () => {
            const response = await garApi.getPriorities();
            if (!response.success) throw new Error(response.error?.message);
            return response.data as PrioritePAG[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (anciennement cacheTime)
    });
}

/**
 * Hook pour le dashboard GAR
 */
export function useGARDashboard(annee?: number) {
    return useQuery({
        queryKey: ['gar', 'dashboard', annee || new Date().getFullYear()],
        queryFn: async () => {
            const response = await garApi.getDashboard(annee);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as DashboardGAR;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // Refresh toutes les 5 minutes
    });
}

/**
 * Hook pour les objectifs avec filtres
 */
export function useObjectifs(filters?: {
    page?: number;
    limit?: number;
    annee?: number;
    ministere_id?: string;
    priorite_id?: string;
    statut?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: ['gar', 'objectifs', filters],
        queryFn: async () => {
            const response = await garApi.getObjectifs(filters);
            if (!response.success) throw new Error(response.error?.message);
            return {
                data: response.data as ObjectifGAR[],
                pagination: response.pagination,
            };
        },
        staleTime: 1 * 60 * 1000,
    });
}

/**
 * Hook pour un objectif spécifique
 */
export function useObjectif(id: string) {
    return useQuery({
        queryKey: ['gar', 'objectif', id],
        queryFn: async () => {
            const response = await garApi.getObjectif(id);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as ObjectifGAR;
        },
        enabled: !!id,
    });
}

/**
 * Hook pour les rapports mensuels
 */
export function useRapports(filters?: {
    page?: number;
    limit?: number;
    annee?: number;
    mois?: number;
    ministere_id?: string;
    statut?: string;
}) {
    return useQuery({
        queryKey: ['gar', 'rapports', filters],
        queryFn: async () => {
            const response = await garApi.getRapports(filters);
            if (!response.success) throw new Error(response.error?.message);
            return {
                data: response.data as RapportGAR[],
                pagination: response.pagination,
            };
        },
        staleTime: 1 * 60 * 1000,
    });
}

/**
 * Hook mutation pour soumettre un rapport
 */
export function useSubmitRapport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<RapportGAR>) => garApi.submitRapport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gar', 'rapports'] });
            queryClient.invalidateQueries({ queryKey: ['gar', 'dashboard'] });
        },
    });
}

/**
 * Hook mutation pour valider un rapport
 */
export function useValidateRapport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, statut, observations }: {
            id: string;
            statut: 'valide' | 'rejete';
            observations?: string;
        }) => garApi.validateRapport(id, statut, observations),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gar', 'rapports'] });
            queryClient.invalidateQueries({ queryKey: ['gar', 'dashboard'] });
        },
    });
}

/**
 * Hook mutation pour créer un objectif
 */
export function useCreateObjectif() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<ObjectifGAR>) => garApi.createObjectif(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gar', 'objectifs'] });
            queryClient.invalidateQueries({ queryKey: ['gar', 'priorities'] });
        },
    });
}

/**
 * Hook mutation pour mettre à jour un objectif
 */
export function useUpdateObjectif() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ObjectifGAR> }) =>
            garApi.updateObjectif(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['gar', 'objectif', id] });
            queryClient.invalidateQueries({ queryKey: ['gar', 'objectifs'] });
        },
    });
}

// ============================================================================
// INSTITUTIONS HOOKS
// ============================================================================

/**
 * Hook pour toutes les institutions
 */
export function useInstitutions(filters?: {
    type?: string;
    parent_id?: string;
    is_active?: string;
}) {
    return useQuery({
        queryKey: ['institutions', 'list', filters],
        queryFn: async () => {
            const response = await institutionsApi.getAll(filters);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as Institution[];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook pour les ministères uniquement
 */
export function useMinisteres() {
    return useQuery({
        queryKey: ['institutions', 'ministeres'],
        queryFn: async () => {
            const response = await institutionsApi.getMinisteres();
            if (!response.success) throw new Error(response.error?.message);
            return response.data as Institution[];
        },
        staleTime: 30 * 60 * 1000, // 30 minutes (données stables)
    });
}

/**
 * Hook pour une institution spécifique
 */
export function useInstitution(id: string) {
    return useQuery({
        queryKey: ['institutions', 'detail', id],
        queryFn: async () => {
            const response = await institutionsApi.getById(id);
            if (!response.success) throw new Error(response.error?.message);
            return response.data;
        },
        enabled: !!id,
    });
}

// ============================================================================
// NOMINATIONS HOOKS
// ============================================================================

/**
 * Hook pour les nominations
 */
export function useNominations(filters?: {
    page?: number;
    limit?: number;
    statut?: string;
    type?: string;
    ministere_id?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: ['nominations', 'list', filters],
        queryFn: async () => {
            const response = await nominationsApi.getAll(filters);
            if (!response.success) throw new Error(response.error?.message);
            return {
                data: response.data as Nomination[],
                pagination: response.pagination,
            };
        },
        staleTime: 1 * 60 * 1000,
    });
}

/**
 * Hook pour une nomination spécifique
 */
export function useNomination(id: string) {
    return useQuery({
        queryKey: ['nominations', 'detail', id],
        queryFn: async () => {
            const response = await nominationsApi.getById(id);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as Nomination;
        },
        enabled: !!id,
    });
}

/**
 * Hook mutation pour créer une nomination
 */
export function useCreateNomination() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Nomination>) => nominationsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nominations'] });
        },
    });
}

/**
 * Hook mutation pour changer le statut d'une nomination
 */
export function useTransitionNomination() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, nouveauStatut, commentaire }: {
            id: string;
            nouveauStatut: string;
            commentaire?: string;
        }) => nominationsApi.transition(id, nouveauStatut, commentaire),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['nominations', 'detail', id] });
            queryClient.invalidateQueries({ queryKey: ['nominations', 'list'] });
        },
    });
}

// ============================================================================
// JOURNAL OFFICIEL HOOKS
// ============================================================================

/**
 * Hook pour rechercher des textes JO
 */
export function useTextesJO(filters?: {
    q?: string;
    type?: string;
    annee?: number;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: ['jo', 'textes', filters],
        queryFn: async () => {
            const response = await joApi.searchTextes(filters);
            if (!response.success) throw new Error(response.error?.message);
            return {
                data: response.data as TexteJO[],
                pagination: response.pagination,
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook pour un texte JO spécifique
 */
export function useTexteJO(id: string) {
    return useQuery({
        queryKey: ['jo', 'texte', id],
        queryFn: async () => {
            const response = await joApi.getTexte(id);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as TexteJO;
        },
        enabled: !!id,
    });
}

/**
 * Hook pour les numéros JO récents
 */
export function useNumerosJO(limit?: number) {
    return useQuery({
        queryKey: ['jo', 'numeros', limit],
        queryFn: async () => {
            const response = await joApi.getNumeros(limit);
            if (!response.success) throw new Error(response.error?.message);
            return response.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

// ============================================================================
// AUTH HOOKS
// ============================================================================

/**
 * Hook mutation pour le login
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authApi.login({ email, password }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
    });
}

/**
 * Hook mutation pour le logout
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            queryClient.clear();
        },
    });
}

/**
 * Hook pour récupérer l'utilisateur courant
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await authApi.me();
            if (!response.success) throw new Error(response.error?.message);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}
