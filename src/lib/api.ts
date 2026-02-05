/**
 * SGG Digital - API Client
 * Client HTTP pour communiquer avec le backend Google Cloud Run
 */

// Configuration API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.sgg.ga';

// Mode démo : utiliser des données mockées si pas d'API configurée
const DEMO_MODE = !import.meta.env.VITE_API_URL;

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Token management
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Main API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params, headers = {}, signal } = options;

  // En mode démo, retourner des données mockées
  if (DEMO_MODE) {
    return getMockResponse<T>(endpoint, method);
  }

  const url = buildUrl(endpoint, params);

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || 'Une erreur est survenue',
          details: data.error?.details,
        },
      };
    }

    return {
      success: true,
      data: data.data,
      pagination: data.pagination,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'REQUEST_ABORTED',
            message: 'La requête a été annulée',
          },
        };
      }
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

/**
 * Mock data for demo mode
 */
function getMockResponse<T>(endpoint: string, method: string): ApiResponse<T> {
  // Dashboard GAR - Retourner success:false pour forcer le hook à utiliser ses données mock
  if (endpoint.includes('/api/gar/dashboard')) {
    return {
      success: false,
      error: {
        code: 'DEMO_MODE',
        message: 'Mode démo - Données locales utilisées',
      },
    };
  }

  // Nominations stats
  if (endpoint.includes('/api/nominations/stats')) {
    return {
      success: true,
      data: {
        total: 156,
        enAttente: 23,
        validees: 118,
        rejetees: 15,
      } as unknown as T,
    };
  }

  // Default - retourner success:false pour utiliser les données mock locales
  return {
    success: false,
    error: {
      code: 'DEMO_MODE',
      message: 'Mode démo - Endpoint non configuré',
    },
  };
}

/**
 * GET request helper
 */
export function get<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET', params });
}

/**
 * POST request helper
 */
export function post<T>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'POST', body });
}

/**
 * PUT request helper
 */
export function put<T>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'PUT', body });
}

/**
 * PATCH request helper
 */
export function patch<T>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body });
}

/**
 * DELETE request helper
 */
export function del<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Upload file helper
 */
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>
): Promise<ApiResponse<{ url: string; id: string }>> {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const headers: Record<string, string> = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'UPLOAD_ERROR',
          message: data.error?.message || 'Erreur lors du téléversement',
        },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Erreur lors du téléversement du fichier',
      },
    };
  }
}

// =============================================================================
// API Endpoints - Specific Methods
// =============================================================================

// Auth
export const auth = {
  login: (email: string, password: string) =>
    post<{ token: string; user: any }>('/api/auth/login', { email, password }),

  logout: () =>
    post('/api/auth/logout'),

  me: () =>
    get<any>('/api/auth/me'),

  refreshToken: () =>
    post<{ token: string }>('/api/auth/refresh'),
};

// Users
export const users = {
  list: (params?: { page?: number; limit?: number; role?: string }) =>
    get<any[]>('/api/users', params),

  get: (id: string) =>
    get<any>(`/api/users/${id}`),

  create: (data: any) =>
    post<any>('/api/users', data),

  update: (id: string, data: any) =>
    patch<any>(`/api/users/${id}`, data),

  delete: (id: string) =>
    del(`/api/users/${id}`),

  updateRole: (id: string, role: string) =>
    patch<any>(`/api/users/${id}/role`, { role }),
};

// Nominations
export const nominations = {
  list: (params?: { page?: number; limit?: number; statut?: string; ministere?: string }) =>
    get<any[]>('/api/nominations', params),

  get: (id: string) =>
    get<any>(`/api/nominations/${id}`),

  create: (data: any) =>
    post<any>('/api/nominations', data),

  update: (id: string, data: any) =>
    patch<any>(`/api/nominations/${id}`, data),

  updateStatus: (id: string, statut: string, commentaire?: string) =>
    patch<any>(`/api/nominations/${id}/status`, { statut, commentaire }),

  uploadDocument: (id: string, type: string, file: File) =>
    uploadFile(`/api/nominations/${id}/documents`, file, { type }),

  getHistory: (id: string) =>
    get<any[]>(`/api/nominations/${id}/history`),

  getStats: () =>
    get<any>('/api/nominations/stats'),
};

// Textes Législatifs
export const textes = {
  list: (params?: { page?: number; limit?: number; type?: string; statut?: string }) =>
    get<any[]>('/api/textes', params),

  get: (id: string) =>
    get<any>(`/api/textes/${id}`),

  create: (data: any) =>
    post<any>('/api/textes', data),

  update: (id: string, data: any) =>
    patch<any>(`/api/textes/${id}`, data),

  updateStatus: (id: string, statut: string, commentaire?: string) =>
    patch<any>(`/api/textes/${id}/status`, { statut, commentaire }),

  getVersions: (id: string) =>
    get<any[]>(`/api/textes/${id}/versions`),

  getAvis: (id: string) =>
    get<any[]>(`/api/textes/${id}/avis`),
};

// Journal Officiel
export const journalOfficiel = {
  list: (params?: { page?: number; limit?: number; type?: string; search?: string }) =>
    get<any[]>('/api/jo', params),

  get: (id: string) =>
    get<any>(`/api/jo/${id}`),

  search: (query: string) =>
    get<any[]>('/api/jo/search', { q: query }),

  getStats: () =>
    get<any>('/api/jo/stats'),

  getPopular: (limit?: number) =>
    get<any[]>('/api/jo/popular', { limit }),

  incrementView: (id: string) =>
    post(`/api/jo/${id}/view`),
};

// Conseils Interministériels
export const conseils = {
  list: (params?: { page?: number; limit?: number; statut?: string }) =>
    get<any[]>('/api/conseils', params),

  get: (id: string) =>
    get<any>(`/api/conseils/${id}`),

  create: (data: any) =>
    post<any>('/api/conseils', data),

  update: (id: string, data: any) =>
    patch<any>(`/api/conseils/${id}`, data),

  getParticipants: (id: string) =>
    get<any[]>(`/api/conseils/${id}/participants`),

  getDossiers: (id: string) =>
    get<any[]>(`/api/conseils/${id}/dossiers`),
};

// Réunions Interministérielles
export const reunions = {
  list: (params?: { page?: number; limit?: number; statut?: string }) =>
    get<any[]>('/api/reunions', params),

  get: (id: string) =>
    get<any>(`/api/reunions/${id}`),

  create: (data: any) =>
    post<any>('/api/reunions', data),

  update: (id: string, data: any) =>
    patch<any>(`/api/reunions/${id}`, data),
};

// Courriers
export const courriers = {
  list: (params?: { page?: number; limit?: number; type?: string; statut?: string }) =>
    get<any[]>('/api/courriers', params),

  get: (id: string) =>
    get<any>(`/api/courriers/${id}`),

  create: (data: any) =>
    post<any>('/api/courriers', data),

  update: (id: string, data: any) =>
    patch<any>(`/api/courriers/${id}`, data),

  updateStatus: (id: string, statut: string) =>
    patch<any>(`/api/courriers/${id}/status`, { statut }),

  assign: (id: string, userId: string) =>
    patch<any>(`/api/courriers/${id}/assign`, { userId }),
};

// GAR (Plan d'Action Gouvernemental)
export const gar = {
  getObjectifs: (params?: { ministere?: string; annee?: number }) =>
    get<any[]>('/api/gar/objectifs', params),

  getObjectif: (id: string) =>
    get<any>(`/api/gar/objectifs/${id}`),

  updateObjectif: (id: string, data: any) =>
    patch<any>(`/api/gar/objectifs/${id}`, data),

  getRapports: (params?: { ministere?: string; annee?: number; mois?: number }) =>
    get<any[]>('/api/gar/rapports', params),

  submitRapport: (data: any) =>
    post<any>('/api/gar/rapports', data),

  getDashboard: () =>
    get<any>('/api/gar/dashboard'),

  getMinistereStats: (ministereId: string) =>
    get<any>(`/api/gar/ministeres/${ministereId}/stats`),
};

// Institutions
export const institutions = {
  list: (params?: { type?: string }) =>
    get<any[]>('/api/institutions', params),

  get: (id: string) =>
    get<any>(`/api/institutions/${id}`),

  getRelations: (id: string) =>
    get<any[]>(`/api/institutions/${id}/relations`),
};

// Notifications
export const notifications = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    get<any[]>('/api/notifications', params),

  markAsRead: (id: string) =>
    patch(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    patch('/api/notifications/read-all'),

  getUnreadCount: () =>
    get<{ count: number }>('/api/notifications/unread-count'),
};

// Export default API object
export default {
  auth,
  users,
  nominations,
  textes,
  journalOfficiel,
  conseils,
  reunions,
  courriers,
  gar,
  institutions,
  notifications,
  // Raw methods
  get,
  post,
  put,
  patch,
  del,
  uploadFile,
  setAuthToken,
  getAuthToken,
};
