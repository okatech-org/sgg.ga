/**
 * SGG Digital — Tableau de Bord Santé Publique
 *
 * Suivi des indicateurs sanitaires nationaux :
 *   - Couverture vaccinale
 *   - Infrastructures de santé
 *   - Maladies prioritaires
 *   - Personnel médical par province
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    HeartPulse, Stethoscope, Syringe, Hospital,
    Users, TrendingUp, TrendingDown, Minus,
    MapPin, AlertTriangle, Baby, ShieldCheck,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface HealthIndicator {
    name: string;
    value: number;
    unit: string;
    target: number;
    trend: 'up' | 'down' | 'stable';
    status: 'good' | 'warning' | 'critical';
}

interface ProvinceHealth {
    province: string;
    hospitals: number;
    healthCenters: number;
    doctors: number;
    nurses: number;
    population: number;
    ratioDoctor: number; // habitants par médecin
}

interface Disease {
    name: string;
    cases2025: number;
    cases2026: number;
    trend: 'up' | 'down' | 'stable';
    severity: 'high' | 'medium' | 'low';
}

const INDICATORS: HealthIndicator[] = [
    { name: 'Espérance de vie', value: 66.2, unit: 'ans', target: 70, trend: 'up', status: 'warning' },
    { name: 'Mortalité infantile', value: 34, unit: '‰', target: 25, trend: 'down', status: 'warning' },
    { name: 'Couverture vaccinale DTC3', value: 72, unit: '%', target: 90, trend: 'up', status: 'warning' },
    { name: 'Accès aux soins primaires', value: 68, unit: '%', target: 85, trend: 'up', status: 'warning' },
    { name: 'Couverture maladie (CNAMGS)', value: 68, unit: '%', target: 100, trend: 'up', status: 'good' },
    { name: 'Accouchements assistés', value: 92, unit: '%', target: 95, trend: 'stable', status: 'good' },
    { name: 'Prévalence VIH', value: 3.8, unit: '%', target: 2, trend: 'down', status: 'warning' },
    { name: 'Prévalence paludisme', value: 22, unit: '%', target: 10, trend: 'down', status: 'critical' },
];

const PROVINCES: ProvinceHealth[] = [
    { province: 'Estuaire', hospitals: 12, healthCenters: 45, doctors: 820, nurses: 2100, population: 1_200_000, ratioDoctor: 1463 },
    { province: 'Haut-Ogooué', hospitals: 5, healthCenters: 22, doctors: 180, nurses: 450, population: 280_000, ratioDoctor: 1556 },
    { province: 'Ogooué-Maritime', hospitals: 3, healthCenters: 15, doctors: 120, nurses: 310, population: 180_000, ratioDoctor: 1500 },
    { province: 'Moyen-Ogooué', hospitals: 2, healthCenters: 12, doctors: 45, nurses: 120, population: 75_000, ratioDoctor: 1667 },
    { province: 'Ngounié', hospitals: 2, healthCenters: 18, doctors: 55, nurses: 140, population: 110_000, ratioDoctor: 2000 },
    { province: 'Nyanga', hospitals: 1, healthCenters: 10, doctors: 25, nurses: 65, population: 55_000, ratioDoctor: 2200 },
    { province: 'Ogooué-Ivindo', hospitals: 1, healthCenters: 8, doctors: 20, nurses: 55, population: 65_000, ratioDoctor: 3250 },
    { province: 'Ogooué-Lolo', hospitals: 1, healthCenters: 9, doctors: 22, nurses: 60, population: 70_000, ratioDoctor: 3182 },
    { province: 'Woleu-Ntem', hospitals: 2, healthCenters: 20, doctors: 65, nurses: 170, population: 160_000, ratioDoctor: 2462 },
];

const DISEASES: Disease[] = [
    { name: 'Paludisme', cases2025: 185_000, cases2026: 42_000, trend: 'down', severity: 'high' },
    { name: 'VIH/SIDA', cases2025: 46_000, cases2026: 11_200, trend: 'down', severity: 'high' },
    { name: 'Tuberculose', cases2025: 4_200, cases2026: 980, trend: 'down', severity: 'medium' },
    { name: 'Diabète', cases2025: 32_000, cases2026: 8_500, trend: 'up', severity: 'medium' },
    { name: 'Hypertension', cases2025: 95_000, cases2026: 25_000, trend: 'up', severity: 'medium' },
    { name: 'Diarrhéiques (enfants)', cases2025: 28_000, cases2026: 5_800, trend: 'down', severity: 'high' },
];

const GLOBAL = {
    totalHospitals: 29,
    totalCenters: 159,
    totalDoctors: 1_352,
    totalNurses: 3_470,
    population: 2_300_000,
    budgetSante: 480, // Mds FCFA
};

// ── Component ───────────────────────────────────────────────────────────────

export default function PublicHealthPage() {
    const [view, setView] = useState<'indicators' | 'provinces' | 'diseases'>('indicators');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <HeartPulse className="h-7 w-7 text-red-500" />
                            Santé Publique
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.population.toLocaleString()} habitants · {GLOBAL.totalDoctors.toLocaleString()} médecins · Budget : {GLOBAL.budgetSante} Mds FCFA
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Plan National Santé 2026</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Hospital className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.totalHospitals}</p><p className="text-[10px] text-muted-foreground">Hôpitaux</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.totalDoctors.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Médecins</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Syringe className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">72%</p><p className="text-[10px] text-muted-foreground">Couverture vaccinale</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">68%</p><p className="text-[10px] text-muted-foreground">CNAMGS couverture</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* View toggle */}
                <div className="flex gap-1">
                    <Button variant={view === 'indicators' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('indicators')}>Indicateurs</Button>
                    <Button variant={view === 'provinces' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('provinces')}>Par province</Button>
                    <Button variant={view === 'diseases' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('diseases')}>Maladies</Button>
                </div>

                {/* Indicators */}
                {view === 'indicators' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {INDICATORS.map((ind, i) => (
                            <Card key={i} className={ind.status === 'critical' ? 'border-red-200 dark:border-red-800' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold">{ind.name}</p>
                                        {ind.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                                            ind.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                                                <Minus className="h-3 w-3 text-gray-400" />}
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-1.5">
                                        <span className={`text-xl font-bold ${ind.status === 'good' ? 'text-green-600' : ind.status === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>{ind.value}</span>
                                        <span className="text-[10px] text-muted-foreground">{ind.unit}</span>
                                        <span className="text-[9px] text-muted-foreground ml-auto">Cible : {ind.target} {ind.unit}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${ind.status === 'good' ? 'bg-green-500' : ind.status === 'warning' ? 'bg-amber-400' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(100, (ind.value / ind.target) * 100)}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Provinces */}
                {view === 'provinces' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                        <th className="text-left py-2 px-3">Province</th>
                                        <th className="text-center py-2 px-2">Hôpitaux</th>
                                        <th className="text-center py-2 px-2">Centres</th>
                                        <th className="text-center py-2 px-2">Médecins</th>
                                        <th className="text-center py-2 px-2">Infirmiers</th>
                                        <th className="text-center py-2 px-2">Pop.</th>
                                        <th className="text-center py-2 px-2">Ratio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PROVINCES.map(p => (
                                        <tr key={p.province} className={`border-b hover:bg-muted/20 ${p.ratioDoctor > 2500 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                            <td className="py-2 px-3 font-bold flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.province}</td>
                                            <td className="text-center py-2 px-2">{p.hospitals}</td>
                                            <td className="text-center py-2 px-2">{p.healthCenters}</td>
                                            <td className="text-center py-2 px-2 font-bold">{p.doctors}</td>
                                            <td className="text-center py-2 px-2">{p.nurses}</td>
                                            <td className="text-center py-2 px-2">{(p.population / 1000).toFixed(0)}k</td>
                                            <td className="text-center py-2 px-2">
                                                <span className={p.ratioDoctor > 2500 ? 'text-red-600 font-bold' : p.ratioDoctor > 2000 ? 'text-amber-600' : 'text-green-600'}>
                                                    1:{p.ratioDoctor}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* Diseases */}
                {view === 'diseases' && (
                    <div className="space-y-2">
                        {DISEASES.map((d, i) => (
                            <Card key={i} className={d.severity === 'high' ? 'border-l-4 border-l-red-500' : d.severity === 'medium' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-xs font-bold">{d.name}</p>
                                            {d.trend === 'up' ? <TrendingUp className="h-3 w-3 text-red-500" /> :
                                                d.trend === 'down' ? <TrendingDown className="h-3 w-3 text-green-500" /> :
                                                    <Minus className="h-3 w-3 text-gray-400" />}
                                            <Badge className={`text-[7px] h-3 ${d.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{d.severity === 'high' ? 'Prioritaire' : 'Surveillance'}</Badge>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">2025 : {d.cases2025.toLocaleString()} cas · T1 2026 : {d.cases2026.toLocaleString()} cas</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold ${d.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                                            {d.trend === 'down' ? '↓' : '↑'} {Math.round((1 - d.cases2026 * 4 / d.cases2025) * 100)}%
                                        </p>
                                        <p className="text-[8px] text-muted-foreground">variation annualisée</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
