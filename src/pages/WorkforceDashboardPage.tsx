/**
 * SGG Digital — Tableau des Effectifs
 *
 * Vue consolidée des ressources humaines de la Fonction Publique :
 *   - Effectifs par ministère
 *   - Répartition par catégorie, genre, tranche d'âge
 *   - Postes vacants
 *   - Masse salariale
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    UsersRound, UserCheck, UserX, Briefcase,
    TrendingUp, DollarSign, BarChart3,
    PieChart as PieIcon,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface MinistryWorkforce {
    ministry: string;
    abbrev: string;
    total: number;
    active: number;
    vacant: number;
    women: number;
    avgAge: number;
    salaryMass: number; // Mds FCFA
    catA: number; catB: number; catC: number;
}

const GLOBAL = {
    totalAgents: 72_540,
    activeAgents: 68_230,
    vacantPosts: 4_310,
    womenRatio: 38,
    avgAge: 42,
    totalSalary: 580, // Mds FCFA
};

const MINISTRIES: MinistryWorkforce[] = [
    { ministry: 'Éducation Nationale', abbrev: 'MENETP', total: 18500, active: 17200, vacant: 1300, women: 42, avgAge: 39, salaryMass: 148, catA: 3200, catB: 8500, catC: 6800 },
    { ministry: 'Santé', abbrev: 'MINSANTE', total: 12800, active: 11900, vacant: 900, women: 55, avgAge: 40, salaryMass: 102, catA: 2800, catB: 5200, catC: 4800 },
    { ministry: 'Défense', abbrev: 'MINDEF', total: 8500, active: 8200, vacant: 300, women: 12, avgAge: 35, salaryMass: 85, catA: 1200, catB: 3800, catC: 3500 },
    { ministry: 'Finances', abbrev: 'MINEFI', total: 5200, active: 4900, vacant: 300, women: 35, avgAge: 44, salaryMass: 52, catA: 1500, catB: 2200, catC: 1500 },
    { ministry: 'Justice', abbrev: 'MINJUSTICE', total: 4800, active: 4500, vacant: 300, women: 40, avgAge: 45, salaryMass: 48, catA: 1800, catB: 1800, catC: 1200 },
    { ministry: 'Transports', abbrev: 'MINTRANS', total: 3800, active: 3500, vacant: 300, women: 28, avgAge: 43, salaryMass: 30, catA: 800, catB: 1500, catC: 1500 },
    { ministry: 'Intérieur', abbrev: 'MININTERIEUR', total: 6200, active: 5900, vacant: 300, women: 22, avgAge: 41, salaryMass: 50, catA: 1100, catB: 2800, catC: 2300 },
    { ministry: 'Économie Numérique', abbrev: 'MTNHDN', total: 1200, active: 1100, vacant: 100, women: 40, avgAge: 36, salaryMass: 12, catA: 450, catB: 450, catC: 300 },
    { ministry: 'Secrétariat Général', abbrev: 'SGG', total: 850, active: 820, vacant: 30, women: 45, avgAge: 42, salaryMass: 8.5, catA: 350, catB: 300, catC: 200 },
    { ministry: 'Affaires Étrangères', abbrev: 'MAECICPG', total: 2400, active: 2200, vacant: 200, women: 38, avgAge: 46, salaryMass: 24, catA: 900, catB: 800, catC: 700 },
];

const AGE_DISTRIBUTION = [
    { range: '20-29', count: 8500, pct: 12 },
    { range: '30-39', count: 18700, pct: 26 },
    { range: '40-49', count: 22100, pct: 31 },
    { range: '50-59', count: 17800, pct: 25 },
    { range: '60+', count: 5440, pct: 7 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function WorkforceDashboardPage() {
    const [sortBy, setSortBy] = useState<'total' | 'vacant' | 'women' | 'salary'>('total');

    const sorted = [...MINISTRIES].sort((a, b) => {
        if (sortBy === 'total') return b.total - a.total;
        if (sortBy === 'vacant') return b.vacant - a.vacant;
        if (sortBy === 'women') return b.women - a.women;
        return b.salaryMass - a.salaryMass;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <UsersRound className="h-7 w-7 text-indigo-600" />
                            Tableau des Effectifs
                        </h1>
                        <p className="text-muted-foreground">
                            Fonction Publique gabonaise · {GLOBAL.totalAgents.toLocaleString()} agents
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Référentiel RH · Fév 2026</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-indigo-500" />
                            <div><p className="text-lg font-bold text-indigo-600">{GLOBAL.activeAgents.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Agents actifs</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <UserX className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.vacantPosts.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Postes vacants</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.womenRatio}%</p><p className="text-[10px] text-muted-foreground">Femmes</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            <div><p className="text-lg font-bold text-emerald-600">{GLOBAL.totalSalary}</p><p className="text-[10px] text-muted-foreground">Masse salariale (Mds)</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Age Distribution */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-500" /> Pyramide des âges</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                            {AGE_DISTRIBUTION.map((age, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className="w-10 text-right text-muted-foreground">{age.range}</span>
                                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${age.pct * 3}%` }} />
                                    </div>
                                    <span className="w-16 text-right text-[9px]">{age.count.toLocaleString()} ({age.pct}%)</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Category Split */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4 text-emerald-500" /> Par catégorie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {[
                                { cat: 'Catégorie A (Cadres)', count: MINISTRIES.reduce((s, m) => s + m.catA, 0), color: 'bg-blue-500' },
                                { cat: 'Catégorie B (Agents de maîtrise)', count: MINISTRIES.reduce((s, m) => s + m.catB, 0), color: 'bg-amber-500' },
                                { cat: 'Catégorie C (Agents d\'exécution)', count: MINISTRIES.reduce((s, m) => s + m.catC, 0), color: 'bg-green-500' },
                            ].map((c, i) => {
                                const pct = Math.round(c.count / GLOBAL.totalAgents * 100);
                                return (
                                    <div key={i} className="mb-2">
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                            <span>{c.cat}</span>
                                            <span className="font-bold">{c.count.toLocaleString()} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${c.color}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Gender & Age Summary */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Indicateurs clés</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="p-2 bg-muted/50 rounded text-center">
                                <p className="text-lg font-bold text-indigo-600">{GLOBAL.avgAge} ans</p>
                                <p className="text-[9px] text-muted-foreground">Âge moyen</p>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                                <p className="text-[10px] font-bold mb-1">Parité hommes / femmes</p>
                                <div className="h-3 rounded-full overflow-hidden flex">
                                    <div className="bg-blue-500 h-full" style={{ width: `${100 - GLOBAL.womenRatio}%` }} />
                                    <div className="bg-pink-500 h-full" style={{ width: `${GLOBAL.womenRatio}%` }} />
                                </div>
                                <div className="flex justify-between text-[9px] mt-0.5">
                                    <span>Hommes {100 - GLOBAL.womenRatio}%</span>
                                    <span>Femmes {GLOBAL.womenRatio}%</span>
                                </div>
                            </div>
                            <div className="p-2 bg-muted/50 rounded text-center">
                                <p className="text-lg font-bold text-red-600">{Math.round(GLOBAL.vacantPosts / GLOBAL.totalAgents * 100)}%</p>
                                <p className="text-[9px] text-muted-foreground">Taux de vacance</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sort */}
                <div className="flex gap-1">
                    {[
                        { key: 'total' as const, label: 'Effectif' },
                        { key: 'vacant' as const, label: 'Postes vacants' },
                        { key: 'women' as const, label: '% Femmes' },
                        { key: 'salary' as const, label: 'Masse salariale' },
                    ].map(s => (
                        <Button key={s.key} variant={sortBy === s.key ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setSortBy(s.key)}>{s.label}</Button>
                    ))}
                </div>

                {/* Ministry Table */}
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Ministère</th>
                                    <th className="text-center py-2 px-2">Total</th>
                                    <th className="text-center py-2 px-2">Actifs</th>
                                    <th className="text-center py-2 px-2">Vacants</th>
                                    <th className="text-center py-2 px-2">% Femmes</th>
                                    <th className="text-center py-2 px-2">Âge moy.</th>
                                    <th className="text-center py-2 px-2">Cat. A/B/C</th>
                                    <th className="text-center py-2 px-2">Masse sal.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(m => (
                                    <tr key={m.abbrev} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3">
                                            <p className="font-bold">{m.abbrev}</p>
                                            <p className="text-[8px] text-muted-foreground">{m.ministry}</p>
                                        </td>
                                        <td className="text-center py-2 px-2 font-bold">{m.total.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">{m.active.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2"><span className={m.vacant > 500 ? 'text-red-600 font-bold' : ''}>{m.vacant}</span></td>
                                        <td className="text-center py-2 px-2">
                                            <span className={m.women >= 40 ? 'text-green-600' : m.women >= 30 ? 'text-amber-600' : 'text-red-600'}>{m.women}%</span>
                                        </td>
                                        <td className="text-center py-2 px-2">{m.avgAge}</td>
                                        <td className="text-center py-2 px-2 text-[9px]">{m.catA}/{m.catB}/{m.catC}</td>
                                        <td className="text-center py-2 px-2 font-mono">{m.salaryMass}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
