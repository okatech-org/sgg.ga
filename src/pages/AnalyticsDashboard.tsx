/**
 * SGG Digital — Dashboard Analytics Avancé
 *
 * Visualisations graphiques pour les métriques de gouvernance :
 *   - Soumissions/validations par mois (Area chart)
 *   - Répartition par statut (Pie chart)
 *   - Performance par institution (Bar chart)
 *   - KPI cards avec tendances
 *   - Filtrage par période
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart2, TrendingUp, TrendingDown, ArrowRight,
    Calendar, Download, RefreshCw, Target,
    Users, FileText, CheckCircle2, Clock,
    Building2, Zap,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';
import { usePDFExport } from '@/services/pdfExport';

// ── Mock Data ───────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
    { mois: 'Sep', soumissions: 42, validations: 38, rejets: 4 },
    { mois: 'Oct', soumissions: 56, validations: 48, rejets: 6 },
    { mois: 'Nov', soumissions: 61, validations: 55, rejets: 5 },
    { mois: 'Dec', soumissions: 45, validations: 41, rejets: 3 },
    { mois: 'Jan', soumissions: 72, validations: 64, rejets: 7 },
    { mois: 'Fév', soumissions: 68, validations: 58, rejets: 8 },
];

const STATUS_DATA = [
    { name: 'Validés', value: 304, color: '#22c55e' },
    { name: 'En cours', value: 45, color: '#3b82f6' },
    { name: 'En attente', value: 23, color: '#f59e0b' },
    { name: 'Rejetés', value: 33, color: '#ef4444' },
];

const INSTITUTION_DATA = [
    { nom: 'MINFI', score: 94, rapports: 12, valides: 11 },
    { nom: 'MINSANTE', score: 87, rapports: 10, valides: 8 },
    { nom: 'MINTP', score: 82, rapports: 8, valides: 7 },
    { nom: 'MINEDUC', score: 78, rapports: 11, valides: 8 },
    { nom: 'MINTRAV', score: 75, rapports: 9, valides: 6 },
    { nom: 'MINCOM', score: 71, rapports: 7, valides: 5 },
    { nom: 'MINEHA', score: 68, rapports: 6, valides: 4 },
    { nom: 'MINPB', score: 65, rapports: 8, valides: 5 },
];

const WORKFLOW_STATS = [
    { type: 'Décrets', total: 24, approuves: 18, enCours: 4, rejetes: 2, tempsJours: 8.2 },
    { type: 'Nominations', total: 36, approuves: 28, enCours: 6, rejetes: 2, tempsJours: 12.5 },
    { type: 'Rapports GAR', total: 156, approuves: 134, enCours: 16, rejetes: 6, tempsJours: 5.1 },
    { type: 'Textes Lég.', total: 12, approuves: 8, enCours: 3, rejetes: 1, tempsJours: 21.3 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
    const [period, setPeriod] = useState<'6m' | '3m' | '1m'>('6m');
    const { exportBySelector, isExporting } = usePDFExport();

    const displayData = useMemo(() => {
        if (period === '3m') return MONTHLY_DATA.slice(-3);
        if (period === '1m') return MONTHLY_DATA.slice(-1);
        return MONTHLY_DATA;
    }, [period]);

    const kpis = useMemo(() => {
        const totalSoumissions = MONTHLY_DATA.reduce((s, m) => s + m.soumissions, 0);
        const totalValidations = MONTHLY_DATA.reduce((s, m) => s + m.validations, 0);
        const totalRejets = MONTHLY_DATA.reduce((s, m) => s + m.rejets, 0);
        const tauxValidation = Math.round((totalValidations / totalSoumissions) * 100);
        const avgInstitScore = Math.round(INSTITUTION_DATA.reduce((s, i) => s + i.score, 0) / INSTITUTION_DATA.length);

        return [
            {
                title: 'Total Soumissions',
                value: totalSoumissions.toLocaleString('fr-FR'),
                trend: '+12.5%',
                trendUp: true,
                icon: FileText,
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
            },
            {
                title: 'Taux de Validation',
                value: `${tauxValidation}%`,
                trend: '+3.2%',
                trendUp: true,
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50 dark:bg-green-950/30',
            },
            {
                title: 'Délai Moyen',
                value: '8.4j',
                trend: '-1.2j',
                trendUp: true,
                icon: Clock,
                color: 'text-orange-600',
                bg: 'bg-orange-50 dark:bg-orange-950/30',
            },
            {
                title: 'Score Moyen',
                value: `${avgInstitScore}/100`,
                trend: '+4pts',
                trendUp: true,
                icon: Target,
                color: 'text-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-950/30',
            },
        ];
    }, []);

    const handleExportPDF = () => {
        exportBySelector('#analytics-content', {
            filename: `sgg-analytics-${new Date().toISOString().split('T')[0]}`,
            title: 'SGG Digital — Tableau de Bord Analytique',
        });
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div id="analytics-content" className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <BarChart2 className="h-7 w-7 text-indigo-600" />
                            Tableau de Bord Analytique
                        </h1>
                        <p className="text-muted-foreground">
                            Indicateurs de performance et métriques de gouvernance
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex rounded-lg border overflow-hidden">
                            {(['6m', '3m', '1m'] as const).map(p => (
                                <Button
                                    key={p}
                                    variant={period === p ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setPeriod(p)}
                                    className="rounded-none h-8 text-xs"
                                >
                                    {p === '6m' ? '6 mois' : p === '3m' ? '3 mois' : '1 mois'}
                                </Button>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" className="gap-1" onClick={handleExportPDF} disabled={isExporting}>
                            <Download className="h-4 w-4" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(kpi => (
                        <Card key={kpi.title} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${kpi.bg}`}>
                                        <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trendUp ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {kpi.trend}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row 1: Area + Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area Chart — Submissions over time */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Évolution des soumissions</CardTitle>
                            <CardDescription>Soumissions vs validations par mois</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={displayData}>
                                    <defs>
                                        <linearGradient id="gradSoumissions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradValidations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="mois" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="soumissions" stroke="#3b82f6" fill="url(#gradSoumissions)" strokeWidth={2} name="Soumissions" />
                                    <Area type="monotone" dataKey="validations" stroke="#22c55e" fill="url(#gradValidations)" strokeWidth={2} name="Validations" />
                                    <Area type="monotone" dataKey="rejets" stroke="#ef4444" fill="none" strokeDasharray="5 5" strokeWidth={1.5} name="Rejets" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pie Chart — Status distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Répartition par statut</CardTitle>
                            <CardDescription>État actuel des dossiers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={STATUS_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {STATUS_DATA.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                        formatter={(value: number) => [`${value} dossiers`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {STATUS_DATA.map(s => (
                                    <div key={s.name} className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span>{s.name}: <strong>{s.value}</strong></span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2: Institution Bar + Workflow Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart — Institution scores */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-teal-600" />
                                Performance par Institution
                            </CardTitle>
                            <CardDescription>Score GAR sur 100</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={INSTITUTION_DATA} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                                    <YAxis type="category" dataKey="nom" width={70} className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                        formatter={(value: number) => [`${value}/100`, 'Score']}
                                    />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {INSTITUTION_DATA.map((entry, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={entry.score >= 80 ? '#22c55e' : entry.score >= 70 ? '#f59e0b' : '#ef4444'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Workflow Stats Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-600" />
                                Workflows par Type
                            </CardTitle>
                            <CardDescription>Statistiques des circuits d'approbation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-xs text-muted-foreground">
                                            <th className="py-2 px-3 text-left font-medium">Type</th>
                                            <th className="py-2 px-3 text-center font-medium">Total</th>
                                            <th className="py-2 px-3 text-center font-medium">
                                                <CheckCircle2 className="h-3 w-3 inline text-green-500" />
                                            </th>
                                            <th className="py-2 px-3 text-center font-medium">
                                                <Clock className="h-3 w-3 inline text-blue-500" />
                                            </th>
                                            <th className="py-2 px-3 text-center font-medium">Délai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {WORKFLOW_STATS.map(wf => (
                                            <tr key={wf.type} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-3 font-medium">{wf.type}</td>
                                                <td className="py-3 px-3 text-center">{wf.total}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className="text-green-600 font-medium">{wf.approuves}</span>
                                                    <span className="text-[10px] text-muted-foreground ml-0.5">
                                                        ({Math.round((wf.approuves / wf.total) * 100)}%)
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center text-blue-600 font-medium">{wf.enCours}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <Badge variant="secondary" className={`text-[10px] ${wf.tempsJours <= 7 ? 'bg-green-100 text-green-700' :
                                                        wf.tempsJours <= 14 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {wf.tempsJours}j
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="mt-4 p-3 rounded-lg bg-muted/30 grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p className="text-lg font-bold">{WORKFLOW_STATS.reduce((s, w) => s + w.total, 0)}</p>
                                    <p className="text-[10px] text-muted-foreground">Total Workflows</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-green-600">
                                        {Math.round((WORKFLOW_STATS.reduce((s, w) => s + w.approuves, 0) / WORKFLOW_STATS.reduce((s, w) => s + w.total, 0)) * 100)}%
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">Taux Approbation</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold">
                                        {(WORKFLOW_STATS.reduce((s, w) => s + w.tempsJours, 0) / WORKFLOW_STATS.length).toFixed(1)}j
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">Délai Moyen</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
