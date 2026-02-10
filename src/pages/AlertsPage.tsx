/**
 * SGG Digital — Alertes & Escalades
 *
 * Système de gestion des alertes et escalades :
 *   - Alertes automatiques par seuil et délai
 *   - Niveaux d'escalade (info, warning, critique)
 *   - Actions de résolution
 *   - Historique des alertes résolues
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle, Bell, ShieldAlert, Info,
    CheckCircle2, Clock, ChevronDown, ChevronRight,
    XCircle, ArrowUpRight, User, Filter,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: AlertSeverity;
    status: AlertStatus;
    source: string;
    createdAt: string;
    resolvedAt?: string;
    assignee: string;
    escalationLevel: number; // 0-3
    actions: string[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; icon: typeof Info; color: string; bg: string }> = {
    info: { label: 'Information', icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    warning: { label: 'Avertissement', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    critical: { label: 'Critique', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    acknowledged: { label: 'Pris en charge', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_ALERTS: Alert[] = [
    {
        id: 'a1', title: 'MINTRANS — Rapport GAR T4 non soumis', description: 'Le Ministère des Transports n\'a pas soumis son rapport GAR pour le T4 2025. Délai dépassé de 15 jours.',
        severity: 'critical', status: 'active', source: 'Module GAR', createdAt: '10 fév 2026, 08:00',
        assignee: 'Marie OBAME', escalationLevel: 2, actions: ['Relancer le point focal', 'Informer le Secrétaire Général', 'Planifier réunion d\'urgence'],
    },
    {
        id: 'a2', title: 'MINSANTE — Incohérences données budgétaires', description: 'Écart de 12% entre les totaux budgétaires et le détail par programme. Données potentiellement erronées.',
        severity: 'critical', status: 'acknowledged', source: 'Module Budget', createdAt: '9 fév 2026, 14:30',
        assignee: 'Sylvie MOUSSAVOU', escalationLevel: 1, actions: ['Demander correction au MINSANTE', 'Bloquer la validation'],
    },
    {
        id: 'a3', title: 'Délai de nomination DG ANPI > 30 jours', description: 'Le dossier de nomination du Directeur Général de l\'ANPI est en attente depuis 35 jours, dépassant le délai réglementaire.',
        severity: 'warning', status: 'active', source: 'Module Nominations', createdAt: '8 fév 2026, 10:00',
        assignee: 'Jean NZE', escalationLevel: 1, actions: ['Relancer la DAJ', 'Préparer mémo pour signature'],
    },
    {
        id: 'a4', title: '3 ministères inactifs depuis 14 jours', description: 'MINCOM, MINJUSTICE et MINEDD n\'ont pas eu d\'activité sur la plateforme depuis plus de 14 jours.',
        severity: 'warning', status: 'active', source: 'Monitoring', createdAt: '7 fév 2026, 09:00',
        assignee: 'Françoise ELLA', escalationLevel: 0, actions: ['Contacter les points focaux', 'Vérifier les accès'],
    },
    {
        id: 'a5', title: 'Pic de charge serveur — 92% CPU', description: 'Le serveur principal a atteint 92% d\'utilisation CPU pendant 15 minutes. Performance dégradée détectée.',
        severity: 'warning', status: 'resolved', source: 'Système', createdAt: '6 fév 2026, 16:45', resolvedAt: '6 fév 2026, 17:30',
        assignee: 'Équipe Tech', escalationLevel: 0, actions: ['Scale-up temporaire effectué'],
    },
    {
        id: 'a6', title: 'Mise à jour plateforme v15 planifiée', description: 'Maintenance planifiée le 10 février de 22h à 02h pour déploiement de la version 15.0.',
        severity: 'info', status: 'resolved', source: 'Système', createdAt: '5 fév 2026, 10:00', resolvedAt: '10 fév 2026, 02:00',
        assignee: 'Équipe Tech', escalationLevel: 0, actions: ['Notification envoyée à tous les utilisateurs'],
    },
    {
        id: 'a7', title: 'Tentative de connexion suspecte', description: '5 tentatives de connexion échouées depuis une adresse IP inconnue (102.16.xx.xx) en 10 minutes.',
        severity: 'critical', status: 'resolved', source: 'Sécurité', createdAt: '4 fév 2026, 03:15', resolvedAt: '4 fév 2026, 03:45',
        assignee: 'Équipe Tech', escalationLevel: 3, actions: ['IP bloquée', 'Rapport incident généré', 'MFA renforcé'],
    },
    {
        id: 'a8', title: 'Formation PTM — faible participation', description: 'Seulement 6 participants sur 20 inscrits à la session de formation PTM du 3 février.',
        severity: 'info', status: 'acknowledged', source: 'Module Formation', createdAt: '3 fév 2026, 17:00',
        assignee: 'Françoise ELLA', escalationLevel: 0, actions: ['Replanifier la session', 'Augmenter la communication'],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AlertsPage() {
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [tab, setTab] = useState<'active' | 'resolved'>('active');
    const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>('a1');

    const filtered = useMemo(() => {
        return alerts.filter(a => {
            const statusMatch = tab === 'active' ? a.status !== 'resolved' : a.status === 'resolved';
            const sevMatch = severityFilter === 'all' || a.severity === severityFilter;
            return statusMatch && sevMatch;
        });
    }, [alerts, tab, severityFilter]);

    const acknowledge = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as AlertStatus } : a));
        toast({ title: '👁️ Alerte prise en charge' });
    };

    const resolve = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: 'Maintenant' } : a));
        toast({ title: '✅ Alerte résolue' });
    };

    const activeCount = alerts.filter(a => a.status === 'active').length;
    const ackCount = alerts.filter(a => a.status === 'acknowledged').length;
    const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Bell className="h-7 w-7 text-red-600" />
                        Alertes & Escalades
                        {activeCount > 0 && <Badge className="bg-red-500 text-white text-[10px]">{activeCount}</Badge>}
                    </h1>
                    <p className="text-muted-foreground">
                        {alerts.length} alertes · {criticalCount} critiques · {ackCount} en cours de traitement
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className={criticalCount > 0 ? 'border-red-300 dark:border-red-800' : ''}>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-red-600">{criticalCount}</p>
                            <p className="text-[10px] text-muted-foreground">Critiques</p>
                        </CardContent>
                    </Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-amber-600">{activeCount}</p>
                        <p className="text-[10px] text-muted-foreground">Actives</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{ackCount}</p>
                        <p className="text-[10px] text-muted-foreground">En traitement</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved').length}</p>
                        <p className="text-[10px] text-muted-foreground">Résolues</p>
                    </CardContent></Card>
                </div>

                {/* Tabs + Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-1">
                        <Button variant={tab === 'active' ? 'default' : 'outline'} size="sm" className="gap-1 text-xs" onClick={() => setTab('active')}>
                            <AlertTriangle className="h-3 w-3" /> Actives ({activeCount + ackCount})
                        </Button>
                        <Button variant={tab === 'resolved' ? 'default' : 'outline'} size="sm" className="gap-1 text-xs" onClick={() => setTab('resolved')}>
                            <CheckCircle2 className="h-3 w-3" /> Résolues ({alerts.filter(a => a.status === 'resolved').length})
                        </Button>
                    </div>
                    <div className="flex gap-1 ml-auto">
                        <Button variant={severityFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setSeverityFilter('all')}>Toutes</Button>
                        {(Object.entries(SEVERITY_CONFIG) as [AlertSeverity, typeof SEVERITY_CONFIG.info][]).map(([key, conf]) => {
                            const Icon = conf.icon;
                            return (
                                <Button key={key} variant={severityFilter === key ? 'default' : 'outline'} size="sm" className="text-xs h-7 gap-0.5" onClick={() => setSeverityFilter(key)}>
                                    <Icon className="h-3 w-3" /> {conf.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Alert List */}
                <div className="space-y-2">
                    {filtered.map(alert => {
                        const sevConf = SEVERITY_CONFIG[alert.severity];
                        const SevIcon = sevConf.icon;
                        const statConf = STATUS_CONFIG[alert.status];
                        const isExpanded = expandedId === alert.id;

                        return (
                            <Card key={alert.id} className={alert.severity === 'critical' && alert.status === 'active' ? 'border-red-300 dark:border-red-800 animate-pulse-slow' : ''}>
                                <button
                                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${sevConf.bg}`}>
                                        <SevIcon className={`h-4 w-4 ${sevConf.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{alert.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                            <span>{alert.source}</span>
                                            <span><Clock className="h-2.5 w-2.5 inline mr-0.5" />{alert.createdAt}</span>
                                            <span><User className="h-2.5 w-2.5 inline mr-0.5" />{alert.assignee}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {alert.escalationLevel > 0 && (
                                            <div className="flex">
                                                {Array.from({ length: alert.escalationLevel }).map((_, i) => (
                                                    <ArrowUpRight key={i} className="h-3 w-3 text-red-500 -ml-1 first:ml-0" />
                                                ))}
                                            </div>
                                        )}
                                        <Badge className={`text-[9px] h-4 ${statConf.color}`}>{statConf.label}</Badge>
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mt-3 mb-3">{alert.description}</p>

                                        {alert.escalationLevel > 0 && (
                                            <div className="flex items-center gap-1 mb-3">
                                                <span className="text-[10px] text-muted-foreground">Niveau d'escalade :</span>
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <div key={i} className={`w-6 h-1.5 rounded-full ${i < alert.escalationLevel ? 'bg-red-500' : 'bg-muted'}`} />
                                                ))}
                                                <span className="text-[10px] font-semibold ml-1">{alert.escalationLevel}/3</span>
                                            </div>
                                        )}

                                        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">ACTIONS</p>
                                        <div className="space-y-1 mb-3">
                                            {alert.actions.map((act, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                                                    <CheckCircle2 className={`h-3 w-3 shrink-0 ${alert.status === 'resolved' ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                    <span>{act}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {alert.resolvedAt && (
                                            <p className="text-[10px] text-green-600 mb-2">✓ Résolu le {alert.resolvedAt}</p>
                                        )}

                                        {alert.status !== 'resolved' && (
                                            <div className="flex gap-2">
                                                {alert.status === 'active' && (
                                                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); acknowledge(alert.id); }}>
                                                        <CheckCircle2 className="h-3 w-3" /> Prendre en charge
                                                    </Button>
                                                )}
                                                <Button size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); resolve(alert.id); }}>
                                                    <CheckCircle2 className="h-3 w-3" /> Résoudre
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30 text-green-500" />
                        <p className="text-sm">Aucune alerte dans cette catégorie 🎉</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
