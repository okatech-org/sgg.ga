/**
 * SGG Digital — Statistiques Système
 *
 * Tableau de bord opérationnel en temps réel :
 *   - Santé des services (API, DB, Redis, WebSocket)
 *   - Métriques d'utilisation (sessions actives, requêtes, bandwidth)
 *   - Uptime et disponibilité
 *   - Alertes récentes et incidents
 *   - Informations serveur
 */

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Server, Database, Wifi, WifiOff,
    Activity, HardDrive, Cpu, MemoryStick,
    Clock, CheckCircle2, AlertTriangle, XCircle,
    RefreshCw, Globe, Users, Zap,
    ArrowUpDown, Shield, TrendingUp,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ServiceStatus = 'healthy' | 'degraded' | 'down';

interface ServiceHealth {
    name: string;
    status: ServiceStatus;
    latency: number;
    uptime: number;
    lastCheck: string;
    icon: typeof Server;
    details?: string;
}

interface SystemMetric {
    label: string;
    value: string;
    unit: string;
    icon: typeof Cpu;
    trend?: string;
    color: string;
}

interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    resolved: boolean;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const SERVICES: ServiceHealth[] = [
    { name: 'API Backend', status: 'healthy', latency: 42, uptime: 99.98, lastCheck: new Date(Date.now() - 30_000).toISOString(), icon: Server, details: 'Express.js v4.18 — Node.js v20.11' },
    { name: 'PostgreSQL', status: 'healthy', latency: 8, uptime: 99.99, lastCheck: new Date(Date.now() - 30_000).toISOString(), icon: Database, details: 'Cloud SQL pg15 — 42 connexions actives' },
    { name: 'Redis Cache', status: 'healthy', latency: 2, uptime: 99.97, lastCheck: new Date(Date.now() - 30_000).toISOString(), icon: Zap, details: 'Redis 7.2 — 1.2 GB utilisé / 4 GB — hit rate 94%' },
    { name: 'WebSocket', status: 'healthy', latency: 15, uptime: 99.90, lastCheck: new Date(Date.now() - 30_000).toISOString(), icon: Wifi, details: '47 clients connectés — 2.3k messages/min' },
    { name: 'CDN Assets', status: 'healthy', latency: 18, uptime: 100, lastCheck: new Date(Date.now() - 30_000).toISOString(), icon: Globe, details: 'Cloudflare — 4 PoPs Afrique' },
    { name: 'Email SMTP', status: 'degraded', latency: 890, uptime: 97.5, lastCheck: new Date(Date.now() - 60_000).toISOString(), icon: ArrowUpDown, details: 'Latence élevée — queue : 12 emails en attente' },
];

const METRICS: SystemMetric[] = [
    { label: 'Sessions Actives', value: '47', unit: '', icon: Users, trend: '+5', color: 'text-blue-600' },
    { label: 'Requêtes / min', value: '342', unit: 'req/min', icon: Activity, trend: '+12%', color: 'text-green-600' },
    { label: 'CPU', value: '23', unit: '%', icon: Cpu, trend: '-2%', color: 'text-amber-600' },
    { label: 'Mémoire', value: '4.2', unit: 'GB / 8 GB', icon: MemoryStick, trend: '+0.1', color: 'text-purple-600' },
    { label: 'Disque', value: '34', unit: 'GB / 100 GB', icon: HardDrive, trend: '+0.5', color: 'text-teal-600' },
    { label: 'Bande passante', value: '2.8', unit: 'Mbps', icon: TrendingUp, trend: 'stable', color: 'text-indigo-600' },
];

const ALERTS: Alert[] = [
    { id: 'al1', severity: 'warning', message: 'SMTP latence élevée (>800ms) — vérifier le fournisseur email', timestamp: new Date(Date.now() - 20 * 60_000).toISOString(), resolved: false },
    { id: 'al2', severity: 'info', message: 'Certificat SSL renouvelé automatiquement pour sgg.ga', timestamp: new Date(Date.now() - 6 * 3600_000).toISOString(), resolved: true },
    { id: 'al3', severity: 'error', message: '3 tentatives de connexion échouées — IP 197.234.88.12 bloquée temporairement', timestamp: new Date(Date.now() - 8 * 3600_000).toISOString(), resolved: true },
    { id: 'al4', severity: 'warning', message: 'Cache Redis atteint 80% de capacité — envisager un nettoyage', timestamp: new Date(Date.now() - 12 * 3600_000).toISOString(), resolved: true },
    { id: 'al5', severity: 'info', message: 'Sauvegarde quotidienne terminée avec succès (12.4 GB)', timestamp: new Date(Date.now() - 18 * 3600_000).toISOString(), resolved: true },
];

const SERVER_INFO = {
    hostname: 'sgg-prod-01.ga',
    os: 'Ubuntu 22.04 LTS',
    kernel: '5.15.0-91-generic',
    nodeVersion: 'v20.11.1',
    bunVersion: '1.1.38',
    timezone: 'Africa/Libreville (WAT, UTC+1)',
    launchDate: '2025-09-01',
    lastDeploy: '2026-02-10T06:30:00Z',
    version: '2.1.0',
};

// ── Component ───────────────────────────────────────────────────────────────

export default function SystemStatsPage() {
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            setLastRefresh(new Date());
        }, 1500);
    };

    const overallStatus = useMemo(() => {
        if (SERVICES.some(s => s.status === 'down')) return 'down';
        if (SERVICES.some(s => s.status === 'degraded')) return 'degraded';
        return 'healthy';
    }, []);

    const avgUptime = useMemo(() => {
        return (SERVICES.reduce((s, svc) => s + svc.uptime, 0) / SERVICES.length).toFixed(2);
    }, []);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const diff = Date.now() - d.getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const statusConfig = {
        healthy: { label: 'Opérationnel', color: 'bg-green-500', textColor: 'text-green-600', icon: CheckCircle2 },
        degraded: { label: 'Dégradé', color: 'bg-amber-500', textColor: 'text-amber-600', icon: AlertTriangle },
        down: { label: 'Hors-ligne', color: 'bg-red-500', textColor: 'text-red-600', icon: XCircle },
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Server className="h-7 w-7 text-slate-600" />
                            Statistiques Système
                        </h1>
                        <p className="text-muted-foreground">
                            Santé plateforme et métriques en temps réel
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            Mis à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
                        </span>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={refreshing}>
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                    </div>
                </div>

                {/* Overall Status Banner */}
                <Card className={`border-2 ${overallStatus === 'healthy' ? 'border-green-300 dark:border-green-800' :
                        overallStatus === 'degraded' ? 'border-amber-300 dark:border-amber-800' :
                            'border-red-300 dark:border-red-800'
                    }`}>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${statusConfig[overallStatus].color} ${overallStatus === 'healthy' ? '' : 'animate-pulse'}`} />
                                <div>
                                    <p className={`text-lg font-bold ${statusConfig[overallStatus].textColor}`}>
                                        {statusConfig[overallStatus].label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Tous les services · Uptime moyen : {avgUptime}%
                                    </p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{SERVER_INFO.hostname}</p>
                                <p className="text-[10px] text-muted-foreground">v{SERVER_INFO.version} · Déployé {formatTime(SERVER_INFO.lastDeploy)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {METRICS.map(m => (
                        <Card key={m.label}>
                            <CardContent className="pt-4 pb-3 text-center">
                                <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                                <p className="text-xl font-bold">
                                    {m.value}
                                    {m.unit && <span className="text-xs text-muted-foreground font-normal ml-0.5">{m.unit}</span>}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                                {m.trend && (
                                    <p className="text-[10px] text-green-600 mt-0.5">{m.trend}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Services + Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Services Health */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-600" />
                                Santé des Services
                            </CardTitle>
                            <CardDescription>{SERVICES.length} services monitorés</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {SERVICES.map(svc => {
                                    const sConf = statusConfig[svc.status];
                                    const SIcon = svc.icon;
                                    return (
                                        <div key={svc.name} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                            <SIcon className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{svc.name}</span>
                                                    <div className={`w-2 h-2 rounded-full ${sConf.color} ${svc.status !== 'healthy' ? 'animate-pulse' : ''}`} />
                                                    <Badge variant="outline" className={`text-[10px] ${sConf.textColor}`}>
                                                        {sConf.label}
                                                    </Badge>
                                                </div>
                                                {svc.details && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{svc.details}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-xs">
                                                <p className={`font-mono font-medium ${svc.latency < 50 ? 'text-green-600' :
                                                        svc.latency < 200 ? 'text-amber-600' : 'text-red-600'
                                                    }`}>
                                                    {svc.latency}ms
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">{svc.uptime}%</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                Alertes Récentes
                            </CardTitle>
                            <CardDescription>{ALERTS.filter(a => !a.resolved).length} actives</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {ALERTS.map(alert => (
                                    <div
                                        key={alert.id}
                                        className={`p-2.5 rounded-lg border text-xs ${!alert.resolved ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {alert.severity === 'error' ? <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" /> :
                                                alert.severity === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" /> :
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />}
                                            <div className="flex-1">
                                                <p className={`${!alert.resolved ? 'font-medium' : ''}`}>{alert.message}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-muted-foreground">{formatTime(alert.timestamp)}</span>
                                                    {alert.resolved && <Badge variant="outline" className="text-[10px] text-green-600">Résolu</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Server Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-600" />
                            Informations Serveur
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                            {[
                                { label: 'Hostname', value: SERVER_INFO.hostname },
                                { label: 'OS', value: SERVER_INFO.os },
                                { label: 'Kernel', value: SERVER_INFO.kernel },
                                { label: 'Node.js', value: SERVER_INFO.nodeVersion },
                                { label: 'Bun', value: SERVER_INFO.bunVersion },
                                { label: 'Timezone', value: SERVER_INFO.timezone },
                                { label: 'En production depuis', value: new Date(SERVER_INFO.launchDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) },
                                { label: 'Dernier déploiement', value: formatTime(SERVER_INFO.lastDeploy) },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                    <p className="font-medium font-mono text-xs">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
