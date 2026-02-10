/**
 * SGG Digital — Rapports Automatisés
 *
 * Interface de planification et génération de rapports récurrents :
 *   - Liste des rapports planifiés
 *   - Création de nouveaux rapports programmés
 *   - Historique des générations passées
 *   - Aperçu des prochaines exécutions
 *   - Actions : exécuter maintenant, pause, reprendre, télécharger
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Clock, Play, Pause, Download,
    Calendar, Send, CheckCircle2, AlertTriangle,
    XCircle, Plus, Trash2, RefreshCw,
    BarChart3, Building2, Users, Shield,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type ReportFrequency = 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel';
type ReportStatus = 'actif' | 'pause' | 'erreur';
type ReportFormat = 'PDF' | 'Excel' | 'CSV';

interface ScheduledReport {
    id: string;
    name: string;
    description: string;
    frequency: ReportFrequency;
    format: ReportFormat;
    recipients: string[];
    status: ReportStatus;
    lastRun: string | null;
    lastDuration: string | null;
    nextRun: string;
    createdBy: string;
    category: string;
    icon: typeof FileText;
}

interface ReportHistory {
    id: string;
    reportId: string;
    reportName: string;
    generatedAt: string;
    duration: string;
    size: string;
    format: ReportFormat;
    success: boolean;
    error?: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const SCHEDULED_REPORTS: ScheduledReport[] = [
    { id: 'r1', name: 'Rapport GAR hebdomadaire', description: 'Synthèse des indicateurs GAR de la semaine. Taux de remplissage, scores par ministère, alertes.', frequency: 'hebdomadaire', format: 'PDF', recipients: ['admin@sgg.ga', 'sg@sgg.ga'], status: 'actif', lastRun: new Date(Date.now() - 3 * 86400_000).toISOString(), lastDuration: '45s', nextRun: new Date(Date.now() + 4 * 86400_000).toISOString(), createdBy: 'admin@sgg.ga', category: 'GAR', icon: BarChart3 },
    { id: 'r2', name: 'Export nominations mensuel', description: 'Liste complète des nominations du mois avec statut de validation.', frequency: 'mensuel', format: 'Excel', recipients: ['admin@sgg.ga', 'drh@sgg.ga'], status: 'actif', lastRun: new Date(Date.now() - 10 * 86400_000).toISOString(), lastDuration: '1min 12s', nextRun: new Date(Date.now() + 20 * 86400_000).toISOString(), createdBy: 'admin@sgg.ga', category: 'Nominations', icon: Users },
    { id: 'r3', name: 'Dashboard consolidé trimestriel', description: 'Rapport exécutif pour le SGPR avec tous les KPI consolidés.', frequency: 'trimestriel', format: 'PDF', recipients: ['sgpr@presidence.ga', 'admin@sgg.ga'], status: 'actif', lastRun: new Date(Date.now() - 30 * 86400_000).toISOString(), lastDuration: '3min 24s', nextRun: new Date(Date.now() + 60 * 86400_000).toISOString(), createdBy: 'admin@sgg.ga', category: 'Consolidé', icon: Shield },
    { id: 'r4', name: 'Suivi PTM quotidien', description: 'État d\'avancement des matrices PTM avec alertes retard.', frequency: 'quotidien', format: 'CSV', recipients: ['admin@sgg.ga'], status: 'actif', lastRun: new Date(Date.now() - 6 * 3600_000).toISOString(), lastDuration: '22s', nextRun: new Date(Date.now() + 18 * 3600_000).toISOString(), createdBy: 'admin@sgg.ga', category: 'PTM', icon: FileText },
    { id: 'r5', name: 'Rapport ministères inactifs', description: 'Liste des ministères n\'ayant pas soumis de rapport depuis 30+ jours.', frequency: 'hebdomadaire', format: 'PDF', recipients: ['admin@sgg.ga', 'sg@sgg.ga', 'dgme@sgg.ga'], status: 'actif', lastRun: new Date(Date.now() - 5 * 86400_000).toISOString(), lastDuration: '18s', nextRun: new Date(Date.now() + 2 * 86400_000).toISOString(), createdBy: 'admin@sgg.ga', category: 'Monitoring', icon: Building2 },
    { id: 'r6', name: 'Audit sécurité mensuel', description: 'Rapport de sécurité : connexions suspectes, changements de rôles, accès critiques.', frequency: 'mensuel', format: 'PDF', recipients: ['admin@sgg.ga', 'securite@sgg.ga'], status: 'pause', lastRun: new Date(Date.now() - 45 * 86400_000).toISOString(), lastDuration: '2min 05s', nextRun: '—', createdBy: 'admin@sgg.ga', category: 'Sécurité', icon: Shield },
];

const HISTORY: ReportHistory[] = [
    { id: 'h1', reportId: 'r1', reportName: 'Rapport GAR hebdomadaire', generatedAt: new Date(Date.now() - 3 * 86400_000).toISOString(), duration: '45s', size: '2.4 MB', format: 'PDF', success: true },
    { id: 'h2', reportId: 'r4', reportName: 'Suivi PTM quotidien', generatedAt: new Date(Date.now() - 6 * 3600_000).toISOString(), duration: '22s', size: '340 KB', format: 'CSV', success: true },
    { id: 'h3', reportId: 'r5', reportName: 'Rapport ministères inactifs', generatedAt: new Date(Date.now() - 5 * 86400_000).toISOString(), duration: '18s', size: '1.1 MB', format: 'PDF', success: true },
    { id: 'h4', reportId: 'r1', reportName: 'Rapport GAR hebdomadaire', generatedAt: new Date(Date.now() - 10 * 86400_000).toISOString(), duration: '52s', size: '2.3 MB', format: 'PDF', success: true },
    { id: 'h5', reportId: 'r2', reportName: 'Export nominations mensuel', generatedAt: new Date(Date.now() - 10 * 86400_000).toISOString(), duration: '1min 12s', size: '5.7 MB', format: 'Excel', success: true },
    { id: 'h6', reportId: 'r4', reportName: 'Suivi PTM quotidien', generatedAt: new Date(Date.now() - 30 * 3600_000).toISOString(), duration: '—', size: '—', format: 'CSV', success: false, error: 'Timeout : connexion base de données' },
    { id: 'h7', reportId: 'r3', reportName: 'Dashboard consolidé trimestriel', generatedAt: new Date(Date.now() - 30 * 86400_000).toISOString(), duration: '3min 24s', size: '8.9 MB', format: 'PDF', success: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const FREQ_LABELS: Record<ReportFrequency, string> = { quotidien: 'Quotidien', hebdomadaire: 'Hebdomadaire', mensuel: 'Mensuel', trimestriel: 'Trimestriel' };
const FORMAT_COLORS: Record<ReportFormat, string> = { PDF: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', Excel: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', CSV: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    actif: { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    pause: { label: 'Pause', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Pause },
    erreur: { label: 'Erreur', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

function relativeTime(iso: string) {
    if (iso === '—') return '—';
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) {
        const abs = Math.abs(diff);
        if (abs < 3600_000) return `dans ${Math.floor(abs / 60_000)} min`;
        if (abs < 86400_000) return `dans ${Math.floor(abs / 3600_000)}h`;
        return `dans ${Math.floor(abs / 86400_000)}j`;
    }
    if (diff < 3600_000) return `il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86400_000) return `il y a ${Math.floor(diff / 3600_000)}h`;
    return `il y a ${Math.floor(diff / 86400_000)}j`;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AutoReportsPage() {
    const [reports, setReports] = useState(SCHEDULED_REPORTS);

    const handleToggleStatus = (id: string) => {
        setReports(prev => prev.map(r => {
            if (r.id !== id) return r;
            const newStatus = r.status === 'actif' ? 'pause' : 'actif';
            toast({
                title: newStatus === 'actif' ? `▶️ ${r.name} repris` : `⏸️ ${r.name} en pause`,
                description: newStatus === 'actif' ? 'Le rapport sera généré selon son planning.' : 'Le rapport ne sera plus généré automatiquement.',
            });
            return { ...r, status: newStatus as ReportStatus };
        }));
    };

    const handleRunNow = (report: ScheduledReport) => {
        toast({
            title: `🚀 ${report.name}`,
            description: `Génération en cours... Format : ${report.format}. Destinataires : ${report.recipients.length}.`,
        });
    };

    const activeCount = reports.filter(r => r.status === 'actif').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Clock className="h-7 w-7 text-purple-600" />
                            Rapports Automatisés
                        </h1>
                        <p className="text-muted-foreground">
                            {activeCount}/{reports.length} rapports actifs
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold">{reports.length}</p>
                            <p className="text-[10px] text-muted-foreground">Rapports planifiés</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-green-600">{activeCount}</p>
                            <p className="text-[10px] text-muted-foreground">Actifs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-blue-600">{HISTORY.filter(h => h.success).length}</p>
                            <p className="text-[10px] text-muted-foreground">Générations réussies</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-red-600">{HISTORY.filter(h => !h.success).length}</p>
                            <p className="text-[10px] text-muted-foreground">Échecs</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Scheduled Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Rapports Planifiés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {reports.map(report => {
                            const RIcon = report.icon;
                            const statusConf = STATUS_CONFIG[report.status];
                            const StatusIcon = statusConf.icon;
                            return (
                                <div key={report.id} className="p-4 rounded-lg border hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${FORMAT_COLORS[report.format].split(' ')[0]}`}>
                                            <RIcon className={`h-5 w-5 ${FORMAT_COLORS[report.format].split(' ').slice(1).join(' ')}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-semibold">{report.name}</h3>
                                                <Badge className={`text-[10px] ${statusConf.color}`}>
                                                    <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                                    {statusConf.label}
                                                </Badge>
                                                <Badge className={`text-[10px] ${FORMAT_COLORS[report.format]}`}>{report.format}</Badge>
                                                <Badge variant="outline" className="text-[10px]">{FREQ_LABELS[report.frequency]}</Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">{report.description}</p>

                                            <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
                                                {report.lastRun && (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Dernier : {relativeTime(report.lastRun)} ({report.lastDuration})
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Prochain : {relativeTime(report.nextRun)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Send className="h-3 w-3" /> {report.recipients.length} destinataire(s)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Exécuter maintenant" onClick={() => handleRunNow(report)}>
                                                <Play className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title={report.status === 'actif' ? 'Mettre en pause' : 'Reprendre'} onClick={() => handleToggleStatus(report.id)}>
                                                {report.status === 'actif' ? <Pause className="h-4 w-4 text-amber-600" /> : <RefreshCw className="h-4 w-4 text-blue-600" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            Historique des générations
                        </CardTitle>
                        <CardDescription>{HISTORY.length} exécutions récentes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {HISTORY.map(h => (
                                <div key={h.id} className={`flex items-center gap-3 p-3 rounded-lg border ${!h.success ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                                    {h.success ?
                                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> :
                                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium">{h.reportName}</p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                            <span>{relativeTime(h.generatedAt)}</span>
                                            <span>·</span>
                                            <span>{h.duration}</span>
                                            <span>·</span>
                                            <span>{h.size}</span>
                                            {h.error && <span className="text-red-500">— {h.error}</span>}
                                        </div>
                                    </div>
                                    <Badge className={`text-[10px] ${FORMAT_COLORS[h.format]}`}>{h.format}</Badge>
                                    {h.success && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Télécharger">
                                            <Download className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
