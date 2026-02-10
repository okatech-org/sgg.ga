/**
 * SGG Digital — Dashboard Admin
 *
 * Connecté au NEOCORTEX via React Query.
 * Affiche les données du système nerveux en temps réel :
 *   - KPI Cards alimentées par NEOCORTEX Dashboard
 *   - Historique des actions (Hippocampe)
 *   - Métriques système + Santé services
 *   - Actions rapides (admin)
 * Fallback sur données mock si l'API est indisponible.
 */

import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';
import {
    useNeocortexDashboard,
    useHistorique,
    useNotificationsCount,
} from '@/hooks/useNeocortex';
import type { NeocortexDashboard as DashboardData, HistoriqueAction } from '@/services/api';
import {
    Users, Activity, ShieldCheck, Server, Brain,
    AlertTriangle, CheckCircle2, Clock, Zap,
    ArrowUpRight, RefreshCw, FileText, Bell,
    UserPlus, Key, Eye, Database, Cpu,
    TrendingUp, BarChart3, Loader2,
} from 'lucide-react';

// ── Mock fallback data ──────────────────────────────────────────────────────

const MOCK_DASHBOARD: DashboardData = {
    limbique: { totalSignaux: 1247, nonTraites: 3, derniere24h: 89, parType: { NOMINATION_CREEE: 12, GAR_RAPPORT_SOUMIS: 34, TEXTE_LEGISLATIF_SOUMIS: 8 } },
    hippocampe: {
        totalActions: 5623, derniere24h: 156,
        parCategorie: { creation: 45, modification: 67, validation: 23, consultation: 21 },
        topActions: [
            { action: 'CREATION', count: 45 },
            { action: 'MODIFICATION', count: 67 },
            { action: 'VALIDATION', count: 23 },
        ],
        topUtilisateurs: [
            { userId: '1', email: 'admin@sgg.ga', count: 89 },
            { userId: '2', email: 'directeur.sgg@sgg.ga', count: 45 },
        ],
    },
    moteur: { enAttente: 2, enCours: 1, terminees24h: 34, echouees24h: 0, parType: [] },
    timestamp: new Date().toISOString(),
};

const MOCK_AUDIT: HistoriqueAction[] = [
    { id: '1', action: 'CREATION', categorie: 'user', entiteType: 'utilisateur', entiteId: 'u-42', userId: 'admin', userEmail: 'admin@sgg.ga', userRole: 'super_admin', details: { target: 'jean.dupont@minfi.ga' }, metadata: {}, correlationId: null, durationMs: 45, createdAt: new Date(Date.now() - 300_000).toISOString() },
    { id: '2', action: 'MODIFICATION', categorie: 'role', entiteType: 'role', entiteId: 'r-12', userId: 'admin', userEmail: 'admin@sgg.ga', userRole: 'super_admin', details: { target: 'marie.nze → sg_ministere' }, metadata: {}, correlationId: null, durationMs: 23, createdAt: new Date(Date.now() - 600_000).toISOString() },
    { id: '3', action: 'VALIDATION', categorie: 'data', entiteType: 'rapport', entiteId: 'rap-7', userId: 'dir', userEmail: 'directeur.sgg@sgg.ga', userRole: 'directeur_sgg', details: { target: 'Rapport MINFI Jan 2026' }, metadata: {}, correlationId: null, durationMs: 120, createdAt: new Date(Date.now() - 900_000).toISOString() },
    { id: '4', action: 'SUPPRESSION', categorie: 'user', entiteType: 'utilisateur', entiteId: 'u-99', userId: 'admin', userEmail: 'admin@sgg.ga', userRole: 'super_admin', details: { target: 'guest@test.ga' }, metadata: {}, correlationId: null, durationMs: 15, createdAt: new Date(Date.now() - 1200_000).toISOString() },
    { id: '5', action: 'DEPLOIEMENT', categorie: 'system', entiteType: 'system', entiteId: null, userId: 'system', userEmail: 'system', userRole: 'system', details: { target: 'v3.0.0-nexus-omega' }, metadata: {}, correlationId: null, durationMs: 0, createdAt: new Date(Date.now() - 1800_000).toISOString() },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 🧠 NEOCORTEX Data
    const { data: dashboard, isLoading: dashLoading, refetch: refetchDash, isRefetching } = useNeocortexDashboard();
    const { data: historiqueData, isLoading: histLoading } = useHistorique({ limit: 8 });
    const { data: unreadCount } = useNotificationsCount();

    // Resolve with fallback
    const dash = dashboard || MOCK_DASHBOARD;
    const audit = historiqueData?.actions?.length ? historiqueData.actions : MOCK_AUDIT;
    const isUsingMock = !dashboard;

    const handleRefresh = async () => {
        await refetchDash();
        toast.success('Données rafraîchies');
    };

    // ── Helpers ─────────────────────────────────────────────────────────

    const formatTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'user': return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'role': return <Key className="h-4 w-4 text-purple-500" />;
            case 'data': return <FileText className="h-4 w-4 text-green-500" />;
            case 'system': return <Server className="h-4 w-4 text-orange-500" />;
            default: return <Eye className="h-4 w-4 text-gray-500" />;
        }
    };

    const moteurOk = dash.moteur.echouees24h === 0;
    const signalsSante = dash.limbique.nonTraites < 10;

    return (
        <DashboardLayout>
            <AnimatedPage className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Brain className="h-7 w-7 text-purple-600" />
                            {t('admin.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('admin.monitoringDesc')}
                            {isUsingMock && <span className="text-xs ml-2 text-amber-500">(données démo)</span>}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount !== undefined && unreadCount > 0 && (
                            <Button
                                variant="outline" size="sm" className="gap-2"
                                onClick={() => navigate('/notifications')}
                            >
                                <Bell className="h-4 w-4" />
                                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                            </Button>
                        )}
                        <Button
                            variant="outline" size="sm"
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                            {isRefetching ? t('common.loading') : t('common.retry')}
                        </Button>
                    </div>
                </div>

                {/* KPI Cards — connected to NEOCORTEX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {/* Signaux 24h */}
                    <Card className="border-l-4 border-l-blue-500 card-hover">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Signaux 24h</p>
                                    {dashLoading ? <Skeleton className="h-9 w-20 mt-1" /> : (
                                        <p className="text-3xl font-bold text-foreground">{dash.limbique.derniere24h}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {dash.limbique.nonTraites} en attente
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions 24h */}
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Actions 24h</p>
                                    {dashLoading ? <Skeleton className="h-9 w-20 mt-1" /> : (
                                        <p className="text-3xl font-bold text-foreground">{dash.hippocampe.derniere24h}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {dash.hippocampe.totalActions} total
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tâches Moteur */}
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tâches Async</p>
                                    {dashLoading ? <Skeleton className="h-9 w-20 mt-1" /> : (
                                        <p className="text-3xl font-bold text-foreground">{dash.moteur.terminees24h}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {dash.moteur.enAttente} en attente · {dash.moteur.echouees24h} échecs
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Cpu className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Santé Système */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.systemHealth')}</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {signalsSante && moteurOk ? '✅' : '⚠️'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {signalsSante && moteurOk ? 'NEOCORTEX nominal' : 'Attention requise'}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* NEOCORTEX Cortex Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Brain className="h-5 w-5 text-purple-500" />
                                Cortex NEOCORTEX
                            </CardTitle>
                            <CardDescription>État des modules du système nerveux</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Limbique */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium text-sm">💓 Limbique (Signaux)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {dash.limbique.totalSignaux} total
                                        </span>
                                        <Badge variant="secondary" className={`text-[10px] ${signalsSante ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {signalsSante ? 'Nominal' : `${dash.limbique.nonTraites} en attente`}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Hippocampe */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Database className="h-4 w-4 text-green-500" />
                                        <span className="font-medium text-sm">📚 Hippocampe (Mémoire)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {dash.hippocampe.totalActions} actions
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30">
                                            Actif
                                        </Badge>
                                    </div>
                                </div>

                                {/* Moteur */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Cpu className="h-4 w-4 text-amber-500" />
                                        <span className="font-medium text-sm">🏃 Moteur (Tâches Async)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {dash.moteur.enCours} en cours
                                        </span>
                                        <Badge variant="secondary" className={`text-[10px] ${moteurOk ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-red-100 text-red-800'}`}>
                                            {moteurOk ? 'OK' : `${dash.moteur.echouees24h} échecs`}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Préfrontal */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-4 w-4 text-purple-500" />
                                        <span className="font-medium text-sm">🎯 Préfrontal (Décisions)</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30">
                                        Actif
                                    </Badge>
                                </div>

                                {/* Auditif */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Bell className="h-4 w-4 text-cyan-500" />
                                        <span className="font-medium text-sm">👂 Auditif (Notifications)</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30">
                                        Actif
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Log — Real data from Hippocampe */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldCheck className="h-5 w-5" />
                                {t('admin.recentActions')}
                            </CardTitle>
                            <CardDescription>
                                Journal d'audit NEOCORTEX (Hippocampe)
                                {histLoading && <Loader2 className="inline-block h-3 w-3 ml-2 animate-spin" />}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {histLoading && [1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-start gap-3 p-3">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                                {!histLoading && audit.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="mt-0.5">{getCategoryIcon(entry.categorie)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{entry.action}</p>
                                            {entry.details && (entry.details as any).target && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {(entry.details as any).target}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                                {entry.userEmail || 'system'} · {formatTime(entry.createdAt)}
                                                {entry.durationMs != null && (
                                                    <span className="ml-2 text-muted-foreground/50">{entry.durationMs}ms</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Signal Types Distribution */}
                {Object.keys(dash.limbique.parType).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                Distribution des Signaux
                            </CardTitle>
                            <CardDescription>Types de signaux émis par le système nerveux</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(dash.limbique.parType).map(([type, count]) => (
                                    <div key={type} className="p-3 rounded-lg bg-muted/50 text-center">
                                        <p className="text-lg font-bold text-foreground">{count}</p>
                                        <p className="text-[10px] text-muted-foreground truncate" title={type}>
                                            {type.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                onClick={() => navigate('/admin/users')}
                            >
                                <Users className="h-6 w-6" />
                                <span className="text-sm font-medium">{t('admin.users')}</span>
                                <span className="text-[11px] text-muted-foreground text-center">{t('admin.usersDesc')}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:text-purple-600 transition-colors"
                                onClick={() => navigate('/admin/permissions')}
                            >
                                <ShieldCheck className="h-6 w-6" />
                                <span className="text-sm font-medium">{t('admin.permissions')}</span>
                                <span className="text-[11px] text-muted-foreground text-center">{t('admin.permissionsDesc')}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:text-green-600 transition-colors"
                                onClick={() => navigate('/notifications')}
                            >
                                <Bell className="h-6 w-6" />
                                <span className="text-sm font-medium">Notifications</span>
                                <span className="text-[11px] text-muted-foreground text-center">
                                    {unreadCount || 0} non lues
                                </span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-colors"
                                onClick={() => navigate('/matrice-reporting')}
                            >
                                <FileText className="h-6 w-6" />
                                <span className="text-sm font-medium">Rapports GAR</span>
                                <span className="text-[11px] text-muted-foreground text-center">
                                    Matrice de reporting
                                </span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedPage>
        </DashboardLayout>
    );
}
