/**
 * SGG Digital — Centre de Notifications
 *
 * Page centralisée pour toutes les notifications :
 *   - Notifications temps réel (WebSocket)
 *   - Notifications push
 *   - Alertes système
 *   - Filtrage par catégorie et statut lu/non-lu
 *   - Actions en masse (marquer lu, supprimer)
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Bell, BellOff, BellRing, Check, CheckCheck,
    Trash2, Search, Filter, Clock, AlertTriangle,
    FileText, Users, GitBranch, BarChart2,
    Shield, Settings, MessageSquare, Eye,
    ChevronDown, MailOpen, Mail,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type NotifCategory = 'workflow' | 'rapport' | 'system' | 'user' | 'security' | 'deadline';
type NotifPriority = 'low' | 'normal' | 'high' | 'urgent';

interface Notification {
    id: string;
    title: string;
    message: string;
    category: NotifCategory;
    priority: NotifPriority;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
    actor?: string;
}

// ── Mock Notifications ──────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1', title: 'Nouvelle étape de validation',
        message: 'Le décret n°001/2026 est en attente de votre visa au SGG.',
        category: 'workflow', priority: 'high',
        timestamp: new Date(Date.now() - 10 * 60_000).toISOString(),
        read: false, actionUrl: '/workflows', actionLabel: 'Voir le dossier',
        actor: 'sg.mintp@mintp.ga',
    },
    {
        id: 'n2', title: 'Rapport GAR soumis',
        message: 'Le Ministère des Finances a soumis son rapport de performance T4 2025.',
        category: 'rapport', priority: 'normal',
        timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
        read: false, actionUrl: '/matrice-reporting', actionLabel: 'Examiner',
        actor: 'pf.minfi@minfi.ga',
    },
    {
        id: 'n3', title: '⚠️ Deadline imminente',
        message: 'Le rapport de performance du MINSANTE est dû dans 24 heures.',
        category: 'deadline', priority: 'urgent',
        timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
        read: false, actionUrl: '/gar', actionLabel: 'Suivre',
    },
    {
        id: 'n4', title: 'Nouvel utilisateur créé',
        message: 'paul.mba@mintp.ga a été ajouté avec le rôle Point Focal.',
        category: 'user', priority: 'low',
        timestamp: new Date(Date.now() - 4 * 3600_000).toISOString(),
        read: true, actor: 'admin@sgg.ga',
    },
    {
        id: 'n5', title: 'Tentative de connexion suspecte',
        message: '3 tentatives de connexion échouées depuis 197.234.xx.xx pour le compte guest@test.ga.',
        category: 'security', priority: 'urgent',
        timestamp: new Date(Date.now() - 6 * 3600_000).toISOString(),
        read: false, actionUrl: '/admin', actionLabel: 'Voir les logs',
    },
    {
        id: 'n6', title: 'Mise à jour système',
        message: 'La version 2.1.0 a été déployée avec succès. Nouveaux modules : Workflow, Import/Export.',
        category: 'system', priority: 'low',
        timestamp: new Date(Date.now() - 12 * 3600_000).toISOString(),
        read: true,
    },
    {
        id: 'n7', title: 'Nomination approuvée',
        message: 'La nomination du DG de l\'Agence Nationale de l\'Eau a été validée par le SGPR.',
        category: 'workflow', priority: 'normal',
        timestamp: new Date(Date.now() - 18 * 3600_000).toISOString(),
        read: true, actionUrl: '/nominations',
        actor: 'sgpr@presidence.ga',
    },
    {
        id: 'n8', title: 'Rapport rejeté',
        message: 'Le rapport MINSANTE Déc 2025 a été rejeté. Motif : données incomplètes.',
        category: 'rapport', priority: 'high',
        timestamp: new Date(Date.now() - 24 * 3600_000).toISOString(),
        read: true, actionUrl: '/matrice-reporting', actionLabel: 'Corriger',
        actor: 'admin.sgg@sgg.ga',
    },
    {
        id: 'n9', title: 'Rôle modifié',
        message: 'Le rôle de marie.nze@minsante.ga a été changé de citoyen à sg_ministere.',
        category: 'user', priority: 'normal',
        timestamp: new Date(Date.now() - 30 * 3600_000).toISOString(),
        read: true, actor: 'admin@sgg.ga',
    },
    {
        id: 'n10', title: 'Sauvegarde automatique',
        message: 'La sauvegarde quotidienne de la base de données a été effectuée avec succès.',
        category: 'system', priority: 'low',
        timestamp: new Date(Date.now() - 36 * 3600_000).toISOString(),
        read: true,
    },
    {
        id: 'n11', title: '🔒 Certificate SSL renouvelé',
        message: 'Le certificat SSL du domaine sgg.ga a été automatiquement renouvelé.',
        category: 'security', priority: 'low',
        timestamp: new Date(Date.now() - 48 * 3600_000).toISOString(),
        read: true,
    },
    {
        id: 'n12', title: 'Décret publié au JO',
        message: 'Le Décret n°045/2025 a été publié au Journal Officiel n°142.',
        category: 'workflow', priority: 'normal',
        timestamp: new Date(Date.now() - 72 * 3600_000).toISOString(),
        read: true, actionUrl: '/journal-officiel',
    },
];

// ── Category Config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<NotifCategory, { label: string; icon: typeof Bell; color: string }> = {
    workflow: { label: 'Workflows', icon: GitBranch, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    rapport: { label: 'Rapports', icon: BarChart2, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    system: { label: 'Système', icon: Settings, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800' },
    user: { label: 'Utilisateurs', icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    security: { label: 'Sécurité', icon: Shield, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    deadline: { label: 'Deadlines', icon: Clock, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
};

// ── Component ───────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<NotifCategory | 'all'>('all');
    const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filtered = useMemo(() => {
        return notifications.filter(n => {
            if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
            if (readFilter === 'unread' && n.read) return false;
            if (readFilter === 'read' && !n.read) return false;
            if (search) {
                const q = search.toLowerCase();
                return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
            }
            return true;
        });
    }, [notifications, search, categoryFilter, readFilter]);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        notifications.forEach(n => {
            counts[n.category] = (counts[n.category] || 0) + 1;
        });
        return counts;
    }, [notifications]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const markAsRead = (ids: string[]) => {
        setNotifications(prev => prev.map(n =>
            ids.includes(n.id) ? { ...n, read: true } : n
        ));
        setSelectedIds(new Set());
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotifications = (ids: string[]) => {
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        setSelectedIds(new Set());
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

    // ── Helpers ─────────────────────────────────────────────────────────────

    const formatTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return 'À l\'instant';
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
        if (diff < 7 * 86400_000) return `Il y a ${Math.floor(diff / 86400_000)}j`;
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const getPriorityDot = (priority: NotifPriority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 animate-pulse';
            case 'high': return 'bg-orange-500';
            case 'normal': return 'bg-blue-500';
            case 'low': return 'bg-gray-400';
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
                            <BellRing className="h-7 w-7 text-blue-600" />
                            Centre de Notifications
                            {unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white ml-2">{unreadCount}</Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            {notifications.length} notifications · {unreadCount} non lues
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {selectedIds.size > 0 && (
                            <>
                                <Button variant="outline" size="sm" className="gap-1" onClick={() => markAsRead(Array.from(selectedIds))}>
                                    <CheckCheck className="h-4 w-4" /> Marquer lu ({selectedIds.size})
                                </Button>
                                <Button variant="destructive" size="sm" className="gap-1" onClick={() => deleteNotifications(Array.from(selectedIds))}>
                                    <Trash2 className="h-4 w-4" /> Supprimer ({selectedIds.size})
                                </Button>
                            </>
                        )}
                        <Button variant="outline" size="sm" className="gap-1" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4" /> Tout marquer lu
                        </Button>
                    </div>
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={categoryFilter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setCategoryFilter('all')}
                    >
                        Toutes ({notifications.length})
                    </Button>
                    {(Object.entries(CATEGORY_CONFIG) as [NotifCategory, typeof CATEGORY_CONFIG.workflow][]).map(([key, conf]) => (
                        <Button
                            key={key}
                            variant={categoryFilter === key ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => setCategoryFilter(key)}
                        >
                            <conf.icon className="h-3 w-3" />
                            {conf.label} ({categoryCounts[key] || 0})
                        </Button>
                    ))}
                </div>

                {/* Search and filters */}
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
                                size="sm"
                                className="h-9 text-xs gap-1"
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

                {/* Notification List */}
                <div className="space-y-2">
                    {filtered.map(notif => {
                        const catConf = CATEGORY_CONFIG[notif.category];
                        const CatIcon = catConf.icon;
                        const isSelected = selectedIds.has(notif.id);

                        return (
                            <Card
                                key={notif.id}
                                className={`transition-all hover:shadow-md ${!notif.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10' : ''
                                    } ${isSelected ? 'ring-2 ring-primary/30' : ''}`}
                            >
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleSelect(notif.id)}
                                            className="mt-1"
                                        >
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                                }`}>
                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                        </button>

                                        {/* Priority dot */}
                                        <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityDot(notif.priority)}`} />

                                        {/* Category icon */}
                                        <div className={`p-2 rounded-lg ${catConf.color}`}>
                                            <CatIcon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}>
                                                    {notif.title}
                                                </h3>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {formatTime(notif.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {notif.actor && (
                                                    <span className="text-[10px] text-muted-foreground/70">{notif.actor}</span>
                                                )}
                                                {notif.actionUrl && (
                                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                                        {notif.actionLabel || 'Voir'} →
                                                    </Button>
                                                )}
                                                {!notif.read && (
                                                    <button
                                                        className="text-[10px] text-blue-500 hover:underline ml-auto"
                                                        onClick={() => markAsRead([notif.id])}
                                                    >
                                                        Marquer lu
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {filtered.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <BellOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-medium">Aucune notification</p>
                                <p className="text-sm mt-1">
                                    {readFilter === 'unread' ? 'Toutes les notifications ont été lues !' : 'Rien à afficher avec ces filtres.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
