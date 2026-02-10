/**
 * SGG Digital — Service Import/Export CSV & Excel
 *
 * Permet l'import et l'export de données depuis/vers des fichiers
 * CSV et Excel (.xlsx), avec validation de schéma, mapping de colonnes,
 * et gestion des erreurs.
 *
 * Usage :
 *   import { useDataExport, useDataImport } from '@/services/dataExchange';
 *
 *   // Export
 *   const { exportToExcel, exportToCSV } = useDataExport();
 *   await exportToExcel(data, { filename: 'institutions', sheetName: 'Liste' });
 *
 *   // Import
 *   const { importFile, validationErrors, importedData } = useDataImport(schema);
 */

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ColumnSchema {
    /** Internal key name */
    key: string;
    /** Display label in header */
    label: string;
    /** Expected data type */
    type: 'string' | 'number' | 'boolean' | 'date' | 'email';
    /** Is this column required? */
    required?: boolean;
    /** Custom validation function */
    validate?: (value: any) => boolean | string;
    /** Transform value on import */
    transform?: (value: any) => any;
    /** Max length for strings */
    maxLength?: number;
    /** Min / max for numbers */
    min?: number;
    max?: number;
    /** Allowed values (enum) */
    allowedValues?: string[];
}

export interface ExportOptions {
    /** Filename (without extension) */
    filename?: string;
    /** Sheet name for Excel */
    sheetName?: string;
    /** Column definitions for headers */
    columns?: ColumnSchema[];
    /** Date format string */
    dateFormat?: string;
    /** Include a timestamp row */
    includeTimestamp?: boolean;
    /** Include a title row */
    title?: string;
}

export interface ImportResult {
    success: boolean;
    data: Record<string, any>[];
    errors: ValidationError[];
    warnings: string[];
    totalRows: number;
    validRows: number;
    skippedRows: number;
}

export interface ValidationError {
    row: number;
    column: string;
    value: any;
    message: string;
    severity: 'error' | 'warning';
}

// ── Default Column Schemas ──────────────────────────────────────────────────

export const SCHEMAS = {
    institutions: [
        { key: 'nom', label: 'Nom', type: 'string' as const, required: true, maxLength: 200 },
        { key: 'type', label: 'Type', type: 'string' as const, required: true, allowedValues: ['ministere', 'institution', 'organisme', 'agence'] },
        { key: 'sigle', label: 'Sigle', type: 'string' as const, maxLength: 20 },
        { key: 'responsable', label: 'Responsable', type: 'string' as const },
        { key: 'email', label: 'Email', type: 'email' as const },
        { key: 'telephone', label: 'Téléphone', type: 'string' as const },
        { key: 'adresse', label: 'Adresse', type: 'string' as const },
        { key: 'actif', label: 'Actif', type: 'boolean' as const },
    ] as ColumnSchema[],

    users: [
        { key: 'email', label: 'Email', type: 'email' as const, required: true },
        { key: 'prenom', label: 'Prénom', type: 'string' as const, required: true },
        { key: 'nom', label: 'Nom', type: 'string' as const, required: true },
        { key: 'role', label: 'Rôle', type: 'string' as const, required: true },
        { key: 'institution', label: 'Institution', type: 'string' as const },
        { key: 'telephone', label: 'Téléphone', type: 'string' as const },
        { key: 'actif', label: 'Actif', type: 'boolean' as const },
    ] as ColumnSchema[],

    nominations: [
        { key: 'nom', label: 'Nom Complet', type: 'string' as const, required: true },
        { key: 'poste', label: 'Poste', type: 'string' as const, required: true },
        { key: 'ministere', label: 'Ministère', type: 'string' as const, required: true },
        { key: 'dateDecret', label: 'Date Décret', type: 'date' as const },
        { key: 'numerDecret', label: 'N° Décret', type: 'string' as const },
        { key: 'statut', label: 'Statut', type: 'string' as const, allowedValues: ['actif', 'révoqué', 'retraité'] },
    ] as ColumnSchema[],
};

// ── Validation Helpers ──────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCell(
    value: any,
    schema: ColumnSchema,
    rowIndex: number
): ValidationError | null {
    const isEmpty = value === null || value === undefined || value === '';

    // Required check
    if (schema.required && isEmpty) {
        return {
            row: rowIndex,
            column: schema.label,
            value,
            message: `"${schema.label}" est obligatoire`,
            severity: 'error',
        };
    }

    if (isEmpty) return null;

    // Type checks
    switch (schema.type) {
        case 'email':
            if (typeof value === 'string' && !EMAIL_REGEX.test(value)) {
                return { row: rowIndex, column: schema.label, value, message: `Email invalide: "${value}"`, severity: 'error' };
            }
            break;

        case 'number':
            const num = Number(value);
            if (isNaN(num)) {
                return { row: rowIndex, column: schema.label, value, message: `Nombre attendu, reçu: "${value}"`, severity: 'error' };
            }
            if (schema.min !== undefined && num < schema.min) {
                return { row: rowIndex, column: schema.label, value, message: `Min ${schema.min}, reçu: ${num}`, severity: 'error' };
            }
            if (schema.max !== undefined && num > schema.max) {
                return { row: rowIndex, column: schema.label, value, message: `Max ${schema.max}, reçu: ${num}`, severity: 'error' };
            }
            break;

        case 'boolean':
            const boolStr = String(value).toLowerCase();
            if (!['true', 'false', '1', '0', 'oui', 'non', 'yes', 'no'].includes(boolStr)) {
                return { row: rowIndex, column: schema.label, value, message: `Booléen attendu (oui/non), reçu: "${value}"`, severity: 'warning' };
            }
            break;

        case 'date':
            if (typeof value === 'string' && isNaN(Date.parse(value))) {
                return { row: rowIndex, column: schema.label, value, message: `Date invalide: "${value}"`, severity: 'error' };
            }
            break;
    }

    // Max length
    if (schema.maxLength && typeof value === 'string' && value.length > schema.maxLength) {
        return { row: rowIndex, column: schema.label, value, message: `Max ${schema.maxLength} caractères (${value.length} reçus)`, severity: 'warning' };
    }

    // Allowed values
    if (schema.allowedValues && !schema.allowedValues.includes(String(value).toLowerCase())) {
        return {
            row: rowIndex, column: schema.label, value,
            message: `Valeur non autorisée: "${value}" (attendu: ${schema.allowedValues.join(', ')})`,
            severity: 'error',
        };
    }

    // Custom validation
    if (schema.validate) {
        const result = schema.validate(value);
        if (result !== true) {
            return {
                row: rowIndex, column: schema.label, value,
                message: typeof result === 'string' ? result : `Validation échouée pour "${value}"`,
                severity: 'error',
            };
        }
    }

    return null;
}

function transformValue(value: any, schema: ColumnSchema): any {
    if (value === null || value === undefined) return value;

    // Apply custom transform
    if (schema.transform) return schema.transform(value);

    switch (schema.type) {
        case 'number':
            return Number(value) || 0;
        case 'boolean': {
            const str = String(value).toLowerCase();
            return ['true', '1', 'oui', 'yes'].includes(str);
        }
        case 'date':
            if (typeof value === 'number') {
                // Excel date serial number
                return new Date((value - 25569) * 86400 * 1000).toISOString();
            }
            return new Date(value).toISOString();
        default:
            return String(value).trim();
    }
}

// ── Export Functions ─────────────────────────────────────────────────────────

/**
 * Export data array to Excel (.xlsx) file
 */
export function exportToExcel(
    data: Record<string, any>[],
    options: ExportOptions = {}
): void {
    const {
        filename = 'export',
        sheetName = 'Données',
        columns,
        includeTimestamp = true,
        title,
    } = options;

    // Determine headers
    const headers = columns
        ? columns.map(c => c.label)
        : data.length > 0 ? Object.keys(data[0]) : [];

    const keys = columns
        ? columns.map(c => c.key)
        : headers;

    // Build rows
    const rows: any[][] = [];

    // Title row
    if (title) {
        rows.push([title]);
        rows.push([]); // Empty row
    }

    // Timestamp
    if (includeTimestamp) {
        rows.push([`Exporté le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`]);
        rows.push([]); // Empty row
    }

    // Header row
    rows.push(headers);

    // Data rows
    for (const item of data) {
        rows.push(keys.map(key => {
            const val = item[key];
            if (val instanceof Date) return val.toLocaleDateString('fr-FR');
            if (typeof val === 'boolean') return val ? 'Oui' : 'Non';
            return val ?? '';
        }));
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto-width columns
    const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(
            h.length,
            ...data.map(d => String(d[keys[i]] ?? '').length)
        );
        return { wch: Math.min(maxLen + 2, 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filename}-${timestamp}.xlsx`);
}

/**
 * Export data array to CSV file
 */
export function exportToCSV(
    data: Record<string, any>[],
    options: ExportOptions = {}
): void {
    const {
        filename = 'export',
        columns,
    } = options;

    const headers = columns ? columns.map(c => c.label) : data.length > 0 ? Object.keys(data[0]) : [];
    const keys = columns ? columns.map(c => c.key) : headers;

    const lines: string[] = [headers.join(',')];

    for (const item of data) {
        const row = keys.map(key => {
            let val = item[key] ?? '';
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            if (typeof val === 'boolean') val = val ? 'Oui' : 'Non';
            return val;
        });
        lines.push(row.join(','));
    }

    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Import and validate data from a file (CSV or Excel)
 */
export async function importFile(
    file: File,
    schema: ColumnSchema[]
): Promise<ImportResult> {
    const warnings: string[] = [];

    try {
        // Read file
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

        if (wb.SheetNames.length === 0) {
            return { success: false, data: [], errors: [], warnings: ['Fichier vide'], totalRows: 0, validRows: 0, skippedRows: 0 };
        }

        // Use first sheet
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

        if (rawData.length === 0) {
            return { success: false, data: [], errors: [], warnings: ['Aucune donnée trouvée'], totalRows: 0, validRows: 0, skippedRows: 0 };
        }

        // Detect column mapping (match headers to schema)
        const fileHeaders = Object.keys(rawData[0]);
        const columnMap: Record<string, ColumnSchema> = {};

        for (const col of schema) {
            const match = fileHeaders.find(h =>
                h.toLowerCase().trim() === col.label.toLowerCase().trim() ||
                h.toLowerCase().trim() === col.key.toLowerCase().trim()
            );
            if (match) {
                columnMap[match] = col;
            } else if (col.required) {
                warnings.push(`Colonne requise "${col.label}" non trouvée dans le fichier`);
            }
        }

        if (Object.keys(columnMap).length === 0) {
            return {
                success: false,
                data: [],
                errors: [{ row: 0, column: '-', value: '-', message: 'Aucune colonne correspondante trouvée', severity: 'error' }],
                warnings,
                totalRows: rawData.length,
                validRows: 0,
                skippedRows: rawData.length,
            };
        }

        // Validate and transform rows
        const errors: ValidationError[] = [];
        const validData: Record<string, any>[] = [];
        let skipped = 0;

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const transformedRow: Record<string, any> = {};
            let rowValid = true;

            for (const [fileCol, colSchema] of Object.entries(columnMap)) {
                const rawValue = row[fileCol];
                const error = validateCell(rawValue, colSchema, i + 2); // +2 for 1-indexed + header

                if (error) {
                    errors.push(error);
                    if (error.severity === 'error') rowValid = false;
                }

                transformedRow[colSchema.key] = transformValue(rawValue, colSchema);
            }

            if (rowValid) {
                validData.push(transformedRow);
            } else {
                skipped++;
            }
        }

        return {
            success: errors.filter(e => e.severity === 'error').length === 0,
            data: validData,
            errors,
            warnings,
            totalRows: rawData.length,
            validRows: validData.length,
            skippedRows: skipped,
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            errors: [{ row: 0, column: '-', value: '-', message: (error as Error).message, severity: 'error' }],
            warnings,
            totalRows: 0,
            validRows: 0,
            skippedRows: 0,
        };
    }
}

// ── React Hooks ─────────────────────────────────────────────────────────────

export interface UseDataExportReturn {
    exportToExcel: (data: Record<string, any>[], options?: ExportOptions) => void;
    exportToCSV: (data: Record<string, any>[], options?: ExportOptions) => void;
    isExporting: boolean;
}

export function useDataExport(): UseDataExportReturn {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportExcel = useCallback((data: Record<string, any>[], options?: ExportOptions) => {
        setIsExporting(true);
        try {
            exportToExcel(data, options);
        } finally {
            setIsExporting(false);
        }
    }, []);

    const handleExportCSV = useCallback((data: Record<string, any>[], options?: ExportOptions) => {
        setIsExporting(true);
        try {
            exportToCSV(data, options);
        } finally {
            setIsExporting(false);
        }
    }, []);

    return {
        exportToExcel: handleExportExcel,
        exportToCSV: handleExportCSV,
        isExporting,
    };
}

export interface UseDataImportReturn {
    importFile: (file: File) => Promise<ImportResult>;
    result: ImportResult | null;
    isImporting: boolean;
    error: string | null;
    reset: () => void;
}

export function useDataImport(schema: ColumnSchema[]): UseDataImportReturn {
    const [result, setResult] = useState<ImportResult | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = useCallback(async (file: File): Promise<ImportResult> => {
        setIsImporting(true);
        setError(null);

        try {
            const importResult = await importFile(file, schema);
            setResult(importResult);

            if (!importResult.success) {
                setError(`${importResult.errors.filter(e => e.severity === 'error').length} erreur(s) de validation`);
            }

            return importResult;
        } catch (err) {
            const msg = (err as Error).message;
            setError(msg);
            const failResult: ImportResult = {
                success: false, data: [], errors: [], warnings: [msg],
                totalRows: 0, validRows: 0, skippedRows: 0,
            };
            setResult(failResult);
            return failResult;
        } finally {
            setIsImporting(false);
        }
    }, [schema]);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return { importFile: handleImport, result, isImporting, error, reset };
}
