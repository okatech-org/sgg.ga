/**
 * SGG Digital — Activité Temps Réel
 *
 * Flux en direct des actions sur la plateforme :
 *   - Connexions, soumissions, validations, modifications
 *   - Filtrage par type d'action et par utilisateur
 *   - Indicateur de charge en temps réel
 *   - Auto-refresh simulé
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Activity, RefreshCw, LogIn, FileText,
    CheckCircle2, Edit3, Upload, Download,
    UserPlus, Trash2, Eye, Bell,
    Shield, Clock, Zap, Pause, Play,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ActionType = 'login' | 'submit' | 'validate' | 'edit' | 'upload' | 'download' | 'create_user' | 'delete' | 'view' | 'notification';

interface ActivityEntry {
    id: string;
    action: ActionType;
    user: string;
    role: string;
    description: string;
    target?: string;
    timestamp: Date;
    ip?: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<ActionType, { label: string; icon: typeof LogIn; color: string; bg: string }> = {
    login: { label: 'Connexion', icon: LogIn, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    submit: { label: 'Soumission', icon: Upload, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    validate: { label: 'Validation', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    edit: { label: 'Modification', icon: Edit3, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    upload: { label: 'Import', icon: Upload, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    download: { label: 'Téléchargement', icon: Download, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    create_user: { label: 'Nouvel utilisateur', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    delete: { label: 'Suppression', icon: Trash2, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    view: { label: 'Consultation', icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
    notification: { label: 'Notification', icon: Bell, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
};

// ── Mock Data Generator ─────────────────────────────────────────────────────

const USERS = [
    { name: 'Albert NDONG', role: 'Admin SGG' },
    { name: 'Marie OBAME', role: 'Admin SGG' },
    { name: 'Paul ABIAGA', role: 'SGPR' },
    { name: 'Jean NZE', role: 'SG Ministère' },
    { name: 'Pierre MBOUMBA', role: 'Point Focal' },
    { name: 'Sylvie MOUSSAVOU', role: 'SG Ministère' },
    { name: 'Françoise ELLA', role: 'Point Focal' },
    { name: 'Rose MABIKA', role: 'Point Focal' },
];

const DESCRIPTIONS: Record<ActionType, string[]> = {
    login: ['Connexion réussie depuis Libreville', 'Connexion via authenticateur mobile', 'Reconexion après timeout'],
    submit: ['Soumission rapport GAR T4 2025 — MINFI', 'Soumission PTM Février — MINEDUC', 'Envoi liste nominations Q1'],
    validate: ['Validation rapport MINSANTE — score 85%', 'Approbation décret n°003/2026', 'Validation workflow nomination DG'],
    edit: ['Modification matrice GAR — indicateur 4.2', 'Mise à jour profil utilisateur', 'Édition texte législatif art. 12'],
    upload: ['Import CSV — 450 lignes de données', 'Upload document officiel signé', 'Import batch institutions (23 entrées)'],
    download: ['Export PDF rapport consolidé Q4', 'Téléchargement Journal Officiel n°24', 'Export Excel nominations 2025'],
    create_user: ['Création compte point focal — MINTRANS', 'Ajout utilisateur SG — Min. Justice'],
    delete: ['Suppression brouillon rapport obsolète', 'Retrait document expiré'],
    view: ['Consultation Dashboard Consolidé', 'Accès matrice PTM Février', 'Lecture rapport GAR MINFI'],
    notification: ['Envoi alerte deadline — 5 ministères', 'Notification rappel validation en attente'],
};

function generateEntry(id: number, minutesAgo: number): ActivityEntry {
    const actions: ActionType[] = ['login', 'submit', 'validate', 'edit', 'upload', 'download', 'create_user', 'delete', 'view', 'notification'];
    const weights = [15, 20, 15, 18, 8, 10, 3, 2, 25, 5];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let action: ActionType = 'view';
    for (let i = 0; i < actions.length; i++) {
        r -= weights[i];
        if (r <= 0) { action = actions[i]; break; }
    }
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const descs = DESCRIPTIONS[action];
    return {
        id: `act-${id}`,
        action,
        user: user.name,
        role: user.role,
        description: descs[Math.floor(Math.random() * descs.length)],
        timestamp: new Date(Date.now() - minutesAgo * 60_000),
        ip: `41.158.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    };
}

function generateInitialEntries(): ActivityEntry[] {
    const entries: ActivityEntry[] = [];
    for (let i = 0; i < 25; i++) {
        entries.push(generateEntry(i, i * 3 + Math.floor(Math.random() * 5)));
    }
    return entries;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function LiveActivityPage() {
    const [entries, setEntries] = useState<ActivityEntry[]>(() => generateInitialEntries());
    const [isLive, setIsLive] = useState(true);
    const [filter, setFilter] = useState<ActionType | 'all'>('all');
    const [counter, setCounter] = useState(25);

    // Auto-refresh
    useEffect(() => {
        if (!isLive) return;
        const interval = setInterval(() => {
            setCounter(c => {
                const newEntry = generateEntry(c, 0);
                setEntries(prev => [newEntry, ...prev.slice(0, 49)]);
                return c + 1;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [isLive]);

    const filtered = useMemo(() =>
        filter === 'all' ? entries : entries.filter(e => e.action === filter),
        [entries, filter]
    );

    const formatTime = (d: Date) => {
        const diff = Date.now() - d.getTime();
        if (diff < 60_000) return 'à l\'instant';
        if (diff < 3600_000) return `il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `il y a ${Math.floor(diff / 3600_000)}h`;
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    // Action counts for sidebar
    const actionCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => { counts[e.action] = (counts[e.action] || 0) + 1; });
        return counts;
    }, [entries]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Activity className="h-7 w-7 text-emerald-600" />
                            Activité Temps Réel
                            {isLive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        </h1>
                        <p className="text-muted-foreground">
                            {entries.length} actions récentes — Mise à jour auto toutes les 5s
                        </p>
                    </div>
                    <Button
                        variant={isLive ? 'destructive' : 'default'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsLive(!isLive)}
                    >
                        {isLive ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Reprendre</>}
                    </Button>
                </div>

                {/* Live Indicator */}
                <Card className={`border-2 ${isLive ? 'border-green-300 dark:border-green-800' : 'border-amber-300 dark:border-amber-800'}`}>
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                <span className="text-sm font-medium">{isLive ? 'En direct' : 'En pause'}</span>
                                <span className="text-xs text-muted-foreground">— {counter} actions captées</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-blue-500" /> ~{Math.floor(60 / 5)} actions/min</span>
                                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-green-500" /> {USERS.length} utilisateurs actifs</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Filtrer par type</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <button
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${filter === 'all' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                                onClick={() => setFilter('all')}
                            >
                                <span>Toutes les actions</span>
                                <Badge variant="secondary" className="text-[10px]">{entries.length}</Badge>
                            </button>
                            {(Object.entries(ACTION_CONFIG) as [ActionType, typeof ACTION_CONFIG.login][]).map(([key, conf]) => {
                                const Icon = conf.icon;
                                const count = actionCounts[key] || 0;
                                if (count === 0) return null;
                                return (
                                    <button
                                        key={key}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${filter === key ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                                        onClick={() => setFilter(key)}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon className={`h-3 w-3 ${conf.color}`} />
                                            {conf.label}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Flux d'activité
                            </CardTitle>
                            <CardDescription>{filtered.length} actions {filter !== 'all' ? `(filtre: ${ACTION_CONFIG[filter].label})` : ''}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1 max-h-[600px] overflow-y-auto">
                                {filtered.map((entry, idx) => {
                                    const conf = ACTION_CONFIG[entry.action];
                                    const Icon = conf.icon;
                                    return (
                                        <div
                                            key={entry.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-muted/30 ${idx === 0 && isLive ? 'animate-in slide-in-from-top-2 border-primary/20 bg-primary/5' : ''}`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${conf.bg} shrink-0`}>
                                                <Icon className={`h-3.5 w-3.5 ${conf.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-semibold">{entry.user}</span>
                                                    <Badge variant="outline" className="text-[10px]">{entry.role}</Badge>
                                                    <Badge className={`text-[10px] ${conf.bg} ${conf.color}`}>{conf.label}</Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{entry.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTime(entry.timestamp)}</p>
                                                {entry.ip && <p className="text-[9px] text-muted-foreground font-mono">{entry.ip}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
