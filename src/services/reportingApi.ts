/**
 * SGG Digital — API Mock Reporting
 * Couche API simulée pour les opérations de reporting
 */

import type { RapportMensuel, StatutValidation } from '@/types/reporting';

function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitRapport(
  rapportId: string,
  data: Partial<RapportMensuel>
): Promise<{ success: boolean; message: string }> {
  await delay();
  console.log('[API Mock] submitRapport', rapportId, data);
  return { success: true, message: 'Rapport soumis avec succès' };
}

export async function saveRapportDraft(
  rapportId: string,
  data: Partial<RapportMensuel>
): Promise<{ success: boolean; message: string }> {
  await delay(400);
  console.log('[API Mock] saveRapportDraft', rapportId, data);
  return { success: true, message: 'Brouillon enregistré' };
}

export async function validateSGG(
  rapportId: string,
  validePar: string,
  commentaire?: string
): Promise<{ success: boolean; message: string; newStatut: StatutValidation }> {
  await delay();
  console.log('[API Mock] validateSGG', rapportId, validePar, commentaire);
  return {
    success: true,
    message: 'Rapport validé par le SGG',
    newStatut: 'valide_sgg',
  };
}

export async function validateSGPR(
  rapportId: string,
  validePar: string,
  commentaire?: string
): Promise<{ success: boolean; message: string; newStatut: StatutValidation }> {
  await delay();
  console.log('[API Mock] validateSGPR', rapportId, validePar, commentaire);
  return {
    success: true,
    message: 'Rapport validé et publié par le SGPR',
    newStatut: 'valide_sgpr',
  };
}

export async function rejectRapport(
  rapportId: string,
  rejetePar: string,
  motif: string
): Promise<{ success: boolean; message: string; newStatut: StatutValidation }> {
  await delay();
  console.log('[API Mock] rejectRapport', rapportId, rejetePar, motif);
  return {
    success: true,
    message: 'Rapport rejeté',
    newStatut: 'rejete',
  };
}

export async function batchValidateSGG(
  rapportIds: string[],
  validePar: string
): Promise<{ success: boolean; count: number }> {
  await delay(1200);
  console.log('[API Mock] batchValidateSGG', rapportIds, validePar);
  return { success: true, count: rapportIds.length };
}

export async function batchValidateSGPR(
  rapportIds: string[],
  validePar: string
): Promise<{ success: boolean; count: number }> {
  await delay(1200);
  console.log('[API Mock] batchValidateSGPR', rapportIds, validePar);
  return { success: true, count: rapportIds.length };
}
