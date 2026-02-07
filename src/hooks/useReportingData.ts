/**
 * SGG Digital — Hooks pour données de reporting
 * Suit le pattern existant de useGAR.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  RapportMensuel,
  ReportingStats,
  SuiviMinistere,
  NotificationReporting,
  StatutValidation,
  StatutProgramme,
  MatriceReportingRow,
  ReportingFilters,
} from '@/types/reporting';
import {
  PROGRAMMES,
  PILIERS,
  GOUVERNANCES,
  RAPPORTS_MENSUELS,
  SUIVI_MINISTERES,
  NOTIFICATIONS_MOCK,
  getRapportByProgrammeEtPeriode,
} from '@/data/reportingData';

interface HookResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function simulateDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// =============================================================================
// 1. useReportingProgrammes — Lignes complètes matrice avec filtres
// =============================================================================

export function useReportingProgrammes(
  filters: ReportingFilters
): HookResult<MatriceReportingRow[]> {
  const [data, setData] = useState<MatriceReportingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let rows: MatriceReportingRow[] = PROGRAMMES.map((prog) => {
        const pilier = PILIERS.find((p) => p.id === prog.pilierId)!;
        const gouv = GOUVERNANCES.find((g) => g.programmeId === prog.id)!;
        const rapport = getRapportByProgrammeEtPeriode(
          prog.id,
          filters.mois,
          filters.annee
        );
        return { programme: prog, pilier, gouvernance: gouv, rapport };
      });

      // Apply filters
      if (filters.pilierId) {
        rows = rows.filter((r) => r.pilier.id === filters.pilierId);
      }
      if (filters.statutProgramme && rows.length > 0) {
        rows = rows.filter(
          (r) => r.rapport?.statutProgramme === filters.statutProgramme
        );
      }
      if (filters.statutValidation) {
        rows = rows.filter(
          (r) => r.rapport?.statutValidation === filters.statutValidation
        );
      }
      if (filters.ministereId) {
        rows = rows.filter(
          (r) => r.gouvernance.ministerePiloteId === filters.ministereId
        );
      }
      if (filters.recherche) {
        const q = filters.recherche.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.programme.libelleProgramme.toLowerCase().includes(q) ||
            r.programme.codeProgramme.toLowerCase().includes(q) ||
            r.gouvernance.ministerePiloteNom.toLowerCase().includes(q)
        );
      }

      const result = await simulateDelay(rows);
      setData(result);
    } catch (err) {
      console.error('Erreur lors du chargement des programmes:', err);
      setError('Erreur lors du chargement des programmes');
    } finally {
      setLoading(false);
    }
  }, [
    filters.mois,
    filters.annee,
    filters.pilierId,
    filters.statutProgramme,
    filters.statutValidation,
    filters.ministereId,
    filters.recherche,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// 2. useReportingStats — Statistiques agrégées du dashboard
// =============================================================================

export function useReportingStats(
  mois: number,
  annee: number
): HookResult<ReportingStats | null> {
  const [data, setData] = useState<ReportingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rapportsPeriode = RAPPORTS_MENSUELS.filter(
        (r) => r.periodeMois === mois && r.periodeAnnee === annee
      );

      const totalBudget = rapportsPeriode.reduce((sum, r) => sum + r.budgetMdFcfa, 0);
      const totalEngage = rapportsPeriode.reduce((sum, r) => sum + r.engageMdFcfa, 0);
      const totalDecaisse = rapportsPeriode.reduce((sum, r) => sum + r.decaisseMdFcfa, 0);

      const moyExecFin =
        rapportsPeriode.length > 0
          ? rapportsPeriode.reduce((s, r) => s + r.pctExecutionFinanciere, 0) / rapportsPeriode.length
          : 0;
      const moyAvancement =
        rapportsPeriode.length > 0
          ? rapportsPeriode.reduce((s, r) => s + r.pctAvancementPhysique, 0) / rapportsPeriode.length
          : 0;

      const rapportsParStatut: Record<StatutValidation, number> = {
        brouillon: 0, soumis: 0, valide_sgg: 0, valide_sgpr: 0, rejete: 0,
      };
      rapportsPeriode.forEach((r) => { rapportsParStatut[r.statutValidation]++; });

      const programmesParStatut: Record<StatutProgramme, number> = {
        en_cours: 0, en_preparation: 0, retard: 0, termine: 0, bloque: 0,
      };
      rapportsPeriode.forEach((r) => { programmesParStatut[r.statutProgramme]++; });

      const tauxRemplissageGlobal =
        PROGRAMMES.length > 0
          ? (rapportsPeriode.length / PROGRAMMES.length) * 100
          : 0;

      const suiviPeriode = SUIVI_MINISTERES.filter(
        (s) => s.mois === mois && s.annee === annee
      );
      const ministeresEnRetard = suiviPeriode.filter(
        (s) => s.statut === 'non_saisi' || s.joursRetard > 0
      ).length;

      const stats: ReportingStats = {
        totalProgrammes: PROGRAMMES.length,
        totalBudget,
        totalEngage,
        totalDecaisse,
        moyenneExecutionFinanciere: Math.round(moyExecFin * 10) / 10,
        moyenneAvancementPhysique: Math.round(moyAvancement * 10) / 10,
        rapportsParStatut,
        programmesParStatut,
        tauxRemplissageGlobal: Math.round(tauxRemplissageGlobal * 10) / 10,
        ministeresEnRetard,
        rapportsValidésCeMois: rapportsParStatut.valide_sgg + rapportsParStatut.valide_sgpr,
      };

      const result = await simulateDelay(stats);
      setData(result);
    } catch (err) {
      console.error('Erreur lors du calcul des statistiques:', err);
      setError('Erreur lors du calcul des statistiques');
    } finally {
      setLoading(false);
    }
  }, [mois, annee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// 3. useRapportForEdit — Rapport unique pour éditeur
// =============================================================================

export function useRapportForEdit(
  programmeId: string | null,
  mois: number,
  annee: number
): HookResult<RapportMensuel | null> {
  const [data, setData] = useState<RapportMensuel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!programmeId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rapport = getRapportByProgrammeEtPeriode(programmeId, mois, annee);
      const result = await simulateDelay(rapport || null);
      setData(result);
    } catch (err) {
      console.error('Erreur lors du chargement du rapport:', err);
      setError('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  }, [programmeId, mois, annee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// 4. useSuiviRemplissage — Données du heatmap de suivi
// =============================================================================

export function useSuiviRemplissage(
  mois: number,
  annee: number
): HookResult<SuiviMinistere[]> {
  const [data, setData] = useState<SuiviMinistere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const suiviPeriode = SUIVI_MINISTERES.filter(
        (s) => s.mois === mois && s.annee === annee
      );
      const result = await simulateDelay(suiviPeriode);
      setData(result);
    } catch (err) {
      console.error('Erreur suivi remplissage:', err);
      setError('Erreur lors du chargement du suivi de remplissage');
    } finally {
      setLoading(false);
    }
  }, [mois, annee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// 5. useReportingNotifications — Notifications filtrées par rôle
// =============================================================================

export function useReportingNotifications(
  roleId: string | null
): HookResult<NotificationReporting[]> {
  const [data, setData] = useState<NotificationReporting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!roleId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notifications = NOTIFICATIONS_MOCK.filter(
        (n) => n.destinataireId === roleId
      );
      const sorted = [...notifications].sort(
        (a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
      );
      const result = await simulateDelay(sorted);
      setData(result);
    } catch (err) {
      console.error('Erreur notifications:', err);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
