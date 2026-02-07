/**
 * SGG Digital — Hook Workflow de Validation
 * Machine à états: BROUILLON → SOUMIS → VALIDÉ SGG → VALIDÉ SGPR
 * Avec boucles de rejet
 */

import { useState, useCallback } from 'react';
import type { StatutValidation } from '@/types/reporting';
import { toast } from 'sonner';

interface WorkflowState {
  statut: StatutValidation;
  commentaire: string | null;
  motifRejet: string | null;
  valideSGGPar: string | null;
  dateSGG: string | null;
  valideSGPRPar: string | null;
  dateSGPR: string | null;
}

const TRANSITIONS: Record<StatutValidation, StatutValidation[]> = {
  brouillon: ['soumis'],
  soumis: ['valide_sgg', 'rejete'],
  valide_sgg: ['valide_sgpr', 'rejete'],
  valide_sgpr: [],
  rejete: ['soumis'],
};

export function useWorkflowValidation(initialStatut: StatutValidation = 'brouillon') {
  const [state, setState] = useState<WorkflowState>({
    statut: initialStatut,
    commentaire: null,
    motifRejet: null,
    valideSGGPar: null,
    dateSGG: null,
    valideSGPRPar: null,
    dateSGPR: null,
  });

  const canTransitionTo = useCallback(
    (target: StatutValidation): boolean => {
      return TRANSITIONS[state.statut]?.includes(target) ?? false;
    },
    [state.statut]
  );

  const soumettre = useCallback(() => {
    if (!canTransitionTo('soumis')) {
      toast.error('Transition non autorisée');
      return false;
    }
    setState((prev) => ({
      ...prev,
      statut: 'soumis',
      motifRejet: null,
    }));
    toast.success('Rapport soumis pour validation');
    return true;
  }, [canTransitionTo]);

  const validerSGG = useCallback(
    (validePar: string, commentaire?: string) => {
      if (!canTransitionTo('valide_sgg')) {
        toast.error('Transition non autorisée');
        return false;
      }
      setState((prev) => ({
        ...prev,
        statut: 'valide_sgg',
        valideSGGPar: validePar,
        dateSGG: new Date().toISOString(),
        commentaire: commentaire || null,
      }));
      toast.success('Rapport validé par le SGG');
      return true;
    },
    [canTransitionTo]
  );

  const validerSGPR = useCallback(
    (validePar: string, commentaire?: string) => {
      if (!canTransitionTo('valide_sgpr')) {
        toast.error('Transition non autorisée');
        return false;
      }
      setState((prev) => ({
        ...prev,
        statut: 'valide_sgpr',
        valideSGPRPar: validePar,
        dateSGPR: new Date().toISOString(),
        commentaire: commentaire || null,
      }));
      toast.success('Rapport validé et publié par le SGPR');
      return true;
    },
    [canTransitionTo]
  );

  const rejeter = useCallback(
    (motif: string) => {
      if (!canTransitionTo('rejete')) {
        toast.error('Transition non autorisée');
        return false;
      }
      setState((prev) => ({
        ...prev,
        statut: 'rejete',
        motifRejet: motif,
      }));
      toast.error('Rapport rejeté');
      return true;
    },
    [canTransitionTo]
  );

  const reset = useCallback((statut: StatutValidation = 'brouillon') => {
    setState({
      statut,
      commentaire: null,
      motifRejet: null,
      valideSGGPar: null,
      dateSGG: null,
      valideSGPRPar: null,
      dateSGPR: null,
    });
  }, []);

  return {
    ...state,
    canTransitionTo,
    soumettre,
    validerSGG,
    validerSGPR,
    rejeter,
    reset,
    isLocked: state.statut === 'valide_sgpr',
    isEditable: state.statut === 'brouillon' || state.statut === 'rejete',
  };
}
