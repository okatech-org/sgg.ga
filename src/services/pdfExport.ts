/**
 * SGG Digital — Service d'Export PDF Dashboard
 *
 * Génère des exports PDF de haute qualité à partir des composants
 * dashboard, avec en-tête institutionnel, date, et pagination.
 *
 * Utilise jsPDF pour la génération PDF et html2canvas pour
 * la capture des composants React.
 *
 * Usage :
 *   import { exportDashboardToPDF, usePDFExport } from '@/services/pdfExport';
 *
 *   // Via fonction directe
 *   await exportDashboardToPDF(elementRef, { title: 'Mon Dashboard' });
 *
 *   // Via hook React
 *   const { exportPDF, isExporting, progress } = usePDFExport();
 *   await exportPDF(elementRef, { title: 'Rapport' });
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState, useCallback } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface PDFExportOptions {
    /** Titre du document (affiché en haut de chaque page) */
    title?: string;
    /** Sous-titre (ex: nom du module ou filtre actif) */
    subtitle?: string;
    /** Orientation du document */
    orientation?: 'portrait' | 'landscape';
    /** Format du papier */
    format?: 'a4' | 'a3' | 'letter';
    /** Nom du fichier (sans extension) */
    filename?: string;
    /** Afficher le logo institutionnel */
    showLogo?: boolean;
    /** Afficher la date/heure de génération */
    showDate?: boolean;
    /** Afficher les numéros de page */
    showPageNumbers?: boolean;
    /** Couleur d'accent pour l'en-tête (hex) */
    accentColor?: string;
    /** Marges en mm */
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    /** Qualité de capture (1-3, plus haut = meilleure qualité) */
    quality?: number;
    /** Callback de progression (0-100) */
    onProgress?: (percent: number) => void;
    /** Inclure un pied de page avec mention légale */
    legalFooter?: string;
}

export interface PDFExportResult {
    success: boolean;
    filename?: string;
    pages?: number;
    error?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: Required<PDFExportOptions> = {
    title: 'SGG Digital — Rapport',
    subtitle: '',
    orientation: 'portrait',
    format: 'a4',
    filename: 'sgg-rapport',
    showLogo: true,
    showDate: true,
    showPageNumbers: true,
    accentColor: '#1B5E20',
    margins: { top: 25, right: 15, bottom: 25, left: 15 },
    quality: 2,
    onProgress: () => { },
    legalFooter: 'République Gabonaise — Secrétariat Général du Gouvernement — Document Confidentiel',
};

// SGG Colors
const COLORS = {
    primary: '#1B5E20',      // Vert foncé
    primaryLight: '#4CAF50', // Vert clair
    gold: '#C9A038',         // Or
    dark: '#1a1a2e',         // Bleu très foncé
    gray: '#6B7280',
    lightGray: '#E5E7EB',
    white: '#FFFFFF',
};

// ── Core Export Function ────────────────────────────────────────────────────

/**
 * Export a DOM element to a multi-page PDF.
 */
export async function exportDashboardToPDF(
    element: HTMLElement,
    options: PDFExportOptions = {}
): Promise<PDFExportResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const { margins, orientation, format, quality } = opts;

    try {
        opts.onProgress(5);

        // ── 1. Capture the HTML element as an image ──────────────────────────

        const canvas = await html2canvas(element, {
            scale: quality,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            // Improve rendering
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        opts.onProgress(40);

        // ── 2. Setup PDF ────────────────────────────────────────────────────

        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margins.left - margins.right;
        const headerHeight = opts.showLogo ? 22 : 12;
        const footerHeight = opts.showPageNumbers ? 15 : 10;
        const contentHeight = pageHeight - margins.top - margins.bottom - headerHeight - footerHeight;

        // Calculate image dimensions
        const imgRatio = canvas.width / canvas.height;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth / imgRatio;

        // Calculate number of pages needed
        const totalPages = Math.ceil(imgHeight / contentHeight);

        opts.onProgress(50);

        // ── 3. Generate pages ───────────────────────────────────────────────

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage();

            // Draw header
            drawHeader(pdf, opts, pageWidth, margins);

            // Draw content (slice of the image)
            const srcY = page * contentHeight * (canvas.height / imgHeight);
            const srcH = Math.min(
                contentHeight * (canvas.height / imgHeight),
                canvas.height - srcY
            );

            // Create a temporary canvas for this page's slice
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = srcH;
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0, srcY,           // source x, y
                    canvas.width, srcH, // source width, height
                    0, 0,               // dest x, y
                    canvas.width, srcH  // dest width, height
                );
            }

            const pageImgData = pageCanvas.toDataURL('image/png');
            const displayH = Math.min(contentHeight, srcH * (imgWidth / canvas.width));

            pdf.addImage(
                pageImgData,
                'PNG',
                margins.left,
                margins.top + headerHeight,
                imgWidth,
                displayH
            );

            // Draw footer
            drawFooter(pdf, opts, page + 1, totalPages, pageWidth, pageHeight, margins);

            // Update progress
            const progressPct = 50 + ((page + 1) / totalPages) * 45;
            opts.onProgress(Math.round(progressPct));
        }

        // ── 4. Save the PDF ─────────────────────────────────────────────────

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${opts.filename}-${timestamp}.pdf`;
        pdf.save(filename);

        opts.onProgress(100);

        return {
            success: true,
            filename,
            pages: totalPages,
        };
    } catch (error) {
        console.error('[PDF Export] Error:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

// ── Header Drawing ──────────────────────────────────────────────────────────

function drawHeader(
    pdf: jsPDF,
    opts: Required<PDFExportOptions>,
    pageWidth: number,
    margins: { top: number; left: number; right: number }
): void {
    const y = margins.top;

    // Green accent bar
    pdf.setFillColor(COLORS.primary);
    pdf.rect(margins.left, y, pageWidth - margins.left - margins.right, 1, 'F');

    // Gold thin line
    pdf.setFillColor(COLORS.gold);
    pdf.rect(margins.left, y + 1.2, pageWidth - margins.left - margins.right, 0.4, 'F');

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(COLORS.primary);
    pdf.text(opts.title, margins.left, y + 8);

    // Subtitle
    if (opts.subtitle) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(COLORS.gray);
        pdf.text(opts.subtitle, margins.left, y + 13);
    }

    // Date (right-aligned)
    if (opts.showDate) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(COLORS.gray);
        pdf.text(dateStr, pageWidth - margins.right, y + 8, { align: 'right' });
    }

    // Institution badge (right-aligned)
    if (opts.showLogo) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(COLORS.gold);
        pdf.text('RÉPUBLIQUE GABONAISE', pageWidth - margins.right, y + 14, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.text('Secrétariat Général du Gouvernement', pageWidth - margins.right, y + 18, { align: 'right' });
    }

    // Separator line
    pdf.setDrawColor(COLORS.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(margins.left, y + 20, pageWidth - margins.right, y + 20);
}

// ── Footer Drawing ──────────────────────────────────────────────────────────

function drawFooter(
    pdf: jsPDF,
    opts: Required<PDFExportOptions>,
    currentPage: number,
    totalPages: number,
    pageWidth: number,
    pageHeight: number,
    margins: { left: number; right: number; bottom: number }
): void {
    const y = pageHeight - margins.bottom;

    // Separator line
    pdf.setDrawColor(COLORS.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(margins.left, y, pageWidth - margins.right, y);

    // Legal footer text
    if (opts.legalFooter) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(6);
        pdf.setTextColor(COLORS.gray);
        pdf.text(opts.legalFooter, margins.left, y + 5);
    }

    // Page number
    if (opts.showPageNumbers) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(COLORS.gray);
        pdf.text(
            `Page ${currentPage} / ${totalPages}`,
            pageWidth - margins.right,
            y + 5,
            { align: 'right' }
        );
    }

    // Green bottom bar
    pdf.setFillColor(COLORS.primary);
    pdf.rect(margins.left, y + 8, pageWidth - margins.left - margins.right, 0.8, 'F');
}

// ── Quick Export Utilities ───────────────────────────────────────────────────

/**
 * Export a specific element by its CSS selector
 */
export async function exportElementToPDF(
    selector: string,
    options: PDFExportOptions = {}
): Promise<PDFExportResult> {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
        return { success: false, error: `Element not found: ${selector}` };
    }
    return exportDashboardToPDF(element, options);
}

/**
 * Export the main content area
 */
export async function exportMainContent(
    options: PDFExportOptions = {}
): Promise<PDFExportResult> {
    const el =
        document.querySelector('[data-pdf-target]') as HTMLElement ||
        document.querySelector('main') as HTMLElement ||
        document.querySelector('#root') as HTMLElement;

    if (!el) {
        return { success: false, error: 'No exportable content found' };
    }

    return exportDashboardToPDF(el, options);
}

// ── React Hook ──────────────────────────────────────────────────────────────

export interface UsePDFExportReturn {
    /** Export a specific element */
    exportPDF: (element: HTMLElement, options?: PDFExportOptions) => Promise<PDFExportResult>;
    /** Export by selector */
    exportBySelector: (selector: string, options?: PDFExportOptions) => Promise<PDFExportResult>;
    /** Whether export is in progress */
    isExporting: boolean;
    /** Current progress (0-100) */
    progress: number;
    /** Last export result */
    lastResult: PDFExportResult | null;
    /** Last error */
    error: string | null;
}

export function usePDFExport(): UsePDFExportReturn {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lastResult, setLastResult] = useState<PDFExportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const exportPDF = useCallback(async (
        element: HTMLElement,
        options: PDFExportOptions = {}
    ): Promise<PDFExportResult> => {
        setIsExporting(true);
        setProgress(0);
        setError(null);

        const result = await exportDashboardToPDF(element, {
            ...options,
            onProgress: (pct) => {
                setProgress(pct);
                options.onProgress?.(pct);
            },
        });

        setLastResult(result);
        setIsExporting(false);

        if (!result.success) {
            setError(result.error || 'Export failed');
        }

        return result;
    }, []);

    const exportBySelector = useCallback(async (
        selector: string,
        options: PDFExportOptions = {}
    ): Promise<PDFExportResult> => {
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) {
            const result = { success: false, error: `Element not found: ${selector}` } as PDFExportResult;
            setLastResult(result);
            setError(result.error!);
            return result;
        }
        return exportPDF(element, options);
    }, [exportPDF]);

    return {
        exportPDF,
        exportBySelector,
        isExporting,
        progress,
        lastResult,
        error,
    };
}
