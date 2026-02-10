/**
 * SGG Digital — Balanced Scorecard
 *
 * Tableau de bord équilibré selon les 4 perspectives :
 *   - Financière
 *   - Usagers / Citoyens
 *   - Processus internes
 *   - Apprentissage et croissance
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Target, TrendingUp, TrendingDown, Minus,
    DollarSign, Users, Cog, GraduationCap,
    CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type Perspective = 'financial' | 'customer' | 'process' | 'learning';
type ObjectiveStatus = 'on-track' | 'at-risk' | 'off-track';

interface Objective {
    id: string;
    name: string;
    measure: string;
    target: string;
    actual: string;
    score: number; // 0-100
    status: ObjectiveStatus;
    trend: 'up' | 'down' | 'stable';
    weight: number; // percentage weight
}

interface BSCPerspective {
    key: Perspective;
    label: string;
    icon: typeof DollarSign;
    color: string;
    bg: string;
    border: string;
    objectives: Objective[];
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const PERSPECTIVES: BSCPerspective[] = [
    {
        key: 'financial', label: 'Perspective Financière', icon: DollarSign,
        color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800',
        objectives: [
            { id: 'f1', name: 'Taux d\'exécution budgétaire', measure: '% crédits consommés', target: '≥ 85%', actual: '72%', score: 85, status: 'on-track', trend: 'up', weight: 30 },
            { id: 'f2', name: 'Réduction coûts opérationnels', measure: 'Économies vs. N-1', target: '-15%', actual: '-11%', score: 73, status: 'at-risk', trend: 'up', weight: 25 },
            { id: 'f3', name: 'Investissement numérique / PIB', measure: '% budget IT', target: '≥ 2%', actual: '1.8%', score: 90, status: 'on-track', trend: 'up', weight: 25 },
            { id: 'f4', name: 'Recettes numériques', measure: 'FCFA (M)', target: '500M', actual: '320M', score: 64, status: 'at-risk', trend: 'stable', weight: 20 },
        ],
    },
    {
        key: 'customer', label: 'Perspective Usagers / Citoyens', icon: Users,
        color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800',
        objectives: [
            { id: 'c1', name: 'Satisfaction usagers plateforme', measure: 'Score NPS', target: '≥ 70', actual: '72', score: 100, status: 'on-track', trend: 'up', weight: 30 },
            { id: 'c2', name: 'Délai traitement moyen', measure: 'Jours', target: '≤ 5j', actual: '6.2j', score: 80, status: 'at-risk', trend: 'down', weight: 25 },
            { id: 'c3', name: 'Couverture services en ligne', measure: '% services digitalisés', target: '80%', actual: '65%', score: 81, status: 'on-track', trend: 'up', weight: 25 },
            { id: 'c4', name: 'Accessibilité provinces', measure: '% provinces connectées', target: '100%', actual: '78%', score: 78, status: 'at-risk', trend: 'stable', weight: 20 },
        ],
    },
    {
        key: 'process', label: 'Perspective Processus Internes', icon: Cog,
        color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800',
        objectives: [
            { id: 'p1', name: 'Taux soumission GAR numérique', measure: '% ministères', target: '100%', actual: '83%', score: 83, status: 'on-track', trend: 'up', weight: 30 },
            { id: 'p2', name: 'SLA nominations respecté', measure: '% dans les délais', target: '≥ 90%', actual: '78%', score: 87, status: 'at-risk', trend: 'up', weight: 25 },
            { id: 'p3', name: 'Taux erreur reporting', measure: '% rapports sans erreur', target: '≥ 95%', actual: '91%', score: 96, status: 'on-track', trend: 'up', weight: 25 },
            { id: 'p4', name: 'Temps cycle décret', measure: 'Jours moyens', target: '≤ 30j', actual: '42j', score: 50, status: 'off-track', trend: 'down', weight: 20 },
        ],
    },
    {
        key: 'learning', label: 'Apprentissage & Croissance', icon: GraduationCap,
        color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800',
        objectives: [
            { id: 'l1', name: 'Agents formés au numérique', measure: '% agents certifiés', target: '≥ 60%', actual: '52%', score: 87, status: 'on-track', trend: 'up', weight: 30 },
            { id: 'l2', name: 'Points focaux opérationnels', measure: '% postes pourvus', target: '100%', actual: '88%', score: 88, status: 'on-track', trend: 'up', weight: 25 },
            { id: 'l3', name: 'Innovation & projets pilotes', measure: 'Projets lancés', target: '≥ 8', actual: '5', score: 62, status: 'at-risk', trend: 'stable', weight: 25 },
            { id: 'l4', name: 'Rétention talents numériques', measure: '% rétention', target: '≥ 85%', actual: '91%', score: 100, status: 'on-track', trend: 'up', weight: 20 },
        ],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function BalancedScorecardPage() {
    const [selectedPerspective, setSelectedPerspective] = useState<Perspective | null>(null);

    const globalScore = Math.round(
        PERSPECTIVES.reduce((sum, p) => {
            const pScore = p.objectives.reduce((s, o) => s + o.score * (o.weight / 100), 0);
            return sum + pScore;
        }, 0) / PERSPECTIVES.length
    );

    const statusIcon = (s: ObjectiveStatus) => {
        if (s === 'on-track') return <CheckCircle2 className="h-3 w-3 text-green-500" />;
        if (s === 'at-risk') return <AlertTriangle className="h-3 w-3 text-amber-500" />;
        return <XCircle className="h-3 w-3 text-red-500" />;
    };

    const statusBadge = (s: ObjectiveStatus) => {
        const map = {
            'on-track': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'at-risk': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'off-track': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        const labels = { 'on-track': 'Sur la cible', 'at-risk': 'À risque', 'off-track': 'Hors cible' };
        return <Badge className={`text-[8px] h-3.5 ${map[s]}`}>{labels[s]}</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Target className="h-7 w-7 text-violet-600" />
                            Balanced Scorecard
                        </h1>
                        <p className="text-muted-foreground">
                            Score global : <span className="font-bold">{globalScore}%</span> · 4 perspectives · 16 objectifs stratégiques
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Période : T1 2026</Badge>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PERSPECTIVES.map(p => {
                        const pScore = Math.round(p.objectives.reduce((s, o) => s + o.score * (o.weight / 100), 0));
                        const Icon = p.icon;
                        const onTrack = p.objectives.filter(o => o.status === 'on-track').length;
                        const isSelected = selectedPerspective === p.key;

                        return (
                            <Card key={p.key} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${p.border}`}
                                onClick={() => setSelectedPerspective(isSelected ? null : p.key)}>
                                <CardContent className="pt-3 pb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-8 h-8 rounded-lg ${p.bg} flex items-center justify-center`}>
                                            <Icon className={`h-4 w-4 ${p.color}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xl font-bold ${p.color}`}>{pScore}%</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-semibold">{p.label}</p>
                                    <p className="text-[9px] text-muted-foreground">{onTrack}/{p.objectives.length} sur la cible</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Perspectives Detail */}
                {PERSPECTIVES.filter(p => !selectedPerspective || p.key === selectedPerspective).map(perspective => {
                    const Icon = perspective.icon;
                    return (
                        <Card key={perspective.key} className={perspective.border}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${perspective.color}`} />
                                    {perspective.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b text-[9px] text-muted-foreground">
                                                <th className="text-left pb-2 pr-2">Objectif</th>
                                                <th className="text-left pb-2 pr-2">Mesure</th>
                                                <th className="text-center pb-2 pr-2">Cible</th>
                                                <th className="text-center pb-2 pr-2">Réel</th>
                                                <th className="text-center pb-2 pr-2">Score</th>
                                                <th className="text-center pb-2 pr-2">Poids</th>
                                                <th className="text-center pb-2">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {perspective.objectives.map(obj => (
                                                <tr key={obj.id} className="border-b last:border-0 hover:bg-muted/30">
                                                    <td className="py-2 pr-2 font-medium">{obj.name}</td>
                                                    <td className="py-2 pr-2 text-muted-foreground text-[10px]">{obj.measure}</td>
                                                    <td className="py-2 pr-2 text-center font-mono">{obj.target}</td>
                                                    <td className="py-2 pr-2 text-center font-bold">{obj.actual}</td>
                                                    <td className="py-2 pr-2 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${obj.score >= 85 ? 'bg-green-500' : obj.score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${obj.score}%` }} />
                                                            </div>
                                                            <span className="text-[9px] w-6">{obj.score}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 pr-2 text-center text-muted-foreground">{obj.weight}%</td>
                                                    <td className="py-2 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {statusIcon(obj.status)}
                                                            {obj.trend === 'up' ? <TrendingUp className="h-2.5 w-2.5 text-green-500" /> : obj.trend === 'down' ? <TrendingDown className="h-2.5 w-2.5 text-red-500" /> : <Minus className="h-2 w-2 text-gray-400" />}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Legend */}
                <Card>
                    <CardContent className="p-3 flex flex-wrap gap-4 text-[10px]">
                        <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Sur la cible (≥85%)</div>
                        <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> À risque (60-84%)</div>
                        <div className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> Hors cible (&lt;60%)</div>
                        <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Amélioration</div>
                        <div className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500" /> Détérioration</div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
