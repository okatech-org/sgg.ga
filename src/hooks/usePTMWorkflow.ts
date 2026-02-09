/**
 * SGG Digital — Hook Workflow PTM/PTG Hiérarchique
 * Chaîne complète: Direction → SG Ministère → SGG → PM → SGPR → Président
 * Avec consolidation à chaque niveau et boucles de rejet
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type StatutPTM =
  | 'brouillon'
  | 'soumis_sg'
  | 'consolide_sg'
  | 'soumis_sgg'
  | 'consolide_sgg'
  | 'soumis_pm'
  | 'soumis_sgpr'
  | 'rejete_sg'
  | 'rejete_sgg'
  | 'rejete';

interface WorkflowPTMState {
  statut: StatutPTM;
  motifRejet: string | null;
  transmisParId: string | null;
  transmisParNom: string | null;
  dateTransmission: string | null;
  commentaire: string | null;
}

// Transitions autorisées à chaque niveau
const TRANSITIONS: Record<StatutPTM, StatutPTM[]> = {
  brouillon: ['soumis_sg'],
  soumis_sg: ['consolide_sg', 'rejete_sg'],
  consolide_sg: ['soumis_sgg'],
  soumis_sgg: ['consolide_sgg', 'rejete_sgg'],
  consolide_sgg: ['soumis_pm'],
  soumis_pm: ['soumis_sgpr'],
  soumis_sgpr: [],
  rejete_sg: ['brouillon'],        // Direction corrige et resoumet
  rejete_sgg: ['consolide_sg'],    // SG corrige et retransmet
  rejete: ['brouillon'],           // Legacy
};

// Labels pour les boutons de transmission à chaque niveau
export const TRANSMISSION_LABELS: Record<string, { action: string; destinataire: string; icon: string }> = {
  'brouillon→soumis_sg': { action: 'Transmettre au SG', destinataire: 'Secrétaire Général du Ministère', icon: '📤' },
  'consolide_sg→soumis_sgg': { action: 'Transmettre au SGG', destinataire: 'Secrétaire Général du Gouvernement', icon: '📤' },
  'consolide_sgg→soumis_pm': { action: 'Transmettre au PM', destinataire: 'Chef du Gouvernement', icon: '📤' },
  'soumis_pm→soumis_sgpr': { action: 'Transmettre au SGPR', destinataire: 'Secrétaire Général de la Présidence', icon: '📤' },
};

// Niveaux hiérarchiques et qui peut agir à chaque niveau
export type NiveauHierarchique = 'direction' | 'sg_ministere' | 'sgg' | 'pm' | 'sgpr' | 'president';

export const NIVEAU_LABELS: Record<NiveauHierarchique, string> = {
  direction: 'Direction / Entité sous tutelle',
  sg_ministere: 'SG du Ministère',
  sgg: 'Secrétaire Général du Gouvernement',
  pm: 'Chef du Gouvernement',
  sgpr: 'Secrétaire Général de la Présidence',
  president: 'Président de la République',
};

// Deadlines par niveau (jour du mois)
export const DEADLINES_PTM: Record<NiveauHierarchique, number> = {
  direction: 5,      // Directions doivent transmettre avant le 5
  sg_ministere: 10,  // SGs avant le 10
  sgg: 15,           // SGG avant le 15
  pm: 20,            // PM avant le 20
  sgpr: 25,          // SGPR avant le 25
  president: 30,     // Informationnel
};

export interface PTMWorkflowHook extends WorkflowPTMState {
  canTransitionTo: (target: StatutPTM) => boolean;
  transmettreAuSG: (parId: string, parNom: string) => boolean;
  consoliderSG: () => boolean;
  transmettreAuSGG: (parId: string, parNom: string) => boolean;
  consoliderSGG: () => boolean;
  transmettreAuPM: (parId: string, parNom: string) => boolean;
  transmettreAuSGPR: (parId: string, parNom: string) => boolean;
  rejeterVers: (motif: string, statutRejet: StatutPTM) => boolean;
  corrigerApresRejet: () => boolean;
  reset: (statut?: StatutPTM) => void;
  isLocked: boolean;
  isEditable: boolean;
  niveauActuel: NiveauHierarchique;
  getTransmissionLabel: () => { action: string; destinataire: string } | null;
}

function getNiveauFromStatut(statut: StatutPTM): NiveauHierarchique {
  switch (statut) {
    case 'brouillon':
    case 'rejete_sg':
      return 'direction';
    case 'soumis_sg':
    case 'consolide_sg':
    case 'rejete_sgg':
      return 'sg_ministere';
    case 'soumis_sgg':
    case 'consolide_sgg':
      return 'sgg';
    case 'soumis_pm':
      return 'pm';
    case 'soumis_sgpr':
      return 'sgpr';
    default:
      return 'direction';
  }
}

export function usePTMWorkflow(initialStatut: StatutPTM = 'brouillon'): PTMWorkflowHook {
  const [state, setState] = useState<WorkflowPTMState>({
    statut: initialStatut,
    motifRejet: null,
    transmisParId: null,
    transmisParNom: null,
    dateTransmission: null,
    commentaire: null,
  });

  const canTransitionTo = useCallback(
    (target: StatutPTM): boolean => {
      return TRANSITIONS[state.statut]?.includes(target) ?? false;
    },
    [state.statut]
  );

  const transmettreAuSG = useCallback((parId: string, parNom: string): boolean => {
    if (!canTransitionTo('soumis_sg')) {
      toast.error('La matrice doit être en brouillon pour être transmise au SG');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: 'soumis_sg',
      transmisParId: parId,
      transmisParNom: parNom,
      dateTransmission: new Date().toISOString(),
      motifRejet: null,
    }));
    toast.success('Matrice transmise au Secrétaire Général du Ministère');
    return true;
  }, [canTransitionTo]);

  const consoliderSG = useCallback((): boolean => {
    if (!canTransitionTo('consolide_sg')) {
      toast.error('Impossible de consolider à ce stade');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: 'consolide_sg',
      dateTransmission: new Date().toISOString(),
    }));
    toast.success('Matrice consolidée par le SG');
    return true;
  }, [canTransitionTo]);

  const transmettreAuSGG = useCallback((parId: string, parNom: string): boolean => {
    if (!canTransitionTo('soumis_sgg')) {
      toast.error('La matrice doit être consolidée par le SG avant transmission au SGG');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: 'soumis_sgg',
      transmisParId: parId,
      transmisParNom: parNom,
      dateTransmission: new Date().toISOString(),
    }));
    toast.success('Matrice transmise au Secrétaire Général du Gouvernement');
    return true;
  }, [canTransitionTo]);

  const consoliderSGG = useCallback((): boolean => {
    if (!canTransitionTo('consolide_sgg')) {
      toast.error('Impossible de consolider à ce stade');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: 'consolide_sgg',
      dateTransmission: new Date().toISOString(),
    }));
    toast.success('Matrice consolidée par le SGG');
    return true;
  }, [canTransitionTo]);

  const transmettreAuPM = useCallback((parId: string, parNom: string): boolean => {
    if (!canTransitionTo('soumis_pm')) {
      toast.error('La matrice doit être consolidée par le SGG avant transmission au PM');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: 'soumis_pm',
      transmisParId: parId,
      transmisParNom: parNom,
      dateTransmission: new Date().toISOString(),
    }));
    toast.success('Matrice transmise au Chef du Gouvernement');
    return true;
  }, [canTransitionTo]);

  const transmettreAuSGPR = useCallback((parId: string, parNom: string): boolean => {
    if (!canTransitionTo('soumis_sgpr')) {
      toast.error('La matrice doit être au niveau PM avant transmission au SGPR');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: 'soumis_sgpr',
      transmisParId: parId,
      transmisParNom: parNom,
      dateTransmission: new Date().toISOString(),
    }));
    toast.success('Matrice transmise au Secrétaire Général de la Présidence');
    return true;
  }, [canTransitionTo]);

  const rejeterVers = useCallback((motif: string, statutRejet: StatutPTM): boolean => {
    if (!canTransitionTo(statutRejet)) {
      toast.error('Rejet non autorisé depuis cet état');
      return false;
    }
    setState(prev => ({
      ...prev,
      statut: statutRejet,
      motifRejet: motif,
    }));
    toast.error('Matrice renvoyée pour correction');
    return true;
  }, [canTransitionTo]);

  const corrigerApresRejet = useCallback((): boolean => {
    if (state.statut === 'rejete_sg') {
      setState(prev => ({ ...prev, statut: 'brouillon', motifRejet: null }));
      toast.info('Matrice remise en brouillon pour correction');
      return true;
    }
    if (state.statut === 'rejete_sgg') {
      setState(prev => ({ ...prev, statut: 'consolide_sg', motifRejet: null }));
      toast.info('Matrice renvoyée au SG pour correction');
      return true;
    }
    return false;
  }, [state.statut]);

  const reset = useCallback((statut: StatutPTM = 'brouillon'): void => {
    setState({
      statut,
      motifRejet: null,
      transmisParId: null,
      transmisParNom: null,
      dateTransmission: null,
      commentaire: null,
    });
  }, []);

  const niveauActuel = getNiveauFromStatut(state.statut);

  const getTransmissionLabel = useCallback(() => {
    const transitions = TRANSITIONS[state.statut];
    if (!transitions || transitions.length === 0) return null;
    const nextStatut = transitions.find(t => !t.startsWith('rejete'));
    if (!nextStatut) return null;
    const key = `${state.statut}→${nextStatut}`;
    return TRANSMISSION_LABELS[key] || null;
  }, [state.statut]);

  return {
    ...state,
    canTransitionTo,
    transmettreAuSG,
    consoliderSG,
    transmettreAuSGG,
    consoliderSGG,
    transmettreAuPM,
    transmettreAuSGPR,
    rejeterVers,
    corrigerApresRejet,
    reset,
    isLocked: state.statut === 'soumis_sgpr',
    isEditable: state.statut === 'brouillon' || state.statut === 'rejete_sg' || state.statut === 'rejete',
    niveauActuel,
    getTransmissionLabel,
  };
}
