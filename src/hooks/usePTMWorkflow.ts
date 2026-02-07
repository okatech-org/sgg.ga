/**
 * SGG Digital — Hook Workflow PTM/PTG
 * Machine à états: BROUILLON → SOUMIS_SGG → VALIDE_SGG → INSCRIT_PTG
 * Avec boucles de rejet
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type StatutPTM =
  | 'brouillon'
  | 'soumis_sgg'
  | 'valide_sgg'
  | 'inscrit_ptg'
  | 'rejete';

interface WorkflowPTMState {
  statut: StatutPTM;
  motifRejet: string | null;
  valideSGGPar: string | null;
  dateValidationSGG: string | null;
  inscritPTGPar: string | null;
  dateInscriptionPTG: string | null;
  commentaire: string | null;
}

const TRANSITIONS: Record<StatutPTM, StatutPTM[]> = {
  brouillon: ['soumis_sgg'],
  soumis_sgg: ['valide_sgg', 'rejete'],
  valide_sgg: ['inscrit_ptg', 'rejete'],
  inscrit_ptg: [],
  rejete: ['soumis_sgg'],
};

export interface PTMWorkflowHook extends WorkflowPTMState {
  canTransitionTo: (target: StatutPTM) => boolean;
  soumettreSGG: () => boolean;
  validerSGG: (validePar: string, commentaire?: string) => boolean;
  inscrirePTG: (inscritPar: string, commentaire?: string) => boolean;
  rejeter: (motif: string) => boolean;
  reset: (statut?: StatutPTM) => void;
  isLocked: boolean;
  isEditable: boolean;
}

export function usePTMWorkflow(initialStatut: StatutPTM = 'brouillon'): PTMWorkflowHook {
  const [state, setState] = useState<WorkflowPTMState>({
    statut: initialStatut,
    motifRejet: null,
    valideSGGPar: null,
    dateValidationSGG: null,
    inscritPTGPar: null,
    dateInscriptionPTG: null,
    commentaire: null,
  });

  const canTransitionTo = useCallback(
    (target: StatutPTM): boolean => {
      return TRANSITIONS[state.statut]?.includes(target) ?? false;
    },
    [state.statut]
  );

  const soumettreSGG = useCallback((): boolean => {
    if (!canTransitionTo('soumis_sgg')) {
      toast.error('Transition non autorisée: le PTM doit être en brouillon');
      return false;
    }
    setState((prev) => ({
      ...prev,
      statut: 'soumis_sgg',
      motifRejet: null,
    }));
    toast.success('PTM soumis au SGG pour validation');
    return true;
  }, [canTransitionTo]);

  const validerSGG = useCallback(
    (validePar: string, commentaire?: string): boolean => {
      if (!canTransitionTo('valide_sgg')) {
        toast.error('Transition non autorisée: le PTM doit être soumis');
        return false;
      }
      setState((prev) => ({
        ...prev,
        statut: 'valide_sgg',
        valideSGGPar: validePar,
        dateValidationSGG: new Date().toISOString(),
        commentaire: commentaire || null,
        motifRejet: null,
      }));
      toast.success('PTM validé par le SGG');
      return true;
    },
    [canTransitionTo]
  );

  const inscrirePTG = useCallback(
    (inscritPar: string, commentaire?: string): boolean => {
      if (!canTransitionTo('inscrit_ptg')) {
        toast.error('Transition non autorisée: le PTM doit être validé par le SGG');
        return false;
      }
      setState((prev) => ({
        ...prev,
        statut: 'inscrit_ptg',
        inscritPTGPar: inscritPar,
        dateInscriptionPTG: new Date().toISOString(),
        commentaire: commentaire || null,
      }));
      toast.success('PTM inscrit au PTG');
      return true;
    },
    [canTransitionTo]
  );

  const rejeter = useCallback(
    (motif: string): boolean => {
      if (!canTransitionTo('rejete')) {
        toast.error('Transition non autorisée: impossible de rejeter depuis cet état');
        return false;
      }
      setState((prev) => ({
        ...prev,
        statut: 'rejete',
        motifRejet: motif,
      }));
      toast.error('PTM rejeté');
      return true;
    },
    [canTransitionTo]
  );

  const reset = useCallback((statut: StatutPTM = 'brouillon'): void => {
    setState({
      statut,
      motifRejet: null,
      valideSGGPar: null,
      dateValidationSGG: null,
      inscritPTGPar: null,
      dateInscriptionPTG: null,
      commentaire: null,
    });
  }, []);

  return {
    ...state,
    canTransitionTo,
    soumettreSGG,
    validerSGG,
    inscrirePTG,
    rejeter,
    reset,
    isLocked: state.statut === 'inscrit_ptg',
    isEditable: state.statut === 'brouillon' || state.statut === 'rejete',
  };
}
