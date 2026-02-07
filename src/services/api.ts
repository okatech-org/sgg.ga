/**
 * SGG Digital - Service API Centralisé
 * Connexion au backend avec gestion d'authentification et cache
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

        return data;
    } catch (error) {
        console.error('API Error:', error);
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
// EXPORT DEFAULT
// ============================================================================

export default {
    auth: authApi,
    gar: garApi,
    institutions: institutionsApi,
    nominations: nominationsApi,
    jo: joApi,
    health: healthApi,
};
