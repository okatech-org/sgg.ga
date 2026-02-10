/**
 * SGG Digital — Journal d'Audit
 *
 * Vue chronologique complète de toutes les actions :
 *   - Connexions / Déconnexions
 *   - CRUD sur entités (nominations, rapports, utilisateurs, etc.)
 *   - Actions de workflow (validation, rejet, escalade)
 *   - Modifications de permissions et rôles
 *   - Exports et imports de données
 *   - Filtrage par utilisateur, action, date, IP
 *   - Export CSV de l'audit trail
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    History, Search, Download, Filter,
    LogIn, LogOut, Plus, Pencil, Trash2,
    CheckCircle2, XCircle, AlertTriangle,
    Shield, Upload, Eye, RefreshCw,
    User as UserIcon, Globe, Clock, ChevronDown,
    FileText,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type AuditAction =
    | 'login' | 'logout'
    | 'create' | 'update' | 'delete'
    | 'approve' | 'reject' | 'escalate'
    | 'role_change' | 'permission_change'
    | 'export' | 'import'
    | 'view';

type AuditSeverity = 'info' | 'warning' | 'critical';

interface AuditEntry {
    id: string;
    timestamp: string;
    action: AuditAction;
    severity: AuditSeverity;
    user: { email: string; name: string; role: string };
    resource: string;
    resourceType: string;
    details: string;
    ip: string;
    userAgent?: string;
    metadata?: Record<string, string>;
}

// ── Action Config ───────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, { label: string; icon: typeof LogIn; color: string }> = {
    login: { label: 'Connexion', icon: LogIn, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    logout: { label: 'Déconnexion', icon: LogOut, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    create: { label: 'Création', icon: Plus, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    update: { label: 'Modification', icon: Pencil, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    delete: { label: 'Suppression', icon: Trash2, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    approve: { label: 'Validation', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    reject: { label: 'Rejet', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    escalate: { label: 'Escalade', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    role_change: { label: 'Changement rôle', icon: Shield, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    permission_change: { label: 'Perm. modifiée', icon: Shield, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    export: { label: 'Export', icon: Download, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    import: { label: 'Import', icon: Upload, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    view: { label: 'Consultation', icon: Eye, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

// ── Mock Audit Data ─────────────────────────────────────────────────────────

const MOCK_AUDIT: AuditEntry[] = [
    {
        id: 'a1', timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
        action: 'approve', severity: 'info',
        user: { email: 'admin@sgg.ga', name: 'Albert NDONG', role: 'admin_sgg' },
        resource: 'Décret n°001/2026', resourceType: 'workflow',
        details: 'Validation du décret — étape 3/4 (visa SGG)',
        ip: '41.158.12.34',
        metadata: { step: '3', total_steps: '4', decision: 'approved' },
    },
    {
        id: 'a2', timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),
        action: 'login', severity: 'info',
        user: { email: 'jean.nze@minfi.ga', name: 'Jean NZE', role: 'sg_ministere' },
        resource: 'Session', resourceType: 'auth',
        details: 'Connexion réussie via 2FA',
        ip: '41.158.22.56',
        metadata: { method: 'password+otp', mfa: 'true' },
    },
    {
        id: 'a3', timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
        action: 'create', severity: 'info',
        user: { email: 'pf.minfi@minfi.ga', name: 'Paul MBA', role: 'point_focal' },
        resource: 'Rapport T4 2025 MINFI', resourceType: 'rapport',
        details: 'Soumission du rapport de performance trimestriel',
        ip: '41.158.22.60',
    },
    {
        id: 'a4', timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
        action: 'role_change', severity: 'warning',
        user: { email: 'admin@sgg.ga', name: 'Albert NDONG', role: 'admin_sgg' },
        resource: 'marie.nze@minsante.ga', resourceType: 'user',
        details: 'Rôle changé de citoyen à sg_ministere',
        ip: '41.158.12.34',
        metadata: { old_role: 'citoyen', new_role: 'sg_ministere' },
    },
    {
        id: 'a5', timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(),
        action: 'reject', severity: 'info',
        user: { email: 'admin.sgg@sgg.ga', name: 'Marie OBAME', role: 'admin_sgg' },
        resource: 'Rapport MINSANTE Déc 2025', resourceType: 'rapport',
        details: 'Rapport rejeté — données incomplètes (sections 3 et 5 manquantes)',
        ip: '41.158.12.40',
        metadata: { reason: 'incomplete_data', sections: '3,5' },
    },
    {
        id: 'a6', timestamp: new Date(Date.now() - 6 * 3600_000).toISOString(),
        action: 'export', severity: 'info',
        user: { email: 'admin@sgg.ga', name: 'Albert NDONG', role: 'admin_sgg' },
        resource: 'Institutions.xlsx', resourceType: 'data',
        details: 'Export Excel de 42 institutions',
        ip: '41.158.12.34',
        metadata: { format: 'xlsx', records: '42' },
    },
    {
        id: 'a7', timestamp: new Date(Date.now() - 8 * 3600_000).toISOString(),
        action: 'delete', severity: 'critical',
        user: { email: 'admin@sgg.ga', name: 'Albert NDONG', role: 'admin_sgg' },
        resource: 'test-user@temp.ga', resourceType: 'user',
        details: 'Suppression du compte utilisateur de test',
        ip: '41.158.12.34',
    },
    {
        id: 'a8', timestamp: new Date(Date.now() - 12 * 3600_000).toISOString(),
        action: 'import', severity: 'info',
        user: { email: 'admin@sgg.ga', name: 'Albert NDONG', role: 'admin_sgg' },
        resource: 'nominations-batch.csv', resourceType: 'data',
        details: 'Import CSV de 24 nominations — 22 valides, 2 ignorées',
        ip: '41.158.12.34',
        metadata: { format: 'csv', total: '24', valid: '22', skipped: '2' },
    },
    {
        id: 'a9', timestamp: new Date(Date.now() - 18 * 3600_000).toISOString(),
        action: 'escalate', severity: 'warning',
        user: { email: 'system@sgg.ga', name: 'Système', role: 'system' },
        resource: 'Décret n°045/2025', resourceType: 'workflow',
        details: 'Escalade automatique — deadline dépassée de 48h, notification envoyée au SGG',
        ip: '127.0.0.1',
        metadata: { delay_hours: '48', escalated_to: 'admin_sgg' },
    },
    {
        id: 'a10', timestamp: new Date(Date.now() - 24 * 3600_000).toISOString(),
        action: 'permission_change', severity: 'warning',
        user: { email: 'admin@sgg.ga', name: 'Albert NDONG', role: 'admin_sgg' },
        resource: 'Module Nominations', resourceType: 'permission',
        details: 'Permission "export" activée pour le rôle sg_ministere',
        ip: '41.158.12.34',
        metadata: { module: 'nominations', permission: 'export', role: 'sg_ministere', enabled: 'true' },
    },
    {
        id: 'a11', timestamp: new Date(Date.now() - 36 * 3600_000).toISOString(),
        action: 'login', severity: 'critical',
        user: { email: 'guest@test.ga', name: 'Inconnu', role: 'unknown' },
        resource: 'Session', resourceType: 'auth',
        details: '3 tentatives de connexion échouées — compte temporairement verrouillé',
        ip: '197.234.88.12',
        metadata: { attempts: '3', locked: 'true', lock_duration: '30min' },
    },
    {
        id: 'a12', timestamp: new Date(Date.now() - 48 * 3600_000).toISOString(),
        action: 'update', severity: 'info',
        user: { email: 'sgpr@presidence.ga', name: 'Paul ABIAGA', role: 'sgpr' },
        resource: 'Nomination DG ANPN', resourceType: 'nomination',
        details: 'Statut mis à jour : en_attente → validé',
        ip: '41.158.10.10',
        metadata: { old_status: 'en_attente', new_status: 'validé' },
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AuditLogPage() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
    const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return MOCK_AUDIT.filter(entry => {
            if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
            if (severityFilter !== 'all' && entry.severity !== severityFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    entry.user.name.toLowerCase().includes(q) ||
                    entry.user.email.toLowerCase().includes(q) ||
                    entry.resource.toLowerCase().includes(q) ||
                    entry.details.toLowerCase().includes(q) ||
                    entry.ip.includes(q)
                );
            }
            return true;
        });
    }, [search, actionFilter, severityFilter]);

    const stats = useMemo(() => ({
        total: MOCK_AUDIT.length,
        actions: Object.entries(
            MOCK_AUDIT.reduce<Record<string, number>>((a, e) => {
                a[e.action] = (a[e.action] || 0) + 1;
                return a;
            }, {})
        ).sort((a, b) => b[1] - a[1]),
        critical: MOCK_AUDIT.filter(e => e.severity === 'critical').length,
        uniqueUsers: new Set(MOCK_AUDIT.map(e => e.user.email)).size,
    }), []);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const diff = Date.now() - d.getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const handleExportCSV = () => {
        const headers = ['Timestamp', 'Action', 'Sévérité', 'Utilisateur', 'Email', 'Rôle', 'Ressource', 'Type', 'Détails', 'IP'];
        const rows = filtered.map(e => [
            e.timestamp, e.action, e.severity,
            e.user.name, e.user.email, e.user.role,
            e.resource, e.resourceType, e.details, e.ip,
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getSeverityBadge = (s: AuditSeverity) => {
        switch (s) {
            case 'critical': return <Badge className="bg-red-500 text-white text-[10px]">Critique</Badge>;
            case 'warning': return <Badge className="bg-amber-500 text-white text-[10px]">Attention</Badge>;
            case 'info': return null;
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <History className="h-7 w-7 text-amber-600" />
                            Journal d'Audit
                        </h1>
                        <p className="text-muted-foreground">
                            Historique complet des actions sur la plateforme
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
                        <Download className="h-4 w-4" />
                        Exporter CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-[10px] text-muted-foreground">Entrées totales</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                            <p className="text-[10px] text-muted-foreground">Utilisateurs uniques</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                            <p className="text-[10px] text-muted-foreground">Événements critiques</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.actions.length}</p>
                            <p className="text-[10px] text-muted-foreground">Types d'actions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher utilisateur, ressource, IP..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value as AuditAction | 'all')}
                    >
                        <option value="all">Toutes les actions</option>
                        {(Object.entries(ACTION_CONFIG) as [AuditAction, typeof ACTION_CONFIG.login][]).map(([key, c]) => (
                            <option key={key} value={key}>{c.label}</option>
                        ))}
                    </select>
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value as AuditSeverity | 'all')}
                    >
                        <option value="all">Toute sévérité</option>
                        <option value="info">Info</option>
                        <option value="warning">Attention</option>
                        <option value="critical">Critique</option>
                    </select>
                </div>

                <p className="text-xs text-muted-foreground">{filtered.length} résultats</p>

                {/* Audit Timeline */}
                <div className="space-y-2">
                    {filtered.map(entry => {
                        const conf = ACTION_CONFIG[entry.action];
                        const ActionIcon = conf.icon;
                        const isExpanded = expandedId === entry.id;

                        return (
                            <Card
                                key={entry.id}
                                className={`transition-all hover:shadow-md cursor-pointer ${entry.severity === 'critical' ? 'border-l-4 border-l-red-500' :
                                        entry.severity === 'warning' ? 'border-l-4 border-l-amber-400' : ''
                                    }`}
                                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            >
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-start gap-3">
                                        {/* Action icon */}
                                        <div className={`p-2 rounded-lg ${conf.color}`}>
                                            <ActionIcon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-[10px] font-mono">{conf.label}</Badge>
                                                    {getSeverityBadge(entry.severity)}
                                                    <span className="text-sm font-medium">{entry.resource}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(entry.timestamp)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>

                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/70">
                                                <span className="flex items-center gap-1">
                                                    <UserIcon className="h-3 w-3" />
                                                    {entry.user.name} ({entry.user.role})
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    {entry.ip}
                                                </span>
                                                <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>

                                            {/* Expanded details */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t space-y-2">
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-muted-foreground">Email :</span>{' '}
                                                            <span className="font-mono">{entry.user.email}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Timestamp :</span>{' '}
                                                            <span className="font-mono">{new Date(entry.timestamp).toLocaleString('fr-FR')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Type ressource :</span>{' '}
                                                            <Badge variant="secondary" className="text-[10px]">{entry.resourceType}</Badge>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Adresse IP :</span>{' '}
                                                            <span className="font-mono">{entry.ip}</span>
                                                        </div>
                                                    </div>
                                                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                                        <div className="p-2 rounded bg-muted/50">
                                                            <p className="text-[10px] font-medium mb-1">Métadonnées :</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {Object.entries(entry.metadata).map(([k, v]) => (
                                                                    <Badge key={k} variant="outline" className="text-[10px] font-mono">
                                                                        {k}: {v}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {filtered.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-medium">Aucune entrée d'audit</p>
                                <p className="text-sm mt-1">Aucun événement ne correspond aux filtres sélectionnés.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
