/**
 * SGG Digital — Mines & Géologie
 *
 * Suivi du secteur minier national :
 *   - Production minière (manganèse, or, fer)
 *   - Permis et concessions
 *   - Opérateurs miniers
 *   - Contribution économique
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Mountain, Factory, MapPin, TrendingUp,
    DollarSign, Users, BarChart3, Pickaxe,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface MiningOperator {
    name: string;
    nationality: string;
    mineral: string;
    site: string;
    province: string;
    production: string;
    employees: number;
    status: 'exploitation' | 'exploration' | 'développement';
}

interface MineralResource {
    name: string;
    reserves: string;
    production2025: string;
    exportValue: number; // Mds FCFA
    worldRank: string;
    trend: 'up' | 'down' | 'stable';
}

const GLOBAL = {
    miningGDP: 6.5, // %
    miningRevenue: 850, // Mds FCFA
    activeMines: 12,
    explorationPermits: 185,
    exploitationPermits: 28,
    employeesTotal: 8_500,
    manganeseProduction: 11_200_000, // tonnes
    manganeseWorldRank: 2,
};

const MINERALS: MineralResource[] = [
    { name: 'Manganèse', reserves: '250 Mt', production2025: '11.2 Mt', exportValue: 680, worldRank: '2e mondial', trend: 'up' },
    { name: 'Or', reserves: '120 t estimées', production2025: '1.8 t', exportValue: 85, worldRank: '—', trend: 'up' },
    { name: 'Fer (Bélinga)', reserves: '1 000 Mt', production2025: '0 (projet)', exportValue: 0, worldRank: 'Potentiel top 10', trend: 'stable' },
    { name: 'Niobium', reserves: '40 Mt', production2025: '12 000 t', exportValue: 28, worldRank: 'Top 5', trend: 'up' },
    { name: 'Terres rares', reserves: 'En exploration', production2025: '0', exportValue: 0, worldRank: 'Potentiel', trend: 'stable' },
    { name: 'Diamant', reserves: '500 000 ct estimés', production2025: '4 200 ct', exportValue: 8, worldRank: '—', trend: 'down' },
];

const OPERATORS: MiningOperator[] = [
    { name: 'COMILOG (Eramet)', nationality: 'France', mineral: 'Manganèse', site: 'Moanda', province: 'Haut-Ogooué', production: '7.5 Mt/an', employees: 3_200, status: 'exploitation' },
    { name: 'Nouvelle Gabon Mining (CICMHZ)', nationality: 'Chine', mineral: 'Manganèse', site: 'Ndjolé / Bembélé', province: 'Moyen-Ogooué', production: '2.2 Mt/an', employees: 1_800, status: 'exploitation' },
    { name: 'Gabon Mining Corp', nationality: 'Inde', mineral: 'Manganèse', site: 'Franceville Nord', province: 'Haut-Ogooué', production: '1.5 Mt/an', employees: 650, status: 'exploitation' },
    { name: 'Managem (via Reminac)', nationality: 'Maroc', mineral: 'Or', site: 'Etéké', province: 'Ngounié', production: '1.2 t/an', employees: 420, status: 'exploitation' },
    { name: 'Ivindo Iron (Sundance)', nationality: 'Australie', mineral: 'Fer', site: 'Bélinga', province: 'Ogooué-Ivindo', production: 'Projet phase 1', employees: 180, status: 'développement' },
    { name: 'Maboumine (Eramet)', nationality: 'France', mineral: 'Niobium / Terres rares', site: 'Mabounié', province: 'Moyen-Ogooué', production: '12 000 t niobium', employees: 350, status: 'exploitation' },
    { name: 'Ressources Gabon SA', nationality: 'Gabon', mineral: 'Or artisanal', site: 'Multi-sites', province: 'Ogooué-Ivindo / Woleu-Ntem', production: '0.6 t/an', employees: 1_200, status: 'exploitation' },
    { name: 'HPX (ex-Ivanhoe)', nationality: 'Canada', mineral: 'Fer', site: 'Bélinga (phase 2)', province: 'Ogooué-Ivindo', production: 'Exploration avancée', employees: 85, status: 'exploration' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function MiningDashboardPage() {
    const [view, setView] = useState<'minerals' | 'operators'>('minerals');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Mountain className="h-7 w-7 text-stone-600" />
                            Mines & Géologie
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.activeMines} mines actives · {GLOBAL.miningGDP}% du PIB · {GLOBAL.manganeseWorldRank}e producteur mondial de manganèse
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGMG · Code Minier 2019</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-stone-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Pickaxe className="h-5 w-5 text-stone-500" />
                            <div><p className="text-lg font-bold text-stone-600">{(GLOBAL.manganeseProduction / 1_000_000).toFixed(1)}Mt</p><p className="text-[10px] text-muted-foreground">Manganèse/an</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.miningRevenue} Mds</p><p className="text-[10px] text-muted-foreground">Revenus miniers</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Factory className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.exploitationPermits}</p><p className="text-[10px] text-muted-foreground">Permis exploitation</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.employeesTotal.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Employés</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'minerals' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('minerals')}>Ressources</Button>
                    <Button variant={view === 'operators' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('operators')}>Opérateurs</Button>
                </div>

                {view === 'minerals' && (
                    <div className="space-y-2">
                        {MINERALS.map((m, i) => (
                            <Card key={i} className={m.name === 'Manganèse' ? 'border-l-4 border-l-amber-500' : m.name === 'Fer (Bélinga)' ? 'border-l-4 border-l-red-400' : ''}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-900/20 flex items-center justify-center shrink-0">
                                        <Mountain className="h-4 w-4 text-stone-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-xs font-bold">{m.name}</p>
                                            {m.worldRank !== '—' && <Badge variant="outline" className="text-[7px] h-3">{m.worldRank}</Badge>}
                                            {m.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                                            <span>Réserves : <b className="text-foreground">{m.reserves}</b></span>
                                            <span>Production : <b className="text-foreground">{m.production2025}</b></span>
                                            {m.exportValue > 0 && <span>Export : <b className="text-amber-600">{m.exportValue} Mds</b></span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'operators' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Opérateur</th>
                                    <th className="text-center py-2 px-2">Minerai</th>
                                    <th className="text-left py-2 px-2">Site</th>
                                    <th className="text-center py-2 px-2">Production</th>
                                    <th className="text-center py-2 px-2">Employés</th>
                                    <th className="text-center py-2 px-2">Statut</th>
                                </tr></thead>
                                <tbody>{OPERATORS.map((o, i) => {
                                    const statusBadge = {
                                        exploitation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                        exploration: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                        développement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                    };
                                    return (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2 px-3"><p className="font-bold">{o.name}</p><p className="text-[8px] text-muted-foreground">{o.nationality}</p></td>
                                            <td className="text-center py-2 px-2"><Badge variant="outline" className="text-[7px] h-3">{o.mineral}</Badge></td>
                                            <td className="py-2 px-2 text-[9px]"><span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{o.site}</span><span className="text-[8px] text-muted-foreground">{o.province}</span></td>
                                            <td className="text-center py-2 px-2 font-mono text-[9px]">{o.production}</td>
                                            <td className="text-center py-2 px-2 font-bold">{o.employees.toLocaleString()}</td>
                                            <td className="text-center py-2 px-2"><Badge className={`text-[6px] h-3 ${statusBadge[o.status]}`}>{o.status}</Badge></td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
