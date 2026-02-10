/**
 * SGG Digital — Centre de Notifications
 *
 * Connecté au Cortex Auditif NEOCORTEX via React Query.
 * Fallback sur données mock si l'API est indisponible.
 *
 *   - Notifications temps réel (polling 30s)
 *   - Filtrage par type et statut lu/non-lu
 *   - Actions en masse (marquer lu, tout marquer lu)
 *   - Handler 8 étapes sur chaque action
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { toast } from 'sonner';
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
} from '@/hooks/useNeocortex';
import type { NeocortexNotification } from '@/services/api';
import {
    Bell, BellOff, BellRing, Check, CheckCheck,
    Search, Clock, AlertTriangle,
    FileText, Users, GitBranch, BarChart2,
    Shield, Settings, Mail, MailOpen, Loader2,
} from 'lucide-react';

// ── Category Config ─────────────────────────────────────────────────────────

type NotifDisplayType = 'workflow' | 'rapport' | 'system' | 'user' | 'security' | 'deadline' | 'info';

const CATEGORY_CONFIG: Record<NotifDisplayType, { label: string; icon: typeof Bell; color: string }> = {
    workflow: { label: 'Workflows', icon: GitBranch, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    rapport: { label: 'Rapports', icon: BarChart2, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    system: { label: 'Système', icon: Settings, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800' },
    user: { label: 'Utilisateurs', icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    security: { label: 'Sécurité', icon: Shield, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    deadline: { label: 'Deadlines', icon: Clock, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    info: { label: 'Info', icon: Bell, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
};

// Map backend notification types to display categories
function mapType(type: string): NotifDisplayType {
    if (type.includes('WORKFLOW') || type.includes('TRANSITION') || type.includes('NOMINATION')) return 'workflow';
    if (type.includes('RAPPORT') || type.includes('GAR')) return 'rapport';
    if (type.includes('SECURITE') || type.includes('AUTH') || type.includes('LOGIN')) return 'security';
    if (type.includes('USER') || type.includes('UTILISATEUR')) return 'user';
    if (type.includes('DEADLINE') || type.includes('RETARD')) return 'deadline';
    if (type.includes('SYSTEM') || type.includes('DEPLOY')) return 'system';
    return 'info';
}

// ── Mock Notifications (fallback si API indisponible) ────────────────────────

const MOCK_NOTIFICATIONS: NeocortexNotification[] = [
    { id: 'n1', type: 'WORKFLOW', canal: 'in_app', titre: 'Nouvelle étape de validation', message: 'Le décret n°001/2026 est en attente de votre visa au SGG.', lien: '/workflows', entiteType: 'workflow', entiteId: null, lu: false, luAt: null, createdAt: new Date(Date.now() - 10 * 60_000).toISOString() },
    { id: 'n2', type: 'GAR_RAPPORT', canal: 'in_app', titre: 'Rapport GAR soumis', message: 'Le Ministère des Finances a soumis son rapport de performance T4 2025.', lien: '/matrice-reporting', entiteType: 'rapport', entiteId: null, lu: false, luAt: null, createdAt: new Date(Date.now() - 45 * 60_000).toISOString() },
    { id: 'n3', type: 'DEADLINE', canal: 'in_app', titre: '⚠️ Deadline imminente', message: 'Le rapport MINSANTE est dû dans 24 heures.', lien: '/gar', entiteType: null, entiteId: null, lu: false, luAt: null, createdAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
    { id: 'n4', type: 'UTILISATEUR', canal: 'in_app', titre: 'Nouvel utilisateur créé', message: 'paul.mba@mintp.ga a été ajouté avec le rôle Point Focal.', lien: null, entiteType: 'user', entiteId: null, lu: true, luAt: new Date().toISOString(), createdAt: new Date(Date.now() - 4 * 3600_000).toISOString() },
    { id: 'n5', type: 'SECURITE_LOGIN', canal: 'in_app', titre: 'Tentative suspecte', message: '3 tentatives de connexion échouées depuis 197.234.xx.xx', lien: '/admin', entiteType: null, entiteId: null, lu: false, luAt: null, createdAt: new Date(Date.now() - 6 * 3600_000).toISOString() },
    { id: 'n6', type: 'SYSTEM_DEPLOY', canal: 'in_app', titre: 'Mise à jour système', message: 'Version 3.0.0-nexus-omega déployée avec succès. NEOCORTEX activé.', lien: null, entiteType: null, entiteId: null, lu: true, luAt: new Date().toISOString(), createdAt: new Date(Date.now() - 12 * 3600_000).toISOString() },
    { id: 'n7', type: 'NOMINATION_TRANSITION', canal: 'in_app', titre: 'Nomination approuvée', message: 'La nomination du DG de l\'Agence Nationale de l\'Eau a été validée.', lien: '/nominations', entiteType: 'nomination', entiteId: null, lu: true, luAt: new Date().toISOString(), createdAt: new Date(Date.now() - 18 * 3600_000).toISOString() },
    { id: 'n8', type: 'GAR_RAPPORT', canal: 'in_app', titre: 'Rapport rejeté', message: 'Le rapport MINSANTE Déc 2025 a été rejeté. Motif : données incomplètes.', lien: '/matrice-reporting', entiteType: 'rapport', entiteId: null, lu: true, luAt: new Date().toISOString(), createdAt: new Date(Date.now() - 24 * 3600_000).toISOString() },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const navigate = useNavigate();

    // 1. React Query — fetch real notifications (fallback to mock)
    const { data, isLoading, isError, error } = useNotifications({ limit: 100 });
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    // Resolve notifications source
    const notifications: NeocortexNotification[] = data?.notifications?.length
        ? data.notifications
        : MOCK_NOTIFICATIONS;
    const totalNonLues = data?.totalNonLues ?? notifications.filter(n => !n.lu).length;
    const isUsingMock = !data?.notifications?.length;

    // 2. Filters state
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotifDisplayType | 'all'>('all');
    const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // 3. Filtered results
    const filtered = useMemo(() => {
        return notifications.filter(n => {
            const displayType = mapType(n.type);
            if (typeFilter !== 'all' && displayType !== typeFilter) return false;
            if (readFilter === 'unread' && n.lu) return false;
            if (readFilter === 'read' && !n.lu) return false;
            if (search) {
                const q = search.toLowerCase();
                return n.titre.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
            }
            return true;
        });
    }, [notifications, search, typeFilter, readFilter]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        notifications.forEach(n => {
            const dt = mapType(n.type);
            counts[dt] = (counts[dt] || 0) + 1;
        });
        return counts;
    }, [notifications]);

    // ── Actions (Handler 8 étapes) ──────────────────────────────────────────

    const handleMarkRead = async (id: string) => {
        // 1. Reset error (handled by mutation)
        // 2. Loading (isPending on mutation)
        try {
            // 3. No validation needed
            // 4. Call mutation
            await markRead.mutateAsync(id);
            // 5-6. State updated + toast via hook
        } catch (err) {
            // 8. Catch error
            toast.error('Erreur lors du marquage');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead.mutateAsync();
        } catch (err) {
            toast.error('Erreur lors du marquage');
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    };

    const selectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(n => n.id)));
        }
    };

    const handleBatchMarkRead = async () => {
        for (const id of selectedIds) {
            await markRead.mutateAsync(id);
        }
        setSelectedIds(new Set());
    };

    // ── Helpers ─────────────────────────────────────────────────────────────

    const formatTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
        if (diff < 7 * 86400_000) return `Il y a ${Math.floor(diff / 86400_000)}j`;
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <AnimatedPage className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <BellRing className="h-7 w-7 text-blue-600" />
                            Centre de Notifications
                            {totalNonLues > 0 && (
                                <Badge className="bg-red-500 text-white ml-2">{totalNonLues}</Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            {notifications.length} notifications · {totalNonLues} non lues
                            {isUsingMock && <span className="text-xs ml-2 text-amber-500">(données démo)</span>}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {selectedIds.size > 0 && (
                            <Button
                                variant="outline" size="sm" className="gap-1"
                                onClick={handleBatchMarkRead}
                                disabled={markRead.isPending}
                            >
                                {markRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                                Marquer lu ({selectedIds.size})
                            </Button>
                        )}
                        <Button
                            variant="outline" size="sm" className="gap-1"
                            onClick={handleMarkAllRead}
                            disabled={markAllRead.isPending}
                        >
                            {markAllRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                            Tout marquer lu
                        </Button>
                    </div>
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={typeFilter === 'all' ? 'default' : 'ghost'}
                        size="sm" className="h-8 text-xs"
                        onClick={() => setTypeFilter('all')}
                    >
                        Toutes ({notifications.length})
                    </Button>
                    {(Object.entries(CATEGORY_CONFIG) as [NotifDisplayType, typeof CATEGORY_CONFIG.workflow][]).map(([key, conf]) => {
                        const count = categoryCounts[key] || 0;
                        if (count === 0) return null;
                        return (
                            <Button
                                key={key}
                                variant={typeFilter === key ? 'default' : 'ghost'}
                                size="sm" className="h-8 text-xs gap-1"
                                onClick={() => setTypeFilter(key)}
                            >
                                <conf.icon className="h-3 w-3" />
                                {conf.label} ({count})
                            </Button>
                        );
                    })}
                </div>

                {/* Search + read filter */}
                <div className="flex gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-1">
                        {(['all', 'unread', 'read'] as const).map(f => (
                            <Button
                                key={f}
                                variant={readFilter === f ? 'default' : 'ghost'}
                                size="sm" className="h-9 text-xs gap-1"
                                onClick={() => setReadFilter(f)}
                            >
                                {f === 'all' ? <Bell className="h-3 w-3" /> :
                                    f === 'unread' ? <Mail className="h-3 w-3" /> :
                                        <MailOpen className="h-3 w-3" />}
                                {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : 'Lues'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Select all */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={selectAll}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                            }`}>
                            {selectedIds.size === filtered.length && filtered.length > 0 && <Check className="h-3 w-3 text-white" />}
                        </div>
                        Sélectionner tout
                    </button>
                    <span className="text-xs text-muted-foreground">{filtered.length} résultats</span>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Card key={i}>
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="w-4 h-4 rounded" />
                                        <Skeleton className="w-2 h-2 rounded-full mt-2" />
                                        <Skeleton className="w-8 h-8 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {isError && !isUsingMock && (
                    <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
                        <CardContent className="py-6 text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                            <p className="font-medium text-red-600">Erreur de chargement</p>
                            <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message || 'Connexion au serveur impossible'}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Notification List */}
                {!isLoading && (
                    <div className="space-y-2">
                        {filtered.map(notif => {
                            const displayType = mapType(notif.type);
                            const catConf = CATEGORY_CONFIG[displayType];
                            const CatIcon = catConf.icon;
                            const isSelected = selectedIds.has(notif.id);

                            return (
                                <Card
                                    key={notif.id}
                                    className={`transition-all hover:shadow-md cursor-pointer ${!notif.lu ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10' : ''
                                        } ${isSelected ? 'ring-2 ring-primary/30' : ''}`}
                                >
                                    <CardContent className="py-3 px-4">
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <button onClick={() => toggleSelect(notif.id)} className="mt-1">
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                                    }`}>
                                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                            </button>

                                            {/* Category icon */}
                                            <div className={`p-2 rounded-lg shrink-0 ${catConf.color}`}>
                                                <CatIcon className="h-4 w-4" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className={`text-sm ${!notif.lu ? 'font-semibold' : 'font-medium'}`}>
                                                        {notif.titre}
                                                    </h3>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-[10px] h-5">
                                                        {catConf.label}
                                                    </Badge>
                                                    {notif.lien && (
                                                        <Button
                                                            variant="link" size="sm"
                                                            className="h-auto p-0 text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(notif.lien!);
                                                            }}
                                                        >
                                                            Voir →
                                                        </Button>
                                                    )}
                                                    {!notif.lu && (
                                                        <button
                                                            className="text-[10px] text-blue-500 hover:underline ml-auto"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkRead(notif.id);
                                                            }}
                                                        >
                                                            {markRead.isPending ? 'Marquage...' : 'Marquer lu'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Empty state */}
                        {filtered.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <BellOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-lg font-medium">Aucune notification</p>
                                    <p className="text-sm mt-1">
                                        {readFilter === 'unread'
                                            ? 'Toutes les notifications ont été lues !'
                                            : 'Rien à afficher avec ces filtres.'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </AnimatedPage>
        </DashboardLayout>
    );
}
