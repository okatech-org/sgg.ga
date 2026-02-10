/**
 * SGG Digital — Centre d'Alertes Avancé
 *
 * Système centralisé de gestion des alertes :
 *   - Alertes critiques, avertissements, informations
 *   - Catégorisation par source
 *   - Actions rapides (acquitter, résoudre, escalader)
 *   - Historique et statistiques
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Bell, AlertTriangle, AlertOctagon, Info,
    CheckCircle2, Clock, Search, Filter,
    Eye, ArrowUpRight, X, Shield,
    FileText, Users, Server, Zap,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';
type AlertSource = 'Système' | 'GAR' | 'Nominations' | 'Sécurité' | 'Performance' | 'Budget';

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: AlertSeverity;
    status: AlertStatus;
    source: AlertSource;
    timestamp: string;
    assignee?: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const SEVERITY_CFG: Record<AlertSeverity, { label: string; icon: typeof AlertOctagon; color: string; bg: string; badge: string }> = {
    critical: { label: 'Critique', icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    warning: { label: 'Avertissement', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    info: { label: 'Information', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const SOURCE_ICONS: Record<AlertSource, typeof Server> = {
    'Système': Server,
    'GAR': FileText,
    'Nominations': Users,
    'Sécurité': Shield,
    'Performance': Zap,
    'Budget': FileText,
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const ALERTS: Alert[] = [
    { id: 'a1', title: 'Rapport GAR MINEFI en retard critique (J+12)', description: 'Le rapport GAR T4 2025 du Ministère des Finances n\'a toujours pas été soumis. Dépassement SLA de 12 jours.', severity: 'critical', status: 'active', source: 'GAR', timestamp: '10 fév 2026 13:45' },
    { id: 'a2', title: 'Tentatives de connexion suspectes détectées', description: '47 tentatives de connexion échouées depuis la même IP (192.168.x.x) en 15 minutes. Compte temporairement verrouillé.', severity: 'critical', status: 'acknowledged', source: 'Sécurité', timestamp: '10 fév 2026 12:32', assignee: 'DSI' },
    { id: 'a3', title: 'Province Nyanga déconnectée depuis 48h', description: 'Aucune activité enregistrée depuis la province de Nyanga. Vérifier la connectivité réseau et l\'alimentation électrique.', severity: 'critical', status: 'active', source: 'Système', timestamp: '10 fév 2026 10:00' },
    { id: 'a4', title: 'Score performance MINSANTE < seuil (52%)', description: 'Le score de performance du Ministère de la Santé est descendu sous le seuil critique de 60%. Analyse requise.', severity: 'warning', status: 'active', source: 'Performance', timestamp: '10 fév 2026 09:15' },
    { id: 'a5', title: 'Nomination DG ANPI : échéance J-3', description: 'La nomination du DG de l\'ANPI arrive à échéance dans 3 jours. Le processus est à 60% de complétion.', severity: 'warning', status: 'active', source: 'Nominations', timestamp: '10 fév 2026 08:30' },
    { id: 'a6', title: 'Espace disque serveur principal > 80%', description: 'Le serveur principal a atteint 82% de capacité disque. Prévoir un nettoyage ou une extension de stockage.', severity: 'warning', status: 'acknowledged', source: 'Système', timestamp: '9 fév 2026 22:00', assignee: 'Équipe Tech' },
    { id: 'a7', title: 'Budget numérique T1 sous-exécuté (34%)', description: 'L\'exécution budgétaire du poste numérique est à 34% alors que l\'objectif T1 est de 50%. Risque de report.', severity: 'warning', status: 'active', source: 'Budget', timestamp: '9 fév 2026 16:00' },
    { id: 'a8', title: '3 rapports GAR soumis avec incohérences', description: 'Les rapports de MINTRANS, MINCOM et MINJUSTICE présentent des écarts > 15% entre les données déclarées et les données système.', severity: 'warning', status: 'active', source: 'GAR', timestamp: '9 fév 2026 14:30' },
    { id: 'a9', title: 'Mise à jour de sécurité disponible v3.2.1', description: 'Un nouveau patch de sécurité est disponible pour la plateforme. Inclut des correctifs TLS et des améliorations MFA.', severity: 'info', status: 'active', source: 'Sécurité', timestamp: '9 fév 2026 11:00' },
    { id: 'a10', title: 'Nouveau point focal MENETP enregistré', description: 'Mme Awa NZOGHE a été désignée comme nouveau point focal pour le Ministère de l\'Éducation Nationale.', severity: 'info', status: 'resolved', source: 'Nominations', timestamp: '8 fév 2026 15:00' },
    { id: 'a11', title: 'Sauvegarde automatique complétée', description: 'La sauvegarde quotidienne de la base de données a été effectuée avec succès. Taille : 4.2 GB.', severity: 'info', status: 'resolved', source: 'Système', timestamp: '8 fév 2026 03:00' },
    { id: 'a12', title: 'Benchmark T4 2025 publié', description: 'Le classement des ministères pour le T4 2025 est maintenant disponible dans le module Comparatif.', severity: 'info', status: 'resolved', source: 'Performance', timestamp: '7 fév 2026 10:00' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AlertCenterPage() {
    const [search, setSearch] = useState('');
    const [sevFilter, setSevFilter] = useState<AlertSeverity | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
    const [alerts, setAlerts] = useState(ALERTS);

    const filtered = useMemo(() => {
        return alerts.filter(a => {
            if (sevFilter !== 'all' && a.severity !== sevFilter) return false;
            if (statusFilter !== 'all' && a.status !== statusFilter) return false;
            if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [alerts, search, sevFilter, statusFilter]);

    const handleAction = (id: string, newStatus: AlertStatus) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    };

    const counts = {
        critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
        warning: alerts.filter(a => a.severity === 'warning' && a.status !== 'resolved').length,
        info: alerts.filter(a => a.severity === 'info' && a.status !== 'resolved').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Bell className="h-7 w-7 text-amber-500" />
                            Centre d'Alertes
                        </h1>
                        <p className="text-muted-foreground">
                            {alerts.filter(a => a.status !== 'resolved').length} alertes actives · {counts.critical} critiques
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setAlerts(prev => prev.map(a => a.status === 'active' ? { ...a, status: 'acknowledged' } : a))}>
                        <Eye className="h-3 w-3" /> Tout acquitter
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className={`cursor-pointer border-l-4 border-l-red-500 ${sevFilter === 'critical' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSevFilter(sevFilter === 'critical' ? 'all' : 'critical')}>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertOctagon className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{counts.critical}</p><p className="text-[10px] text-muted-foreground">Critiques</p></div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer border-l-4 border-l-amber-500 ${sevFilter === 'warning' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSevFilter(sevFilter === 'warning' ? 'all' : 'warning')}>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{counts.warning}</p><p className="text-[10px] text-muted-foreground">Avertissements</p></div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer border-l-4 border-l-blue-500 ${sevFilter === 'info' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSevFilter(sevFilter === 'info' ? 'all' : 'info')}>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{counts.info}</p><p className="text-[10px] text-muted-foreground">Informations</p></div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer border-l-4 border-l-green-500 ${statusFilter === 'resolved' ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{counts.resolved}</p><p className="text-[10px] text-muted-foreground">Résolues</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une alerte..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        {(['all', 'active', 'acknowledged', 'resolved'] as const).map(s => (
                            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setStatusFilter(s)}>
                                {s === 'all' ? 'Tous' : s === 'active' ? 'Actives' : s === 'acknowledged' ? 'Acquittées' : 'Résolues'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Alert List */}
                <div className="space-y-2">
                    {filtered.map(alert => {
                        const sev = SEVERITY_CFG[alert.severity];
                        const SevIcon = sev.icon;
                        const SourceIcon = SOURCE_ICONS[alert.source];

                        return (
                            <Card key={alert.id} className={`${alert.status === 'resolved' ? 'opacity-60' : ''} ${alert.severity === 'critical' && alert.status === 'active' ? 'border-red-300 dark:border-red-800 shadow-sm' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sev.bg}`}>
                                            <SevIcon className={`h-4 w-4 ${sev.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <p className="text-xs font-bold">{alert.title}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{alert.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                <Badge className={`text-[8px] h-3.5 ${sev.badge}`}>{sev.label}</Badge>
                                                <span className="flex items-center gap-0.5"><SourceIcon className="h-2.5 w-2.5" />{alert.source}</span>
                                                <span><Clock className="h-2.5 w-2.5 inline mr-0.5" />{alert.timestamp}</span>
                                                {alert.assignee && <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{alert.assignee}</span>}
                                                <Badge variant="outline" className={`text-[7px] h-3 ${alert.status === 'active' ? 'border-red-200 text-red-600' :
                                                        alert.status === 'acknowledged' ? 'border-amber-200 text-amber-600' :
                                                            'border-green-200 text-green-600'
                                                    }`}>
                                                    {alert.status === 'active' ? 'Active' : alert.status === 'acknowledged' ? 'Acquittée' : 'Résolue'}
                                                </Badge>
                                            </div>
                                        </div>
                                        {alert.status !== 'resolved' && (
                                            <div className="flex gap-1 shrink-0">
                                                {alert.status === 'active' && (
                                                    <Button variant="outline" size="sm" className="text-[9px] h-6 px-2" onClick={() => handleAction(alert.id, 'acknowledged')}>
                                                        <Eye className="h-2.5 w-2.5 mr-0.5" />Acquitter
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" className="text-[9px] h-6 px-2" onClick={() => handleAction(alert.id, 'resolved')}>
                                                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Résoudre
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune alerte trouvée</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
