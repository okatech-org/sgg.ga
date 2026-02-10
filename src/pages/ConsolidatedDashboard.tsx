/**
 * SGG Digital — Tableau de Bord Consolidé
 *
 * Vue exécutive unifiée de tous les modules :
 *   - Synthèse par module avec indicateurs clés
 *   - Alertes cross-modules
 *   - KPI nationaux globaux
 *   - Indicateurs de progression PAG 2026
 *   - Accès rapide aux actions prioritaires
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, ArrowRight, TrendingUp, TrendingDown,
    FileText, Users, BookOpen, Building2, FolderOpen,
    Scale, BarChart3, Table2, GitBranch, CheckCircle2,
    Clock, AlertTriangle, Target, Zap, Crown,
    ArrowUpRight,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface ModuleKPI {
    id: string;
    name: string;
    icon: typeof FileText;
    color: string;
    bgColor: string;
    metrics: {
        label: string;
        value: string | number;
        trend?: string;
        trendUp?: boolean;
    }[];
    status: 'excellent' | 'bon' | 'moyen' | 'faible';
    score: number;
    href: string;
    alerts?: number;
}

interface ActionItem {
    label: string;
    urgency: 'high' | 'medium' | 'low';
    module: string;
    href: string;
    deadline?: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MODULES: ModuleKPI[] = [
    {
        id: 'gar', name: 'Suivi GAR / PAG',
        icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        metrics: [
            { label: 'Taux de remplissage', value: '78%', trend: '+5%', trendUp: true },
            { label: 'Ministères conformes', value: '32/42', trend: '+3', trendUp: true },
            { label: 'Score PAG global', value: '72/100', trend: '+4pts', trendUp: true },
        ],
        status: 'bon', score: 78, href: '/gar/app', alerts: 2,
    },
    {
        id: 'nominations', name: 'Nominations',
        icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        metrics: [
            { label: 'Dossiers actifs', value: 36 },
            { label: 'En attente SGPR', value: 8, trend: '-2', trendUp: true },
            { label: 'Délai moyen', value: '12.5j', trend: '-1.3j', trendUp: true },
        ],
        status: 'bon', score: 82, href: '/nominations/app', alerts: 5,
    },
    {
        id: 'workflows', name: 'Workflows',
        icon: GitBranch, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30',
        metrics: [
            { label: 'Circuits actifs', value: 29 },
            { label: 'Taux validation', value: '88%', trend: '+2%', trendUp: true },
            { label: 'En retard', value: 3, trend: '-1', trendUp: true },
        ],
        status: 'excellent', score: 91, href: '/workflows',
    },
    {
        id: 'reporting', name: 'Matrice Reporting',
        icon: Table2, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        metrics: [
            { label: 'Rapports soumis', value: 344 },
            { label: 'En attente validation', value: 23, trend: '+5', trendUp: false },
            { label: 'Rejetés ce mois', value: 8 },
        ],
        status: 'moyen', score: 68, href: '/matrice-reporting', alerts: 3,
    },
    {
        id: 'institutions', name: 'Institutions',
        icon: Building2, color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/30',
        metrics: [
            { label: 'Institutions enregistrées', value: 42 },
            { label: 'Fiches complètes', value: '85%' },
            { label: 'Points focaux actifs', value: 38, trend: '+2', trendUp: true },
        ],
        status: 'bon', score: 85, href: '/institutions/app',
    },
    {
        id: 'jo', name: 'Journal Officiel',
        icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
        metrics: [
            { label: 'Textes publiés 2026', value: 67 },
            { label: 'En cours de révision', value: 12 },
            { label: 'Décrets signés', value: 24, trend: '+3', trendUp: true },
        ],
        status: 'excellent', score: 94, href: '/journal-officiel/app',
    },
    {
        id: 'egop', name: 'e-GOP',
        icon: FolderOpen, color: 'text-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-950/30',
        metrics: [
            { label: 'Conseils 2026', value: 6 },
            { label: 'Dossiers traités', value: 45 },
            { label: 'Prochaine session', value: '15 Fév' },
        ],
        status: 'bon', score: 80, href: '/egop/app',
    },
    {
        id: 'legislatif', name: 'Cycle Législatif',
        icon: Scale, color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
        metrics: [
            { label: 'Projets de loi actifs', value: 8 },
            { label: 'En commission', value: 3 },
            { label: 'Adoptés 2026', value: 2 },
        ],
        status: 'moyen', score: 65, href: '/cycle-legislatif/app',
    },
];

const PRIORITY_ACTIONS: ActionItem[] = [
    { label: 'Valider Décret n°001/2026 (étape SGG)', urgency: 'high', module: 'Workflows', href: '/workflows', deadline: 'Aujourd\'hui' },
    { label: 'Rapport MINSANTE T4 2025 en attente', urgency: 'high', module: 'Reporting', href: '/matrice-reporting', deadline: 'Demain' },
    { label: '5 nominations en attente de visa SGPR', urgency: 'high', module: 'Nominations', href: '/nominations/app' },
    { label: 'Saisie rapport GAR Février 2026 — 10 ministères manquants', urgency: 'medium', module: 'GAR', href: '/matrice-reporting/saisie', deadline: '15 Fév' },
    { label: 'Conseil des Ministres — préparation dossiers session du 15 Fév', urgency: 'medium', module: 'e-GOP', href: '/egop/app', deadline: '14 Fév' },
    { label: 'Mise à jour fiche Agence Nationale de l\'Eau', urgency: 'low', module: 'Institutions', href: '/institutions/app' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ConsolidatedDashboard() {
    const navigate = useNavigate();

    const globalScore = useMemo(() => {
        return Math.round(MODULES.reduce((s, m) => s + m.score, 0) / MODULES.length);
    }, []);

    const totalAlerts = useMemo(() => {
        return MODULES.reduce((s, m) => s + (m.alerts || 0), 0);
    }, []);

    const getStatusConfig = (status: ModuleKPI['status']) => {
        switch (status) {
            case 'excellent': return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-600' };
            case 'bon': return { label: 'Bon', color: 'bg-blue-500', textColor: 'text-blue-600' };
            case 'moyen': return { label: 'Moyen', color: 'bg-amber-500', textColor: 'text-amber-600' };
            case 'faible': return { label: 'Faible', color: 'bg-red-500', textColor: 'text-red-600' };
        }
    };

    const getUrgencyConfig = (urgency: ActionItem['urgency']) => {
        switch (urgency) {
            case 'high': return { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
            case 'medium': return { label: 'Prioritaire', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
            case 'low': return { label: 'Normal', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Crown className="h-7 w-7 text-amber-500" />
                            Vue Consolidée
                        </h1>
                        <p className="text-muted-foreground">
                            Synthèse exécutive de tous les modules SGG Digital
                        </p>
                    </div>
                </div>

                {/* Global KPI Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="border-2 border-green-200 dark:border-green-800">
                        <CardContent className="pt-4 pb-3 text-center">
                            <Target className="h-6 w-6 mx-auto text-green-600 mb-1" />
                            <p className="text-3xl font-bold text-green-600">{globalScore}%</p>
                            <p className="text-[10px] text-muted-foreground">Score Global SGG</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <Zap className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                            <p className="text-3xl font-bold">{MODULES.length}</p>
                            <p className="text-[10px] text-muted-foreground">Modules Actifs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <AlertTriangle className="h-6 w-6 mx-auto text-amber-600 mb-1" />
                            <p className="text-3xl font-bold text-amber-600">{totalAlerts}</p>
                            <p className="text-[10px] text-muted-foreground">Alertes en Cours</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-3 text-center">
                            <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-1" />
                            <p className="text-3xl font-bold text-green-600">{MODULES.filter(m => m.status === 'excellent').length}</p>
                            <p className="text-[10px] text-muted-foreground">Modules Excellents</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Module Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MODULES.map(mod => {
                        const ModIcon = mod.icon;
                        const stConf = getStatusConfig(mod.status);
                        return (
                            <Card
                                key={mod.id}
                                className="hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => navigate(mod.href)}
                            >
                                <CardContent className="pt-5 pb-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${mod.bgColor}`}>
                                            <ModIcon className={`h-5 w-5 ${mod.color}`} />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {mod.alerts && mod.alerts > 0 && (
                                                <Badge className="bg-red-500 text-white text-[10px] px-1.5">{mod.alerts}</Badge>
                                            )}
                                            <div className={`w-2 h-2 rounded-full ${stConf.color}`} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <p className="font-semibold text-sm mb-0.5">{mod.name}</p>
                                    <Badge variant="outline" className={`text-[10px] ${stConf.textColor}`}>{stConf.label} — {mod.score}%</Badge>

                                    {/* Score Bar */}
                                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${mod.score >= 85 ? 'bg-green-500' :
                                                    mod.score >= 70 ? 'bg-blue-500' :
                                                        mod.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${mod.score}%` }}
                                        />
                                    </div>

                                    {/* Metrics */}
                                    <div className="mt-3 space-y-1">
                                        {mod.metrics.map(m => (
                                            <div key={m.label} className="flex items-center justify-between text-[11px]">
                                                <span className="text-muted-foreground truncate">{m.label}</span>
                                                <span className="font-medium flex items-center gap-0.5">
                                                    {m.value}
                                                    {m.trend && (
                                                        <span className={`text-[10px] ${m.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                                            {m.trend}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Accéder <ArrowUpRight className="h-3 w-3 ml-0.5" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Priority Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Actions Prioritaires
                        </CardTitle>
                        <CardDescription>{PRIORITY_ACTIONS.filter(a => a.urgency === 'high').length} actions urgentes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {PRIORITY_ACTIONS.map((action, i) => {
                                const uConf = getUrgencyConfig(action.urgency);
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => navigate(action.href)}
                                    >
                                        <Badge className={`text-[10px] shrink-0 ${uConf.color}`}>{uConf.label}</Badge>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{action.label}</p>
                                            <p className="text-[10px] text-muted-foreground">{action.module}</p>
                                        </div>
                                        {action.deadline && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                                <Clock className="h-3 w-3" />
                                                {action.deadline}
                                            </div>
                                        )}
                                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
