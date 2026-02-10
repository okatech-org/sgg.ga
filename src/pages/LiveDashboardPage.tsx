/**
 * SGG Digital — Activité Temps Réel (Live Dashboard)
 *
 * Flux en temps réel des actions sur la plateforme :
 *   - Sessions actives
 *   - Actions récentes (auto-refresh simulé)
 *   - Métriques temps réel
 *   - Alertes live
 */

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Radio, Users, FileText, Upload, Eye,
    CheckCircle2, Clock, AlertTriangle,
    Shield, Activity, Zap, RefreshCw,
    LogIn, LogOut, Edit, Trash2,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type EventType = 'login' | 'logout' | 'submit' | 'edit' | 'view' | 'upload' | 'approve' | 'alert';

interface LiveEvent {
    id: string;
    type: EventType;
    user: string;
    ministry: string;
    action: string;
    timestamp: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const EVENT_CFG: Record<EventType, { icon: typeof LogIn; color: string; bg: string }> = {
    login: { icon: LogIn, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    logout: { icon: LogOut, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
    submit: { icon: Upload, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    edit: { icon: Edit, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    view: { icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    upload: { icon: Upload, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    approve: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

// ── Mock Data Generator ─────────────────────────────────────────────────────

const USERS_POOL = [
    { name: 'Marie OBAME', ministry: 'SGG' },
    { name: 'Paul ABIAGA', ministry: 'MINER' },
    { name: 'Rose MABIKA', ministry: 'MAECICPG' },
    { name: 'Jean NZE', ministry: 'MENETP' },
    { name: 'Françoise ELLA', ministry: 'MINSANTE' },
    { name: 'Albert NDONG', ministry: 'MINTRANS' },
    { name: 'Sophie MOUELE', ministry: 'MINJUSTICE' },
    { name: 'Pierre OGOULAT', ministry: 'MBCPFPRE' },
    { name: 'Claire BIVIGOU', ministry: 'MINCOM' },
    { name: 'André MBOUMBA', ministry: 'MTNHDN' },
];

const ACTIONS: Record<EventType, string[]> = {
    login: ['s\'est connecté(e)'],
    logout: ['s\'est déconnecté(e)'],
    submit: ['a soumis le rapport GAR T4', 'a soumis le formulaire de nomination', 'a envoyé le rapport budgétaire'],
    edit: ['a modifié le rapport GAR', 'a mis à jour les effectifs', 'a corrigé les données budgétaires'],
    view: ['a consulté le benchmark', 'a ouvert le tableau de bord', 'a visualisé le rapport consolidé'],
    upload: ['a importé un fichier Excel', 'a uploadé une pièce justificative', 'a déposé un scan signé'],
    approve: ['a validé le rapport GAR', 'a approuvé la nomination', 'a signé le décret'],
    alert: ['⚠ Tentative connexion échouée', '⚠ Rapport GAR en retard J+5', '⚠ Incohérence données détectée'],
};

let eventCounter = 0;

function generateEvent(): LiveEvent {
    const types: EventType[] = ['login', 'submit', 'edit', 'view', 'upload', 'approve', 'alert', 'logout'];
    const type = types[Math.floor(Math.random() * types.length)];
    const user = USERS_POOL[Math.floor(Math.random() * USERS_POOL.length)];
    const actions = ACTIONS[type];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    return {
        id: `evt-${++eventCounter}`,
        type,
        user: user.name,
        ministry: user.ministry,
        action,
        timestamp: ts,
    };
}

function generateInitialEvents(count: number): LiveEvent[] {
    return Array.from({ length: count }, () => generateEvent()).reverse();
}

// ── Component ───────────────────────────────────────────────────────────────

export default function LiveDashboardPage() {
    const [events, setEvents] = useState<LiveEvent[]>(() => generateInitialEvents(20));
    const [isPaused, setIsPaused] = useState(false);
    const [sessionCount] = useState(247);
    const [actionsPerMin] = useState(34);

    // Auto-generate events
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setEvents(prev => [generateEvent(), ...prev.slice(0, 49)]);
        }, 2500);
        return () => clearInterval(interval);
    }, [isPaused]);

    const eventCounts = {
        login: events.filter(e => e.type === 'login').length,
        submit: events.filter(e => e.type === 'submit').length,
        approve: events.filter(e => e.type === 'approve').length,
        alert: events.filter(e => e.type === 'alert').length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Radio className="h-7 w-7 text-red-500 animate-pulse" />
                            Activité Temps Réel
                        </h1>
                        <p className="text-muted-foreground">
                            {events.length} événements · Rafraîchissement toutes les 2.5s
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant={isPaused ? 'default' : 'outline'} size="sm" className="gap-1 text-xs" onClick={() => setIsPaused(!isPaused)}>
                            {isPaused ? <><Zap className="h-3 w-3" /> Reprendre</> : <><Clock className="h-3 w-3" /> Pause</>}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setEvents(generateInitialEvents(20))}>
                            <RefreshCw className="h-3 w-3" /> Reset
                        </Button>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-lg font-bold text-green-600">{sessionCount}</p>
                                <p className="text-[10px] text-muted-foreground">Sessions actives</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-lg font-bold text-blue-600">{actionsPerMin}/min</p>
                                <p className="text-[10px] text-muted-foreground">Actions par minute</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <div>
                                <p className="text-lg font-bold text-emerald-600">{eventCounts.approve}</p>
                                <p className="text-[10px] text-muted-foreground">Validations</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-lg font-bold text-red-600">{eventCounts.alert}</p>
                                <p className="text-[10px] text-muted-foreground">Alertes</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Event Feed */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                Flux d'Événements
                                {!isPaused && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                            {events.map((event, i) => {
                                const cfg = EVENT_CFG[event.type];
                                const Icon = cfg.icon;
                                return (
                                    <div key={event.id} className={`flex items-center gap-3 px-4 py-2.5 border-b hover:bg-muted/20 transition-colors ${i === 0 && !isPaused ? 'animate-in slide-in-from-top-2' : ''}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs">
                                                <span className="font-bold">{event.user}</span>
                                                <span className="text-muted-foreground"> ({event.ministry}) </span>
                                                <span>{event.action}</span>
                                            </p>
                                        </div>
                                        <span className="text-[9px] text-muted-foreground font-mono shrink-0">{event.timestamp}</span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Side Stats */}
                    <div className="space-y-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs">Ministères Actifs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {[
                                    { name: 'SGG', users: 45, color: 'bg-blue-500' },
                                    { name: 'MINER', users: 28, color: 'bg-green-500' },
                                    { name: 'MAECICPG', users: 22, color: 'bg-violet-500' },
                                    { name: 'MENETP', users: 18, color: 'bg-amber-500' },
                                    { name: 'MINSANTE', users: 15, color: 'bg-red-400' },
                                    { name: 'MINTRANS', users: 12, color: 'bg-teal-500' },
                                    { name: 'Autres', users: 107, color: 'bg-gray-400' },
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                        <div className={`w-2 h-2 rounded-full ${m.color}`} />
                                        <span className="flex-1">{m.name}</span>
                                        <span className="font-bold">{m.users}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs">Système</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5">
                                {[
                                    { label: 'CPU', value: 42, unit: '%', color: 'bg-green-500' },
                                    { label: 'RAM', value: 68, unit: '%', color: 'bg-amber-400' },
                                    { label: 'Disque', value: 55, unit: '%', color: 'bg-blue-500' },
                                    { label: 'Uptime', value: 99.97, unit: '%', color: 'bg-green-500' },
                                ].map((metric, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px]">
                                            <span>{metric.label}</span>
                                            <span className="font-bold">{metric.value}{metric.unit}</span>
                                        </div>
                                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${Math.min(metric.value, 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-3 pb-2 text-center">
                                <Shield className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                <p className="text-xs font-bold text-green-600">Système opérationnel</p>
                                <p className="text-[9px] text-muted-foreground">Dernière vérification : maintenant</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
