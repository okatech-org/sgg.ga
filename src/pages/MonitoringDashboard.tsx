/**
 * SGG Digital — Page Monitoring Admin
 *
 * Dashboard dédié au monitoring : Core Web Vitals, audit trail,
 * WebSocket connections, et rate limiting stats.
 * Accessible uniquement par admin_sgg.
 */

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Activity, Gauge, Shield, Clock, RefreshCw,
    TrendingUp, TrendingDown, Minus, AlertTriangle,
    CheckCircle2, XCircle, Eye, FileText,
    Download, Filter,
} from 'lucide-react';
import { usePDFExport } from '@/services/pdfExport';

// ── Types ───────────────────────────────────────────────────────────────────

interface VitalMetric {
    name: string;
    value: number;
    unit: string;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
    description: string;
}

interface AuditLogEntry {
    id: string;
    action: string;
    userEmail: string;
    userRole: string;
    resourceType: string;
    module: string;
    status: 'success' | 'failure' | 'error';
    durationMs: number;
    createdAt: string;
}

interface AuditStats {
    total: number;
    byAction: { action: string; count: number }[];
    byModule: { module: string; count: number }[];
    byStatus: { status: string; count: number }[];
    topUsers: { email: string; count: number }[];
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_VITALS: VitalMetric[] = [
    { name: 'LCP', value: 1.8, unit: 's', rating: 'good', threshold: { good: 2.5, poor: 4 }, description: 'Largest Contentful Paint' },
    { name: 'FID', value: 45, unit: 'ms', rating: 'good', threshold: { good: 100, poor: 300 }, description: 'First Input Delay' },
    { name: 'INP', value: 120, unit: 'ms', rating: 'good', threshold: { good: 200, poor: 500 }, description: 'Interaction to Next Paint' },
    { name: 'CLS', value: 0.05, unit: '', rating: 'good', threshold: { good: 0.1, poor: 0.25 }, description: 'Cumulative Layout Shift' },
    { name: 'FCP', value: 1.2, unit: 's', rating: 'good', threshold: { good: 1.8, poor: 3 }, description: 'First Contentful Paint' },
    { name: 'TTFB', value: 320, unit: 'ms', rating: 'good', threshold: { good: 800, poor: 1800 }, description: 'Time to First Byte' },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: '1', action: 'create', userEmail: 'admin@sgg.ga', userRole: 'admin_sgg', resourceType: 'user', module: 'users', status: 'success', durationMs: 45, createdAt: new Date(Date.now() - 120_000).toISOString() },
    { id: '2', action: 'update', userEmail: 'directeur@sgg.ga', userRole: 'directeur_sgg', resourceType: 'report', module: 'reporting', status: 'success', durationMs: 120, createdAt: new Date(Date.now() - 300_000).toISOString() },
    { id: '3', action: 'login', userEmail: 'ministre@minfi.ga', userRole: 'ministre', resourceType: 'session', module: 'auth', status: 'success', durationMs: 230, createdAt: new Date(Date.now() - 450_000).toISOString() },
    { id: '4', action: 'delete', userEmail: 'admin@sgg.ga', userRole: 'admin_sgg', resourceType: 'dossier', module: 'gar', status: 'success', durationMs: 78, createdAt: new Date(Date.now() - 600_000).toISOString() },
    { id: '5', action: 'login_failed', userEmail: 'unknown@test.ga', userRole: 'citoyen', resourceType: 'session', module: 'auth', status: 'failure', durationMs: 15, createdAt: new Date(Date.now() - 900_000).toISOString() },
    { id: '6', action: 'approve', userEmail: 'sgpr@sgg.ga', userRole: 'sgpr', resourceType: 'texte', module: 'legislatif', status: 'success', durationMs: 95, createdAt: new Date(Date.now() - 1200_000).toISOString() },
    { id: '7', action: 'export', userEmail: 'directeur@sgg.ga', userRole: 'directeur_sgg', resourceType: 'rapport', module: 'reporting', status: 'success', durationMs: 1500, createdAt: new Date(Date.now() - 1500_000).toISOString() },
    { id: '8', action: '2fa_enable', userEmail: 'admin@sgg.ga', userRole: 'admin_sgg', resourceType: 'security', module: 'auth', status: 'success', durationMs: 340, createdAt: new Date(Date.now() - 1800_000).toISOString() },
];

const MOCK_AUDIT_STATS: AuditStats = {
    total: 1247,
    byAction: [
        { action: 'read', count: 580 }, { action: 'login', count: 234 },
        { action: 'update', count: 189 }, { action: 'create', count: 112 },
        { action: 'export', count: 67 }, { action: 'delete', count: 34 },
        { action: 'approve', count: 31 },
    ],
    byModule: [
        { module: 'auth', count: 412 }, { module: 'reporting', count: 298 },
        { module: 'gar', count: 187 }, { module: 'nominations', count: 134 },
        { module: 'legislatif', count: 98 }, { module: 'egop', count: 67 },
        { module: 'jo', count: 51 },
    ],
    byStatus: [
        { status: 'success', count: 1189 }, { status: 'failure', count: 42 },
        { status: 'error', count: 16 },
    ],
    topUsers: [
        { email: 'admin@sgg.ga', count: 412 },
        { email: 'directeur@sgg.ga', count: 234 },
        { email: 'sgpr@sgg.ga', count: 156 },
        { email: 'sg.minfi@minfi.ga', count: 89 },
        { email: 'jo@sgg.ga', count: 67 },
    ],
};

// ── Component ───────────────────────────────────────────────────────────────

export default function MonitoringDashboard() {
    const [vitals] = useState(MOCK_VITALS);
    const [auditLogs] = useState(MOCK_AUDIT_LOGS);
    const [auditStats] = useState(MOCK_AUDIT_STATS);
    const [refreshing, setRefreshing] = useState(false);
    const [auditFilter, setAuditFilter] = useState<string>('all');
    const contentRef = useRef<HTMLDivElement>(null);
    const { exportPDF, isExporting, progress } = usePDFExport();

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 800));
        setRefreshing(false);
    };

    useEffect(() => {
        const interval = setInterval(handleRefresh, 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleExportPDF = async () => {
        if (contentRef.current) {
            await exportPDF(contentRef.current, {
                title: 'SGG Digital — Rapport Monitoring',
                subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
                filename: 'sgg-monitoring',
            });
        }
    };

    // ── Helpers ─────────────────────────────────────────────────────────────

    const overallScore = Math.round(
        vitals.reduce((sum, v) => sum + (v.rating === 'good' ? 100 : v.rating === 'needs-improvement' ? 60 : 30), 0) / vitals.length
    );

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good': return 'text-green-600 dark:text-green-400';
            case 'needs-improvement': return 'text-yellow-600 dark:text-yellow-400';
            case 'poor': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-500';
        }
    };

    const getRatingBg = (rating: string) => {
        switch (rating) {
            case 'good': return 'bg-green-100 dark:bg-green-900/30';
            case 'needs-improvement': return 'bg-yellow-100 dark:bg-yellow-900/30';
            case 'poor': return 'bg-red-100 dark:bg-red-900/30';
            default: return 'bg-gray-100';
        }
    };

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'good': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'needs-improvement': return <Minus className="h-4 w-4 text-yellow-500" />;
            case 'poor': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Succès</Badge>;
            case 'failure': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Échec</Badge>;
            case 'error': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Erreur</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        return `Il y a ${Math.floor(diff / 3600_000)}h`;
    };

    const filteredLogs = auditFilter === 'all'
        ? auditLogs
        : auditLogs.filter(l => l.status === auditFilter);

    const successRate = Math.round((auditStats.byStatus.find(s => s.status === 'success')?.count || 0) / auditStats.total * 100);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div ref={contentRef} className="space-y-6" data-pdf-target>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">📊 Monitoring & Performance</h1>
                        <p className="text-muted-foreground">Core Web Vitals, audit trail, métriques système</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="gap-2">
                            <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                            {isExporting ? `${progress}%` : 'Export PDF'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                    </div>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Score Performance</p>
                                    <p className="text-4xl font-bold text-foreground">{overallScore}</p>
                                    <p className="text-xs text-muted-foreground mt-1">/100 — Excellent</p>
                                </div>
                                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Gauge className="h-7 w-7 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Actions Auditées (30j)</p>
                                    <p className="text-4xl font-bold text-foreground">{auditStats.total.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{successRate}% succès</p>
                                </div>
                                <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Erreurs</p>
                                    <p className="text-4xl font-bold text-foreground">
                                        {auditStats.byStatus.find(s => s.status === 'error')?.count || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">derniers 30 jours</p>
                                </div>
                                <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <AlertTriangle className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Core Web Vitals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Activity className="h-5 w-5" />
                            Core Web Vitals
                        </CardTitle>
                        <CardDescription>Métriques de performance selon les seuils Google</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vitals.map((vital) => (
                                <div
                                    key={vital.name}
                                    className={`p-4 rounded-xl border ${getRatingBg(vital.rating)} transition-all hover:scale-[1.02]`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {vital.name}
                                        </span>
                                        {getRatingIcon(vital.rating)}
                                    </div>
                                    <p className={`text-3xl font-bold ${getRatingColor(vital.rating)}`}>
                                        {vital.value}{vital.unit}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{vital.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${vital.rating === 'good' ? 'bg-green-500' :
                                                        vital.rating === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{
                                                    width: `${Math.min(100, (vital.value / vital.threshold.poor) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {vital.rating === 'good' ? '✓' : vital.rating === 'needs-improvement' ? '~' : '✗'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Two-column: Audit Stats + Recent Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Audit Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Gauge className="h-5 w-5" />
                                Statistiques d'Audit
                            </CardTitle>
                            <CardDescription>Répartition des 30 derniers jours</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* By Module */}
                            <div>
                                <h4 className="text-sm font-medium mb-3">Par Module</h4>
                                <div className="space-y-2">
                                    {auditStats.byModule.slice(0, 5).map((item) => {
                                        const pct = Math.round((item.count / auditStats.total) * 100);
                                        return (
                                            <div key={item.module} className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-20 truncate">{item.module}</span>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-medium w-12 text-right">{item.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Top Users */}
                            <div>
                                <h4 className="text-sm font-medium mb-3">Utilisateurs les Plus Actifs</h4>
                                <div className="space-y-2">
                                    {auditStats.topUsers.slice(0, 5).map((user, idx) => (
                                        <div key={user.email} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                                                <span className="text-sm truncate">{user.email}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">{user.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* By Status */}
                            <div>
                                <h4 className="text-sm font-medium mb-3">Par Statut</h4>
                                <div className="flex gap-3">
                                    {auditStats.byStatus.map((s) => (
                                        <div key={s.status} className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
                                            {s.status === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" /> :
                                                s.status === 'failure' ? <XCircle className="h-5 w-5 text-yellow-500 mx-auto mb-1" /> :
                                                    <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" />}
                                            <p className="text-lg font-bold">{s.count}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{s.status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Audit Logs */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Eye className="h-5 w-5" />
                                        Journal d'Audit Récent
                                    </CardTitle>
                                    <CardDescription>Dernières actions enregistrées</CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    {['all', 'success', 'failure', 'error'].map((f) => (
                                        <Button
                                            key={f}
                                            variant={auditFilter === f ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-7 text-xs px-2"
                                            onClick={() => setAuditFilter(f)}
                                        >
                                            {f === 'all' ? 'Tous' : f === 'success' ? '✓' : f === 'failure' ? '⚠' : '✗'}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {filteredLogs.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                    >
                                        <div className="mt-0.5">
                                            {entry.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                                entry.status === 'failure' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                                                    <XCircle className="h-4 w-4 text-red-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium capitalize">{entry.action.replace(/_/g, ' ')}</span>
                                                {getStatusBadge(entry.status)}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {entry.userEmail} · {entry.module}/{entry.resourceType}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {formatTime(entry.createdAt)}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground/70">
                                                    {entry.durationMs}ms
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
