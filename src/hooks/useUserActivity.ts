/**
 * SGG Digital — Hook Activités Récentes Utilisateur
 */

import { useState, useMemo } from 'react';
import { useDemoUser } from './useDemoUser';
import type { UserActivityEntry, ActivityAction } from '@/types/user-profile';

const MOCK_ACTIVITIES: UserActivityEntry[] = [
  { id: 'act-001', action: 'validation', module: 'matriceReporting', description: 'Validation du rapport FNEE (Min. Énergie) — Janvier 2026', timestamp: '2026-02-07T08:45:00Z' },
  { id: 'act-002', action: 'consultation', module: 'matriceReporting', description: 'Consultation de la matrice de reporting PAG 2026', timestamp: '2026-02-07T08:30:00Z' },
  { id: 'act-003', action: 'soumission', module: 'ptmptg', description: 'Soumission du PTM Février 2026 — Min. Énergie', timestamp: '2026-02-06T16:20:00Z' },
  { id: 'act-004', action: 'modification', module: 'matriceReporting', description: 'Mise à jour du rapport Numérique — Janvier 2026', timestamp: '2026-02-06T14:00:00Z' },
  { id: 'act-005', action: 'validation', module: 'nominations', description: 'Validation de la nomination — DG de la SEEG', timestamp: '2026-02-06T10:15:00Z' },
  { id: 'act-006', action: 'consultation', module: 'journalOfficiel', description: 'Consultation du JO n°2026-003', timestamp: '2026-02-05T17:30:00Z' },
  { id: 'act-007', action: 'soumission', module: 'matriceReporting', description: 'Soumission du rapport Infrastructure — Janvier 2026', timestamp: '2026-02-05T11:00:00Z' },
  { id: 'act-008', action: 'export', module: 'matriceReporting', description: 'Export Excel de la matrice complète', timestamp: '2026-02-04T16:45:00Z' },
  { id: 'act-009', action: 'connexion', module: 'systeme', description: 'Connexion depuis Chrome / MacBook Pro', timestamp: '2026-02-04T08:00:00Z' },
  { id: 'act-010', action: 'modification', module: 'ptmptg', description: 'Modification du plan de travail — Action n°12', timestamp: '2026-02-03T15:20:00Z' },
  { id: 'act-011', action: 'validation', module: 'matriceReporting', description: 'Validation du rapport Fonction Publique — Janvier 2026', timestamp: '2026-02-03T10:30:00Z' },
  { id: 'act-012', action: 'consultation', module: 'documents', description: 'Consultation du décret n°2026-015', timestamp: '2026-02-02T14:15:00Z' },
  { id: 'act-013', action: 'soumission', module: 'nominations', description: 'Soumission dossier nomination — SG Min. Commerce', timestamp: '2026-02-01T16:00:00Z' },
  { id: 'act-014', action: 'connexion', module: 'systeme', description: 'Connexion depuis Safari / iPhone', timestamp: '2026-02-01T09:00:00Z' },
  { id: 'act-015', action: 'export', module: 'ptmptg', description: 'Export PDF du plan de travail ministériel', timestamp: '2026-01-31T17:30:00Z' },
];

const MODULE_LABELS: Record<string, string> = {
  matriceReporting: 'Matrice Reporting',
  ptmptg: 'PTM / PTG',
  nominations: 'Nominations',
  cycleLegislatif: 'Cycle Législatif',
  egop: 'e-GOP',
  journalOfficiel: 'Journal Officiel',
  documents: 'Documents',
  systeme: 'Système',
};

const ACTION_LABELS: Record<ActivityAction, string> = {
  soumission: 'Soumission',
  validation: 'Validation',
  consultation: 'Consultation',
  modification: 'Modification',
  connexion: 'Connexion',
  export: 'Export',
};

export function useUserActivity() {
  const { demoUser } = useDemoUser();
  const isDemo = !!demoUser;

  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    let data = MOCK_ACTIVITIES;
    if (filterModule !== 'all') {
      data = data.filter((a) => a.module === filterModule);
    }
    if (filterAction !== 'all') {
      data = data.filter((a) => a.action === filterAction);
    }
    return data.slice(0, 50);
  }, [filterModule, filterAction]);

  const modules = Object.entries(MODULE_LABELS).map(([key, label]) => ({ key, label }));
  const actions = Object.entries(ACTION_LABELS).map(([key, label]) => ({ key, label }));

  return {
    activities: filteredActivities,
    filterModule,
    setFilterModule,
    filterAction,
    setFilterAction,
    modules,
    actions,
    isDemo,
    getModuleLabel: (key: string) => MODULE_LABELS[key] || key,
    getActionLabel: (key: string) => ACTION_LABELS[key as ActivityAction] || key,
  };
}
