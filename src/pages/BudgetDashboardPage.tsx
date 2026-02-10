/**
 * SGG Digital — Tableau de Bord Budgétaire
 *
 * Vue consolidée de l'exécution budgétaire de l'État :
 *   - Budget global par secteur
 *   - Recettes vs Dépenses
 *   - Taux d'exécution par ministère
 *   - Tendance trimestrielle
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Wallet, TrendingUp, TrendingDown, ArrowUpRight,
    ArrowDownRight, BarChart3, PieChart, AlertTriangle,
    CheckCircle2, DollarSign,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface BudgetSector {
    sector: string;
    allocated: number; // Mds FCFA
    executed: number;
    rate: number;
    trend: 'up' | 'down' | 'stable';
}

interface MinistryBudget {
    ministry: string;
    abbrev: string;
    allocated: number;
    executed: number;
    rate: number;
}

const GLOBAL = {
    totalBudget: 3_420, // Mds FCFA
    totalExecuted: 1_890,
    totalRecettes: 2_100,
    rateExecution: 55,
    rateCoverage: 61,
};

const SECTORS: BudgetSector[] = [
    { sector: 'Éducation & Recherche', allocated: 620, executed: 410, rate: 66, trend: 'up' },
    { sector: 'Santé & Protection Sociale', allocated: 480, executed: 255, rate: 53, trend: 'down' },
    { sector: 'Infrastructure & Transports', allocated: 520, executed: 275, rate: 53, trend: 'stable' },
    { sector: 'Défense & Sécurité', allocated: 380, executed: 265, rate: 70, trend: 'up' },
    { sector: 'Économie & Numérique', allocated: 290, executed: 195, rate: 67, trend: 'up' },
    { sector: 'Agriculture & Environnement', allocated: 210, executed: 98, rate: 47, trend: 'down' },
    { sector: 'Fonction Publique & Salaires', allocated: 580, executed: 310, rate: 53, trend: 'stable' },
    { sector: 'Souveraineté & Diplomatie', allocated: 340, executed: 82, rate: 24, trend: 'down' },
];

const MINISTRY_BUDGETS: MinistryBudget[] = [
    { ministry: 'Ministère des Finances', abbrev: 'MINEFI', allocated: 190, executed: 135, rate: 71 },
    { ministry: 'Ministère de l\'Éducation', abbrev: 'MENETP', allocated: 320, executed: 210, rate: 66 },
    { ministry: 'Ministère de la Santé', abbrev: 'MINSANTE', allocated: 280, executed: 145, rate: 52 },
    { ministry: 'Ministère des Transports', abbrev: 'MINTRANS', allocated: 220, executed: 115, rate: 52 },
    { ministry: 'Ministère de la Défense', abbrev: 'MINDEF', allocated: 250, executed: 175, rate: 70 },
    { ministry: 'Secrétariat Général', abbrev: 'SGG', allocated: 45, executed: 32, rate: 71 },
    { ministry: 'Économie Numérique', abbrev: 'MTNHDN', allocated: 85, executed: 60, rate: 71 },
    { ministry: 'Agriculture', abbrev: 'MAGPE', allocated: 110, executed: 48, rate: 44 },
    { ministry: 'Affaires Étrangères', abbrev: 'MAECICPG', allocated: 95, executed: 22, rate: 23 },
    { ministry: 'Justice', abbrev: 'MINJUSTICE', allocated: 75, executed: 45, rate: 60 },
];

const QUARTERLY = [
    { q: 'T1 2025', rate: 18 },
    { q: 'T2 2025', rate: 42 },
    { q: 'T3 2025', rate: 68 },
    { q: 'T4 2025', rate: 88 },
    { q: 'T1 2026', rate: 22 },
    { q: 'T2 2026*', rate: 55 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function BudgetDashboardPage() {
    const [view, setView] = useState<'sectors' | 'ministries'>('sectors');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Wallet className="h-7 w-7 text-emerald-600" />
                            Tableau de Bord Budgétaire
                        </h1>
                        <p className="text-muted-foreground">
                            Loi de Finances 2026 · Budget : {(GLOBAL.totalBudget / 1000).toFixed(1)} T FCFA
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Données au 10 Fév 2026</Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-blue-600">{(GLOBAL.totalBudget).toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">Budget total (Mds FCFA)</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-emerald-600">{GLOBAL.rateExecution}%</p>
                            <p className="text-[10px] text-muted-foreground">Taux d'exécution</p>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${GLOBAL.rateExecution}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.totalRecettes.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Recettes (Mds FCFA)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.totalExecuted.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Dépensé (Mds FCFA)</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quarterly Trend */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" /> Tendance exécution trimestrielle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 h-24">
                            {QUARTERLY.map((q, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] font-bold">{q.rate}%</span>
                                    <div className="w-full rounded-t transition-all" style={{
                                        height: `${q.rate}px`,
                                        background: q.rate >= 60 ? '#22c55e' : q.rate >= 40 ? '#f59e0b' : '#94a3b8',
                                    }} />
                                    <span className="text-[7px] text-muted-foreground">{q.q}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Toggle */}
                <div className="flex gap-1">
                    <Button variant={view === 'sectors' ? 'default' : 'outline'} size="sm" className="text-xs h-7 gap-1" onClick={() => setView('sectors')}>
                        <PieChart className="h-3 w-3" /> Par secteur
                    </Button>
                    <Button variant={view === 'ministries' ? 'default' : 'outline'} size="sm" className="text-xs h-7 gap-1" onClick={() => setView('ministries')}>
                        <BarChart3 className="h-3 w-3" /> Par ministère
                    </Button>
                </div>

                {/* Sectors view */}
                {view === 'sectors' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SECTORS.map((s, i) => (
                            <Card key={i} className={s.rate < 30 ? 'border-red-200 dark:border-red-800' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-xs font-bold">{s.sector}</p>
                                        {s.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                                            s.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                                                <DollarSign className="h-3 w-3 text-gray-400" />}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                        <span>Dépensé : {s.executed} / {s.allocated} Mds</span>
                                        <span className={`font-bold ${s.rate >= 60 ? 'text-green-600' : s.rate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{s.rate}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${s.rate >= 60 ? 'bg-green-500' : s.rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${s.rate}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Ministries view */}
                {view === 'ministries' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                        <th className="text-left py-2 px-3">Ministère</th>
                                        <th className="text-center py-2 px-2">Alloué</th>
                                        <th className="text-center py-2 px-2">Exécuté</th>
                                        <th className="text-center py-2 px-2">Taux</th>
                                        <th className="text-center py-2 px-2">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MINISTRY_BUDGETS.sort((a, b) => b.rate - a.rate).map(m => (
                                        <tr key={m.abbrev} className={`border-b hover:bg-muted/20 ${m.rate < 30 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                            <td className="py-2 px-3">
                                                <p className="font-medium">{m.abbrev}</p>
                                                <p className="text-[9px] text-muted-foreground">{m.ministry}</p>
                                            </td>
                                            <td className="text-center py-2 px-2 font-mono">{m.allocated}</td>
                                            <td className="text-center py-2 px-2 font-mono font-bold">{m.executed}</td>
                                            <td className="text-center py-2 px-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${m.rate >= 60 ? 'bg-green-500' : m.rate >= 40 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${m.rate}%` }} />
                                                    </div>
                                                    <span className="font-bold text-[10px]">{m.rate}%</span>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 px-2">
                                                {m.rate >= 60 ? <CheckCircle2 className="h-3 w-3 text-green-500 mx-auto" /> :
                                                    m.rate >= 40 ? <AlertTriangle className="h-3 w-3 text-amber-500 mx-auto" /> :
                                                        <AlertTriangle className="h-3 w-3 text-red-500 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* Deficit info */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-2 text-xs">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-muted-foreground">
                            Déficit prévisionnel : <strong className="text-foreground">{(GLOBAL.totalBudget - GLOBAL.totalRecettes).toLocaleString()} Mds FCFA</strong> ({Math.round((1 - GLOBAL.totalRecettes / GLOBAL.totalBudget) * 100)}% du budget).
                            Sources de financement : emprunts concessionnels, DTS FMI, coopération bilatérale.
                        </span>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
