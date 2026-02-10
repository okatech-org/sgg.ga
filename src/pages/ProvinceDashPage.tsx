/**
 * SGG Digital — Tableau de Bord Provinces
 *
 * Suivi de la performance par province :
 *   - 9 provinces du Gabon
 *   - Score de connectivité et couverture
 *   - KPIs par province
 *   - Classement et comparaison
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MapPin, TrendingUp, TrendingDown, Minus,
    Users, Building2, Wifi, WifiOff,
    BarChart3, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Province {
    id: string;
    name: string;
    capital: string;
    population: number;
    institutions: number;
    connected: boolean;
    scoreGlobal: number;
    scoreSoumission: number;
    scoreConformite: number;
    agentsNumerises: number;
    agentsTotal: number;
    pointsFocaux: number;
    trend: 'up' | 'down' | 'stable';
    historique: number[];
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const PROVINCES: Province[] = [
    { id: 'p1', name: 'Estuaire', capital: 'Libreville', population: 1200000, institutions: 28, connected: true, scoreGlobal: 88, scoreSoumission: 92, scoreConformite: 85, agentsNumerises: 12500, agentsTotal: 14000, pointsFocaux: 28, trend: 'up', historique: [80, 82, 84, 85, 87, 88] },
    { id: 'p2', name: 'Haut-Ogooué', capital: 'Franceville', population: 250000, institutions: 6, connected: true, scoreGlobal: 72, scoreSoumission: 78, scoreConformite: 68, agentsNumerises: 1800, agentsTotal: 2800, pointsFocaux: 6, trend: 'up', historique: [60, 63, 65, 68, 70, 72] },
    { id: 'p3', name: 'Moyen-Ogooué', capital: 'Lambaréné', population: 70000, institutions: 4, connected: true, scoreGlobal: 65, scoreSoumission: 70, scoreConformite: 60, agentsNumerises: 800, agentsTotal: 1500, pointsFocaux: 4, trend: 'stable', historique: [62, 63, 64, 64, 65, 65] },
    { id: 'p4', name: 'Ngounié', capital: 'Mouila', population: 100000, institutions: 5, connected: true, scoreGlobal: 58, scoreSoumission: 62, scoreConformite: 55, agentsNumerises: 600, agentsTotal: 1400, pointsFocaux: 4, trend: 'down', historique: [65, 63, 62, 60, 59, 58] },
    { id: 'p5', name: 'Nyanga', capital: 'Tchibanga', population: 55000, institutions: 3, connected: false, scoreGlobal: 35, scoreSoumission: 30, scoreConformite: 40, agentsNumerises: 200, agentsTotal: 900, pointsFocaux: 2, trend: 'down', historique: [45, 43, 40, 38, 36, 35] },
    { id: 'p6', name: 'Ogooué-Ivindo', capital: 'Makokou', population: 65000, institutions: 3, connected: false, scoreGlobal: 30, scoreSoumission: 25, scoreConformite: 35, agentsNumerises: 150, agentsTotal: 850, pointsFocaux: 2, trend: 'stable', historique: [32, 31, 30, 30, 30, 30] },
    { id: 'p7', name: 'Ogooué-Lolo', capital: 'Koulamoutou', population: 65000, institutions: 4, connected: true, scoreGlobal: 55, scoreSoumission: 58, scoreConformite: 52, agentsNumerises: 500, agentsTotal: 1100, pointsFocaux: 3, trend: 'up', historique: [45, 47, 49, 51, 53, 55] },
    { id: 'p8', name: 'Ogooué-Maritime', capital: 'Port-Gentil', population: 160000, institutions: 5, connected: true, scoreGlobal: 75, scoreSoumission: 80, scoreConformite: 72, agentsNumerises: 2200, agentsTotal: 3000, pointsFocaux: 5, trend: 'up', historique: [65, 67, 70, 72, 74, 75] },
    { id: 'p9', name: 'Woleu-Ntem', capital: 'Oyem', population: 155000, institutions: 5, connected: true, scoreGlobal: 62, scoreSoumission: 65, scoreConformite: 58, agentsNumerises: 900, agentsTotal: 1800, pointsFocaux: 4, trend: 'up', historique: [50, 53, 55, 58, 60, 62] },
];

// ── Mini sparkline ──────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 60},${30 - ((v - min) / range) * 28}`).join(' ');
    return (
        <svg width="60" height="30" className="inline-block">
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ProvinceDashPage() {
    const [selectedId, setSelectedId] = useState('p1');
    const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

    const sorted = useMemo(() => {
        return [...PROVINCES].sort((a, b) => sortBy === 'score' ? b.scoreGlobal - a.scoreGlobal : a.name.localeCompare(b.name));
    }, [sortBy]);

    const selected = PROVINCES.find(p => p.id === selectedId)!;
    const rank = [...PROVINCES].sort((a, b) => b.scoreGlobal - a.scoreGlobal).findIndex(p => p.id === selectedId) + 1;
    const avgScore = Math.round(PROVINCES.reduce((s, p) => s + p.scoreGlobal, 0) / PROVINCES.length);
    const connectedCount = PROVINCES.filter(p => p.connected).length;

    const scoreColor = (s: number) => s >= 75 ? 'text-green-600' : s >= 50 ? 'text-amber-600' : 'text-red-600';
    const scoreBg = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <MapPin className="h-7 w-7 text-emerald-600" />
                        Tableau de Bord Provinces
                    </h1>
                    <p className="text-muted-foreground">
                        {PROVINCES.length} provinces · {connectedCount}/9 connectées · Score moyen {avgScore}%
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-emerald-600">{connectedCount}/9</p>
                        <p className="text-[10px] text-muted-foreground">Provinces connectées</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{avgScore}%</p>
                        <p className="text-[10px] text-muted-foreground">Score moyen</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-violet-600">{PROVINCES.reduce((s, p) => s + p.agentsNumerises, 0).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Agents numérisés</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-amber-600">{PROVINCES.reduce((s, p) => s + p.pointsFocaux, 0)}</p>
                        <p className="text-[10px] text-muted-foreground">Points focaux</p>
                    </CardContent></Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Province List */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Classement</CardTitle>
                                <div className="flex gap-0.5">
                                    <Button variant={sortBy === 'score' ? 'default' : 'ghost'} size="sm" className="h-6 text-[9px]" onClick={() => setSortBy('score')}>Score</Button>
                                    <Button variant={sortBy === 'name' ? 'default' : 'ghost'} size="sm" className="h-6 text-[9px]" onClick={() => setSortBy('name')}>Nom</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {sorted.map((prov, i) => {
                                const rankNum = [...PROVINCES].sort((a, b) => b.scoreGlobal - a.scoreGlobal).findIndex(p => p.id === prov.id) + 1;
                                return (
                                    <button key={prov.id} className={`w-full flex items-center gap-2 p-3 border-b hover:bg-muted/30 transition-colors text-left ${prov.id === selectedId ? 'bg-primary/5' : ''}`} onClick={() => setSelectedId(prov.id)}>
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${rankNum <= 3 ? 'bg-emerald-500 text-white' : !prov.connected ? 'bg-red-200 text-red-800 dark:bg-red-900/30' : 'bg-muted'
                                            }`}>{rankNum}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold flex items-center gap-1">
                                                {prov.name}
                                                {!prov.connected && <WifiOff className="h-2.5 w-2.5 text-red-500" />}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">{prov.capital}</p>
                                        </div>
                                        <Sparkline data={prov.historique} color={prov.scoreGlobal >= 60 ? '#10b981' : '#f59e0b'} />
                                        <span className={`text-xs font-bold w-7 text-right ${scoreColor(prov.scoreGlobal)}`}>{prov.scoreGlobal}</span>
                                        {prov.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500 shrink-0" /> : prov.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500 shrink-0" /> : <Minus className="h-2 w-2 text-gray-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Province Detail */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Header */}
                        <Card>
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${selected.connected ? (selected.scoreGlobal >= 75 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30') : 'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                    <span className={`text-xl font-bold ${scoreColor(selected.scoreGlobal)}`}>{selected.scoreGlobal}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-bold">{selected.name}</p>
                                    <p className="text-xs text-muted-foreground">Capitale : {selected.capital} · Pop. {selected.population.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={selected.connected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                        {selected.connected ? <><Wifi className="h-3 w-3 mr-1" /> Connectée</> : <><WifiOff className="h-3 w-3 mr-1" /> Non connectée</>}
                                    </Badge>
                                    <div className="text-center">
                                        <p className="text-sm font-bold">#{rank}</p>
                                        <p className="text-[9px] text-muted-foreground">sur 9</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scores */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <p className={`text-xl font-bold ${scoreColor(selected.scoreSoumission)}`}>{selected.scoreSoumission}%</p>
                                <p className="text-[10px] text-muted-foreground">Soumission GAR</p>
                                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(selected.scoreSoumission)}`} style={{ width: `${selected.scoreSoumission}%` }} /></div>
                            </CardContent></Card>
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <p className={`text-xl font-bold ${scoreColor(selected.scoreConformite)}`}>{selected.scoreConformite}%</p>
                                <p className="text-[10px] text-muted-foreground">Conformité</p>
                                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(selected.scoreConformite)}`} style={{ width: `${selected.scoreConformite}%` }} /></div>
                            </CardContent></Card>
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <p className="text-xl font-bold text-violet-600">{Math.round((selected.agentsNumerises / selected.agentsTotal) * 100)}%</p>
                                <p className="text-[10px] text-muted-foreground">Numérisation</p>
                                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-violet-500" style={{ width: `${(selected.agentsNumerises / selected.agentsTotal) * 100}%` }} /></div>
                            </CardContent></Card>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <Building2 className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                                <p className="text-sm font-bold">{selected.institutions}</p>
                                <p className="text-[9px] text-muted-foreground">Institutions</p>
                            </CardContent></Card>
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <Users className="h-4 w-4 mx-auto mb-1 text-violet-500" />
                                <p className="text-sm font-bold">{selected.agentsNumerises.toLocaleString()}</p>
                                <p className="text-[9px] text-muted-foreground">Agents numérisés</p>
                            </CardContent></Card>
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <Users className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                                <p className="text-sm font-bold">{selected.pointsFocaux}</p>
                                <p className="text-[9px] text-muted-foreground">Points focaux</p>
                            </CardContent></Card>
                            <Card><CardContent className="pt-3 pb-2 text-center">
                                <BarChart3 className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                                <Sparkline data={selected.historique} color="#10b981" />
                                <p className="text-[9px] text-muted-foreground">Évolution 6 mois</p>
                            </CardContent></Card>
                        </div>

                        {/* Alerts */}
                        {!selected.connected && (
                            <Card className="border-red-300 dark:border-red-800">
                                <CardContent className="p-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600">
                                        Cette province n'est pas connectée à la plateforme SGG Digital. Les données sont collectées manuellement avec un délai de 7 à 14 jours.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
