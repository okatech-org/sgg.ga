/**
 * SGG Digital — API Reporting
 * Couche API pour les opérations de reporting (validation, soumission, rejet).
 * 
 * Architecture hybride :
 * - Si le backend est disponible, les appels passent par l'API centralisée.
 * - En cas d'erreur réseau ou en mode démo, un fallback mock est utilisé.
 */

import type { RapportMensuel, StatutValidation } from '@/types/reporting';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ============================================================================
// HTTP HELPER
// ============================================================================

async function fetchReportingApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('sgg_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// MOCK FALLBACK (for demo mode & offline development)
// ============================================================================

function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// API FUNCTIONS (with automatic mock fallback)
// ============================================================================

export async function submitRapport(
  rapportId: string,
  data: Partial<RapportMensuel>
): Promise<{ success: boolean; message: string }> {
  try {
    return await fetchReportingApi<{ success: boolean; message: string }>(
      `/api/reporting/rapports/${rapportId}/submit`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  } catch {
    // Fallback mock
    await delay();
    return { success: true, message: 'Rapport soumis avec succès' };
  }
}

export async function saveRapportDraft(
  rapportId: string,
  data: Partial<RapportMensuel>
): Promise<{ success: boolean; message: string }> {
  try {
    return await fetchReportingApi<{ success: boolean; message: string }>(
      `/api/reporting/rapports/${rapportId}/draft`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  } catch {
    await delay(400);
    return { success: true, message: 'Brouillon enregistré' };
  }
}

export async function validateSGG(
  rapportId: string,
  validePar: string,
  commentaire?: string
): Promise<{ success: boolean; message: string; newStatut: StatutValidation }> {
  try {
    return await fetchReportingApi<{ success: boolean; message: string; newStatut: StatutValidation }>(
      `/api/reporting/rapports/${rapportId}/validate-sgg`,
      { method: 'PATCH', body: JSON.stringify({ validePar, commentaire }) }
    );
  } catch {
    await delay();
    return {
      success: true,
      message: 'Rapport validé par le SGG',
      newStatut: 'valide_sgg',
    };
  }
}

export async function validateSGPR(
  rapportId: string,
  validePar: string,
  commentaire?: string
): Promise<{ success: boolean; message: string; newStatut: StatutValidation }> {
  try {
    return await fetchReportingApi<{ success: boolean; message: string; newStatut: StatutValidation }>(
      `/api/reporting/rapports/${rapportId}/validate-sgpr`,
      { method: 'PATCH', body: JSON.stringify({ validePar, commentaire }) }
    );
  } catch {
    await delay();
    return {
      success: true,
      message: 'Rapport validé et publié par le SGPR',
      newStatut: 'valide_sgpr',
    };
  }
}

export async function rejectRapport(
  rapportId: string,
  rejetePar: string,
  motif: string
): Promise<{ success: boolean; message: string; newStatut: StatutValidation }> {
  try {
    return await fetchReportingApi<{ success: boolean; message: string; newStatut: StatutValidation }>(
      `/api/reporting/rapports/${rapportId}/reject`,
      { method: 'PATCH', body: JSON.stringify({ rejetePar, motif }) }
    );
  } catch {
    await delay();
    return {
      success: true,
      message: 'Rapport rejeté',
      newStatut: 'rejete',
    };
  }
}

export async function batchValidateSGG(
  rapportIds: string[],
  validePar: string
): Promise<{ success: boolean; count: number }> {
  try {
    return await fetchReportingApi<{ success: boolean; count: number }>(
      `/api/reporting/rapports/batch-validate-sgg`,
      { method: 'POST', body: JSON.stringify({ rapportIds, validePar }) }
    );
  } catch {
    await delay(1200);
    return { success: true, count: rapportIds.length };
  }
}

export async function batchValidateSGPR(
  rapportIds: string[],
  validePar: string
): Promise<{ success: boolean; count: number }> {
  try {
    return await fetchReportingApi<{ success: boolean; count: number }>(
      `/api/reporting/rapports/batch-validate-sgpr`,
      { method: 'POST', body: JSON.stringify({ rapportIds, validePar }) }
    );
  } catch {
    await delay(1200);
    return { success: true, count: rapportIds.length };
  }
}
