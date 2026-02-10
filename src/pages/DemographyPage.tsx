/**
 * SGG Digital — Démographie & Recensement
 *
 * Données démographiques nationales :
 *   - Population par province
 *   - Pyramide des âges
 *   - Urbanisation et densité
 *   - Indicateurs de développement
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users, MapPin, Baby, TrendingUp,
    Building2, Home, HeartPulse, GraduationCap,
    BarChart3,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ProvinceDemo {
    province: string;
    population: number;
    density: number; // hab/km²
    urbanRate: number; // %
    growthRate: number; // %
    medianAge: number;
    capital: string;
}

const GLOBAL = {
    totalPopulation: 2_340_000,
    growthRate: 2.5,
    urbanRate: 89,
    medianAge: 22.5,
    lifeExpectancy: 67,
    fertilityRate: 3.6,
    infantMortality: 32, // per 1000
    area: 267_668, // km²
    density: 8.7,
    under15: 37, // %
    youth15_34: 33,
    active35_59: 22,
    seniors60: 8,
};

const PROVINCES: ProvinceDemo[] = [
    { province: 'Estuaire', population: 870_000, density: 45, urbanRate: 97, growthRate: 3.2, medianAge: 24, capital: 'Libreville' },
    { province: 'Haut-Ogooué', population: 285_000, density: 7.8, urbanRate: 82, growthRate: 2.1, medianAge: 23, capital: 'Franceville' },
    { province: 'Ogooué-Maritime', population: 195_000, density: 8.5, urbanRate: 88, growthRate: 1.8, medianAge: 25, capital: 'Port-Gentil' },
    { province: 'Woleu-Ntem', population: 185_000, density: 5.0, urbanRate: 55, growthRate: 1.5, medianAge: 21, capital: 'Oyem' },
    { province: 'Ngounié', population: 155_000, density: 4.2, urbanRate: 52, growthRate: 1.3, medianAge: 20, capital: 'Mouila' },
    { province: 'Moyen-Ogooué', population: 125_000, density: 6.5, urbanRate: 68, growthRate: 2.0, medianAge: 22, capital: 'Lambaréné' },
    { province: 'Ogooué-Ivindo', population: 92_000, density: 2.1, urbanRate: 45, growthRate: 1.4, medianAge: 19, capital: 'Makokou' },
    { province: 'Ogooué-Lolo', population: 78_000, density: 3.0, urbanRate: 48, growthRate: 1.2, medianAge: 20, capital: 'Koulamoutou' },
    { province: 'Nyanga', population: 55_000, density: 2.5, urbanRate: 42, growthRate: 1.1, medianAge: 21, capital: 'Tchibanga' },
];

const AGE_PYRAMID = [
    { group: '0-4 ans', male: 125_000, female: 122_000 },
    { group: '5-14 ans', male: 195_000, female: 190_000 },
    { group: '15-24 ans', male: 210_000, female: 205_000 },
    { group: '25-34 ans', male: 188_000, female: 185_000 },
    { group: '35-44 ans', male: 142_000, female: 140_000 },
    { group: '45-54 ans', male: 95_000, female: 98_000 },
    { group: '55-64 ans', male: 55_000, female: 58_000 },
    { group: '65+ ans', male: 42_000, female: 48_000 },
];

const DEV_INDICATORS = [
    { label: 'IDH (Indice dév. humain)', value: '0.706', rank: '117e / 191', trend: 'up' as const },
    { label: 'Espérance de vie', value: '67 ans', rank: '—', trend: 'up' as const },
    { label: 'Taux d\'alphabétisation', value: '84%', rank: '—', trend: 'up' as const },
    { label: 'Accès eau potable', value: '87%', rank: '—', trend: 'up' as const },
    { label: 'Accès électricité', value: '92%', rank: '—', trend: 'stable' as const },
    { label: 'Couverture télécom', value: '75%', rank: '—', trend: 'up' as const },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DemographyPage() {
    const [view, setView] = useState<'provinces' | 'pyramid' | 'indicators'>('provinces');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-7 w-7 text-teal-600" />
                            Démographie & Recensement
                        </h1>
                        <p className="text-muted-foreground">
                            {(GLOBAL.totalPopulation / 1_000_000).toFixed(2)}M habitants · {GLOBAL.urbanRate}% urbain · {GLOBAL.density} hab/km²
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">RGPL 2024 · 267 668 km²</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-teal-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-teal-500" />
                            <div><p className="text-lg font-bold text-teal-600">{(GLOBAL.totalPopulation / 1_000_000).toFixed(2)}M</p><p className="text-[10px] text-muted-foreground">Population</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-pink-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Baby className="h-5 w-5 text-pink-500" />
                            <div><p className="text-lg font-bold text-pink-600">{GLOBAL.medianAge} ans</p><p className="text-[10px] text-muted-foreground">Âge médian</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.urbanRate}%</p><p className="text-[10px] text-muted-foreground">Urbanisation</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">+{GLOBAL.growthRate}%</p><p className="text-[10px] text-muted-foreground">Croissance/an</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Age distribution mini */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-1">
                            {[
                                { label: '< 15 ans', pct: GLOBAL.under15, color: 'bg-pink-400' },
                                { label: '15-34', pct: GLOBAL.youth15_34, color: 'bg-blue-400' },
                                { label: '35-59', pct: GLOBAL.active35_59, color: 'bg-green-400' },
                                { label: '60+', pct: GLOBAL.seniors60, color: 'bg-amber-400' },
                            ].map((s, i) => (
                                <div key={i} className="text-center" style={{ flex: s.pct }}>
                                    <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 3 ? 'rounded-r' : ''}`} />
                                    <p className="text-[7px] mt-0.5">{s.label} ({s.pct}%)</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'provinces' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('provinces')}>Provinces</Button>
                    <Button variant={view === 'pyramid' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('pyramid')}>Pyramide</Button>
                    <Button variant={view === 'indicators' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('indicators')}>Indicateurs</Button>
                </div>

                {view === 'provinces' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Province</th>
                                    <th className="text-center py-2 px-2">Population</th>
                                    <th className="text-center py-2 px-2">Densité</th>
                                    <th className="text-center py-2 px-2">Urbanisation</th>
                                    <th className="text-center py-2 px-2">Croissance</th>
                                    <th className="text-center py-2 px-2">Âge médian</th>
                                </tr></thead>
                                <tbody>{PROVINCES.map((p, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.province}<span className="text-[8px] text-muted-foreground font-normal">({p.capital})</span></td>
                                        <td className="text-center py-2 px-2 font-bold">{p.population.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">{p.density} hab/km²</td>
                                        <td className="text-center py-2 px-2">
                                            <span className={p.urbanRate < 50 ? 'text-amber-600 font-bold' : ''}>{p.urbanRate}%</span>
                                        </td>
                                        <td className="text-center py-2 px-2 text-green-600">+{p.growthRate}%</td>
                                        <td className="text-center py-2 px-2">{p.medianAge}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'pyramid' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Pyramide des âges (estimation 2026)</CardTitle></CardHeader>
                        <CardContent className="space-y-1">
                            {AGE_PYRAMID.map((g, i) => {
                                const maxPop = 210_000;
                                return (
                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                        <div className="w-16 text-right">
                                            <div className="h-3 bg-blue-400 rounded-l" style={{ width: `${(g.male / maxPop) * 100}%`, marginLeft: 'auto' }} />
                                        </div>
                                        <div className="w-16 text-center font-bold text-[8px] shrink-0">{g.group}</div>
                                        <div className="w-16">
                                            <div className="h-3 bg-pink-400 rounded-r" style={{ width: `${(g.female / maxPop) * 100}%` }} />
                                        </div>
                                        <span className="text-[8px] text-muted-foreground">{((g.male + g.female) / 1000).toFixed(0)}k</span>
                                    </div>
                                );
                            })}
                            <div className="flex justify-center gap-4 mt-2 text-[8px]">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400" /> Hommes</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-pink-400" /> Femmes</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {view === 'indicators' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DEV_INDICATORS.map((ind, i) => (
                            <Card key={i}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                                        <BarChart3 className="h-3.5 w-3.5 text-teal-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-muted-foreground">{ind.label}</p>
                                        <p className="text-sm font-bold">{ind.value}</p>
                                        {ind.rank !== '—' && <p className="text-[8px] text-muted-foreground">Rang mondial : {ind.rank}</p>}
                                    </div>
                                    {ind.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
