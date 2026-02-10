/**
 * SGG Digital — Comparaison Ministères (Benchmarking)
 *
 * Dashboard de comparaison des performances ministérielles :
 *   - Classement global avec scores composites
 *   - Radar multi-dimensions par ministère
 *   - Tableaux comparatifs (GAR, reporting, nominations, réactivité)
 *   - Sélection de ministères à comparer
 *   - Export du benchmark
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3, Trophy, TrendingUp, TrendingDown,
    Building2, Download, ArrowUpDown, Medal,
    Target, FileText, Users, Clock,
    ChevronUp, ChevronDown, Minus,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface MinistryStats {
    id: string;
    name: string;
    short: string;
    scoreGlobal: number;
    scoreGAR: number;
    scorePTM: number;
    scoreReporting: number;
    scoreNominations: number;
    scoreReactivite: number;
    rapportsSoumis: number;
    rapportsTotal: number;
    delaiMoyen: number; // jours
    pointsFocaux: number;
    tendance: 'up' | 'down' | 'stable';
    rang: number;
    rangPrecedent: number;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MINISTRIES: MinistryStats[] = [
    { id: 'm1', name: 'Ministère des Finances', short: 'MINFI', scoreGlobal: 92, scoreGAR: 95, scorePTM: 90, scoreReporting: 94, scoreNominations: 88, scoreReactivite: 91, rapportsSoumis: 12, rapportsTotal: 12, delaiMoyen: 2, pointsFocaux: 4, tendance: 'up', rang: 1, rangPrecedent: 2 },
    { id: 'm2', name: 'Ministère de l\'Éducation Nationale', short: 'MINEDUC', scoreGlobal: 87, scoreGAR: 89, scorePTM: 85, scoreReporting: 92, scoreNominations: 80, scoreReactivite: 88, rapportsSoumis: 11, rapportsTotal: 12, delaiMoyen: 3, pointsFocaux: 3, tendance: 'up', rang: 2, rangPrecedent: 3 },
    { id: 'm3', name: 'Ministère de la Santé', short: 'MINSANTE', scoreGlobal: 85, scoreGAR: 88, scorePTM: 82, scoreReporting: 86, scoreNominations: 85, scoreReactivite: 84, rapportsSoumis: 11, rapportsTotal: 12, delaiMoyen: 4, pointsFocaux: 3, tendance: 'stable', rang: 3, rangPrecedent: 1 },
    { id: 'm4', name: 'Ministère de la Justice', short: 'MINJUST', scoreGlobal: 81, scoreGAR: 82, scorePTM: 80, scoreReporting: 84, scoreNominations: 78, scoreReactivite: 82, rapportsSoumis: 10, rapportsTotal: 12, delaiMoyen: 5, pointsFocaux: 2, tendance: 'up', rang: 4, rangPrecedent: 5 },
    { id: 'm5', name: 'Ministère des Transports', short: 'MINTRANS', scoreGlobal: 78, scoreGAR: 75, scorePTM: 80, scoreReporting: 82, scoreNominations: 72, scoreReactivite: 80, rapportsSoumis: 10, rapportsTotal: 12, delaiMoyen: 6, pointsFocaux: 2, tendance: 'down', rang: 5, rangPrecedent: 4 },
    { id: 'm6', name: 'Ministère de l\'Agriculture', short: 'MINAGRI', scoreGlobal: 74, scoreGAR: 70, scorePTM: 78, scoreReporting: 76, scoreNominations: 68, scoreReactivite: 78, rapportsSoumis: 9, rapportsTotal: 12, delaiMoyen: 7, pointsFocaux: 2, tendance: 'stable', rang: 6, rangPrecedent: 6 },
    { id: 'm7', name: 'Ministère des Mines', short: 'MINES', scoreGlobal: 71, scoreGAR: 68, scorePTM: 74, scoreReporting: 72, scoreNominations: 70, scoreReactivite: 71, rapportsSoumis: 9, rapportsTotal: 12, delaiMoyen: 8, pointsFocaux: 1, tendance: 'up', rang: 7, rangPrecedent: 9 },
    { id: 'm8', name: 'Ministère de la Défense', short: 'MINDEF', scoreGlobal: 68, scoreGAR: 65, scorePTM: 72, scoreReporting: 70, scoreNominations: 64, scoreReactivite: 68, rapportsSoumis: 8, rapportsTotal: 12, delaiMoyen: 9, pointsFocaux: 1, tendance: 'down', rang: 8, rangPrecedent: 7 },
    { id: 'm9', name: 'Ministère de la Communication', short: 'MINCOM', scoreGlobal: 64, scoreGAR: 60, scorePTM: 66, scoreReporting: 68, scoreNominations: 62, scoreReactivite: 64, rapportsSoumis: 8, rapportsTotal: 12, delaiMoyen: 10, pointsFocaux: 1, tendance: 'down', rang: 9, rangPrecedent: 8 },
    { id: 'm10', name: 'Ministère de l\'Environnement', short: 'MINENV', scoreGlobal: 58, scoreGAR: 55, scorePTM: 60, scoreReporting: 62, scoreNominations: 52, scoreReactivite: 60, rapportsSoumis: 7, rapportsTotal: 12, delaiMoyen: 12, pointsFocaux: 1, tendance: 'down', rang: 10, rangPrecedent: 10 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number) {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 55) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

function getScoreBg(score: number) {
    if (score >= 85) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 55) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
}

function getRankBadge(rang: number) {
    if (rang === 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300';
    if (rang === 2) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300';
    if (rang === 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300';
    return 'bg-muted text-muted-foreground';
}

// ── Component ───────────────────────────────────────────────────────────────

export default function BenchmarkPage() {
    const [sortKey, setSortKey] = useState<keyof MinistryStats>('scoreGlobal');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const sorted = useMemo(() => {
        return [...MINISTRIES].sort((a, b) => {
            const va = a[sortKey] as number;
            const vb = b[sortKey] as number;
            return sortDir === 'desc' ? vb - va : va - vb;
        });
    }, [sortKey, sortDir]);

    const selected = selectedIds.length > 0 ? MINISTRIES.filter(m => selectedIds.includes(m.id)) : [];

    const handleSort = (key: keyof MinistryStats) => {
        if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev);
    };

    const handleExport = () => {
        const headers = ['Rang', 'Ministère', 'Score Global', 'GAR', 'PTM', 'Reporting', 'Nominations', 'Réactivité', 'Rapports', 'Délai Moy.'];
        const rows = sorted.map(m => [m.rang, m.name, m.scoreGlobal, m.scoreGAR, m.scorePTM, m.scoreReporting, m.scoreNominations, m.scoreReactivite, `${m.rapportsSoumis}/${m.rapportsTotal}`, `${m.delaiMoyen}j`]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benchmark-ministeres-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Global stats
    const avgScore = Math.round(MINISTRIES.reduce((s, m) => s + m.scoreGlobal, 0) / MINISTRIES.length);
    const topMinistry = MINISTRIES.reduce((a, b) => a.scoreGlobal > b.scoreGlobal ? a : b);
    const avgDelay = Math.round(MINISTRIES.reduce((s, m) => s + m.delaiMoyen, 0) / MINISTRIES.length);

    const SortIcon = ({ field }: { field: keyof MinistryStats }) => {
        if (sortKey !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
        return sortDir === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Trophy className="h-7 w-7 text-yellow-600" />
                            Benchmark Ministères
                        </h1>
                        <p className="text-muted-foreground">
                            Comparaison des performances de {MINISTRIES.length} ministères
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <BarChart3 className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                            <p className="text-xl font-bold">{avgScore}%</p>
                            <p className="text-[10px] text-muted-foreground">Score moyen</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <Medal className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                            <p className="text-xl font-bold">{topMinistry.short}</p>
                            <p className="text-[10px] text-muted-foreground">1er du classement</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <Clock className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                            <p className="text-xl font-bold">{avgDelay}j</p>
                            <p className="text-[10px] text-muted-foreground">Délai moyen</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <Building2 className="h-5 w-5 mx-auto text-green-600 mb-1" />
                            <p className="text-xl font-bold">{MINISTRIES.filter(m => m.scoreGlobal >= 80).length}</p>
                            <p className="text-[10px] text-muted-foreground">Ministères ≥ 80%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Ranking Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Classement Général</CardTitle>
                        <CardDescription>Cliquez sur un ministère pour le sélectionner (max 3). Cliquez sur les en-têtes pour trier.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-2 text-[10px] font-medium text-muted-foreground">#</th>
                                    <th className="text-left py-2 px-2 text-[10px] font-medium text-muted-foreground">Ministère</th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('scoreGlobal')}>
                                        <span className="flex items-center justify-center gap-1">Global <SortIcon field="scoreGlobal" /></span>
                                    </th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => handleSort('scoreGAR')}>
                                        <span className="flex items-center justify-center gap-1">GAR <SortIcon field="scoreGAR" /></span>
                                    </th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => handleSort('scorePTM')}>
                                        <span className="flex items-center justify-center gap-1">PTM <SortIcon field="scorePTM" /></span>
                                    </th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden md:table-cell" onClick={() => handleSort('scoreReporting')}>
                                        <span className="flex items-center justify-center gap-1">Reporting <SortIcon field="scoreReporting" /></span>
                                    </th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell" onClick={() => handleSort('scoreNominations')}>
                                        <span className="flex items-center justify-center gap-1">Nomin. <SortIcon field="scoreNominations" /></span>
                                    </th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell" onClick={() => handleSort('scoreReactivite')}>
                                        <span className="flex items-center justify-center gap-1">Réactiv. <SortIcon field="scoreReactivite" /></span>
                                    </th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground hidden sm:table-cell">Rapports</th>
                                    <th className="text-center py-2 px-1 text-[10px] font-medium text-muted-foreground hidden sm:table-cell">Tendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((m, idx) => {
                                    const isSelected = selectedIds.includes(m.id);
                                    return (
                                        <tr
                                            key={m.id}
                                            className={`border-b cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5 border-primary/20' : ''}`}
                                            onClick={() => toggleSelect(m.id)}
                                        >
                                            <td className="py-2 px-2">
                                                <Badge className={`text-[10px] ${getRankBadge(m.rang)}`}>
                                                    {m.rang}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${getScoreBg(m.scoreGlobal)} ${getScoreColor(m.scoreGlobal)}`}>
                                                        {m.short.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium">{m.short}</p>
                                                        <p className="text-[10px] text-muted-foreground hidden md:block truncate max-w-[180px]">{m.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 px-1">
                                                <span className={`text-sm font-bold ${getScoreColor(m.scoreGlobal)}`}>{m.scoreGlobal}%</span>
                                            </td>
                                            <td className={`text-center py-2 px-1 text-xs hidden lg:table-cell ${getScoreColor(m.scoreGAR)}`}>{m.scoreGAR}%</td>
                                            <td className={`text-center py-2 px-1 text-xs hidden lg:table-cell ${getScoreColor(m.scorePTM)}`}>{m.scorePTM}%</td>
                                            <td className={`text-center py-2 px-1 text-xs hidden md:table-cell ${getScoreColor(m.scoreReporting)}`}>{m.scoreReporting}%</td>
                                            <td className={`text-center py-2 px-1 text-xs hidden xl:table-cell ${getScoreColor(m.scoreNominations)}`}>{m.scoreNominations}%</td>
                                            <td className={`text-center py-2 px-1 text-xs hidden xl:table-cell ${getScoreColor(m.scoreReactivite)}`}>{m.scoreReactivite}%</td>
                                            <td className="text-center py-2 px-1 text-xs hidden sm:table-cell">
                                                <span className="font-mono">{m.rapportsSoumis}/{m.rapportsTotal}</span>
                                            </td>
                                            <td className="text-center py-2 px-1 hidden sm:table-cell">
                                                {m.tendance === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />}
                                                {m.tendance === 'down' && <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />}
                                                {m.tendance === 'stable' && <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Comparison Panel */}
                {selected.length > 0 && (
                    <Card className="border-2 border-primary/30">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Comparaison ({selected.length} sélectionnés)
                            </CardTitle>
                            <CardDescription>Cliquez sur un ministère dans le tableau pour ajouter/retirer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {selected.map(m => (
                                    <Card key={m.id} className="border-2">
                                        <CardContent className="pt-4 space-y-3">
                                            <div className="text-center">
                                                <Badge className={`${getRankBadge(m.rang)} mb-2`}>#{m.rang}</Badge>
                                                <p className="font-bold text-sm">{m.short}</p>
                                                <p className="text-[10px] text-muted-foreground">{m.name}</p>
                                                <p className={`text-2xl font-bold mt-1 ${getScoreColor(m.scoreGlobal)}`}>{m.scoreGlobal}%</p>
                                            </div>

                                            <div className="space-y-1.5">
                                                {([
                                                    ['GAR', m.scoreGAR],
                                                    ['PTM', m.scorePTM],
                                                    ['Reporting', m.scoreReporting],
                                                    ['Nominations', m.scoreNominations],
                                                    ['Réactivité', m.scoreReactivite],
                                                ] as [string, number][]).map(([label, val]) => (
                                                    <div key={label} className="flex items-center gap-2">
                                                        <span className="text-[10px] text-muted-foreground w-20">{label}</span>
                                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${val >= 85 ? 'bg-green-500' : val >= 70 ? 'bg-blue-500' : val >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                style={{ width: `${val}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-[10px] font-mono w-8 text-right ${getScoreColor(val)}`}>{val}%</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                                                <div>
                                                    <p className="text-xs font-bold">{m.rapportsSoumis}/{m.rapportsTotal}</p>
                                                    <p className="text-[9px] text-muted-foreground">Rapports</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{m.delaiMoyen}j</p>
                                                    <p className="text-[9px] text-muted-foreground">Délai moy.</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{m.pointsFocaux}</p>
                                                    <p className="text-[9px] text-muted-foreground">Pts Focaux</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedIds.length > 0 && (
                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                            Effacer la sélection
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
