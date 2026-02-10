/**
 * SGG Digital - Service API Centralisé
 * Connexion au backend avec gestion d'authentification et cache
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

import { apiLogger } from '@/services/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    institution_id?: string;
    totp_enabled?: boolean;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

const TOKEN_KEY = 'sgg_auth_token';
const USER_KEY = 'sgg_auth_user';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

// Track endpoints that have already failed to reduce console noise
const _failedEndpoints = new Set<string>();

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        // Handle 401 - Token expired
        if (response.status === 401) {
            removeToken();
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        // Clear failed endpoint on success
        _failedEndpoints.delete(endpoint);

        return data;
    } catch (error) {
        // Log only once per endpoint to reduce console noise
        if (!_failedEndpoints.has(endpoint)) {
            _failedEndpoints.add(endpoint);
            apiLogger.warn('API non disponible', { endpoint, error: String(error) });
        }
        return {
            success: false,
            error: {
                code: 'NETWORK_ERROR',
                message: 'Erreur de connexion au serveur',
            },
        };
    }
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
    /**
     * Login with email and password
     */
    login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
        const response = await fetchApi<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.data) {
            setToken(response.data.token);
            setStoredUser(response.data.user);
        }

        return response;
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await fetchApi<{ message: string }>('/api/auth/logout', {
            method: 'POST',
        });
        removeToken();
        return response;
    },

    /**
     * Get current user info
     */
    me: async (): Promise<ApiResponse<AuthUser>> => {
        return fetchApi<AuthUser>('/api/auth/me');
    },

    /**
     * Refresh token
     */
    refresh: async (): Promise<ApiResponse<{ token: string }>> => {
        const response = await fetchApi<{ token: string }>('/api/auth/refresh', {
            method: 'POST',
        });

        if (response.success && response.data) {
            setToken(response.data.token);
        }

        return response;
    },

    /**
     * Change password
     */
    changePassword: async (
        currentPassword: string,
        newPassword: string
    ): Promise<ApiResponse<{ message: string }>> => {
        return fetchApi<{ message: string }>('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });
    },
};

// ============================================================================
// GAR API (Gestion Axée sur les Résultats)
// ============================================================================

export interface PrioritePAG {
    id: string;
    code: string;
    priorite: string;
    titre: string;
    description: string;
    icone: string;
    couleur: string;
    ordre: number;
    budget_alloue: number;
    nb_objectifs_actifs?: number;
    objectifs_atteints?: number;
    objectifs_en_retard?: number;
    taux_execution_moyen?: number;
}

export interface ObjectifGAR {
    id: string;
    code: string;
    titre: string;
    description: string;
    priorite_id: string;
    priorite_titre: string;
    priorite_code: string;
    couleur: string;
    ministere_id: string;
    ministere_nom: string;
    ministere_sigle: string;
    annee: number;
    indicateur_cle: string;
    unite_mesure: string;
    valeur_cible: number;
    valeur_realisee: number;
    taux_execution: number;
    statut: 'non_demarre' | 'en_cours' | 'atteint' | 'en_retard' | 'suspendu';
    budget_prevu: number;
    budget_decaisse: number;
}

export interface RapportGAR {
    id: string;
    ministere_id: string;
    ministere_nom: string;
    ministere_sigle: string;
    annee: number;
    mois: number;
    statut: 'brouillon' | 'soumis' | 'valide' | 'rejete' | 'en_retard';
    date_soumission: string;
    date_validation: string;
    soumis_par_nom?: string;
    valide_par_nom?: string;
    synthese?: string;
    difficultes?: string;
    perspectives?: string;
}

export interface DashboardGAR {
    priorities: PrioritePAG[];
    globalStats: {
        total_objectifs: number;
        objectifs_atteints: number;
        objectifs_en_cours: number;
        objectifs_en_retard: number;
        taux_execution_global: number;
        budget_total_prevu: number;
        budget_total_decaisse: number;
    };
    ministeres: Array<{
        id: string;
        nom: string;
        sigle: string;
        nb_objectifs: number;
        objectifs_atteints: number;
        taux_execution_moyen: number;
        rapports_valides: number;
        rapports_en_retard: number;
    }>;
    recentReports: RapportGAR[];
    annee: number;
}

export const garApi = {
    /**
     * Get all PAG priorities (PUBLIC - no auth required)
     */
    getPrioritiesPublic: async (): Promise<ApiResponse<PrioritePAG[]>> => {
        return fetchApi<PrioritePAG[]>('/api/gar/public/priorities');
    },

    /**
     * Get public stats (PUBLIC - no auth required)
     */
    getPublicStats: async (annee?: number): Promise<ApiResponse<{
        total_objectifs: number;
        objectifs_atteints: number;
        objectifs_en_cours: number;
        taux_execution_global: number;
        budget_total_prevu: number;
        budget_total_decaisse: number;
        nb_ministeres: number;
        annee: number;
    }>> => {
        const params = annee ? `?annee=${annee}` : '';
        return fetchApi(`/api/gar/public/stats${params}`);
    },

    /**
     * Get all PAG priorities (requires auth)
     */
    getPriorities: async (): Promise<ApiResponse<PrioritePAG[]>> => {
        return fetchApi<PrioritePAG[]>('/api/gar/priorities');
    },

    /**
     * Get GAR dashboard data (requires auth)
     */
    getDashboard: async (annee?: number): Promise<ApiResponse<DashboardGAR>> => {
        const params = annee ? `?annee=${annee}` : '';
        return fetchApi<DashboardGAR>(`/api/gar/dashboard${params}`);
    },

    /**
     * Get objectives with filters
     */
    getObjectifs: async (filters?: {
        page?: number;
        limit?: number;
        annee?: number;
        ministere_id?: string;
        priorite_id?: string;
        statut?: string;
        search?: string;
    }): Promise<ApiResponse<ObjectifGAR[]>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return fetchApi<ObjectifGAR[]>(`/api/gar/objectifs?${params}`);
    },

    /**
     * Get single objective
     */
    getObjectif: async (id: string): Promise<ApiResponse<ObjectifGAR>> => {
        return fetchApi<ObjectifGAR>(`/api/gar/objectifs/${id}`);
    },

    /**
     * Create objective
     */
    createObjectif: async (data: Partial<ObjectifGAR>): Promise<ApiResponse<ObjectifGAR>> => {
        return fetchApi<ObjectifGAR>('/api/gar/objectifs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update objective
     */
    updateObjectif: async (id: string, data: Partial<ObjectifGAR>): Promise<ApiResponse<ObjectifGAR>> => {
        return fetchApi<ObjectifGAR>(`/api/gar/objectifs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get reports
     */
    getRapports: async (filters?: {
        page?: number;
        limit?: number;
        annee?: number;
        mois?: number;
        ministere_id?: string;
        statut?: string;
    }): Promise<ApiResponse<RapportGAR[]>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return fetchApi<RapportGAR[]>(`/api/gar/rapports?${params}`);
    },

    /**
     * Submit report
     */
    submitRapport: async (data: Partial<RapportGAR>): Promise<ApiResponse<RapportGAR>> => {
        return fetchApi<RapportGAR>('/api/gar/rapports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Validate report
     */
    validateRapport: async (
        id: string,
        statut: 'valide' | 'rejete',
        observations?: string
    ): Promise<ApiResponse<RapportGAR>> => {
        return fetchApi<RapportGAR>(`/api/gar/rapports/${id}/validate`, {
            method: 'PATCH',
            body: JSON.stringify({ statut, observations }),
        });
    },

    /**
     * Get ministry stats
     */
    getMinistereStats: async (id: string, annee?: number): Promise<ApiResponse<any>> => {
        const params = annee ? `?annee=${annee}` : '';
        return fetchApi<any>(`/api/gar/ministeres/${id}/stats${params}`);
    },
};

// ============================================================================
// INSTITUTIONS API
// ============================================================================

export interface Institution {
    id: string;
    code: string;
    nom: string;
    nom_court?: string;
    sigle: string;
    type: string;
    parent_id?: string;
    ordre_protocole: number;
    ville?: string;
    logo_url?: string;
    responsable_nom?: string;
    responsable_fonction?: string;
    niveau_digitalisation?: string;
    is_active: boolean;
}

export const institutionsApi = {
    /**
     * Get all institutions
     */
    getAll: async (filters?: {
        type?: string;
        parent_id?: string;
        is_active?: string;
    }): Promise<ApiResponse<Institution[]>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, value);
            });
        }
        return fetchApi<Institution[]>(`/api/institutions?${params}`);
    },

    /**
     * Get ministries only
     */
    getMinisteres: async (): Promise<ApiResponse<Institution[]>> => {
        return fetchApi<Institution[]>('/api/institutions/ministeres');
    },

    /**
     * Get single institution
     */
    getById: async (id: string): Promise<ApiResponse<Institution & {
        children: Institution[];
        interactions: any[];
    }>> => {
        return fetchApi<Institution & { children: Institution[]; interactions: any[] }>(
            `/api/institutions/${id}`
        );
    },

    /**
     * Get institution hierarchy
     */
    getHierarchy: async (id: string): Promise<ApiResponse<{
        ancestors: Institution[];
        descendants: Institution[];
    }>> => {
        return fetchApi<{ ancestors: Institution[]; descendants: Institution[] }>(
            `/api/institutions/${id}/hierarchy`
        );
    },
};

// ============================================================================
// NOMINATIONS API
// ============================================================================

export interface Nomination {
    id: string;
    reference: string;
    candidat_nom: string;
    candidat_prenom: string;
    poste_titre: string;
    poste_categorie: string;
    ministere_nom: string;
    type: 'nomination' | 'renouvellement' | 'promotion' | 'cessation';
    statut: string;
    date_proposition: string;
    date_decision?: string;
}

export const nominationsApi = {
    /**
     * Get nominations list
     */
    getAll: async (filters?: {
        page?: number;
        limit?: number;
        statut?: string;
        type?: string;
        ministere_id?: string;
        search?: string;
    }): Promise<ApiResponse<Nomination[]>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return fetchApi<Nomination[]>(`/api/nominations/dossiers?${params}`);
    },

    /**
     * Get single nomination
     */
    getById: async (id: string): Promise<ApiResponse<Nomination>> => {
        return fetchApi<Nomination>(`/api/nominations/dossiers/${id}`);
    },

    /**
     * Create nomination
     */
    create: async (data: Partial<Nomination>): Promise<ApiResponse<Nomination>> => {
        return fetchApi<Nomination>('/api/nominations/dossiers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Transition nomination status
     */
    transition: async (
        id: string,
        nouveauStatut: string,
        commentaire?: string
    ): Promise<ApiResponse<Nomination>> => {
        return fetchApi<Nomination>(`/api/nominations/dossiers/${id}/transition`, {
            method: 'PUT',
            body: JSON.stringify({ nouveau_statut: nouveauStatut, commentaire }),
        });
    },
};

// ============================================================================
// JOURNAL OFFICIEL API
// ============================================================================

export interface TexteJO {
    id: string;
    numero_jo: string;
    titre: string;
    type: string;
    date_publication: string;
    date_signature: string;
    signataire: string;
    ministere?: string;
    resume?: string;
    contenu_html?: string;
    fichier_url?: string;
    vues: number;
}

export const joApi = {
    /**
     * Search textes (public)
     */
    searchTextes: async (filters?: {
        q?: string;
        type?: string;
        annee?: number;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<TexteJO[]>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return fetchApi<TexteJO[]>(`/api/jo/textes?${params}`);
    },

    /**
     * Get single texte
     */
    getTexte: async (id: string): Promise<ApiResponse<TexteJO>> => {
        return fetchApi<TexteJO>(`/api/jo/textes/${id}`);
    },

    /**
     * Get recent JO numbers
     */
    getNumeros: async (limit?: number): Promise<ApiResponse<any[]>> => {
        const params = limit ? `?limit=${limit}` : '';
        return fetchApi<any[]>(`/api/jo/numeros${params}`);
    },
};

// ============================================================================
// PTM API (Programme de Travail du Ministère)
// ============================================================================

export interface InitiativePTMApi {
    id: string;
    ministere_id: string;
    ministere_nom?: string;
    ministere_sigle?: string;
    direction_id?: string;
    direction_nom?: string;
    annee: number;
    rubrique: 'projet_texte_legislatif' | 'politique_generale' | 'missions_conferences';
    numero: number;
    intitule: string;
    cadrage: 'sept_priorites' | 'pag' | 'pncd' | 'pap';
    cadrage_detail?: string;
    incidence_financiere: boolean;
    loi_finance: boolean;
    services_porteurs: string[];
    date_transmission_sgg?: string;
    observations?: string;
    programme_pag_id?: string;
    statut: string; // Hierarchical statuses: brouillon, soumis_sg, consolide_sg, soumis_sgg, etc.
    soumis_par?: string;
    soumis_par_nom?: string;
    date_soumission?: string;
    valide_sgg_par?: string;
    valide_sgg_par_nom?: string;
    date_validation_sgg?: string;
    commentaire_sgg?: string;
    inscrit_ptg_par?: string;
    inscrit_ptg_par_nom?: string;
    date_inscription_ptg?: string;
    motif_rejet?: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface PTMStatsApi {
    totalInitiatives: number;
    parRubrique: Record<string, number>;
    parStatut: Record<string, number>;
    tauxInscriptionPTG: number;
    avecIncidenceFinanciere: number;
    avecLoiFinance: number;
    annee: number;
}

export const ptmApi = {
    /**
     * Get PTM initiatives with filters and pagination
     */
    getInitiatives: async (filters?: {
        page?: number;
        limit?: number;
        annee?: number;
        ministere_id?: string;
        statut?: string;
        rubrique?: string;
        search?: string;
    }): Promise<ApiResponse<InitiativePTMApi[]>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return fetchApi<InitiativePTMApi[]>(`/api/ptm/initiatives?${params}`);
    },

    /**
     * Get single initiative
     */
    getInitiative: async (id: string): Promise<ApiResponse<InitiativePTMApi>> => {
        return fetchApi<InitiativePTMApi>(`/api/ptm/initiatives/${id}`);
    },

    /**
     * Create initiative
     */
    createInitiative: async (data: Partial<InitiativePTMApi>): Promise<ApiResponse<InitiativePTMApi>> => {
        return fetchApi<InitiativePTMApi>('/api/ptm/initiatives', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update initiative
     */
    updateInitiative: async (id: string, data: Partial<InitiativePTMApi>): Promise<ApiResponse<InitiativePTMApi>> => {
        return fetchApi<InitiativePTMApi>(`/api/ptm/initiatives/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    /**
     * Submit initiative for validation
     */
    submitInitiative: async (id: string): Promise<ApiResponse<InitiativePTMApi>> => {
        return fetchApi<InitiativePTMApi>(`/api/ptm/initiatives/${id}/submit`, {
            method: 'POST',
        });
    },

    /**
     * Validate/Reject initiative
     */
    validateInitiative: async (
        id: string,
        decision: 'valide_sgg' | 'inscrit_ptg' | 'rejete',
        commentaire?: string,
        motif_rejet?: string
    ): Promise<ApiResponse<InitiativePTMApi>> => {
        return fetchApi<InitiativePTMApi>(`/api/ptm/initiatives/${id}/validate`, {
            method: 'PATCH',
            body: JSON.stringify({ decision, commentaire, motif_rejet }),
        });
    },

    /**
     * Get PTM statistics
     */
    getStats: async (annee?: number): Promise<ApiResponse<PTMStatsApi>> => {
        const params = annee ? `?annee=${annee}` : '';
        return fetchApi<PTMStatsApi>(`/api/ptm/stats${params}`);
    },
};

// ============================================================================
// HEALTH API
// ============================================================================

export const healthApi = {
    check: async (): Promise<ApiResponse<{
        status: string;
        timestamp: string;
        service: string;
        version: string;
    }>> => {
        return fetchApi('/api/health');
    },
};

// ============================================================================
// 🧠 NEOCORTEX API — Système nerveux digital
// ============================================================================

/** Types NEOCORTEX frontend */
export interface NeocortexDashboard {
    limbique: {
        totalSignaux: number;
        nonTraites: number;
        derniere24h: number;
        parType: Record<string, number>;
    };
    hippocampe: {
        totalActions: number;
        derniere24h: number;
        parCategorie: Record<string, number>;
        topActions: Array<{ action: string; count: number }>;
        topUtilisateurs: Array<{ userId: string; email: string; count: number }>;
    };
    moteur: {
        enAttente: number;
        enCours: number;
        terminees24h: number;
        echouees24h: number;
        parType: Array<{ type: string; count: number; statut: string }>;
    };
    timestamp: string;
}

export interface NeocortexNotification {
    id: string;
    type: string;
    canal: string;
    titre: string;
    message: string;
    lien: string | null;
    entiteType: string | null;
    entiteId: string | null;
    lu: boolean;
    luAt: string | null;
    createdAt: string;
}

export interface HistoriqueAction {
    id: string;
    action: string;
    categorie: string;
    entiteType: string;
    entiteId: string | null;
    userId: string | null;
    userEmail: string | null;
    userRole: string | null;
    details: Record<string, unknown>;
    metadata: Record<string, unknown>;
    correlationId: string | null;
    durationMs: number | null;
    createdAt: string;
}

export interface TransitionValidation {
    autorise: boolean;
    transitionsValides: string[];
}

export interface DecisionResult {
    score: number;
    decision: 'approve' | 'reject' | 'review';
    details: Array<{ valeur: number; poids: number; label?: string }>;
    seuils: { auto_approve: number; auto_reject: number };
}

export interface ConfigSysteme {
    cle: string;
    valeur: unknown;
    description: string | null;
    categorie?: string;
    version: number;
    updated_at?: string;
}

export interface MetriqueSysteme {
    nom: string;
    valeur: number;
    unite: string;
    periode: string;
    dimensions: Record<string, unknown>;
    created_at: string;
}

export const neocortexApi = {
    /** Dashboard complet du système nerveux */
    getDashboard: async (): Promise<ApiResponse<NeocortexDashboard>> =>
        fetchApi<NeocortexDashboard>('/api/neocortex/dashboard'),

    /** Signaux non traités */
    getSignaux: async (limit = 50): Promise<ApiResponse<unknown[]>> =>
        fetchApi(`/api/neocortex/signaux?limit=${limit}`),

    /** Historique des actions avec filtres */
    getHistorique: async (filters: {
        entiteType?: string;
        entiteId?: string;
        userId?: string;
        categorie?: string;
        action?: string;
        dateDebut?: string;
        dateFin?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<ApiResponse<{
        actions: HistoriqueAction[];
        total: number;
        page: number;
        totalPages: number;
    }>> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== '') params.set(k, String(v));
        });
        return fetchApi(`/api/neocortex/historique?${params}`);
    },

    /** Timeline d'une entité spécifique */
    getHistoriqueEntite: async (entiteType: string, entiteId: string): Promise<ApiResponse<HistoriqueAction[]>> =>
        fetchApi(`/api/neocortex/historique/${entiteType}/${entiteId}`),

    /** Lire toutes les configs ou par catégorie */
    getConfig: async (categorie?: string): Promise<ApiResponse<ConfigSysteme[]>> => {
        const params = categorie ? `?categorie=${categorie}` : '';
        return fetchApi(`/api/neocortex/config${params}`);
    },

    /** Lire une config spécifique */
    getConfigValue: async (cle: string): Promise<ApiResponse<{ cle: string; valeur: unknown }>> =>
        fetchApi(`/api/neocortex/config/${cle}`),

    /** Modifier une config */
    updateConfig: async (cle: string, valeur: unknown, description?: string): Promise<ApiResponse<{ cle: string; valeur: unknown }>> =>
        fetchApi(`/api/neocortex/config/${cle}`, {
            method: 'PUT',
            body: JSON.stringify({ valeur, description }),
        }),

    /** Valider une transition de workflow */
    validateTransition: async (module: string, statutActuel: string, nouveauStatut: string): Promise<ApiResponse<TransitionValidation>> =>
        fetchApi('/api/neocortex/decision/transition/validate', {
            method: 'POST',
            body: JSON.stringify({ module, statutActuel, nouveauStatut }),
        }),

    /** Évaluer un dossier pour auto-approbation */
    evaluerAutoApprobation: async (data: {
        module: string;
        entiteId: string;
        completude: number;
        delai?: number;
        historique?: number;
        conformite: number;
        urgence?: number;
    }): Promise<ApiResponse<DecisionResult>> =>
        fetchApi('/api/neocortex/decision/auto-approbation', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /** Mes notifications */
    getNotifications: async (options: {
        nonLues?: boolean;
        type?: string;
        limit?: number;
        offset?: number;
    } = {}): Promise<ApiResponse<{
        notifications: NeocortexNotification[];
        totalNonLues: number;
    }>> => {
        const params = new URLSearchParams();
        if (options.nonLues) params.set('nonLues', 'true');
        if (options.type) params.set('type', options.type);
        if (options.limit) params.set('limit', String(options.limit));
        if (options.offset) params.set('offset', String(options.offset));
        return fetchApi(`/api/neocortex/notifications?${params}`);
    },

    /** Compteur de notifications non lues */
    getNotificationsCount: async (): Promise<ApiResponse<{ nonLues: number }>> =>
        fetchApi('/api/neocortex/notifications/count'),

    /** Marquer une notification comme lue */
    markNotificationRead: async (id: string): Promise<ApiResponse<{ success: boolean }>> =>
        fetchApi(`/api/neocortex/notifications/${id}/lue`, { method: 'PATCH' }),

    /** Marquer toutes les notifications comme lues */
    markAllNotificationsRead: async (): Promise<ApiResponse<{ marquees: number }>> =>
        fetchApi('/api/neocortex/notifications/lire-tout', { method: 'PATCH' }),

    /** Poids adaptatifs pour un signal */
    getPoidsAdaptatifs: async (signalType: string): Promise<ApiResponse<
        Array<{ regle: string; poids: number; reussites: number; echecs: number }>
    >> =>
        fetchApi(`/api/neocortex/poids/${signalType}`),

    /** Métriques du système */
    getMetriques: async (filters: {
        nom?: string;
        periode?: string;
        limit?: number;
    } = {}): Promise<ApiResponse<MetriqueSysteme[]>> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined) params.set(k, String(v));
        });
        return fetchApi(`/api/neocortex/metriques?${params}`);
    },
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
    auth: authApi,
    gar: garApi,
    institutions: institutionsApi,
    nominations: nominationsApi,
    jo: joApi,
    ptm: ptmApi,
    health: healthApi,
    neocortex: neocortexApi,
};
