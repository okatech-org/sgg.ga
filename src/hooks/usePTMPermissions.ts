/**
 * SGG Digital — Hook Permissions PTM/PTG
 * Gestion des permissions sur le Plan Technique de Mise en œuvre
 */

import { useMemo } from 'react';
import { useDemoUser } from '@/hooks/useDemoUser';

export type PermissionPTM = 'R' | 'W' | 'V' | 'none';

export interface PTMPermissions {
  currentRole: string;
  getPermission: (action: 'saisie' | 'validation_sgg' | 'inscription_ptg') => PermissionPTM;
  canSaisir: () => boolean;
  canValiderSGG: () => boolean;
  canInscrirePTG: () => boolean;
  isReadOnly: () => boolean;
}

export function usePTMPermissions(): PTMPermissions {
  const { demoUser } = useDemoUser();

  const currentRole = useMemo(() => {
    if (!demoUser) return 'sgg-admin';
    return demoUser.id;
  }, [demoUser]);

  return useMemo(() => {
    // Permission matrix: action × role
    // Actions: saisie, validation_sgg, inscription_ptg
    // Roles:
    //   - sgg-admin: W all (Write/approve all actions)
    //   - sgg-directeur: V validation_sgg only (can validate SGG decisions)
    //   - sgpr: V inscription_ptg only (can register PTG)
    //   - ministre/sg-ministere: W saisie only (can write PTM entries)
    //   - premier-ministre, president, vice-president: R all (Read only)
    //   - others: R all (Read only)

    const permMatrix: Record<string, Record<string, PermissionPTM>> = {
      'sgg-admin': {
        saisie: 'W',
        validation_sgg: 'W',
        inscription_ptg: 'W',
      },
      'sgg-directeur': {
        saisie: 'R',
        validation_sgg: 'V',
        inscription_ptg: 'R',
      },
      'sgpr': {
        saisie: 'R',
        validation_sgg: 'R',
        inscription_ptg: 'V',
      },
      'premier-ministre': {
        saisie: 'R',
        validation_sgg: 'R',
        inscription_ptg: 'R',
      },
      'president': {
        saisie: 'R',
        validation_sgg: 'R',
        inscription_ptg: 'R',
      },
      'vice-president': {
        saisie: 'R',
        validation_sgg: 'R',
        inscription_ptg: 'R',
      },
      'ministre': {
        saisie: 'W',
        validation_sgg: 'R',
        inscription_ptg: 'R',
      },
      'sg-ministere': {
        saisie: 'W',
        validation_sgg: 'R',
        inscription_ptg: 'R',
      },
    };

    const defaultPerms: Record<string, PermissionPTM> = {
      saisie: 'R',
      validation_sgg: 'R',
      inscription_ptg: 'R',
    };

    const getPermission = (
      action: 'saisie' | 'validation_sgg' | 'inscription_ptg'
    ): PermissionPTM => {
      return permMatrix[currentRole]?.[action] || defaultPerms[action];
    };

    const canSaisir = (): boolean => {
      const p = getPermission('saisie');
      return p === 'W';
    };

    const canValiderSGG = (): boolean => {
      const p = getPermission('validation_sgg');
      return p === 'V' || p === 'W';
    };

    const canInscrirePTG = (): boolean => {
      const p = getPermission('inscription_ptg');
      return p === 'V' || p === 'W';
    };

    const isReadOnly = (): boolean => {
      return !canSaisir() && !canValiderSGG() && !canInscrirePTG();
    };

    return {
      currentRole,
      getPermission,
      canSaisir,
      canValiderSGG,
      canInscrirePTG,
      isReadOnly,
    };
  }, [currentRole]);
}
