/**
 * SGG Digital — Matrice des Permissions Reporting PAG 2026
 * Droits par acteur et par bloc de colonnes
 */

import type { BlocReporting, PermissionReporting } from '@/types/reporting';

// =============================================================================
// TYPES
// =============================================================================

export interface MatricePermissionEntry {
  role: string;
  bloc: BlocReporting;
  permission: PermissionReporting;
}

// =============================================================================
// MATRICE DES PERMISSIONS
// =============================================================================

/**
 * Matrice complète des droits:
 * R = Lecture | W = Écriture | V = Validation (implique lecture) | none = Pas d'accès
 *
 * ACTEUR               | Cadrage | Gouv. | Opérat. | Financier | Jurid. | Perf.
 * =====================|=========|=======|=========|===========|========|======
 * sgg-admin            | W       | W     | V       | V         | W      | V
 * sgg-directeur        | R       | V     | V       | V         | V      | V
 * premier-ministre     | R       | R     | R       | R         | R      | R
 * sgpr                 | R       | R     | V       | V         | R      | V
 * ministre             | R       | R     | R       | R         | R      | R
 * sg-ministere         | R       | R     | W       | W         | R      | W
 * dgjo                 | R       | R     | R       | R         | R      | R
 * conseil-etat         | R       | R     | R       | R         | W      | R
 * president            | R       | R     | R       | R         | R      | R
 * vice-president       | R       | R     | R       | R         | R      | R
 * assemblee            | none    | none  | none    | none      | R      | none
 * senat                | none    | none  | none    | none      | R      | none
 * cour-constitutionnelle | none  | none  | none    | none      | R      | none
 * citoyen              | R       | R     | R       | R         | R      | R
 * professionnel-droit  | R       | R     | R       | R         | R      | R
 */

const BLOCS: BlocReporting[] = ['cadrage', 'gouvernance', 'operationnel', 'financier', 'juridique', 'performance'];

type PermRow = [PermissionReporting, PermissionReporting, PermissionReporting, PermissionReporting, PermissionReporting, PermissionReporting];

const PERMISSIONS_MAP: Record<string, PermRow> = {
  //                        cadrage   gouv.     opérat.   financier juridique perf.
  'sgg-admin':             ['W',      'W',      'V',      'V',      'W',      'V'],
  'sgg-directeur':         ['R',      'V',      'V',      'V',      'V',      'V'],
  'premier-ministre':      ['R',      'R',      'R',      'R',      'R',      'R'],
  'sgpr':                  ['R',      'R',      'V',      'V',      'R',      'V'],
  'ministre':              ['R',      'R',      'R',      'R',      'R',      'R'],
  'sg-ministere':          ['R',      'R',      'W',      'W',      'R',      'W'],
  'dgjo':                  ['R',      'R',      'R',      'R',      'R',      'R'],
  'conseil-etat':          ['R',      'R',      'R',      'R',      'W',      'R'],
  'president':             ['R',      'R',      'R',      'R',      'R',      'R'],
  'vice-president':        ['R',      'R',      'R',      'R',      'R',      'R'],
  'assemblee':             ['none',   'none',   'none',   'none',   'R',      'none'],
  'senat':                 ['none',   'none',   'none',   'none',   'R',      'none'],
  'cour-constitutionnelle':['none',   'none',   'none',   'none',   'R',      'none'],
  'citoyen':               ['R',      'R',      'R',      'R',      'R',      'R'],
  'professionnel-droit':   ['R',      'R',      'R',      'R',      'R',      'R'],
};

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

export function getPermission(roleId: string, bloc: BlocReporting): PermissionReporting {
  const row = PERMISSIONS_MAP[roleId];
  if (!row) return 'R';
  const idx = BLOCS.indexOf(bloc);
  return idx >= 0 ? row[idx] : 'none';
}

/** Hiérarchie des permissions : W > V > R > none */
const PERM_HIERARCHY: Record<PermissionReporting, number> = {
  none: 0,
  R: 1,
  V: 2,
  W: 3,
};

export function hasPermission(
  roleId: string,
  bloc: BlocReporting,
  required: PermissionReporting
): boolean {
  const perm = getPermission(roleId, bloc);
  return PERM_HIERARCHY[perm] >= PERM_HIERARCHY[required];
}

export function canRead(roleId: string, bloc: BlocReporting): boolean {
  return hasPermission(roleId, bloc, 'R');
}

export function canWrite(roleId: string, bloc: BlocReporting): boolean {
  return hasPermission(roleId, bloc, 'W');
}

export function canValidate(roleId: string, bloc: BlocReporting): boolean {
  return hasPermission(roleId, bloc, 'V');
}

export function getEditableBlocs(roleId: string): BlocReporting[] {
  return BLOCS.filter(bloc => canWrite(roleId, bloc));
}

export function getVisibleBlocs(roleId: string): BlocReporting[] {
  return BLOCS.filter(bloc => canRead(roleId, bloc));
}

export function isReadOnly(roleId: string): boolean {
  return getEditableBlocs(roleId).length === 0;
}
