/**
 * SGG Digital — Tableau Comparatif Multi-Périodes
 *
 * Comparaison de données entre périodes ou entités :
 *   - Sélection T1/T2/T3/T4 ou annuel
 *   - Comparaison côte à côte
 *   - Écarts et variations en %
 *   - Codes couleur performance
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    GitCompareArrows, TrendingUp, TrendingDown,
    Minus, ArrowRight, Calendar,
    BarChart3, Download,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type Period = 'T1' | 'T2' | 'T3' | 'T4';

interface MetricRow {
    label: string;
    category: string;
    unit: string;
    values: Record<Period, number>;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const METRICS: MetricRow[] = [
    { label: 'Taux de soumission GAR', category: 'GAR', unit: '%', values: { T1: 45, T2: 62, T3: 75, T4: 78 } },
    { label: 'Rapports conformes', category: 'GAR', unit: 'rapports', values: { T1: 12, T2: 18, T3: 24, T4: 28 } },
    { label: 'Score qualité moyen', category: 'GAR', unit: '%', values: { T1: 68, T2: 72, T3: 78, T4: 82 } },
    { label: 'Nominations traitées', category: 'Nominations', unit: 'dossiers', values: { T1: 15, T2: 22, T3: 35, T4: 45 } },
    { label: 'Délai moyen traitement', category: 'Nominations', unit: 'jours', values: { T1: 18, T2: 15, T3: 13, T4: 12 } },
    { label: 'Exécution budgétaire', category: 'Budget', unit: '%', values: { T1: 12, T2: 28, T3: 42, T4: 65 } },
    { label: 'Engagements (MdF CFA)', category: 'Budget', unit: 'MdF', values: { T1: 85, T2: 165, T3: 285, T4: 380 } },
    { label: 'Agents numérisés', category: 'RH', unit: 'agents', values: { T1: 1800, T2: 2050, T3: 2300, T4: 2450 } },
    { label: 'Points focaux formés', category: 'RH', unit: '%', values: { T1: 40, T2: 58, T3: 75, T4: 85 } },
    { label: 'Provinces connectées', category: 'Digital', unit: 'provinces', values: { T1: 4, T2: 5, T3: 6, T4: 7 } },
    { label: 'Disponibilité plateforme', category: 'Digital', unit: '%', values: { T1: 98.5, T2: 99.2, T3: 99.5, T4: 99.7 } },
    { label: 'Score composite national', category: 'Performance', unit: '%', values: { T1: 55, T2: 62, T3: 68, T4: 72 } },
    { label: 'Projets PAG achevés', category: 'Performance', unit: 'projets', values: { T1: 5, T2: 9, T3: 14, T4: 18 } },
    { label: 'Publications J.O.', category: 'J.O.', unit: 'textes', values: { T1: 42, T2: 38, T3: 55, T4: 48 } },
    { label: 'Décrets signés', category: 'J.O.', unit: 'décrets', values: { T1: 12, T2: 15, T3: 18, T4: 14 } },
];

const PERIODS: Period[] = ['T1', 'T2', 'T3', 'T4'];
const CATEGORIES = [...new Set(METRICS.map(m => m.category))];
const PERIOD_LABELS: Record<Period, string> = { T1: 'Janv-Mars', T2: 'Avr-Juin', T3: 'Juil-Sep', T4: 'Oct-Déc' };

// ── Component ───────────────────────────────────────────────────────────────

export default function ComparisonPage() {
    const [periodA, setPeriodA] = useState<Period>('T3');
    const [periodB, setPeriodB] = useState<Period>('T4');
    const [catFilter, setCatFilter] = useState('all');

    const filtered = useMemo(() => {
        if (catFilter === 'all') return METRICS;
        return METRICS.filter(m => m.category === catFilter);
    }, [catFilter]);

    // Calculate deltas
    const deltas = useMemo(() => {
        return filtered.map(m => {
            const a = m.values[periodA];
            const b = m.values[periodB];
            const diff = b - a;
            const pct = a !== 0 ? Math.round((diff / a) * 100) : 0;
            // For "Délai moyen", lower is better
            const isInverse = m.label.includes('Délai');
            const isPositive = isInverse ? diff < 0 : diff > 0;
            return { ...m, a, b, diff, pct, isPositive, isNeutral: diff === 0 };
        });
    }, [filtered, periodA, periodB]);

    const improved = deltas.filter(d => d.isPositive).length;
    const degraded = deltas.filter(d => !d.isPositive && !d.isNeutral).length;
    const stable = deltas.filter(d => d.isNeutral).length;

    const exportCSV = () => {
        const header = `Indicateur,Catégorie,${periodA} (${PERIOD_LABELS[periodA]}),${periodB} (${PERIOD_LABELS[periodB]}),Écart,Variation %\n`;
        const rows = deltas.map(d => `"${d.label}","${d.category}",${d.a},${d.b},${d.diff > 0 ? '+' : ''}${d.diff},${d.pct > 0 ? '+' : ''}${d.pct}%`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `comparaison_${periodA}_vs_${periodB}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast({ title: '📥 Export CSV téléchargé' });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GitCompareArrows className="h-7 w-7 text-orange-600" />
                            Tableau Comparatif
                        </h1>
                        <p className="text-muted-foreground">
                            {METRICS.length} indicateurs · {CATEGORIES.length} catégories · Année 2025-2026
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                {/* Period Selector */}
                <Card>
                    <CardContent className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold">Période A :</span>
                            <div className="flex gap-1">
                                {PERIODS.map(p => (
                                    <Button key={`a-${p}`} variant={periodA === p ? 'default' : 'outline'} size="sm" className="text-xs h-7 w-10" onClick={() => setPeriodA(p)}>{p}</Button>
                                ))}
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold">Période B :</span>
                            <div className="flex gap-1">
                                {PERIODS.map(p => (
                                    <Button key={`b-${p}`} variant={periodB === p ? 'default' : 'outline'} size="sm" className="text-xs h-7 w-10" onClick={() => setPeriodB(p)}>{p}</Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-green-600">{improved}</p>
                        <p className="text-[10px] text-muted-foreground">Améliorés</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-red-600">{degraded}</p>
                        <p className="text-[10px] text-muted-foreground">Dégradés</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-gray-600">{stable}</p>
                        <p className="text-[10px] text-muted-foreground">Stables</p>
                    </CardContent></Card>
                </div>

                {/* Category Filter */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Tous</Button>
                    {CATEGORIES.map(cat => (
                        <Button key={cat} variant={catFilter === cat ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(cat)}>{cat}</Button>
                    ))}
                </div>

                {/* Comparison Table */}
                <Card>
                    <CardContent className="p-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 p-3 border-b bg-muted/30 text-[10px] font-semibold text-muted-foreground">
                            <div className="col-span-4">Indicateur</div>
                            <div className="col-span-1 text-center">Cat.</div>
                            <div className="col-span-2 text-center">{periodA} ({PERIOD_LABELS[periodA]})</div>
                            <div className="col-span-2 text-center">{periodB} ({PERIOD_LABELS[periodB]})</div>
                            <div className="col-span-1 text-center">Écart</div>
                            <div className="col-span-2 text-center">Variation</div>
                        </div>

                        {/* Table Body */}
                        {deltas.map((d, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-muted/20 transition-colors items-center text-xs">
                                <div className="col-span-4">
                                    <p className="font-semibold text-xs">{d.label}</p>
                                    <p className="text-[9px] text-muted-foreground">{d.unit}</p>
                                </div>
                                <div className="col-span-1 text-center">
                                    <Badge variant="outline" className="text-[8px] h-3.5">{d.category}</Badge>
                                </div>
                                <div className="col-span-2 text-center font-mono">{d.a}</div>
                                <div className="col-span-2 text-center font-mono font-bold">{d.b}</div>
                                <div className={`col-span-1 text-center font-mono font-semibold ${d.isPositive ? 'text-green-600' : d.isNeutral ? 'text-gray-400' : 'text-red-600'}`}>
                                    {d.diff > 0 ? '+' : ''}{d.diff}
                                </div>
                                <div className="col-span-2 flex items-center justify-center gap-1">
                                    {d.isPositive ? (
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] gap-0.5">
                                            <TrendingUp className="h-2.5 w-2.5" />{d.pct > 0 ? '+' : ''}{d.pct}%
                                        </Badge>
                                    ) : d.isNeutral ? (
                                        <Badge variant="outline" className="text-[10px] gap-0.5">
                                            <Minus className="h-2.5 w-2.5" />0%
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] gap-0.5">
                                            <TrendingDown className="h-2.5 w-2.5" />{d.pct}%
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
