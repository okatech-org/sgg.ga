/**
 * SGG Digital — KPI Builder (Constructeur d'Indicateurs)
 *
 * Création et suivi d'indicateurs de performance personnalisés :
 *   - Bibliothèque de KPIs existants
 *   - Création de nouveaux KPIs
 *   - Visualisation par catégorie
 *   - Alertes de seuils
 *   - Mini-sparklines de tendance
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Target, Plus, TrendingUp, TrendingDown,
    Minus, AlertTriangle, Search, Filter,
    CheckCircle2, XCircle, BarChart3,
    ArrowUp, ArrowDown, Eye, Gauge,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type KPIStatus = 'on-track' | 'at-risk' | 'off-track';
type KPITrend = 'up' | 'down' | 'stable';
type KPICategory = 'GAR' | 'Nominations' | 'Budget' | 'RH' | 'Digital' | 'Performance';

interface KPI {
    id: string;
    name: string;
    description: string;
    category: KPICategory;
    value: number;
    target: number;
    unit: string;
    status: KPIStatus;
    trend: KPITrend;
    sparkline: number[];
    owner: string;
    lastUpdated: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<KPIStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    'on-track': { label: 'En bonne voie', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    'at-risk': { label: 'À risque', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
    'off-track': { label: 'Hors piste', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const CATEGORY_COLORS: Record<KPICategory, string> = {
    GAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Nominations: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Budget: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    RH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Digital: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    Performance: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const CATEGORIES: KPICategory[] = ['GAR', 'Nominations', 'Budget', 'RH', 'Digital', 'Performance'];

// ── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_KPIS: KPI[] = [
    {
        id: 'k1', name: 'Taux de soumission GAR', description: 'Pourcentage de ministères ayant soumis leur rapport GAR',
        category: 'GAR', value: 78, target: 90, unit: '%', status: 'at-risk', trend: 'up',
        sparkline: [45, 52, 60, 65, 68, 72, 75, 78], owner: 'Marie OBAME', lastUpdated: '10 fév',
    },
    {
        id: 'k2', name: 'Score qualité moyen', description: 'Score de qualité moyen des rapports soumis',
        category: 'GAR', value: 82, target: 80, unit: '%', status: 'on-track', trend: 'up',
        sparkline: [70, 72, 74, 76, 78, 79, 81, 82], owner: 'Sylvie MOUSSAVOU', lastUpdated: '10 fév',
    },
    {
        id: 'k3', name: 'Nominations traitées', description: 'Nombre de nominations traitées ce trimestre',
        category: 'Nominations', value: 45, target: 60, unit: 'dossiers', status: 'at-risk', trend: 'up',
        sparkline: [8, 15, 22, 28, 33, 38, 42, 45], owner: 'Jean NZE', lastUpdated: '9 fév',
    },
    {
        id: 'k4', name: 'Délai moyen de traitement', description: 'Délai moyen de traitement des nominations',
        category: 'Nominations', value: 12, target: 7, unit: 'jours', status: 'off-track', trend: 'down',
        sparkline: [18, 16, 15, 14, 14, 13, 12, 12], owner: 'Jean NZE', lastUpdated: '9 fév',
    },
    {
        id: 'k5', name: 'Exécution budgétaire', description: 'Taux d\'exécution du budget de fonctionnement',
        category: 'Budget', value: 42, target: 50, unit: '%', status: 'at-risk', trend: 'up',
        sparkline: [8, 14, 20, 25, 30, 34, 38, 42], owner: 'Paul ABIAGA', lastUpdated: '8 fév',
    },
    {
        id: 'k6', name: 'Engagements traités', description: 'Montant des engagements budgétaires traités',
        category: 'Budget', value: 285, target: 400, unit: 'MdF CFA', status: 'on-track', trend: 'up',
        sparkline: [50, 90, 130, 160, 195, 230, 260, 285], owner: 'Paul ABIAGA', lastUpdated: '10 fév',
    },
    {
        id: 'k7', name: 'Effectifs numérisés', description: 'Agents avec profil numérique complet',
        category: 'RH', value: 2450, target: 3000, unit: 'agents', status: 'on-track', trend: 'up',
        sparkline: [1800, 1950, 2050, 2150, 2250, 2300, 2380, 2450], owner: 'Françoise ELLA', lastUpdated: '10 fév',
    },
    {
        id: 'k8', name: 'Taux de formation', description: 'Points focaux formés à la plateforme',
        category: 'RH', value: 85, target: 100, unit: '%', status: 'on-track', trend: 'up',
        sparkline: [40, 50, 58, 65, 70, 75, 80, 85], owner: 'Françoise ELLA', lastUpdated: '9 fév',
    },
    {
        id: 'k9', name: 'Couverture numérique', description: 'Provinces connectées à la plateforme SGG',
        category: 'Digital', value: 7, target: 9, unit: 'provinces', status: 'at-risk', trend: 'stable',
        sparkline: [3, 4, 4, 5, 5, 6, 7, 7], owner: 'Rose MABIKA', lastUpdated: '7 fév',
    },
    {
        id: 'k10', name: 'Disponibilité plateforme', description: 'Uptime de la plateforme SGG Digital',
        category: 'Digital', value: 99.7, target: 99.5, unit: '%', status: 'on-track', trend: 'stable',
        sparkline: [99.2, 99.4, 99.5, 99.6, 99.5, 99.7, 99.6, 99.7], owner: 'Équipe Tech', lastUpdated: '10 fév',
    },
    {
        id: 'k11', name: 'Score composite national', description: 'Score de performance globale du gouvernement',
        category: 'Performance', value: 72, target: 80, unit: '%', status: 'at-risk', trend: 'up',
        sparkline: [55, 58, 62, 64, 67, 69, 71, 72], owner: 'Albert NDONG', lastUpdated: '10 fév',
    },
    {
        id: 'k12', name: 'Projets PAG bouclés', description: 'Projets du PAG 2026 achevés',
        category: 'Performance', value: 18, target: 50, unit: 'projets', status: 'on-track', trend: 'up',
        sparkline: [2, 5, 7, 9, 11, 13, 16, 18], owner: 'Albert NDONG', lastUpdated: '10 fév',
    },
];

// ── Sparkline Component ─────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const h = 24;
    const w = 64;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
        <svg width={w} height={h} className="shrink-0">
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

// ── Component ───────────────────────────────────────────────────────────────

export default function KPIBuilderPage() {
    const [kpis] = useState(INITIAL_KPIS);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState<KPICategory | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<KPIStatus | 'all'>('all');

    const filtered = useMemo(() => {
        return kpis.filter(k => {
            if (catFilter !== 'all' && k.category !== catFilter) return false;
            if (statusFilter !== 'all' && k.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!k.name.toLowerCase().includes(q) && !k.description.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [kpis, search, catFilter, statusFilter]);

    const onTrack = kpis.filter(k => k.status === 'on-track').length;
    const atRisk = kpis.filter(k => k.status === 'at-risk').length;
    const offTrack = kpis.filter(k => k.status === 'off-track').length;
    const avgProgress = Math.round(kpis.reduce((s, k) => s + Math.min(100, (k.value / k.target) * 100), 0) / kpis.length);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Target className="h-7 w-7 text-rose-600" />
                            KPI Builder
                        </h1>
                        <p className="text-muted-foreground">
                            {kpis.length} indicateurs · {avgProgress}% de progression moyenne
                        </p>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => toast({ title: '🎯 Création KPI', description: 'Fonctionnalité disponible prochainement' })}>
                        <Plus className="h-4 w-4" /> Nouvel Indicateur
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-green-600">{onTrack}</p>
                        <p className="text-[10px] text-muted-foreground">En bonne voie</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-amber-600">{atRisk}</p>
                        <p className="text-[10px] text-muted-foreground">À risque</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-red-600">{offTrack}</p>
                        <p className="text-[10px] text-muted-foreground">Hors piste</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{avgProgress}%</p>
                        <p className="text-[10px] text-muted-foreground">Progression moy.</p>
                    </CardContent></Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un KPI..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Tous</Button>
                        {CATEGORIES.map(cat => (
                            <Button key={cat} variant={catFilter === cat ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(cat)}>{cat}</Button>
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {(Object.entries(STATUS_CONFIG) as [KPIStatus, typeof STATUS_CONFIG['on-track']][]).map(([key, conf]) => {
                            const Icon = conf.icon;
                            return (
                                <Button key={key} variant={statusFilter === key ? 'default' : 'outline'} size="sm" className="text-xs h-7 gap-1" onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}>
                                    <Icon className="h-3 w-3" />
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(kpi => {
                        const progress = Math.min(100, Math.round((kpi.value / kpi.target) * 100));
                        const statusConf = STATUS_CONFIG[kpi.status];
                        const StatusIcon = statusConf.icon;
                        const sparkColor = kpi.status === 'on-track' ? '#22c55e' : kpi.status === 'at-risk' ? '#f59e0b' : '#ef4444';
                        return (
                            <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-sm">{kpi.name}</CardTitle>
                                            <CardDescription className="text-[10px] mt-0.5">{kpi.description}</CardDescription>
                                        </div>
                                        <Badge className={`text-[9px] h-4 shrink-0 ${CATEGORY_COLORS[kpi.category]}`}>{kpi.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Value + Trend + Sparkline */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold">{kpi.value}</span>
                                            <span className="text-xs text-muted-foreground">/ {kpi.target} {kpi.unit}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sparkline data={kpi.sparkline} color={sparkColor} />
                                            {kpi.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                                            {kpi.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                                            {kpi.trend === 'stable' && <Minus className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                            <span>Progression</span>
                                            <span className="font-semibold">{progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${kpi.status === 'on-track' ? 'bg-green-500' : kpi.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
                                                }`} style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <Badge className={`text-[9px] h-4 gap-0.5 ${statusConf.color}`}>
                                            <StatusIcon className="h-2.5 w-2.5" /> {statusConf.label}
                                        </Badge>
                                        <span className="text-[9px] text-muted-foreground">{kpi.owner} · {kpi.lastUpdated}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun KPI ne correspond aux filtres</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
