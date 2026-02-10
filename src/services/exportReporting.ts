/**
 * SGG Digital — Service d'Export Reporting
 * Export Excel, PDF, CSV avec données mock
 */

import type { MatriceReportingRow } from '@/types/reporting';
import { STATUT_PROGRAMME_LABELS, STATUT_VALIDATION_LABELS } from '@/types/reporting';
import { exportLogger } from '@/services/logger';

// =============================================================================
// CSV Export (natif, pas de dépendance)
// =============================================================================

export function exportToCSV(
  rows: MatriceReportingRow[],
  mois: number,
  annee: number
): void {
  const MOIS_LABELS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const headers = [
    'Pilier', 'Mesure Présidentielle', 'Code Programme', 'Programme',
    'Objectif Stratégique', 'Résultats Attendus', 'Actions/Projets',
    'Ministère Pilote', 'Co-responsables', 'PTF/Partenaires',
    'Date Début', 'Date Fin', 'Activités Réalisées',
    'Budget (Md FCFA)', 'Engagé (Md FCFA)', 'Décaissé (Md FCFA)', '% Exéc. Financière',
    'Encadrement Juridique',
    'KPI', '% Avancement Physique', 'Statut Programme', 'Observations',
    'Statut Validation',
  ];

  const csvRows = rows.map((row) => {
    const r = row.rapport;
    return [
      `"${row.pilier.nom}"`,
      `"${row.programme.mesurePresidentielle}"`,
      `"${row.programme.codeProgramme}"`,
      `"${row.programme.libelleProgramme}"`,
      `"${row.programme.objectifStrategique}"`,
      `"${row.programme.resultatsAttendus}"`,
      `"${row.programme.actionsProjets}"`,
      `"${row.gouvernance.ministerePiloteNom}"`,
      `"${row.gouvernance.ministeresCoResponsables.join(', ')}"`,
      `"${row.gouvernance.partenairesPTF.join(', ')}"`,
      `"${r?.dateDebut || ''}"`,
      `"${r?.dateFin || ''}"`,
      `"${r?.activitesRealisees || ''}"`,
      r?.budgetMdFcfa ?? '',
      r?.engageMdFcfa ?? '',
      r?.decaisseMdFcfa ?? '',
      r?.pctExecutionFinanciere ?? '',
      `"${r?.encadrementJuridique || ''}"`,
      `"${r?.indicateursKpi || ''}"`,
      r?.pctAvancementPhysique ?? '',
      `"${r ? STATUT_PROGRAMME_LABELS[r.statutProgramme] : ''}"`,
      `"${r?.observationsContraintes || ''}"`,
      `"${r ? STATUT_VALIDATION_LABELS[r.statutValidation] : ''}"`,
    ].join(';');
  });

  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const content = BOM + headers.join(';') + '\n' + csvRows.join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `matrice_reporting_${MOIS_LABELS[mois - 1]}_${annee}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =============================================================================
// Excel Export (simulation — log uniquement si xlsx non installé)
// =============================================================================

export async function exportToExcel(
  rows: MatriceReportingRow[],
  mois: number,
  annee: number
): Promise<void> {
  const MOIS_LABELS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  try {
    // Try dynamic import for xlsx
    const XLSX = await import('xlsx').catch((): null => null);

    if (XLSX) {
      const wsData = rows.map((row) => {
        const r = row.rapport;
        return {
          'Pilier': row.pilier.nom,
          'Code Programme': row.programme.codeProgramme,
          'Programme': row.programme.libelleProgramme,
          'Ministère Pilote': row.gouvernance.ministerePiloteNom,
          'Budget (Md FCFA)': r?.budgetMdFcfa ?? 0,
          'Engagé (Md FCFA)': r?.engageMdFcfa ?? 0,
          'Décaissé (Md FCFA)': r?.decaisseMdFcfa ?? 0,
          '% Exéc. Financière': r?.pctExecutionFinanciere ?? 0,
          '% Avancement Physique': r?.pctAvancementPhysique ?? 0,
          'Statut': r ? STATUT_PROGRAMME_LABELS[r.statutProgramme] : '',
          'Validation': r ? STATUT_VALIDATION_LABELS[r.statutValidation] : '',
        };
      });

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Matrice Reporting');
      XLSX.writeFile(wb, `matrice_reporting_${MOIS_LABELS[mois - 1]}_${annee}.xlsx`);
    } else {
      // Fallback: export as CSV with xlsx extension info
      exportLogger.warn('xlsx non disponible, export CSV en fallback');
      exportToCSV(rows, mois, annee);
    }
  } catch {
    exportLogger.warn('Erreur export Excel, fallback CSV');
    exportToCSV(rows, mois, annee);
  }
}

// =============================================================================
// PDF Export (simulation — log uniquement si jspdf non installé)
// =============================================================================

export async function exportToPDF(
  rows: MatriceReportingRow[],
  mois: number,
  annee: number
): Promise<void> {
  const MOIS_LABELS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  try {
    const jsPDFModule = await import('jspdf').catch((): null => null);

    if (jsPDFModule) {
      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Title
      doc.setFontSize(16);
      doc.text('RÉPUBLIQUE GABONAISE', 148, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Secrétariat Général du Gouvernement', 148, 22, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Matrice de Reporting — ${MOIS_LABELS[mois - 1]} ${annee}`, 148, 32, { align: 'center' });

      // Simple table
      let y = 40;
      doc.setFontSize(8);
      rows.forEach((row) => {
        if (y > 190) {
          doc.addPage();
          y = 15;
        }
        const r = row.rapport;
        doc.text(
          `${row.programme.codeProgramme} — ${row.programme.libelleProgramme} | Budget: ${r?.budgetMdFcfa ?? 0} Md | Exéc: ${r?.pctExecutionFinanciere ?? 0}% | Phys: ${r?.pctAvancementPhysique ?? 0}%`,
          10,
          y
        );
        y += 6;
      });

      doc.save(`matrice_reporting_${MOIS_LABELS[mois - 1]}_${annee}.pdf`);
    } else {
      exportLogger.warn('jsPDF non disponible, fallback CSV');
      exportToCSV(rows, mois, annee);
    }
  } catch {
    exportLogger.warn('Erreur export PDF, fallback CSV');
    exportToCSV(rows, mois, annee);
  }
}
