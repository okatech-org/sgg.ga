/**
 * SGG Digital - GAR (Gestion Axée sur les Résultats) Hooks
 * Hooks React pour la gestion des données GAR
 * Connecté au backend réel avec fallback sur données mock
 */

import { useState, useEffect, useCallback } from 'react';
import { gar } from '@/lib/api';
import { garApi } from '@/services/api';
import { garLogger } from '@/services/logger';
import type {
  PrioritePresidentielle,
} from '@/types';

// Types pour les états de chargement
interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Types locaux pour les objectifs et rapports
interface GARObjectif {
  id: string;
  code: string;
  titre: string;
  ministere_id: string;
  priorite_id: string;
  annee: number;
  taux_execution: number;
  statut: string;
  [key: string]: any;
}

interface GARRapportMensuel {
  id: string;
  ministere_id: string;
  annee: number;
  mois: number;
  statut: string;
  synthese?: string;
  difficultes?: string;
  perspectives?: string;
  [key: string]: any;
}

// Type pour les statistiques du dashboard
interface DashboardStats {
  totalProgress: number;
  priorities: {
    code: PrioritePresidentielle;
    name: string;
    progress: number;
    target: number;
    budgetAlloue: number;
    budgetConsomme: number;
    objectifsAtteints: number;
    objectifsTotal: number;
    color: string;
  }[];
  ministryStats: {
    id: string;
    name: string;
    lastReport: string;
    status: 'submitted' | 'pending' | 'late';
    completeness: number;
    daysOverdue?: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    date: string;
    actor: string;
  }[];
}

// Mock data pour le développement (fallback si API indisponible)
const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalProgress: 68,
  priorities: [
    {
      code: 'sante',
      name: 'Santé pour Tous',
      progress: 72,
      target: 80,
      budgetAlloue: 250000000000,
      budgetConsomme: 180000000000,
      objectifsAtteints: 18,
      objectifsTotal: 25,
      color: '#ef4444',
    },
    {
      code: 'education',
      name: 'Éducation de Qualité',
      progress: 68,
      target: 75,
      budgetAlloue: 320000000000,
      budgetConsomme: 217600000000,
      objectifsAtteints: 22,
      objectifsTotal: 32,
      color: '#3b82f6',
    },
    {
      code: 'infrastructure',
      name: 'Infrastructures Modernes',
      progress: 58,
      target: 70,
      budgetAlloue: 450000000000,
      budgetConsomme: 261000000000,
      objectifsAtteints: 12,
      objectifsTotal: 20,
      color: '#8b5cf6',
    },
    {
      code: 'agriculture',
      name: 'Agriculture Durable',
      progress: 45,
      target: 60,
      budgetAlloue: 180000000000,
      budgetConsomme: 81000000000,
      objectifsAtteints: 8,
      objectifsTotal: 18,
      color: '#22c55e',
    },
    {
      code: 'numerique',
      name: 'Transformation Numérique',
      progress: 82,
      target: 75,
      budgetAlloue: 120000000000,
      budgetConsomme: 98400000000,
      objectifsAtteints: 15,
      objectifsTotal: 18,
      color: '#06b6d4',
    },
    {
      code: 'emploi',
      name: 'Emploi et Formation',
      progress: 55,
      target: 65,
      budgetAlloue: 200000000000,
      budgetConsomme: 110000000000,
      objectifsAtteints: 10,
      objectifsTotal: 22,
      color: '#f59e0b',
    },
    {
      code: 'environnement',
      name: 'Environnement et Climat',
      progress: 78,
      target: 70,
      budgetAlloue: 95000000000,
      budgetConsomme: 74100000000,
      objectifsAtteints: 14,
      objectifsTotal: 16,
      color: '#10b981',
    },
    {
      code: 'gouvernance',
      name: 'Gouvernance et Transparence',
      progress: 85,
      target: 80,
      budgetAlloue: 85000000000,
      budgetConsomme: 72250000000,
      objectifsAtteints: 20,
      objectifsTotal: 22,
      color: '#6366f1',
    },
  ],
  ministryStats: [
    {
      id: '1',
      name: 'Ministère de l\'Économie et des Finances',
      lastReport: '01/02/2026',
      status: 'submitted',
      completeness: 100,
    },
    {
      id: '2',
      name: 'Ministère de la Santé',
      lastReport: '30/01/2026',
      status: 'submitted',
      completeness: 95,
    },
    {
      id: '3',
      name: 'Ministère de l\'Éducation Nationale',
      lastReport: '28/01/2026',
      status: 'pending',
      completeness: 75,
      daysOverdue: 3,
    },
    {
      id: '4',
      name: 'Ministère des Travaux Publics',
      lastReport: '20/01/2026',
      status: 'late',
      completeness: 40,
      daysOverdue: 11,
    },
    {
      id: '5',
      name: 'Ministère de l\'Agriculture',
      lastReport: '25/01/2026',
      status: 'late',
      completeness: 60,
      daysOverdue: 6,
    },
    {
      id: '6',
      name: 'Ministère de l\'Intérieur',
      lastReport: '02/02/2026',
      status: 'submitted',
      completeness: 100,
    },
    {
      id: '7',
      name: 'Ministère des Affaires Étrangères',
      lastReport: '01/02/2026',
      status: 'submitted',
      completeness: 90,
    },
  ],
  recentActivity: [],
};

// Mapping des codes priorité vers les codes PrioritePresidentielle
const PRIORITE_CODE_MAP: Record<string, PrioritePresidentielle> = {
  'sante': 'sante',
  'education': 'education',
  'infrastructure': 'infrastructure',
  'agriculture': 'agriculture',
  'numerique': 'numerique',
  'emploi': 'emploi',
  'environnement': 'environnement',
  'gouvernance': 'gouvernance',
};

/**
 * Shared cache for GAR dashboard data to prevent duplicate API calls
 * when multiple components use useGARDashboard simultaneously.
 */
let _garDashboardCache: { data: DashboardStats; timestamp: number } | null = null;
let _garDashboardPromise: Promise<DashboardStats> | null = null;
const GAR_CACHE_TTL = 30_000; // 30 seconds

async function _fetchGARDashboard(): Promise<DashboardStats> {
  // Return cached data if still fresh
  if (_garDashboardCache && Date.now() - _garDashboardCache.timestamp < GAR_CACHE_TTL) {
    return _garDashboardCache.data;
  }

  // Reuse in-flight promise if one exists
  if (_garDashboardPromise) {
    return _garDashboardPromise;
  }

  _garDashboardPromise = (async () => {
    try {
      const prioritiesResponse = await garApi.getPrioritiesPublic();

      if (prioritiesResponse.success && prioritiesResponse.data && prioritiesResponse.data.length > 0) {
        const apiPriorities = prioritiesResponse.data;

        const mappedPriorities = apiPriorities.map((p: any) => ({
          code: PRIORITE_CODE_MAP[p.priorite] || p.priorite,
          name: p.titre,
          progress: Number(p.taux_execution_moyen) || 0,
          target: 75,
          budgetAlloue: Number(p.budget_alloue) || 0,
          budgetConsomme: 0,
          objectifsAtteints: Number(p.objectifs_atteints) || 0,
          objectifsTotal: Number(p.nb_objectifs_actifs) || 0,
          color: p.couleur || '#6366f1',
        }));

        const totalProgress = mappedPriorities.length > 0
          ? Math.round(mappedPriorities.reduce((acc: number, p: any) => acc + p.progress, 0) / mappedPriorities.length)
          : 0;

        const result: DashboardStats = {
          totalProgress: totalProgress || MOCK_DASHBOARD_STATS.totalProgress,
          priorities: mappedPriorities.length > 0 ? mappedPriorities : MOCK_DASHBOARD_STATS.priorities,
          ministryStats: MOCK_DASHBOARD_STATS.ministryStats,
          recentActivity: [],
        };

        _garDashboardCache = { data: result, timestamp: Date.now() };
        return result;
      } else {
        garLogger.warn('API GAR non disponible, utilisation des données mock');
        _garDashboardCache = { data: MOCK_DASHBOARD_STATS, timestamp: Date.now() };
        return MOCK_DASHBOARD_STATS;
      }
    } catch (err) {
      garLogger.warn('API GAR non disponible, fallback mock', { error: String(err) });
      _garDashboardCache = { data: MOCK_DASHBOARD_STATS, timestamp: Date.now() };
      return MOCK_DASHBOARD_STATS;
    } finally {
      _garDashboardPromise = null;
    }
  })();

  return _garDashboardPromise;
}

/**
 * Hook pour récupérer les données du dashboard GAR
 * Essaie d'abord l'API réelle, puis fallback sur les données mock
 * Utilise un cache partagé pour éviter les appels API dupliqués
 */
export function useGARDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await _fetchGARDashboard();
      setData(result);
    } catch (err) {
      setData(MOCK_DASHBOARD_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour récupérer les priorités présidentielles
 */
export function useGARPriorities() {
  const { data, loading, error, refetch } = useGARDashboard();

  return {
    priorities: data?.priorities || [],
    totalProgress: data?.totalProgress || 0,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les statistiques des ministères
 */
export function useMinistryStats() {
  const { data, loading, error, refetch } = useGARDashboard();

  return {
    ministries: data?.ministryStats || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les objectifs GAR
 */
export function useGARObjectifs(params?: { ministere?: string; annee?: number }) {
  const [objectifs, setObjectifs] = useState<GARObjectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await gar.getObjectifs(params);

      if (response.success && response.data) {
        setObjectifs(response.data);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [params?.ministere, params?.annee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { objectifs, loading, error, refetch: fetchData };
}

/**
 * Hook pour récupérer les rapports mensuels GAR
 */
export function useGARRapports(params?: { ministere?: string; annee?: number; mois?: number }) {
  const [rapports, setRapports] = useState<GARRapportMensuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await gar.getRapports(params);

      if (response.success && response.data) {
        setRapports(response.data);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [params?.ministere, params?.annee, params?.mois]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rapports, loading, error, refetch: fetchData };
}

/**
 * Hook pour soumettre un rapport GAR
 */
export function useSubmitGARRapport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (data: Partial<GARRapportMensuel>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await gar.submitRapport(data);

      if (response.success) {
        setSuccess(true);
        return response.data;
      } else {
        setError(response.error?.message || 'Erreur lors de la soumission');
        return null;
      }
    } catch (err) {
      setError('Erreur de connexion');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error, success };
}

/**
 * Hook pour récupérer les statistiques d'un ministère spécifique
 */
export function useMinistereStats(ministereId: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!ministereId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await gar.getMinistereStats(ministereId);

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [ministereId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, error, refetch: fetchData };
}

// Utilitaires pour le formatage
export function formatBudget(amount: number): string {
  if (amount >= 1000000000000) {
    return `${(amount / 1000000000000).toFixed(1)}T FCFA`;
  }
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(0)} Mds FCFA`;
  }
  return `${(amount / 1000000).toFixed(0)}M FCFA`;
}

export function getProgressStatus(progress: number, target: number): 'success' | 'warning' | 'danger' {
  const ratio = progress / target;
  if (ratio >= 0.9) return 'success';
  if (ratio >= 0.7) return 'warning';
  return 'danger';
}

export function getReportingStatus(
  lastReportDate: string,
  deadlineDay: number = 5
): 'submitted' | 'pending' | 'late' {
  const today = new Date();
  const lastReport = new Date(lastReportDate.split('/').reverse().join('-'));

  // Si le rapport a été soumis ce mois-ci
  if (
    lastReport.getMonth() === today.getMonth() &&
    lastReport.getFullYear() === today.getFullYear()
  ) {
    return 'submitted';
  }

  // Si on est avant la date limite du mois
  if (today.getDate() <= deadlineDay) {
    return 'pending';
  }

  return 'late';
}

export function calculateDaysOverdue(lastReportDate: string, deadlineDay: number = 5): number {
  const today = new Date();
  const deadline = new Date(today.getFullYear(), today.getMonth(), deadlineDay);

  if (today <= deadline) return 0;

  const diffTime = Math.abs(today.getTime() - deadline.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
