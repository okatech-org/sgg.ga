/**
 * SGG Digital — Page Import / Export de Données
 *
 * Interface pour :
 *   - Exporter les données en CSV ou Excel
 *   - Importer des fichiers avec validation
 *   - Prévisualiser les données avant import
 *   - Télécharger des templates
 */

import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
    Upload, Download, FileSpreadsheet, FileText,
    CheckCircle2, XCircle, AlertTriangle, ArrowRight,
    Table, Eye, Trash2, RefreshCw, Info,
} from 'lucide-react';
import {
    useDataExport,
    useDataImport,
    SCHEMAS,
    exportToExcel,
    type ColumnSchema,
    type ImportResult,
} from '@/services/dataExchange';

// ── Types ───────────────────────────────────────────────────────────────────

interface DatasetConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    schema: ColumnSchema[];
    sampleData: Record<string, any>[];
    recordCount: number;
}

// ── Mock Data Sources ───────────────────────────────────────────────────────

const DATASETS: DatasetConfig[] = [
    {
        id: 'institutions',
        name: 'Institutions',
        description: 'Liste des institutions gouvernementales',
        icon: '🏢',
        schema: SCHEMAS.institutions,
        recordCount: 42,
        sampleData: [
            { nom: 'Ministère des Finances', type: 'ministere', sigle: 'MINFI', responsable: 'M. Jean NZE', email: 'sg@minfi.ga', telephone: '+241 01 76 00 00', adresse: 'Libreville', actif: true },
            { nom: 'Ministère de la Santé', type: 'ministere', sigle: 'MINSANTE', responsable: 'Mme Marie OBAME', email: 'sg@minsante.ga', telephone: '+241 01 76 00 01', adresse: 'Libreville', actif: true },
            { nom: 'Agence Nationale des Parcs', type: 'agence', sigle: 'ANPN', responsable: 'M. Paul MBA', email: 'dg@anpn.ga', telephone: '+241 01 44 00 00', adresse: 'Libreville', actif: true },
        ],
    },
    {
        id: 'users',
        name: 'Utilisateurs',
        description: 'Comptes utilisateurs de la plateforme',
        icon: '👥',
        schema: SCHEMAS.users,
        recordCount: 247,
        sampleData: [
            { email: 'admin@sgg.ga', prenom: 'Albert', nom: 'NDONG', role: 'admin_sgg', institution: 'SGG', telephone: '+241 01 00 00 00', actif: true },
            { email: 'jean.nze@minfi.ga', prenom: 'Jean', nom: 'NZE', role: 'sg_ministere', institution: 'MINFI', telephone: '+241 06 00 00 01', actif: true },
        ],
    },
    {
        id: 'nominations',
        name: 'Nominations',
        description: 'Nominations gouvernementales',
        icon: '👤',
        schema: SCHEMAS.nominations,
        recordCount: 156,
        sampleData: [
            { nom: 'Jean-Pierre OBAME', poste: 'Directeur Général', ministere: 'Ministère des Finances', dateDecret: '2026-01-15', numerDecret: 'D-001/2026', statut: 'actif' },
            { nom: 'Marie NTOUTOUME', poste: 'Secrétaire Général', ministere: 'Ministère de la Santé', dateDecret: '2025-12-01', numerDecret: 'D-045/2025', statut: 'actif' },
        ],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DataExchangePage() {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importSchema, setImportSchema] = useState<string>('institutions');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { exportToExcel: exportExcel, exportToCSV, isExporting } = useDataExport();
    const { importFile: doImport, isImporting, reset: resetImport } = useDataImport(
        DATASETS.find(d => d.id === importSchema)?.schema || SCHEMAS.institutions
    );

    // ── Export Handlers ─────────────────────────────────────────────────────

    const handleExportExcel = (dataset: DatasetConfig) => {
        exportExcel(dataset.sampleData, {
            filename: `sgg-${dataset.id}`,
            sheetName: dataset.name,
            columns: dataset.schema,
            title: `SGG Digital — ${dataset.name}`,
        });
        toast({ title: '✅ Export Excel', description: `${dataset.name} exporté avec succès.` });
    };

    const handleExportCSV = (dataset: DatasetConfig) => {
        exportToCSV(dataset.sampleData, {
            filename: `sgg-${dataset.id}`,
            columns: dataset.schema,
        });
        toast({ title: '✅ Export CSV', description: `${dataset.name} exporté avec succès.` });
    };

    const handleDownloadTemplate = (dataset: DatasetConfig) => {
        exportToExcel([], {
            filename: `template-${dataset.id}`,
            sheetName: 'Template',
            columns: dataset.schema,
            title: `Template Import — ${dataset.name}`,
        });
        toast({ title: '📋 Template téléchargé', description: `Remplissez le fichier et importez-le.` });
    };

    // ── Import Handlers ─────────────────────────────────────────────────────

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportFile(file);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!importFile) return;
        const result = await doImport(importFile);
        setImportResult(result);

        if (result.success) {
            toast({ title: '✅ Import réussi', description: `${result.validRows} lignes importées avec succès.` });
        } else {
            toast({
                title: '⚠️ Import avec erreurs',
                description: `${result.validRows} valides, ${result.skippedRows} ignorées, ${result.errors.length} erreurs.`,
                variant: 'destructive',
            });
        }
    };

    const handleReset = () => {
        setImportFile(null);
        setImportResult(null);
        resetImport();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <FileSpreadsheet className="h-7 w-7 text-green-600" />
                            Import / Export de Données
                        </h1>
                        <p className="text-muted-foreground">
                            Importer et exporter vos données en CSV ou Excel
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-lg bg-muted/50 w-fit">
                    <Button
                        variant={activeTab === 'export' ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setActiveTab('export')}
                    >
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                    <Button
                        variant={activeTab === 'import' ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setActiveTab('import')}
                    >
                        <Upload className="h-4 w-4" />
                        Importer
                    </Button>
                </div>

                {/* EXPORT TAB */}
                {activeTab === 'export' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DATASETS.map(dataset => (
                            <Card key={dataset.id} className="hover:shadow-md transition-all">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <span className="text-2xl">{dataset.icon}</span>
                                        {dataset.name}
                                    </CardTitle>
                                    <CardDescription>{dataset.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="secondary" className="text-xs">
                                            <Table className="h-3 w-3 mr-1" />
                                            {dataset.recordCount} entrées
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {dataset.schema.length} colonnes
                                        </Badge>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="gap-2 w-full"
                                            onClick={() => handleExportExcel(dataset)}
                                            disabled={isExporting}
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Export Excel (.xlsx)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 w-full"
                                            onClick={() => handleExportCSV(dataset)}
                                            disabled={isExporting}
                                        >
                                            <FileText className="h-4 w-4" />
                                            Export CSV
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 w-full text-xs"
                                            onClick={() => handleDownloadTemplate(dataset)}
                                        >
                                            <Download className="h-3 w-3" />
                                            Template d'import
                                        </Button>
                                    </div>

                                    {/* Schema preview */}
                                    <button
                                        className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                        onClick={() => setSelectedDataset(selectedDataset === dataset.id ? null : dataset.id)}
                                    >
                                        <Eye className="h-3 w-3" />
                                        {selectedDataset === dataset.id ? 'Masquer' : 'Voir'} le schéma
                                    </button>

                                    {selectedDataset === dataset.id && (
                                        <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs space-y-1">
                                            {dataset.schema.map(col => (
                                                <div key={col.key} className="flex items-center justify-between">
                                                    <span className="font-medium">{col.label}</span>
                                                    <div className="flex gap-1">
                                                        <Badge variant="outline" className="text-[10px] py-0">{col.type}</Badge>
                                                        {col.required && <Badge className="text-[10px] py-0 bg-red-100 text-red-700">requis</Badge>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* IMPORT TAB */}
                {activeTab === 'import' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Upload Area */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Importer un fichier</CardTitle>
                                    <CardDescription>Formats acceptés : .xlsx, .xls, .csv</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Schema selector */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Type de données</label>
                                        <div className="flex gap-2">
                                            {DATASETS.map(d => (
                                                <Button
                                                    key={d.id}
                                                    variant={importSchema === d.id ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => { setImportSchema(d.id); handleReset(); }}
                                                    className="gap-1"
                                                >
                                                    <span>{d.icon}</span>
                                                    {d.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* File drop zone */}
                                    <div
                                        className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file) { setImportFile(file); setImportResult(null); }
                                        }}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                        {importFile ? (
                                            <div className="space-y-2">
                                                <FileSpreadsheet className="h-10 w-10 mx-auto text-green-500" />
                                                <p className="font-medium">{importFile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(importFile.size / 1024).toFixed(1)} Ko
                                                </p>
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                                                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                                                <p className="font-medium">Glissez un fichier ici</p>
                                                <p className="text-xs text-muted-foreground">ou cliquez pour sélectionner</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Import button */}
                                    {importFile && !importResult && (
                                        <Button
                                            className="w-full gap-2"
                                            onClick={handleImport}
                                            disabled={isImporting}
                                        >
                                            {isImporting ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ArrowRight className="h-4 w-4" />
                                            )}
                                            {isImporting ? 'Validation en cours...' : 'Valider et Importer'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Results */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Résultat de l'import</CardTitle>
                                    <CardDescription>Validation et aperçu des données</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {importResult ? (
                                        <div className="space-y-4">
                                            {/* Summary */}
                                            <div className={`p-4 rounded-lg border ${importResult.success
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200'
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {importResult.success ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-600" />
                                                    )}
                                                    <span className="font-medium">
                                                        {importResult.success ? 'Import réussi' : 'Erreurs détectées'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold">{importResult.totalRows}</p>
                                                        <p className="text-[10px] text-muted-foreground">Total</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold text-green-600">{importResult.validRows}</p>
                                                        <p className="text-[10px] text-muted-foreground">Valides</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold text-red-600">{importResult.skippedRows}</p>
                                                        <p className="text-[10px] text-muted-foreground">Ignorées</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Errors */}
                                            {importResult.errors.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                        Erreurs ({importResult.errors.length})
                                                    </h4>
                                                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                                        {importResult.errors.slice(0, 20).map((err, i) => (
                                                            <div key={i} className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400">
                                                                <span className="font-mono">Ligne {err.row}</span> · {err.column} : {err.message}
                                                            </div>
                                                        ))}
                                                        {importResult.errors.length > 20 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                ... et {importResult.errors.length - 20} autres erreurs
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Preview */}
                                            {importResult.data.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                        Aperçu ({importResult.data.length} lignes)
                                                    </h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b">
                                                                    {Object.keys(importResult.data[0]).slice(0, 5).map(key => (
                                                                        <th key={key} className="py-1 px-2 text-left font-medium text-muted-foreground">
                                                                            {key}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {importResult.data.slice(0, 5).map((row, i) => (
                                                                    <tr key={i} className="border-b">
                                                                        {Object.values(row).slice(0, 5).map((val, j) => (
                                                                            <td key={j} className="py-1 px-2 truncate max-w-[120px]">
                                                                                {String(val ?? '-')}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                                                <RefreshCw className="h-4 w-4" />
                                                Nouvel import
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Table className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">Sélectionnez un fichier et lancez l'import</p>
                                            <p className="text-xs mt-1">Les données seront validées avant insertion</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info */}
                        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900 dark:text-blue-300">Conseils d'import</p>
                                        <ul className="text-blue-700 dark:text-blue-400 mt-1 space-y-0.5 list-disc list-inside">
                                            <li>Utilisez les templates pour garantir le bon format</li>
                                            <li>Les colonnes sont détectées par leur nom (label ou clé)</li>
                                            <li>Les booléens acceptent : oui/non, true/false, 1/0</li>
                                            <li>Les dates acceptent les formats ISO et JJ/MM/AAAA</li>
                                            <li>Les lignes en erreur sont ignorées, les lignes valides sont importées</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
