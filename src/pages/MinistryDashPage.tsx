/**
 * SGG Digital — Tableau de Bord Ministériel
 *
 * Vue détaillée d'un ministère sélectionné :
 *   - Sélection dynamique de ministère
 *   - Scores et KPIs par ministère
 *   - Conformité, effectifs, budget
 *   - Historique de performance
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building2, TrendingUp, TrendingDown,
    Users, FileText, DollarSign,
    CheckCircle2, XCircle, Clock, BarChart3,
    ChevronDown,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Ministry {
    id: string;
    name: string;
    acronym: string;
    minister: string;
    pointFocal: string;
    scoreGlobal: number;
    scoreGAR: number;
    scoreBudget: number;
    scoreConformite: number;
    effectifs: number;
    effectifsNumerises: number;
    rapportsSoumis: number;
    rapportsTotal: number;
    budgetAlloue: number; // MdF CFA
    budgetExecute: number;
    lastActivity: string;
    trend: 'up' | 'down' | 'stable';
    historique: number[]; // 6 mois de scores
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MINISTRIES: Ministry[] = [
    {
        id: 'm1', name: 'Ministère de l\'Économie et de la Relance', acronym: 'MINER', minister: 'Nicole JEANINE LYSSA',
        pointFocal: 'André MAGANGA', scoreGlobal: 85, scoreGAR: 92, scoreBudget: 78, scoreConformite: 88,
        effectifs: 1250, effectifsNumerises: 1100, rapportsSoumis: 4, rapportsTotal: 4, budgetAlloue: 45.2, budgetExecute: 35.8,
        lastActivity: '10 fév, 11:30', trend: 'up', historique: [72, 75, 78, 80, 83, 85],
    },
    {
        id: 'm2', name: 'Ministère de la Santé', acronym: 'MINSANTE', minister: 'Adrien NKOGHE ESSINGONE',
        pointFocal: 'Cécile MOUBELET', scoreGlobal: 68, scoreGAR: 65, scoreBudget: 72, scoreConformite: 60,
        effectifs: 3200, effectifsNumerises: 2100, rapportsSoumis: 3, rapportsTotal: 4, budgetAlloue: 128.5, budgetExecute: 85.3,
        lastActivity: '9 fév, 16:00', trend: 'down', historique: [75, 73, 72, 70, 69, 68],
    },
    {
        id: 'm3', name: 'Ministère de l\'Éducation Nationale', acronym: 'MENETP', minister: 'Camélia NTOUTOUME-LECLERCQ',
        pointFocal: 'Hervé NDONG', scoreGlobal: 78, scoreGAR: 80, scoreBudget: 75, scoreConformite: 82,
        effectifs: 8500, effectifsNumerises: 5800, rapportsSoumis: 4, rapportsTotal: 4, budgetAlloue: 215.0, budgetExecute: 148.5,
        lastActivity: '10 fév, 09:15', trend: 'up', historique: [68, 70, 72, 74, 76, 78],
    },
    {
        id: 'm4', name: 'Ministère des Transports', acronym: 'MINTRANS', minister: 'Loïc MOUYABI',
        pointFocal: 'Georges EKOMI', scoreGlobal: 52, scoreGAR: 40, scoreBudget: 58, scoreConformite: 45,
        effectifs: 800, effectifsNumerises: 350, rapportsSoumis: 2, rapportsTotal: 4, budgetAlloue: 65.0, budgetExecute: 28.6,
        lastActivity: '25 jan, 14:30', trend: 'down', historique: [65, 62, 58, 56, 54, 52],
    },
    {
        id: 'm5', name: 'Ministère de l\'Intérieur', acronym: 'MINICLGPAT', minister: 'Lambert-Noël MATHA',
        pointFocal: 'Blaise MOUSSADJI', scoreGlobal: 74, scoreGAR: 78, scoreBudget: 70, scoreConformite: 75,
        effectifs: 4500, effectifsNumerises: 3200, rapportsSoumis: 4, rapportsTotal: 4, budgetAlloue: 95.0, budgetExecute: 68.4,
        lastActivity: '10 fév, 10:00', trend: 'stable', historique: [73, 73, 74, 74, 74, 74],
    },
    {
        id: 'm6', name: 'Ministère des Affaires Étrangères', acronym: 'MAECICPG', minister: 'Michael MOUSSA-ADAMO',
        pointFocal: 'Jeanne BONGO', scoreGlobal: 82, scoreGAR: 88, scoreBudget: 80, scoreConformite: 85,
        effectifs: 1800, effectifsNumerises: 1600, rapportsSoumis: 4, rapportsTotal: 4, budgetAlloue: 52.0, budgetExecute: 42.5,
        lastActivity: '10 fév, 08:45', trend: 'up', historique: [70, 73, 76, 78, 80, 82],
    },
    {
        id: 'm7', name: 'Ministère de la Défense Nationale', acronym: 'MDN', minister: 'Brigitte ONKANOWA',
        pointFocal: 'Colonel EDZANG', scoreGlobal: 70, scoreGAR: 72, scoreBudget: 65, scoreConformite: 78,
        effectifs: 6000, effectifsNumerises: 3500, rapportsSoumis: 3, rapportsTotal: 4, budgetAlloue: 180.0, budgetExecute: 115.2,
        lastActivity: '8 fév, 15:00', trend: 'up', historique: [60, 62, 64, 66, 68, 70],
    },
    {
        id: 'm8', name: 'Ministère de la Justice', acronym: 'MINJUSTICE', minister: 'Erlyne ANTONELLA NDEMBET',
        pointFocal: 'Patrick OGOULIGUENDE', scoreGlobal: 58, scoreGAR: 55, scoreBudget: 62, scoreConformite: 50,
        effectifs: 2200, effectifsNumerises: 980, rapportsSoumis: 2, rapportsTotal: 4, budgetAlloue: 38.0, budgetExecute: 18.5,
        lastActivity: '3 fév, 11:20', trend: 'down', historique: [70, 68, 65, 62, 60, 58],
    },
];

// ── Mini bar chart ──────────────────────────────────────────────────────────

function MiniBars({ data }: { data: number[] }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-0.5 h-8">
            {data.map((v, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / max) * 100}%`, backgroundColor: i === data.length - 1 ? '#8b5cf6' : '#e5e7eb' }} />
            ))}
        </div>
    );
}

// ── Component ───────────────────────────────────────────────────────────────

export default function MinistryDashPage() {
    const [selectedId, setSelectedId] = useState('m1');

    const selected = MINISTRIES.find(m => m.id === selectedId)!;
    const rank = [...MINISTRIES].sort((a, b) => b.scoreGlobal - a.scoreGlobal).findIndex(m => m.id === selectedId) + 1;

    const scoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';
    const scoreBg = (s: number) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Building2 className="h-7 w-7 text-blue-600" />
                        Tableau de Bord Ministériel
                    </h1>
                    <p className="text-muted-foreground">{MINISTRIES.length} ministères suivis</p>
                </div>

                {/* Ministry Selector */}
                <div className="relative">
                    <select
                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm font-semibold appearance-none cursor-pointer"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                    >
                        {MINISTRIES.map(m => (
                            <option key={m.id} value={m.id}>{m.acronym} — {m.name} ({m.scoreGlobal}%)</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>

                {/* Ministry Header Card */}
                <Card>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${selected.scoreGlobal >= 80 ? 'bg-green-100 dark:bg-green-900/30' : selected.scoreGlobal >= 60 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                            <span className={`text-xl font-bold ${scoreColor(selected.scoreGlobal)}`}>{selected.scoreGlobal}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">{selected.name}</p>
                            <p className="text-[10px] text-muted-foreground">Ministre : {selected.minister}</p>
                            <p className="text-[10px] text-muted-foreground">Point focal : {selected.pointFocal}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-center">
                                <p className="text-sm font-bold">#{rank}</p>
                                <p className="text-[9px] text-muted-foreground">Classement</p>
                            </div>
                            <Badge className={selected.trend === 'up' ? 'bg-green-100 text-green-700' : selected.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                                {selected.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : selected.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
                                {selected.trend === 'up' ? 'Progression' : selected.trend === 'down' ? 'Régression' : 'Stable'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Score Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className={`text-xl font-bold ${scoreColor(selected.scoreGAR)}`}>{selected.scoreGAR}%</p>
                            <p className="text-[10px] text-muted-foreground">Score GAR</p>
                            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(selected.scoreGAR)}`} style={{ width: `${selected.scoreGAR}%` }} /></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className={`text-xl font-bold ${scoreColor(selected.scoreBudget)}`}>{selected.scoreBudget}%</p>
                            <p className="text-[10px] text-muted-foreground">Score Budget</p>
                            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(selected.scoreBudget)}`} style={{ width: `${selected.scoreBudget}%` }} /></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className={`text-xl font-bold ${scoreColor(selected.scoreConformite)}`}>{selected.scoreConformite}%</p>
                            <p className="text-[10px] text-muted-foreground">Conformité</p>
                            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(selected.scoreConformite)}`} style={{ width: `${selected.scoreConformite}%` }} /></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2">
                            <MiniBars data={selected.historique} />
                            <p className="text-[10px] text-muted-foreground text-center mt-1">6 derniers mois</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rapports */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Rapports</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Soumis</span>
                                <span className="text-sm font-bold">{selected.rapportsSoumis}/{selected.rapportsTotal}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${selected.rapportsSoumis === selected.rapportsTotal ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${(selected.rapportsSoumis / selected.rapportsTotal) * 100}%` }} />
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: selected.rapportsTotal }).map((_, i) => (
                                    <div key={i} className={`flex-1 h-6 rounded flex items-center justify-center text-[9px] font-bold ${i < selected.rapportsSoumis ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                        }`}>
                                        T{i + 1} {i < selected.rapportsSoumis ? '✓' : '✗'}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Effectifs */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-violet-500" /> Effectifs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Numérisés</span>
                                <span className="text-sm font-bold">{selected.effectifsNumerises.toLocaleString()}/{selected.effectifs.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-violet-500" style={{ width: `${(selected.effectifsNumerises / selected.effectifs) * 100}%` }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">
                                {Math.round((selected.effectifsNumerises / selected.effectifs) * 100)}% numérisés
                            </p>
                        </CardContent>
                    </Card>

                    {/* Budget */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" /> Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Exécuté</span>
                                <span className="text-sm font-bold">{selected.budgetExecute} / {selected.budgetAlloue} MdF CFA</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-green-500" style={{ width: `${(selected.budgetExecute / selected.budgetAlloue) * 100}%` }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">
                                {Math.round((selected.budgetExecute / selected.budgetAlloue) * 100)}% exécuté
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Ranking Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Classement Général</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {[...MINISTRIES].sort((a, b) => b.scoreGlobal - a.scoreGlobal).map((m, i) => (
                            <button
                                key={m.id}
                                className={`w-full flex items-center gap-3 p-3 border-b hover:bg-muted/30 transition-colors text-left ${m.id === selectedId ? 'bg-primary/5' : ''}`}
                                onClick={() => setSelectedId(m.id)}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-800' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-muted'
                                    }`}>{i + 1}</span>
                                <span className="text-xs font-semibold flex-1">{m.acronym}</span>
                                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${scoreBg(m.scoreGlobal)}`} style={{ width: `${m.scoreGlobal}%` }} />
                                </div>
                                <span className={`text-xs font-bold w-8 text-right ${scoreColor(m.scoreGlobal)}`}>{m.scoreGlobal}%</span>
                                {m.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> : m.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> : <div className="w-3" />}
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <p className="text-[10px] text-muted-foreground text-center">Dernière activité : {selected.lastActivity}</p>
            </div>
        </DashboardLayout>
    );
}
