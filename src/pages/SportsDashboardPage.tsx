/**
 * SGG Digital — Sports & Jeunesse
 *
 * Suivi des fédérations sportives et politique jeunesse :
 *   - Fédérations et disciplines
 *   - Infrastructures sportives
 *   - Compétitions et palmarès
 *   - Programmes jeunesse
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Trophy, Users, MapPin, Medal,
    DollarSign, Star, Dumbbell,
    Target, Calendar,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface SportFederation {
    name: string;
    sport: string;
    licensees: number;
    clubs: number;
    president: string;
    palmares: string;
    infrastructures: number;
    status: 'olympique' | 'non olympique' | 'affilée';
}

const GLOBAL = {
    totalFederations: 42,
    olympicFederations: 18,
    totalLicensees: 85_000,
    totalClubs: 1_200,
    sportsBudget: 45, // Mds FCFA
    infrastructures: 280,
    stadia: 12,
    youthPrograms: 35,
    youthBeneficiaries: 45_000,
    internationalEvents: 8,
};

const FEDERATIONS: SportFederation[] = [
    { name: 'FEGAFOOT', sport: 'Football', licensees: 32_000, clubs: 420, president: 'Pierre A. Aubameyang', palmares: 'CAN 2012 (co-organisateur), CHAN 2016', infrastructures: 45, status: 'olympique' },
    { name: 'FEGABASKET', sport: 'Basketball', licensees: 8_500, clubs: 85, president: 'N/A', palmares: 'FIBA AfroBasket participations', infrastructures: 22, status: 'olympique' },
    { name: 'FEGAHAND', sport: 'Handball', licensees: 5_200, clubs: 52, president: 'N/A', palmares: 'CAN Handball féminines quarts', infrastructures: 18, status: 'olympique' },
    { name: 'Fédération de Judo', sport: 'Judo', licensees: 3_800, clubs: 35, president: 'N/A', palmares: 'Médailles africaines, JO participations', infrastructures: 12, status: 'olympique' },
    { name: 'Fédération de Taekwondo', sport: 'Taekwondo', licensees: 4_200, clubs: 45, president: 'N/A', palmares: 'Anthony Obame — Médaille argent JO 2012 🥈', infrastructures: 15, status: 'olympique' },
    { name: 'Fédération d\'Athlétisme', sport: 'Athlétisme', licensees: 2_800, clubs: 28, president: 'N/A', palmares: 'JO participations régulières', infrastructures: 8, status: 'olympique' },
    { name: 'FEGANAT', sport: 'Natation', licensees: 1_500, clubs: 12, president: 'N/A', palmares: 'JO participations', infrastructures: 5, status: 'olympique' },
    { name: 'Fédération de Tennis', sport: 'Tennis', licensees: 1_200, clubs: 8, president: 'N/A', palmares: 'Coupe Davis — Zone Afrique', infrastructures: 6, status: 'olympique' },
    { name: 'Fédération de Boxe', sport: 'Boxe', licensees: 2_500, clubs: 25, president: 'N/A', palmares: 'Championnats d\'Afrique', infrastructures: 10, status: 'olympique' },
    { name: 'Fédération de Rugby', sport: 'Rugby à XV', licensees: 1_800, clubs: 15, president: 'N/A', palmares: 'Rugby Africa — Division 1B', infrastructures: 4, status: 'non olympique' },
    { name: 'Fédération de Pétanque', sport: 'Pétanque', licensees: 5_500, clubs: 120, president: 'N/A', palmares: 'Championnats d\'Afrique (médailles)', infrastructures: 35, status: 'non olympique' },
    { name: 'Fédération de Cyclisme', sport: 'Cyclisme', licensees: 1_200, clubs: 10, president: 'N/A', palmares: 'Tropicale Amissa Bongo (UCI)', infrastructures: 3, status: 'olympique' },
];

const INFRA_SPORTIVE = [
    { name: 'Stade Omar Bongo Ondimba', location: 'Libreville', capacity: 40_000, type: 'Stade', state: 'opérationnel' },
    { name: 'Stade de l\'Amitié Sino-Gabonaise', location: 'Libreville', capacity: 35_000, type: 'Stade', state: 'opérationnel' },
    { name: 'Stade de Franceville', location: 'Franceville', capacity: 20_000, type: 'Stade', state: 'rénovation' },
    { name: 'Palais des Sports', location: 'Libreville', capacity: 5_000, type: 'Complexe indoor', state: 'opérationnel' },
    { name: 'Complexe Sportif de Nzeng-Ayong', location: 'Libreville', capacity: 3_000, type: 'Complexe', state: 'opérationnel' },
    { name: 'Stade Port-Gentil', location: 'Port-Gentil', capacity: 12_000, type: 'Stade', state: 'opérationnel' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function SportsDashboardPage() {
    const [view, setView] = useState<'federations' | 'infra'>('federations');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Trophy className="h-7 w-7 text-yellow-600" />
                            Sports & Jeunesse
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalFederations} fédérations · {GLOBAL.totalLicensees.toLocaleString()} licenciés · {GLOBAL.totalClubs.toLocaleString()} clubs
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Min. Sports · CNOSS · {GLOBAL.sportsBudget} Mds FCFA</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Medal className="h-5 w-5 text-yellow-500" />
                            <div><p className="text-lg font-bold text-yellow-600">{GLOBAL.olympicFederations}</p><p className="text-[10px] text-muted-foreground">Féd. olympiques</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.totalLicensees / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Licenciés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.infrastructures}</p><p className="text-[10px] text-muted-foreground">Infrastructures</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-500" />
                            <div><p className="text-lg font-bold text-purple-600">{(GLOBAL.youthBeneficiaries / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Jeunes encadrés</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'federations' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('federations')}>Fédérations</Button>
                    <Button variant={view === 'infra' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('infra')}>Infrastructures</Button>
                </div>

                {view === 'federations' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Fédération</th>
                                    <th className="text-center py-2 px-2">Sport</th>
                                    <th className="text-center py-2 px-2">Licenciés</th>
                                    <th className="text-center py-2 px-2">Clubs</th>
                                    <th className="text-left py-2 px-2">Palmarès</th>
                                </tr></thead>
                                <tbody>{FEDERATIONS.map((f, i) => (
                                    <tr key={i} className={`border-b hover:bg-muted/20 ${f.palmares.includes('Médaille') || f.palmares.includes('médaille') ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}>
                                        <td className="py-2 px-3">
                                            <p className="font-bold">{f.name}</p>
                                            <Badge className={`text-[5px] h-2.5 ${f.status === 'olympique' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{f.status}</Badge>
                                        </td>
                                        <td className="text-center py-2 px-2 font-bold text-[10px]">{f.sport}</td>
                                        <td className="text-center py-2 px-2 font-mono">{f.licensees.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 font-mono">{f.clubs}</td>
                                        <td className="py-2 px-2 text-[8px] text-muted-foreground max-w-[150px] truncate">{f.palmares}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'infra' && (
                    <div className="space-y-2">
                        {INFRA_SPORTIVE.map((inf, i) => {
                            const stateBadge = { opérationnel: 'bg-green-100 text-green-700', rénovation: 'bg-amber-100 text-amber-700' };
                            return (
                                <Card key={i}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                                            <Dumbbell className="h-4 w-4 text-yellow-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${stateBadge[inf.state as keyof typeof stateBadge] || stateBadge.opérationnel}`}>{inf.state === 'opérationnel' ? '✓' : '🔧'} {inf.state}</Badge>
                                                <Badge variant="outline" className="text-[6px] h-3">{inf.type}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{inf.name}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{inf.location}</span>
                                                <span className="font-bold text-foreground">{inf.capacity.toLocaleString()} places</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
