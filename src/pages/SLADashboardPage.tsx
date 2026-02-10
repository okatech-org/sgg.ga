/**
 * SGG Digital — Tableau SLA (Service Level Agreements)
 *
 * Suivi des engagements de service :
 *   - SLA par processus gouvernemental
 *   - Taux de respect global et par catégorie
 *   - Historique des violations
 *   - Tendance mensuelle
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Timer, CheckCircle2, AlertTriangle, XCircle,
    TrendingUp, TrendingDown, Minus, Clock,
    FileText, Users, Shield, BarChart3,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type SLAStatus = 'met' | 'at-risk' | 'breached';

interface SLAItem {
    id: string;
    process: string;
    category: string;
    target: string;
    actual: string;
    unit: string;
    complianceRate: number;
    status: SLAStatus;
    trend: 'up' | 'down' | 'stable';
    violations: number;
    lastViolation?: string;
    owner: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<SLAStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    met: { label: 'Respecté', color: 'text-green-600', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    'at-risk': { label: 'À risque', color: 'text-amber-600', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
    breached: { label: 'Violé', color: 'text-red-600', bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const SLA_ITEMS: SLAItem[] = [
    { id: 's1', process: 'Soumission rapport GAR', category: 'Reporting', target: '15', actual: '12', unit: 'jours', complianceRate: 83, status: 'met', trend: 'up', violations: 5, lastViolation: 'MINSANTE - Jan 2026', owner: 'DGA' },
    { id: 's2', process: 'Traitement nomination', category: 'Nominations', target: '30', actual: '42', unit: 'jours', complianceRate: 65, status: 'breached', trend: 'down', violations: 12, lastViolation: 'DG ANPI - Fév 2026', owner: 'DAJ' },
    { id: 's3', process: 'Publication décret', category: 'Juridique', target: '21', actual: '28', unit: 'jours', complianceRate: 72, status: 'at-risk', trend: 'down', violations: 8, lastViolation: 'Décret 2026-019 - Jan 2026', owner: 'DAJ' },
    { id: 's4', process: 'Réponse point focal', category: 'Support', target: '48', actual: '24', unit: 'heures', complianceRate: 92, status: 'met', trend: 'up', violations: 2, owner: 'SGG' },
    { id: 's5', process: 'Validation rapport soumis', category: 'Reporting', target: '5', actual: '4', unit: 'jours', complianceRate: 88, status: 'met', trend: 'stable', violations: 3, owner: 'DGA' },
    { id: 's6', process: 'Incident sécurité résolu', category: 'Sécurité', target: '4', actual: '2.5', unit: 'heures', complianceRate: 95, status: 'met', trend: 'up', violations: 1, owner: 'DSI' },
    { id: 's7', process: 'Onboarding nouveau point focal', category: 'Support', target: '3', actual: '3.5', unit: 'jours', complianceRate: 78, status: 'at-risk', trend: 'stable', violations: 4, owner: 'SGG' },
    { id: 's8', process: 'Consolidation données provinciales', category: 'Reporting', target: '7', actual: '5', unit: 'jours', complianceRate: 85, status: 'met', trend: 'up', violations: 3, owner: 'DGA' },
    { id: 's9', process: 'Publication Journal Officiel', category: 'Juridique', target: '3', actual: '2', unit: 'jours', complianceRate: 97, status: 'met', trend: 'up', violations: 0, owner: 'DPO' },
    { id: 's10', process: 'Audit trimestriel publié', category: 'Performance', target: '15', actual: '12', unit: 'jours', complianceRate: 90, status: 'met', trend: 'up', violations: 1, owner: 'IGS' },
    { id: 's11', process: 'Budget mensuel consolidé', category: 'Budget', target: '10', actual: '14', unit: 'jours', complianceRate: 60, status: 'breached', trend: 'down', violations: 6, lastViolation: 'Jan 2026', owner: 'MBCPFPRE' },
    { id: 's12', process: 'Révision texte réglementaire', category: 'Juridique', target: '10', actual: '8', unit: 'jours', complianceRate: 82, status: 'met', trend: 'stable', violations: 3, owner: 'DAJ' },
];

const MONTHLY_TREND = [
    { month: 'Sep', rate: 76 },
    { month: 'Oct', rate: 78 },
    { month: 'Nov', rate: 80 },
    { month: 'Déc', rate: 79 },
    { month: 'Jan', rate: 82 },
    { month: 'Fév', rate: 84 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function SLADashboardPage() {
    const [catFilter, setCatFilter] = useState('all');

    const filtered = useMemo(() => {
        if (catFilter === 'all') return SLA_ITEMS;
        return SLA_ITEMS.filter(s => s.category === catFilter);
    }, [catFilter]);

    const globalCompliance = Math.round(SLA_ITEMS.reduce((s, i) => s + i.complianceRate, 0) / SLA_ITEMS.length);
    const metCount = SLA_ITEMS.filter(s => s.status === 'met').length;
    const breachedCount = SLA_ITEMS.filter(s => s.status === 'breached').length;
    const totalViolations = SLA_ITEMS.reduce((s, i) => s + i.violations, 0);
    const categories = [...new Set(SLA_ITEMS.map(s => s.category))];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Timer className="h-7 w-7 text-blue-600" />
                            Tableau des SLA
                        </h1>
                        <p className="text-muted-foreground">
                            {SLA_ITEMS.length} engagements de service · Taux global : {globalCompliance}%
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-blue-600">{globalCompliance}%</p>
                            <p className="text-[10px] text-muted-foreground">Conformité globale</p>
                            <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
                                <div className={`h-full rounded-full ${globalCompliance >= 85 ? 'bg-green-500' : globalCompliance >= 70 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${globalCompliance}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{metCount}/{SLA_ITEMS.length}</p><p className="text-[10px] text-muted-foreground">SLA respectés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{breachedCount}</p><p className="text-[10px] text-muted-foreground">SLA violés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{totalViolations}</p><p className="text-[10px] text-muted-foreground">Violations totales</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trend */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" /> Tendance conformité (6 mois)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-1 h-20">
                            {MONTHLY_TREND.map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] font-bold">{m.rate}%</span>
                                    <div className="w-full rounded-t" style={{ height: `${(m.rate - 70) * 3}px`, background: m.rate >= 80 ? '#22c55e' : m.rate >= 75 ? '#f59e0b' : '#ef4444' }} />
                                    <span className="text-[8px] text-muted-foreground">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Tous</Button>
                    {categories.map(c => (
                        <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(c)}>{c}</Button>
                    ))}
                </div>

                {/* SLA Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-[9px] text-muted-foreground bg-muted/30">
                                        <th className="text-left py-2 px-3">Processus</th>
                                        <th className="text-center py-2 px-2">Catégorie</th>
                                        <th className="text-center py-2 px-2">Cible</th>
                                        <th className="text-center py-2 px-2">Réel</th>
                                        <th className="text-center py-2 px-2">Conformité</th>
                                        <th className="text-center py-2 px-2">Statut</th>
                                        <th className="text-center py-2 px-2">Violations</th>
                                        <th className="text-center py-2 px-2">Tendance</th>
                                        <th className="text-left py-2 px-2">Responsable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(sla => {
                                        const cfg = STATUS_CFG[sla.status];
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <tr key={sla.id} className={`border-b hover:bg-muted/20 ${sla.status === 'breached' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                                <td className="py-2.5 px-3 font-medium">{sla.process}</td>
                                                <td className="py-2.5 px-2 text-center">
                                                    <Badge variant="outline" className="text-[8px] h-3.5">{sla.category}</Badge>
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono">≤ {sla.target}{sla.unit === 'heures' ? 'h' : 'j'}</td>
                                                <td className="py-2.5 px-2 text-center font-bold">{sla.actual}{sla.unit === 'heures' ? 'h' : 'j'}</td>
                                                <td className="py-2.5 px-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${sla.complianceRate >= 85 ? 'bg-green-500' : sla.complianceRate >= 70 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${sla.complianceRate}%` }} />
                                                        </div>
                                                        <span className={`text-[9px] font-bold ${cfg.color}`}>{sla.complianceRate}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-2 text-center">
                                                    <Badge className={`text-[8px] h-3.5 ${cfg.bg}`}>
                                                        <StatusIcon className="h-2 w-2 mr-0.5" />{cfg.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 px-2 text-center">
                                                    <span className={`font-bold ${sla.violations > 5 ? 'text-red-600' : sla.violations > 0 ? 'text-amber-600' : 'text-green-600'}`}>{sla.violations}</span>
                                                </td>
                                                <td className="py-2.5 px-2 text-center">
                                                    {sla.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500 mx-auto" /> :
                                                        sla.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500 mx-auto" /> :
                                                            <Minus className="h-3 w-3 text-gray-400 mx-auto" />}
                                                </td>
                                                <td className="py-2.5 px-2 text-[10px] text-muted-foreground">{sla.owner}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Violations */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" /> Violations récentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                        {SLA_ITEMS.filter(s => s.lastViolation).sort((a, b) => b.violations - a.violations).map(sla => (
                            <div key={sla.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/30">
                                <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                                <span className="flex-1">{sla.process}</span>
                                <span className="text-[9px] text-muted-foreground">{sla.lastViolation}</span>
                                <Badge variant="outline" className="text-[8px] h-3.5">{sla.violations} violations</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
