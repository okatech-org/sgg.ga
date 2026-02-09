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
    ptmApi,
    type PrioritePAG,
    type ObjectifGAR,
    type RapportGAR,
    type DashboardGAR,
    type Institution,
    type Nomination,
    type TexteJO,
    type InitiativePTMApi,
    type PTMStatsApi,
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

// ============================================================================
// PTM HOOKS (Programme de Travail du Ministère)
// ============================================================================

/**
 * Hook pour récupérer les initiatives PTM avec filtres
 * Fallback sur données mock si l'API backend est indisponible
 */
export function usePTMInitiatives(filters?: {
    page?: number;
    limit?: number;
    annee?: number;
    ministere_id?: string;
    statut?: string;
    rubrique?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: ['ptm', 'initiatives', filters],
        queryFn: async () => {
            try {
                const response = await ptmApi.getInitiatives(filters);
                if (response.success && response.data) {
                    return { data: response.data as InitiativePTMApi[], pagination: response.pagination };
                }
            } catch (err) {
                console.warn('API PTM non disponible, utilisation des données mock');
            }
            // Fallback: convertir les données mock camelCase → snake_case
            const { INITIATIVES_PTM } = await import('@/data/ptmData');
            const mockData: InitiativePTMApi[] = INITIATIVES_PTM.map((init) => ({
                id: init.id,
                ministere_id: init.ministereId || '',
                annee: 2026,
                rubrique: init.rubrique,
                numero: init.numero,
                intitule: init.intitule,
                cadrage: init.cadrage,
                cadrage_detail: init.cadrageDetail || null,
                incidence_financiere: init.incidenceFinanciere,
                loi_finance: init.loiFinance,
                services_porteurs: init.servicesPorteurs || [],
                date_transmission_sgg: init.dateTransmissionSGG || null,
                observations: init.observations || null,
                programme_pag_id: init.programmePAGId || null,
                statut: init.statut,
                ministere_nom: init.ministereId ? init.servicesPorteursNoms?.[0] || 'Ministère' : 'Ministère',
                ministere_sigle: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));
            return { data: mockData, pagination: { page: 1, limit: 50, total: mockData.length, totalPages: 1 } };
        },
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook pour récupérer une initiative PTM par ID
 */
export function usePTMInitiative(id: string | null) {
    return useQuery({
        queryKey: ['ptm', 'initiative', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await ptmApi.getInitiative(id);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as InitiativePTMApi;
        },
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook pour récupérer les statistiques PTM
 */
export function usePTMStats(annee?: number) {
    return useQuery({
        queryKey: ['ptm', 'stats', annee],
        queryFn: async () => {
            const response = await ptmApi.getStats(annee);
            if (!response.success) throw new Error(response.error?.message);
            return response.data as PTMStatsApi;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Mutation pour créer une initiative PTM
 */
export function useCreatePTMInitiative() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<InitiativePTMApi>) => ptmApi.createInitiative(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptm'] });
        },
    });
}

/**
 * Mutation pour modifier une initiative PTM
 */
export function useUpdatePTMInitiative() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<InitiativePTMApi> }) =>
            ptmApi.updateInitiative(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptm'] });
        },
    });
}

/**
 * Mutation pour soumettre une initiative PTM
 */
export function useSubmitPTMInitiative() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ptmApi.submitInitiative(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptm'] });
        },
    });
}

/**
 * Mutation pour valider/rejeter une initiative PTM
 */
export function useValidatePTMInitiative() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            decision,
            commentaire,
            motif_rejet,
        }: {
            id: string;
            decision: 'valide_sgg' | 'inscrit_ptg' | 'rejete';
            commentaire?: string;
            motif_rejet?: string;
        }) => ptmApi.validateInitiative(id, decision, commentaire, motif_rejet),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptm'] });
        },
    });
}
