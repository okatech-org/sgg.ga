/**
 * SGG Digital — OKR Manager (Objectifs & Résultats Clés)
 *
 * Suivi des objectifs stratégiques du gouvernement :
 *   - Objectifs par axe stratégique
 *   - Key Results avec progression
 *   - Score de confiance
 *   - Filtrage par statut et propriétaire
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Target, ChevronDown, ChevronRight, Flame,
    CheckCircle2, AlertTriangle, Clock, Users,
    TrendingUp, Plus, Flag,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type OKRStatus = 'on-track' | 'at-risk' | 'behind' | 'completed';

interface KeyResult {
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
    owner: string;
}

interface Objective {
    id: string;
    title: string;
    description: string;
    axis: string;
    status: OKRStatus;
    confidence: number; // 0-100
    keyResults: KeyResult[];
    owner: string;
    deadline: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OKRStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    'on-track': { label: 'En bonne voie', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    'at-risk': { label: 'À risque', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
    'behind': { label: 'En retard', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Clock },
    'completed': { label: 'Terminé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle2 },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const OBJECTIVES: Objective[] = [
    {
        id: 'o1', title: 'Améliorer la gouvernance numérique', description: 'Digitaliser 90% des processus gouvernementaux clés d\'ici fin 2026',
        axis: 'Transformation Digitale', status: 'on-track', confidence: 75, owner: 'Albert NDONG', deadline: 'Déc 2026',
        keyResults: [
            { id: 'kr1', title: 'Taux de soumission GAR ≥ 90%', current: 78, target: 90, unit: '%', owner: 'Marie OBAME' },
            { id: 'kr2', title: 'Provinces connectées à 100%', current: 7, target: 9, unit: 'provinces', owner: 'Rose MABIKA' },
            { id: 'kr3', title: 'Disponibilité plateforme ≥ 99.5%', current: 99.7, target: 99.5, unit: '%', owner: 'Équipe Tech' },
        ],
    },
    {
        id: 'o2', title: 'Accélérer le traitement des nominations', description: 'Réduire le délai moyen de traitement des nominations à 7 jours',
        axis: 'Efficacité Administrative', status: 'behind', confidence: 45, owner: 'Jean NZE', deadline: 'Juin 2026',
        keyResults: [
            { id: 'kr4', title: 'Délai moyen ≤ 7 jours', current: 12, target: 7, unit: 'jours', owner: 'Jean NZE' },
            { id: 'kr5', title: 'Dossiers traités ≥ 60/trimestre', current: 45, target: 60, unit: 'dossiers', owner: 'Jean NZE' },
            { id: 'kr6', title: 'Taux de conformité ≥ 95%', current: 88, target: 95, unit: '%', owner: 'Sylvie MOUSSAVOU' },
        ],
    },
    {
        id: 'o3', title: 'Renforcer la transparence budgétaire', description: 'Publication trimestrielle de l\'exécution budgétaire pour tous les ministères',
        axis: 'Transparence', status: 'on-track', confidence: 82, owner: 'Paul ABIAGA', deadline: 'Déc 2026',
        keyResults: [
            { id: 'kr7', title: 'Taux d\'exécution publié chaque trimestre', current: 3, target: 4, unit: 'trimestres', owner: 'Paul ABIAGA' },
            { id: 'kr8', title: 'Ministères déclarants ≥ 35', current: 30, target: 35, unit: 'ministères', owner: 'Paul ABIAGA' },
        ],
    },
    {
        id: 'o4', title: 'Former 100% des points focaux', description: 'Tous les points focaux ministériels formés à la plateforme SGG Digital',
        axis: 'Renforcement Capacités', status: 'on-track', confidence: 88, owner: 'Françoise ELLA', deadline: 'Sep 2026',
        keyResults: [
            { id: 'kr9', title: 'Points focaux formés = 100%', current: 85, target: 100, unit: '%', owner: 'Françoise ELLA' },
            { id: 'kr10', title: 'Sessions de formation ≥ 24/an', current: 18, target: 24, unit: 'sessions', owner: 'Françoise ELLA' },
            { id: 'kr11', title: 'Score satisfaction formation ≥ 4.5/5', current: 4.3, target: 4.5, unit: '/5', owner: 'Françoise ELLA' },
        ],
    },
    {
        id: 'o5', title: 'Achever 50 projets PAG en 2026', description: 'Compléter 50 projets structurants du Plan d\'Accélération de la Transformation',
        axis: 'Performance Gouvernementale', status: 'at-risk', confidence: 55, owner: 'Albert NDONG', deadline: 'Déc 2026',
        keyResults: [
            { id: 'kr12', title: 'Projets achevés ≥ 50', current: 18, target: 50, unit: 'projets', owner: 'Albert NDONG' },
            { id: 'kr13', title: 'Score composite national ≥ 80%', current: 72, target: 80, unit: '%', owner: 'Albert NDONG' },
            { id: 'kr14', title: 'Ministères avec score ≥ 70% : ≥ 25', current: 15, target: 25, unit: 'ministères', owner: 'Marie OBAME' },
        ],
    },
    {
        id: 'o6', title: 'Moderniser le Journal Officiel', description: 'Publication 100% numérique du Journal Officiel avec recherche avancée',
        axis: 'Transformation Digitale', status: 'completed', confidence: 100, owner: 'Rose MABIKA', deadline: 'Mars 2026',
        keyResults: [
            { id: 'kr15', title: 'Publications numérisées = 100%', current: 100, target: 100, unit: '%', owner: 'Rose MABIKA' },
            { id: 'kr16', title: 'Moteur de recherche déployé', current: 1, target: 1, unit: 'livré', owner: 'Équipe Tech' },
        ],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function OKRPage() {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['o1', 'o2']));
    const [statusFilter, setStatusFilter] = useState<OKRStatus | 'all'>('all');

    const toggle = (id: string) => {
        setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    };

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return OBJECTIVES;
        return OBJECTIVES.filter(o => o.status === statusFilter);
    }, [statusFilter]);

    const avgConfidence = Math.round(OBJECTIVES.reduce((s, o) => s + o.confidence, 0) / OBJECTIVES.length);
    const totalKR = OBJECTIVES.reduce((s, o) => s + o.keyResults.length, 0);
    const completedKR = OBJECTIVES.reduce((s, o) => s + o.keyResults.filter(kr => kr.current >= kr.target).length, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Flag className="h-7 w-7 text-violet-600" />
                            OKR — Objectifs & Résultats Clés
                        </h1>
                        <p className="text-muted-foreground">
                            {OBJECTIVES.length} objectifs · {totalKR} résultats clés · {avgConfidence}% confiance moyenne
                        </p>
                    </div>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nouvel Objectif</Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-violet-600">{OBJECTIVES.length}</p>
                        <p className="text-[10px] text-muted-foreground">Objectifs</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{completedKR}/{totalKR}</p>
                        <p className="text-[10px] text-muted-foreground">KR atteints</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-amber-600">{avgConfidence}%</p>
                        <p className="text-[10px] text-muted-foreground">Confiance moy.</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-green-600">{OBJECTIVES.filter(o => o.status === 'completed').length}</p>
                        <p className="text-[10px] text-muted-foreground">Terminés</p>
                    </CardContent></Card>
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setStatusFilter('all')}>Tous</Button>
                    {(Object.entries(STATUS_CONFIG) as [OKRStatus, typeof STATUS_CONFIG['on-track']][]).map(([key, conf]) => {
                        const Icon = conf.icon;
                        const count = OBJECTIVES.filter(o => o.status === key).length;
                        return (
                            <Button key={key} variant={statusFilter === key ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setStatusFilter(key)}>
                                <Icon className="h-3 w-3" /> {conf.label} ({count})
                            </Button>
                        );
                    })}
                </div>

                {/* OKR List */}
                <div className="space-y-3">
                    {filtered.map(obj => {
                        const isExpanded = expandedIds.has(obj.id);
                        const statusConf = STATUS_CONFIG[obj.status];
                        const avgProgress = Math.round(obj.keyResults.reduce((s, kr) => s + Math.min(100, (kr.current / kr.target) * 100), 0) / obj.keyResults.length);
                        const krDone = obj.keyResults.filter(kr => kr.current >= kr.target).length;

                        return (
                            <Card key={obj.id} className={obj.status === 'completed' ? 'opacity-75' : ''}>
                                <button
                                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                                    onClick={() => toggle(obj.id)}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${obj.confidence >= 75 ? 'bg-green-100 dark:bg-green-900/30' : obj.confidence >= 50 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                        }`}>
                                        <Target className={`h-4 w-4 ${obj.confidence >= 75 ? 'text-green-600' : obj.confidence >= 50 ? 'text-amber-600' : 'text-red-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold">{obj.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] h-4">{obj.axis}</Badge>
                                            <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{obj.owner}</span>
                                            <span><Clock className="h-2.5 w-2.5 inline mr-0.5" />{obj.deadline}</span>
                                            <span>{krDone}/{obj.keyResults.length} KR</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Confidence gauge */}
                                        <div className="text-center hidden sm:block">
                                            <p className={`text-sm font-bold ${obj.confidence >= 75 ? 'text-green-600' : obj.confidence >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{obj.confidence}%</p>
                                            <p className="text-[8px] text-muted-foreground">confiance</p>
                                        </div>
                                        <Badge className={`text-[9px] h-4 ${statusConf.color}`}>{statusConf.label}</Badge>
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mt-3 mb-3">{obj.description}</p>

                                        {/* Overall progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                                <span>Progression globale</span>
                                                <span className="font-semibold">{avgProgress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${avgProgress >= 75 ? 'bg-green-500' : avgProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} style={{ width: `${avgProgress}%` }} />
                                            </div>
                                        </div>

                                        {/* Key Results */}
                                        <p className="text-[10px] font-semibold text-muted-foreground mb-2">RÉSULTATS CLÉS ({obj.keyResults.length})</p>
                                        <div className="space-y-2">
                                            {obj.keyResults.map(kr => {
                                                const pct = Math.min(100, Math.round((kr.current / kr.target) * 100));
                                                const done = kr.current >= kr.target;
                                                return (
                                                    <div key={kr.id} className="p-2.5 rounded-lg border hover:bg-muted/20 transition-colors">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                {done ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                                                <span className={`text-xs ${done ? 'line-through text-muted-foreground' : 'font-medium'}`}>{kr.title}</span>
                                                            </div>
                                                            <span className="text-xs font-mono font-bold">{kr.current} / {kr.target} {kr.unit}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${done ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                                                            <span className="text-[9px] text-muted-foreground hidden sm:inline">{kr.owner}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
