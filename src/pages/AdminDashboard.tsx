/**
 * SGG Digital — Dashboard Admin
 *
 * Page d'administration centralisée pour les super-administrateurs :
 *   - Statistiques utilisateurs en temps réel
 *   - Monitoring système (santé services)
 *   - Journal d'audit des actions récentes
 *   - Gestion rapide (liens vers modules admin)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import {
    Users, Activity, ShieldCheck, Server,
    AlertTriangle, CheckCircle2, Clock,
    ArrowUpRight, RefreshCw, FileText,
    UserPlus, UserX, Key, Eye,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface SystemService {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latencyMs: number;
    lastCheck: string;
}

interface AuditEntry {
    id: string;
    action: string;
    user: string;
    target?: string;
    timestamp: string;
    category: 'user' | 'role' | 'system' | 'data';
}

interface AdminStats {
    totalUsers: number;
    activeToday: number;
    pendingRequests: number;
    dailyLogins: number;
    reportsSubmitted: number;
    reportsValidated: number;
}

// ── Mock data (sera remplacé par API) ───────────────────────────────────────

const MOCK_STATS: AdminStats = {
    totalUsers: 247,
    activeToday: 89,
    pendingRequests: 12,
    dailyLogins: 156,
    reportsSubmitted: 34,
    reportsValidated: 28,
};

const MOCK_SERVICES: SystemService[] = [
    { name: 'PostgreSQL', status: 'healthy', latencyMs: 4, lastCheck: new Date().toISOString() },
    { name: 'Redis Cache', status: 'healthy', latencyMs: 1, lastCheck: new Date().toISOString() },
    { name: 'Supabase Auth', status: 'healthy', latencyMs: 45, lastCheck: new Date().toISOString() },
    { name: 'SendGrid Email', status: 'healthy', latencyMs: 120, lastCheck: new Date().toISOString() },
    { name: 'Cloud Storage', status: 'healthy', latencyMs: 68, lastCheck: new Date().toISOString() },
];

const MOCK_AUDIT: AuditEntry[] = [
    { id: '1', action: 'Utilisateur créé', user: 'admin@sgg.ga', target: 'jean.dupont@minfi.ga', timestamp: new Date(Date.now() - 300_000).toISOString(), category: 'user' },
    { id: '2', action: 'Rôle modifié', user: 'admin@sgg.ga', target: 'marie.nze@minsante.ga → sg_ministere', timestamp: new Date(Date.now() - 600_000).toISOString(), category: 'role' },
    { id: '3', action: 'Rapport validé SGG', user: 'directeur.sgg@sgg.ga', target: 'Rapport MINFI Jan 2026', timestamp: new Date(Date.now() - 900_000).toISOString(), category: 'data' },
    { id: '4', action: 'Accès révoqué', user: 'admin@sgg.ga', target: 'guest@test.ga', timestamp: new Date(Date.now() - 1200_000).toISOString(), category: 'user' },
    { id: '5', action: 'Système mis à jour', user: 'system', target: 'v2.1.0 déployée', timestamp: new Date(Date.now() - 1800_000).toISOString(), category: 'system' },
    { id: '6', action: 'Utilisateur créé', user: 'admin@sgg.ga', target: 'paul.mba@mintp.ga', timestamp: new Date(Date.now() - 2400_000).toISOString(), category: 'user' },
    { id: '7', action: 'Migration données', user: 'system', target: 'institutions : 12 insérés', timestamp: new Date(Date.now() - 3000_000).toISOString(), category: 'system' },
    { id: '8', action: 'Rapport rejeté', user: 'admin.sgg@sgg.ga', target: 'Rapport MINSANTE Déc 2025', timestamp: new Date(Date.now() - 3600_000).toISOString(), category: 'data' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [stats, setStats] = useState<AdminStats>(MOCK_STATS);
    const [services, setServices] = useState<SystemService[]>(MOCK_SERVICES);
    const [audit, setAudit] = useState<AuditEntry[]>(MOCK_AUDIT);
    const [refreshing, setRefreshing] = useState(false);

    // Simulate real-time refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 800));

        // Randomize slightly to simulate live data
        setStats(prev => ({
            ...prev,
            activeToday: prev.activeToday + Math.floor(Math.random() * 5) - 2,
            dailyLogins: prev.dailyLogins + Math.floor(Math.random() * 3),
        }));

        setServices(prev =>
            prev.map(s => ({
                ...s,
                latencyMs: s.latencyMs + Math.floor(Math.random() * 10) - 5,
                lastCheck: new Date().toISOString(),
            }))
        );

        setRefreshing(false);
    };

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(handleRefresh, 30_000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        return `Il y a ${Math.floor(diff / 3600_000)}h`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            down: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return variants[status] || variants.down;
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

    const allHealthy = services.every(s => s.status === 'healthy');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t('admin.title')}</h1>
                        <p className="text-muted-foreground">{t('admin.monitoringDesc')}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? t('common.loading') : t('common.retry')}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.totalUsers')}</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.activeToday')}</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.activeToday}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.pendingRequests')}</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.pendingRequests}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.systemHealth')}</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {allHealthy ? '✅' : '⚠️'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {allHealthy ? t('admin.healthy') : t('admin.degraded')}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Services */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Server className="h-5 w-5" />
                                {t('admin.monitoring')}
                            </CardTitle>
                            <CardDescription>{t('admin.monitoringDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {services.map((service) => (
                                    <div
                                        key={service.name}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(service.status)}
                                            <span className="font-medium text-sm">{service.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {service.latencyMs}ms
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className={`text-[10px] ${getStatusBadge(service.status)}`}
                                            >
                                                {service.status === 'healthy' ? t('admin.healthy') : t('admin.degraded')}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldCheck className="h-5 w-5" />
                                {t('admin.recentActions')}
                            </CardTitle>
                            <CardDescription>Journal d'audit des 24 dernières heures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {audit.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="mt-0.5">{getCategoryIcon(entry.category)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{entry.action}</p>
                                            {entry.target && (
                                                <p className="text-xs text-muted-foreground truncate">{entry.target}</p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                                {entry.user} · {formatTime(entry.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                                onClick={() => navigate('/matrice-reporting')}
                            >
                                <FileText className="h-6 w-6" />
                                <span className="text-sm font-medium">Rapports</span>
                                <span className="text-[11px] text-muted-foreground text-center">
                                    {stats.reportsSubmitted} soumis, {stats.reportsValidated} validés
                                </span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-colors"
                                onClick={() => window.open('/api/docs', '_blank')}
                            >
                                <ArrowUpRight className="h-6 w-6" />
                                <span className="text-sm font-medium">API Docs</span>
                                <span className="text-[11px] text-muted-foreground text-center">OpenAPI / Swagger UI</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
