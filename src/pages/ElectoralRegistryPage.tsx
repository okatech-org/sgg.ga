/**
 * SGG Digital — Registre Électoral
 *
 * Suivi de la préparation électorale :
 *   - Inscrits par province
 *   - Bureaux de vote
 *   - Calendrier électoral
 *   - Statistiques démographiques électorales
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Vote, Users, MapPin, Calendar,
    CheckCircle2, TrendingUp, BarChart3,
    Clock, Building2,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ProvinceElectoral {
    province: string;
    registered: number;
    bureaux: number;
    women: number; // %
    youth: number; // % 18-35
    newRegistrations: number;
}

interface ElectionEvent {
    title: string;
    date: string;
    type: string;
    status: 'completed' | 'upcoming' | 'in-progress';
}

const GLOBAL = {
    totalRegistered: 882_000,
    eligiblePopulation: 1_150_000,
    registrationRate: 77,
    totalBureaux: 2_850,
    womenRate: 52,
    youthRate: 38,
    newRegistrations: 125_000,
    diaspora: 42_000,
};

const PROVINCES: ProvinceElectoral[] = [
    { province: 'Estuaire', registered: 385_000, bureaux: 980, women: 54, youth: 42, newRegistrations: 52_000 },
    { province: 'Haut-Ogooué', registered: 112_000, bureaux: 320, women: 51, youth: 36, newRegistrations: 15_000 },
    { province: 'Ogooué-Maritime', registered: 78_000, bureaux: 210, women: 53, youth: 40, newRegistrations: 11_000 },
    { province: 'Woleu-Ntem', registered: 72_000, bureaux: 280, women: 50, youth: 34, newRegistrations: 9_500 },
    { province: 'Ngounié', registered: 52_000, bureaux: 220, women: 52, youth: 35, newRegistrations: 7_000 },
    { province: 'Moyen-Ogooué', registered: 38_000, bureaux: 165, women: 51, youth: 37, newRegistrations: 5_200 },
    { province: 'Ogooué-Ivindo', registered: 32_000, bureaux: 180, women: 49, youth: 33, newRegistrations: 4_800 },
    { province: 'Ogooué-Lolo', registered: 35_000, bureaux: 190, women: 50, youth: 34, newRegistrations: 4_500 },
    { province: 'Nyanga', registered: 28_000, bureaux: 145, women: 51, youth: 36, newRegistrations: 3_500 },
    { province: 'Diaspora', registered: 42_000, bureaux: 160, women: 55, youth: 45, newRegistrations: 12_500 },
];

const CALENDAR: ElectionEvent[] = [
    { title: 'Referendum constitutionnel', date: 'Avril 2026', type: 'Référendum', status: 'upcoming' },
    { title: 'Révision des listes électorales', date: 'Jan–Mars 2026', type: 'Préparation', status: 'in-progress' },
    { title: 'Élections législatives', date: 'Août 2026', type: 'Législatives', status: 'upcoming' },
    { title: 'Élection présidentielle', date: 'Août 2026', type: 'Présidentielle', status: 'upcoming' },
    { title: 'Élections locales', date: 'Décembre 2026', type: 'Locales', status: 'upcoming' },
    { title: 'Formation des agents électoraux', date: 'Fév–Mars 2026', type: 'Préparation', status: 'in-progress' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ElectoralRegistryPage() {
    const [view, setView] = useState<'provinces' | 'calendar'>('provinces');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Vote className="h-7 w-7 text-indigo-600" />
                            Registre Électoral
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalRegistered.toLocaleString()} inscrits · {GLOBAL.totalBureaux.toLocaleString()} bureaux de vote · Taux : {GLOBAL.registrationRate}%
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">CGE · CTRI · Transition 2024-2026</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-500" />
                            <div><p className="text-lg font-bold text-indigo-600">{(GLOBAL.totalRegistered / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Inscrits</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">+{(GLOBAL.newRegistrations / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Nouvelles inscriptions</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-pink-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-pink-500" />
                            <div><p className="text-lg font-bold text-pink-600">{GLOBAL.womenRate}%</p><p className="text-[10px] text-muted-foreground">Femmes inscrites</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.youthRate}%</p><p className="text-[10px] text-muted-foreground">18-35 ans</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'provinces' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('provinces')}>Par province</Button>
                    <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('calendar')}>Calendrier</Button>
                </div>

                {view === 'provinces' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Province</th>
                                    <th className="text-center py-2 px-2">Inscrits</th>
                                    <th className="text-center py-2 px-2">Bureaux</th>
                                    <th className="text-center py-2 px-2">% Femmes</th>
                                    <th className="text-center py-2 px-2">% Jeunes</th>
                                    <th className="text-center py-2 px-2">Nouveaux</th>
                                </tr></thead>
                                <tbody>{PROVINCES.map(p => (
                                    <tr key={p.province} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.province}</td>
                                        <td className="text-center py-2 px-2 font-bold">{p.registered.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">{p.bureaux}</td>
                                        <td className="text-center py-2 px-2"><span className={p.women >= 50 ? 'text-green-600' : 'text-amber-600'}>{p.women}%</span></td>
                                        <td className="text-center py-2 px-2">{p.youth}%</td>
                                        <td className="text-center py-2 px-2 text-green-600">+{p.newRegistrations.toLocaleString()}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'calendar' && (
                    <div className="space-y-2">
                        {CALENDAR.map((e, i) => (
                            <Card key={i} className={e.status === 'in-progress' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-gray-300 dark:border-l-gray-700'}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-muted/30'}`}>
                                        {e.status === 'in-progress' ? <Clock className="h-4 w-4 text-blue-500" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold">{e.title}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                                            <Badge variant="outline" className="text-[7px] h-3">{e.type}</Badge>
                                            <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{e.date}</span>
                                        </div>
                                    </div>
                                    <Badge className={`text-[7px] h-3.5 ${e.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {e.status === 'in-progress' ? 'En cours' : 'À venir'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
