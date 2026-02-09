/**
 * SGG Digital — Hook Permissions PTM/PTG Hiérarchique
 * Gestion des permissions multi-niveaux: Direction → SG → SGG → PM → SGPR
 */

import { useMemo } from 'react';
import { useDemoUser } from '@/hooks/useDemoUser';
import type { NiveauHierarchique } from '@/hooks/usePTMWorkflow';

export type PermissionPTM = 'R' | 'W' | 'V' | 'none';

export interface PTMPermissions {
  currentRole: string;
  niveau: NiveauHierarchique;
  getPermission: (action: 'saisie' | 'consolidation' | 'transmission' | 'validation') => PermissionPTM;
  canSaisir: () => boolean;
  canConsolider: () => boolean;
  canTransmettre: () => boolean;
  canValider: () => boolean;
  canRejeter: () => boolean;
  isReadOnly: () => boolean;
}

// Mapping rôle → niveau hiérarchique
function getNiveauFromRole(roleId: string): NiveauHierarchique {
  switch (roleId) {
    case 'directeur-cgi':
    case 'directeur-dgpn':
    case 'directeur-direction':
      return 'direction';
    case 'sg-ministere':
    case 'sg-ministere-fp':
      return 'sg_ministere';
    case 'sgg-admin':
    case 'sgg-directeur':
      return 'sgg';
    case 'premier-ministre':
      return 'pm';
    case 'sgpr':
      return 'sgpr';
    case 'president':
    case 'vice-president':
      return 'president';
    case 'ministre':
      return 'sg_ministere'; // Ministre voit le niveau SG
    default:
      return 'direction';
  }
}

export function usePTMPermissions(): PTMPermissions {
  const { demoUser } = useDemoUser();

  const currentRole = useMemo(() => {
    if (!demoUser) return 'sgg-admin';
    return demoUser.id;
  }, [demoUser]);

  const niveau = useMemo(() => getNiveauFromRole(currentRole), [currentRole]);

  return useMemo(() => {
    // Permission matrix: action × role
    // Actions: saisie (remplir), consolidation (fusionner), transmission (pousser), validation (accepter/rejeter)
    const permMatrix: Record<string, Record<string, PermissionPTM>> = {
      // Directions — remplissent et transmettent au SG
      'directeur-cgi': {
        saisie: 'W',
        consolidation: 'none',
        transmission: 'W',
        validation: 'none',
      },
      'directeur-dgpn': {
        saisie: 'W',
        consolidation: 'none',
        transmission: 'W',
        validation: 'none',
      },
      'directeur-direction': {
        saisie: 'W',
        consolidation: 'none',
        transmission: 'W',
        validation: 'none',
      },
      // SG Ministère — consolide, valide/rejette, transmet au SGG
      'sg-ministere': {
        saisie: 'W',
        consolidation: 'W',
        transmission: 'W',
        validation: 'V',
      },
      'sg-ministere-fp': {
        saisie: 'W',
        consolidation: 'W',
        transmission: 'W',
        validation: 'V',
      },
      // Ministre — même vue que SG
      'ministre': {
        saisie: 'W',
        consolidation: 'R',
        transmission: 'R',
        validation: 'R',
      },
      // SGG — consolide les ministères, transmet au PM
      'sgg-admin': {
        saisie: 'W',
        consolidation: 'W',
        transmission: 'W',
        validation: 'W',
      },
      'sgg-directeur': {
        saisie: 'R',
        consolidation: 'W',
        transmission: 'W',
        validation: 'V',
      },
      // PM — consolide et transmet au SGPR
      'premier-ministre': {
        saisie: 'R',
        consolidation: 'W',
        transmission: 'W',
        validation: 'R',
      },
      // SGPR — reçoit pour le Président
      'sgpr': {
        saisie: 'R',
        consolidation: 'R',
        transmission: 'R',
        validation: 'R',
      },
      // Président — lecture seule
      'president': {
        saisie: 'R',
        consolidation: 'R',
        transmission: 'R',
        validation: 'R',
      },
      'vice-president': {
        saisie: 'R',
        consolidation: 'R',
        transmission: 'R',
        validation: 'R',
      },
    };

    const defaultPerms: Record<string, PermissionPTM> = {
      saisie: 'R',
      consolidation: 'R',
      transmission: 'R',
      validation: 'R',
    };

    const getPermission = (
      action: 'saisie' | 'consolidation' | 'transmission' | 'validation'
    ): PermissionPTM => {
      return permMatrix[currentRole]?.[action] || defaultPerms[action];
    };

    const canSaisir = (): boolean => getPermission('saisie') === 'W';
    const canConsolider = (): boolean => getPermission('consolidation') === 'W';
    const canTransmettre = (): boolean => getPermission('transmission') === 'W';
    const canValider = (): boolean => {
      const p = getPermission('validation');
      return p === 'V' || p === 'W';
    };
    const canRejeter = (): boolean => canValider();
    const isReadOnly = (): boolean => !canSaisir() && !canConsolider() && !canTransmettre() && !canValider();

    return {
      currentRole,
      niveau,
      getPermission,
      canSaisir,
      canConsolider,
      canTransmettre,
      canValider,
      canRejeter,
      isReadOnly,
    };
  }, [currentRole, niveau]);
}
