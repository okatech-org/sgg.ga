/**
 * SGG Digital — Registre de l'État Civil
 *
 * Base de données de l'état civil national :
 *   - Naissances, mariages, décès
 *   - Centres d'état civil
 *   - Taux d'enregistrement
 *   - Modernisation et digitalisation
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText, Baby, Heart, Users,
    MapPin, TrendingUp, Building2,
    BarChart3, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ProvinceEtatCivil {
    province: string;
    centers: number;
    birthRate: number; // %
    registrationRate: number; // %
    births2025: number;
    marriages2025: number;
    deaths2025: number;
    digitized: boolean;
}

const GLOBAL = {
    totalBirths: 68_000,
    totalMarriages: 12_500,
    totalDeaths: 14_200,
    registrationRate: 72,
    birthRegistration: 89,
    deathRegistration: 52,
    marriageRegistration: 65,
    centers: 185,
    digitizedCenters: 42,
    digitizationRate: 23,
    totalActes: 850_000,
};

const PROVINCES: ProvinceEtatCivil[] = [
    { province: 'Estuaire', centers: 45, birthRate: 30.5, registrationRate: 92, births2025: 24_500, marriages2025: 5_200, deaths2025: 5_800, digitized: true },
    { province: 'Haut-Ogooué', centers: 28, birthRate: 28.2, registrationRate: 78, births2025: 8_200, marriages2025: 1_800, deaths2025: 2_100, digitized: true },
    { province: 'Ogooué-Maritime', centers: 22, birthRate: 27.8, registrationRate: 85, births2025: 5_500, marriages2025: 1_200, deaths2025: 1_400, digitized: true },
    { province: 'Woleu-Ntem', centers: 24, birthRate: 32.1, registrationRate: 65, births2025: 6_800, marriages2025: 950, deaths2025: 1_200, digitized: false },
    { province: 'Ngounié', centers: 20, birthRate: 29.5, registrationRate: 58, births2025: 5_200, marriages2025: 780, deaths2025: 950, digitized: false },
    { province: 'Moyen-Ogooué', centers: 14, birthRate: 28.0, registrationRate: 70, births2025: 3_800, marriages2025: 650, deaths2025: 520, digitized: false },
    { province: 'Ogooué-Ivindo', centers: 12, birthRate: 33.5, registrationRate: 45, births2025: 4_200, marriages2025: 480, deaths2025: 680, digitized: false },
    { province: 'Ogooué-Lolo', centers: 10, birthRate: 30.0, registrationRate: 50, births2025: 3_500, marriages2025: 520, deaths2025: 580, digitized: false },
    { province: 'Nyanga', centers: 10, birthRate: 31.2, registrationRate: 48, births2025: 2_300, marriages2025: 420, deaths2025: 370, digitized: false },
];

const MONTHLY_2025 = [
    { month: 'Jan', births: 5_800, marriages: 650, deaths: 1_250 },
    { month: 'Fév', births: 5_500, marriages: 720, deaths: 1_180 },
    { month: 'Mar', births: 5_900, marriages: 880, deaths: 1_150 },
    { month: 'Avr', births: 5_700, marriages: 1_200, deaths: 1_120 },
    { month: 'Mai', births: 5_600, marriages: 950, deaths: 1_100 },
    { month: 'Jun', births: 5_400, marriages: 1_350, deaths: 1_080 },
    { month: 'Jul', births: 5_800, marriages: 1_500, deaths: 1_150 },
    { month: 'Aoû', births: 5_900, marriages: 1_100, deaths: 1_200 },
    { month: 'Sep', births: 5_500, marriages: 980, deaths: 1_180 },
    { month: 'Oct', births: 5_700, marriages: 1_050, deaths: 1_220 },
    { month: 'Nov', births: 5_400, marriages: 1_120, deaths: 1_250 },
    { month: 'Déc', births: 5_800, marriages: 1_000, deaths: 1_320 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function CivilRegistryPage() {
    const [view, setView] = useState<'provinces' | 'monthly'>('provinces');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-7 w-7 text-purple-600" />
                            Registre de l'État Civil
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalActes.toLocaleString()} actes · {GLOBAL.centers} centres · Taux d'enregistrement : {GLOBAL.registrationRate}%
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGEC · Digitalisation {GLOBAL.digitizationRate}%</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-pink-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Baby className="h-5 w-5 text-pink-500" />
                            <div><p className="text-lg font-bold text-pink-600">{(GLOBAL.totalBirths / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Naissances ({GLOBAL.birthRegistration}%)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{(GLOBAL.totalMarriages / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Mariages ({GLOBAL.marriageRegistration}%)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-500" />
                            <div><p className="text-lg font-bold text-gray-600">{(GLOBAL.totalDeaths / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Décès ({GLOBAL.deathRegistration}%)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.digitizedCenters}/{GLOBAL.centers}</p><p className="text-[10px] text-muted-foreground">Centres numérisés</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'provinces' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('provinces')}>Par province</Button>
                    <Button variant={view === 'monthly' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('monthly')}>Mensuel 2025</Button>
                </div>

                {view === 'provinces' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Province</th>
                                    <th className="text-center py-2 px-2">Centres</th>
                                    <th className="text-center py-2 px-2">Naissances</th>
                                    <th className="text-center py-2 px-2">Mariages</th>
                                    <th className="text-center py-2 px-2">Enreg.</th>
                                    <th className="text-center py-2 px-2">Digital</th>
                                </tr></thead>
                                <tbody>{PROVINCES.map((p, i) => (
                                    <tr key={i} className={`border-b hover:bg-muted/20 ${p.registrationRate < 55 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                        <td className="py-2 px-3 font-bold flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.province}</td>
                                        <td className="text-center py-2 px-2">{p.centers}</td>
                                        <td className="text-center py-2 px-2 font-mono">{p.births2025.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">{p.marriages2025.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">
                                            <span className={`font-bold ${p.registrationRate < 55 ? 'text-red-600' : p.registrationRate < 70 ? 'text-amber-600' : 'text-green-600'}`}>{p.registrationRate}%</span>
                                        </td>
                                        <td className="text-center py-2 px-2">{p.digitized ? <CheckCircle2 className="h-3 w-3 text-green-500 mx-auto" /> : <AlertTriangle className="h-3 w-3 text-amber-500 mx-auto" />}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'monthly' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Actes d'état civil par mois — 2025</CardTitle></CardHeader>
                        <CardContent className="space-y-1.5">
                            {MONTHLY_2025.map((m, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-8 font-bold shrink-0">{m.month}</span>
                                    <div className="flex-1 flex items-center gap-0.5">
                                        <div className="h-3 bg-pink-400 rounded-l" style={{ width: `${(m.births / 6000) * 100}%` }} />
                                        <div className="h-3 bg-red-400" style={{ width: `${(m.marriages / 6000) * 100}%` }} />
                                        <div className="h-3 bg-gray-400 rounded-r" style={{ width: `${(m.deaths / 6000) * 100}%` }} />
                                    </div>
                                    <span className="text-[8px] text-muted-foreground w-24 text-right shrink-0">{m.births.toLocaleString()} / {m.marriages.toLocaleString()} / {m.deaths.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-center gap-4 mt-2 text-[8px]">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-pink-400" /> Naissances</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" /> Mariages</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-400" /> Décès</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
