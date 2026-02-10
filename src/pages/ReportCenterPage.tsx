/**
 * SGG Digital — Centre de Rapports
 *
 * Générateur et bibliothèque de rapports :
 *   - Rapports pré-configurés par catégorie
 *   - Génération à la demande
 *   - Historique des rapports générés
 *   - Formats multiples (PDF, XLSX, CSV)
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileBarChart, Download, Clock, Play,
    Search, FileText, Sheet, File,
    CheckCircle2, Loader2, Calendar, Filter,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type ReportFormat = 'PDF' | 'XLSX' | 'CSV';
type ReportStatus = 'ready' | 'generating' | 'scheduled';
type ReportCategory = 'GAR' | 'Budget' | 'Nominations' | 'Performance' | 'RH' | 'Système';

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    format: ReportFormat;
    frequency: string;
    lastGenerated?: string;
    size?: string;
    status: ReportStatus;
    recipients: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const FORMAT_ICONS: Record<ReportFormat, { icon: typeof FileText; color: string }> = {
    PDF: { icon: FileText, color: 'text-red-500' },
    XLSX: { icon: Sheet, color: 'text-green-500' },
    CSV: { icon: File, color: 'text-blue-500' },
};

const CAT_COLORS: Record<ReportCategory, string> = {
    GAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Budget: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Nominations: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Performance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    RH: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'Système': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const REPORT_TEMPLATES: ReportTemplate[] = [
    { id: 'rp1', name: 'Rapport GAR Consolidé Trimestriel', description: 'Synthèse des rapports GAR de tous les ministères pour le trimestre en cours.', category: 'GAR', format: 'PDF', frequency: 'Trimestriel', lastGenerated: '31 jan 2026', size: '4.2 MB', status: 'ready', recipients: 42 },
    { id: 'rp2', name: 'Tableau de Bord Exécutif Mensuel', description: 'Dashboard consolidé avec KPIs nationaux, alertes et points d\'attention pour le Secrétaire Général.', category: 'Performance', format: 'PDF', frequency: 'Mensuel', lastGenerated: '1 fév 2026', size: '2.8 MB', status: 'ready', recipients: 5 },
    { id: 'rp3', name: 'État des Nominations en Cours', description: 'Liste détaillée des nominations en attente avec délais, étapes et responsables.', category: 'Nominations', format: 'XLSX', frequency: 'Hebdomadaire', lastGenerated: '7 fév 2026', size: '890 KB', status: 'ready', recipients: 12 },
    { id: 'rp4', name: 'Suivi Exécution Budgétaire', description: 'État d\'avancement de l\'exécution budgétaire par ministère et par programme.', category: 'Budget', format: 'XLSX', frequency: 'Mensuel', lastGenerated: '31 jan 2026', size: '1.5 MB', status: 'ready', recipients: 35 },
    { id: 'rp5', name: 'Benchmark Ministères T4 2025', description: 'Classement et comparaison de performance des ministères pour le dernier trimestre.', category: 'Performance', format: 'PDF', frequency: 'Trimestriel', lastGenerated: '15 jan 2026', size: '5.1 MB', status: 'ready', recipients: 42 },
    { id: 'rp6', name: 'Registre des Agents Numérisés', description: 'Export complet des agents publics enregistrés sur la plateforme par ministère et province.', category: 'RH', format: 'CSV', frequency: 'Mensuel', lastGenerated: '1 fév 2026', size: '3.2 MB', status: 'ready', recipients: 15 },
    { id: 'rp7', name: 'Rapport d\'Activité Plateforme', description: 'Statistiques d\'utilisation : connexions, sessions, pages vues, temps moyen par utilisateur.', category: 'Système', format: 'PDF', frequency: 'Mensuel', lastGenerated: '1 fév 2026', size: '1.8 MB', status: 'ready', recipients: 8 },
    { id: 'rp8', name: 'Journal d\'Audit Sécurité', description: 'Actions sensibles, connexions suspectes, modifications de permissions sur la période.', category: 'Système', format: 'CSV', frequency: 'Hebdomadaire', lastGenerated: '7 fév 2026', size: '650 KB', status: 'ready', recipients: 3 },
    { id: 'rp9', name: 'Rapport Formation Points Focaux', description: 'Bilan des sessions de formation : participation, scores, certifications obtenues.', category: 'RH', format: 'PDF', frequency: 'Mensuel', lastGenerated: '1 fév 2026', size: '920 KB', status: 'ready', recipients: 10 },
    { id: 'rp10', name: 'Synthèse GAR par Province', description: 'Ventilation des résultats GAR par province avec indicateurs de couverture et performance.', category: 'GAR', format: 'XLSX', frequency: 'Trimestriel', status: 'scheduled', recipients: 18 },
    { id: 'rp11', name: 'Projets PAG — Avancement', description: 'État d\'avancement des 50 projets du Plan d\'Accélération de la Transformation.', category: 'Performance', format: 'PDF', frequency: 'Mensuel', lastGenerated: '1 fév 2026', size: '3.5 MB', status: 'ready', recipients: 20 },
    { id: 'rp12', name: 'Export Données Brutes Multi-Module', description: 'Extraction complète des données pour analyse externe (GAR, Budget, Effectifs, Nominations).', category: 'Système', format: 'CSV', frequency: 'À la demande', status: 'ready', recipients: 5 },
];

const CATEGORIES: ReportCategory[] = ['GAR', 'Budget', 'Nominations', 'Performance', 'RH', 'Système'];

// ── Component ───────────────────────────────────────────────────────────────

export default function ReportCenterPage() {
    const [reports, setReports] = useState(REPORT_TEMPLATES);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [generating, setGenerating] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return reports.filter(r => {
            if (catFilter !== 'all' && r.category !== catFilter) return false;
            if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [reports, search, catFilter]);

    const handleGenerate = (id: string) => {
        setGenerating(id);
        toast({ title: '⚙️ Génération en cours...' });
        setTimeout(() => {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'ready' as ReportStatus, lastGenerated: 'Maintenant', size: '2.1 MB' } : r));
            setGenerating(null);
            toast({ title: '✅ Rapport généré avec succès', description: 'Prêt au téléchargement' });
        }, 2000);
    };

    const readyCount = reports.filter(r => r.status === 'ready').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FileBarChart className="h-7 w-7 text-indigo-600" />
                        Centre de Rapports
                    </h1>
                    <p className="text-muted-foreground">
                        {reports.length} modèles · {readyCount} rapports prêts · {reports.reduce((s, r) => s + r.recipients, 0)} destinataires
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {CATEGORIES.map(cat => (
                        <Card key={cat} className={`cursor-pointer ${catFilter === cat ? 'ring-2 ring-primary' : ''}`} onClick={() => setCatFilter(catFilter === cat ? 'all' : cat)}>
                            <CardContent className="pt-2 pb-1 text-center">
                                <p className="text-lg font-bold">{reports.filter(r => r.category === cat).length}</p>
                                <p className="text-[9px] text-muted-foreground">{cat}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un rapport..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Report Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map(report => {
                        const fmtConf = FORMAT_ICONS[report.format];
                        const FmtIcon = fmtConf.icon;
                        const isGen = generating === report.id;

                        return (
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                                            <FmtIcon className={`h-5 w-5 ${fmtConf.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold leading-snug">{report.name}</p>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <Badge className={`text-[8px] h-3.5 ${CAT_COLORS[report.category]}`}>{report.category}</Badge>
                                                <Badge variant="outline" className="text-[8px] h-3.5">{report.format}</Badge>
                                                <span className="text-[9px] text-muted-foreground">{report.frequency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-muted-foreground leading-relaxed">{report.description}</p>

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            {report.lastGenerated && (
                                                <span><Clock className="h-2.5 w-2.5 inline mr-0.5" />{report.lastGenerated}</span>
                                            )}
                                            {report.size && <span>{report.size}</span>}
                                        </div>
                                        <span>{report.recipients} dest.</span>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {report.status === 'ready' && report.lastGenerated && (
                                            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 gap-1" onClick={() => toast({ title: '📥 Téléchargement lancé' })}>
                                                <Download className="h-3 w-3" /> Télécharger
                                            </Button>
                                        )}
                                        <Button size="sm" className="flex-1 text-[10px] h-7 gap-1" disabled={isGen} onClick={() => handleGenerate(report.id)}>
                                            {isGen ? <><Loader2 className="h-3 w-3 animate-spin" /> Génération...</> : <><Play className="h-3 w-3" /> Générer</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileBarChart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun rapport trouvé</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
