/**
 * SGG Digital — Énergie & Hydrocarbures
 *
 * Suivi du secteur énergétique national :
 *   - Production pétrolière et gazière
 *   - Mix énergétique et électrification
 *   - Opérateurs et contrats
 *   - Transition énergétique
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Fuel, Zap, Factory, TrendingDown,
    TrendingUp, MapPin, BarChart3,
    Droplets, Sun, Wind, Flame,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface OilOperator {
    name: string;
    nationality: string;
    production: number; // barils/jour
    fields: string[];
    share: number; // % production nationale
    status: 'active' | 'exploration';
}

interface PowerPlant {
    name: string;
    type: 'hydro' | 'thermal' | 'solar' | 'gas';
    capacity: number; // MW
    location: string;
    operator: string;
    status: 'operational' | 'construction' | 'planned';
}

const GLOBAL = {
    oilProduction: 181_000, // barils/jour
    gasProduction: 2.1, // Gm³/an
    oilReserves: 2_000, // millions barils
    gasReserves: 26, // Gm³
    oilGDP: 38, // %
    oilExportRevenue: 3_200, // Mds FCFA
    electricCapacity: 780, // MW
    electricAccess: 92, // %
    hydroShare: 58, // %
    thermalShare: 35,
    renewableShare: 7,
    refineryCapacity: 21_000, // barils/jour (SOGARA)
};

const OPERATORS: OilOperator[] = [
    { name: 'TotalEnergies EP Gabon', nationality: 'France', production: 52_000, fields: ['Anguille', 'Torpille', 'Mandji'], share: 29, status: 'active' },
    { name: 'Assala Energy', nationality: 'UK', production: 38_000, fields: ['Rabi-Kounga', 'Toucan', 'Coucal'], share: 21, status: 'active' },
    { name: 'Perenco Gabon', nationality: 'France/UK', production: 35_000, fields: ['Batanga', 'Mandaros', 'Omko'], share: 19, status: 'active' },
    { name: 'CNOOC (Addax)', nationality: 'Chine', production: 22_000, fields: ['Obangué', 'Tsiengui'], share: 12, status: 'active' },
    { name: 'Vaalco Energy', nationality: 'USA', production: 18_000, fields: ['Etame'], share: 10, status: 'active' },
    { name: 'BW Energy', nationality: 'Norvège', production: 12_000, fields: ['Dussafu'], share: 7, status: 'active' },
    { name: 'Gabon Oil Company (GOC)', nationality: 'Gabon', production: 4_000, fields: ['Akoum', 'Remboué'], share: 2, status: 'active' },
];

const POWER_PLANTS: PowerPlant[] = [
    { name: 'Grand Poubara', type: 'hydro', capacity: 160, location: 'Haut-Ogooué', operator: 'SEEG / Etat', status: 'operational' },
    { name: 'Kinguélé', type: 'hydro', capacity: 58, location: 'Estuaire', operator: 'SEEG', status: 'operational' },
    { name: 'Tchimbélé', type: 'hydro', capacity: 68, location: 'Estuaire', operator: 'SEEG', status: 'operational' },
    { name: 'Centrale Owendo', type: 'thermal', capacity: 105, location: 'Estuaire', operator: 'SEEG / Aggreko', status: 'operational' },
    { name: 'FE2 (Franceville)', type: 'gas', capacity: 70, location: 'Haut-Ogooué', operator: 'Perenco/État', status: 'operational' },
    { name: 'Alenakiri', type: 'hydro', capacity: 20, location: 'Estuaire', operator: 'SEEG', status: 'operational' },
    { name: 'Centrale solaire Nkok', type: 'solar', capacity: 50, location: 'Estuaire', operator: 'Aurinko / PPP', status: 'construction' },
    { name: 'Ngoulmendjim', type: 'hydro', capacity: 200, location: 'Estuaire', operator: 'GSEZ/États', status: 'planned' },
    { name: 'FE3 (Batterie Li)', type: 'solar', capacity: 30, location: 'Haut-Ogooué', operator: 'Projet PPP', status: 'planned' },
];

const PRODUCTION_HISTORY = [
    { year: 2018, barrels: 210_000 },
    { year: 2019, barrels: 205_000 },
    { year: 2020, barrels: 195_000 },
    { year: 2021, barrels: 190_000 },
    { year: 2022, barrels: 188_000 },
    { year: 2023, barrels: 185_000 },
    { year: 2024, barrels: 183_000 },
    { year: 2025, barrels: 181_000 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function EnergyDashboardPage() {
    const [view, setView] = useState<'oil' | 'power' | 'history'>('oil');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Fuel className="h-7 w-7 text-amber-600" />
                            Énergie & Hydrocarbures
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.oilProduction.toLocaleString()} bbl/j · {GLOBAL.oilGDP}% du PIB · {GLOBAL.electricCapacity} MW installés
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">OPEP · DGH · SOGARA</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Fuel className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{(GLOBAL.oilProduction / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">bbl/jour</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.gasProduction} Gm³</p><p className="text-[10px] text-muted-foreground">Gaz/an</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.electricAccess}%</p><p className="text-[10px] text-muted-foreground">Accès électricité</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-cyan-500" />
                            <div><p className="text-lg font-bold text-cyan-600">{GLOBAL.hydroShare}%</p><p className="text-[10px] text-muted-foreground">Hydroélectricité</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mix énergétique */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-1">
                            {[
                                { label: 'Hydro', pct: GLOBAL.hydroShare, color: 'bg-cyan-400' },
                                { label: 'Thermique', pct: GLOBAL.thermalShare, color: 'bg-amber-400' },
                                { label: 'Renouvelable', pct: GLOBAL.renewableShare, color: 'bg-green-400' },
                            ].map((s, i) => (
                                <div key={i} className="text-center" style={{ flex: s.pct }}>
                                    <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 2 ? 'rounded-r' : ''}`} />
                                    <p className="text-[7px] mt-0.5">{s.label} ({s.pct}%)</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'oil' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('oil')}>Opérateurs</Button>
                    <Button variant={view === 'power' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('power')}>Centrales</Button>
                    <Button variant={view === 'history' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('history')}>Historique</Button>
                </div>

                {view === 'oil' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Opérateur</th>
                                    <th className="text-center py-2 px-2">Nationalité</th>
                                    <th className="text-center py-2 px-2">Production</th>
                                    <th className="text-center py-2 px-2">Part</th>
                                    <th className="text-left py-2 px-2">Champs</th>
                                </tr></thead>
                                <tbody>{OPERATORS.map((o, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold">{o.name}</td>
                                        <td className="text-center py-2 px-2 text-[9px]">{o.nationality}</td>
                                        <td className="text-center py-2 px-2 font-mono font-bold">{o.production.toLocaleString()} bbl/j</td>
                                        <td className="text-center py-2 px-2">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${o.share * 3}%` }} />
                                                </div>
                                                <span className="text-[9px]">{o.share}%</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 text-[8px] text-muted-foreground">{o.fields.join(', ')}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'power' && (
                    <div className="space-y-2">
                        {POWER_PLANTS.map((p, i) => {
                            const typeColors = { hydro: 'text-cyan-500', thermal: 'text-amber-500', solar: 'text-yellow-500', gas: 'text-blue-500' };
                            const typeLabels = { hydro: 'Hydroélectrique', thermal: 'Thermique', solar: 'Solaire', gas: 'Gaz' };
                            const statusBadge = {
                                operational: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                construction: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                planned: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                            };
                            return (
                                <Card key={i} className={p.status !== 'operational' ? 'border-l-4 border-l-blue-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                            <Zap className={`h-3.5 w-3.5 ${typeColors[p.type]}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <p className="text-xs font-bold">{p.name}</p>
                                                <Badge className={`text-[7px] h-3 ${statusBadge[p.status]}`}>{p.status === 'operational' ? 'Opérationnel' : p.status === 'construction' ? 'En construction' : 'Planifié'}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                                                <Badge variant="outline" className="text-[7px] h-3">{typeLabels[p.type]}</Badge>
                                                <span className="font-bold text-foreground">{p.capacity} MW</span>
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}</span>
                                                <span>{p.operator}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'history' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Production pétrolière (bbl/j) — Tendance</CardTitle></CardHeader>
                        <CardContent className="space-y-1.5">
                            {PRODUCTION_HISTORY.map((h, i) => {
                                const maxP = 215_000;
                                return (
                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-8 font-bold shrink-0">{h.year}</span>
                                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(h.barrels / maxP) * 100}%` }} />
                                        </div>
                                        <span className="w-16 text-right font-mono font-bold shrink-0">{(h.barrels / 1000).toFixed(0)}k</span>
                                    </div>
                                );
                            })}
                            <p className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3 text-red-500" />
                                Déclin naturel des champs matures — SOGARA : {GLOBAL.refineryCapacity.toLocaleString()} bbl/j de capacité raffinage
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
