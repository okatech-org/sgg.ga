/**
 * SGG Digital — Hook Permissions Matrice Reporting
 */

import { useMemo } from 'react';
import { useDemoUser } from '@/hooks/useDemoUser';
import {
  getPermission,
  canRead,
  canWrite,
  canValidate,
  getEditableBlocs,
  getVisibleBlocs,
  isReadOnly,
} from '@/config/matricePermissions';
import type { BlocReporting, PermissionReporting } from '@/types/reporting';

export function useMatricePermissions() {
  const { demoUser } = useDemoUser();

  const currentRole = useMemo(() => {
    if (!demoUser) return 'sgg-admin';
    return demoUser.id;
  }, [demoUser]);

  return useMemo(() => ({
    currentRole,
    getPermission: (bloc: BlocReporting): PermissionReporting =>
      getPermission(currentRole, bloc),
    canRead: (bloc: BlocReporting): boolean =>
      canRead(currentRole, bloc),
    canWrite: (bloc: BlocReporting): boolean =>
      canWrite(currentRole, bloc),
    canValidate: (bloc: BlocReporting): boolean =>
      canValidate(currentRole, bloc),
    getEditableBlocs: (): BlocReporting[] =>
      getEditableBlocs(currentRole),
    getVisibleBlocs: (): BlocReporting[] =>
      getVisibleBlocs(currentRole),
    isReadOnly: (): boolean =>
      isReadOnly(currentRole),
  }), [currentRole]);
}
