/**
 * SGG Digital — Migrations & Réfugiés
 *
 * Centre de gestion des flux migratoires :
 *   - Immigration, émigration, transit
 *   - Titre de séjour et permis de travail
 *   - Réfugiés et demandeurs d'asile
 *   - Postes frontières
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Plane, Users, MapPin, Shield,
    Clock, FileCheck, Globe, Flag,
    TrendingUp, AlertTriangle,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ImmigrationStat {
    nationality: string;
    flag: string;
    residents: number;
    permits2025: number;
    workers: number;
    trend: 'up' | 'stable' | 'down';
}

interface BorderPost {
    name: string;
    type: 'aérien' | 'terrestre' | 'maritime';
    location: string;
    province: string;
    crossings2025: number;
    status: 'opérationnel' | 'modernisation' | 'limité';
}

const GLOBAL = {
    totalForeigners: 285_000,
    foreignPct: 11.9, // %
    titresValides: 142_000,
    permisDelivres2025: 18_500,
    refugees: 2_800,
    asylumSeekers: 650,
    borderPosts: 18,
    visasDelivres: 45_000,
    departures2025: 12_000,
    diasporaEstimate: 55_000,
    hcrPartner: true,
};

const COMMUNITIES: ImmigrationStat[] = [
    { nationality: 'Cameroun', flag: '🇨🇲', residents: 52_000, permits2025: 3_200, workers: 28_000, trend: 'stable' },
    { nationality: 'France', flag: '🇫🇷', residents: 12_000, permits2025: 1_800, workers: 8_500, trend: 'stable' },
    { nationality: 'Guinée Équatoriale', flag: '🇬🇶', residents: 18_000, permits2025: 1_200, workers: 9_500, trend: 'up' },
    { nationality: 'Mali', flag: '🇲🇱', residents: 25_000, permits2025: 2_100, workers: 18_000, trend: 'stable' },
    { nationality: 'Sénégal', flag: '🇸🇳', residents: 22_000, permits2025: 1_800, workers: 15_000, trend: 'up' },
    { nationality: 'Bénin', flag: '🇧🇯', residents: 18_000, permits2025: 1_500, workers: 12_000, trend: 'stable' },
    { nationality: 'Togo', flag: '🇹🇬', residents: 15_000, permits2025: 1_200, workers: 10_000, trend: 'stable' },
    { nationality: 'Congo-Brazzaville', flag: '🇨🇬', residents: 28_000, permits2025: 2_400, workers: 14_000, trend: 'stable' },
    { nationality: 'RDC', flag: '🇨🇩', residents: 12_000, permits2025: 800, workers: 5_500, trend: 'up' },
    { nationality: 'Liban', flag: '🇱🇧', residents: 8_000, permits2025: 600, workers: 6_500, trend: 'down' },
    { nationality: 'Chine', flag: '🇨🇳', residents: 5_500, permits2025: 450, workers: 4_800, trend: 'up' },
    { nationality: 'Nigeria', flag: '🇳🇬', residents: 10_000, permits2025: 850, workers: 7_000, trend: 'stable' },
];

const BORDER_POSTS: BorderPost[] = [
    { name: 'Aéroport Léon Mba', type: 'aérien', location: 'Libreville', province: 'Estuaire', crossings2025: 385_000, status: 'opérationnel' },
    { name: 'Aéroport de Port-Gentil', type: 'aérien', location: 'Port-Gentil', province: 'Ogooué-Maritime', crossings2025: 85_000, status: 'opérationnel' },
    { name: 'Aéroport Mvengué', type: 'aérien', location: 'Franceville', province: 'Haut-Ogooué', crossings2025: 28_000, status: 'opérationnel' },
    { name: 'Port d\'Owendo', type: 'maritime', location: 'Libreville', province: 'Estuaire', crossings2025: 42_000, status: 'modernisation' },
    { name: 'Port de Port-Gentil', type: 'maritime', location: 'Port-Gentil', province: 'Ogooué-Maritime', crossings2025: 18_000, status: 'opérationnel' },
    { name: 'Poste Bitam (Cameroun)', type: 'terrestre', location: 'Bitam', province: 'Woleu-Ntem', crossings2025: 65_000, status: 'modernisation' },
    { name: 'Poste Minseng (Cameroun)', type: 'terrestre', location: 'Minseng', province: 'Woleu-Ntem', crossings2025: 22_000, status: 'limité' },
    { name: 'Poste Léconi (Congo)', type: 'terrestre', location: 'Léconi', province: 'Haut-Ogooué', crossings2025: 35_000, status: 'opérationnel' },
    { name: 'Poste Ndendi (Congo)', type: 'terrestre', location: 'Ndendi', province: 'Nyanga', crossings2025: 12_000, status: 'limité' },
    { name: 'Poste Ebebiyin (Guinée Éq.)', type: 'terrestre', location: 'Mongomo frontière', province: 'Woleu-Ntem', crossings2025: 28_000, status: 'opérationnel' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function MigrationDashboardPage() {
    const [view, setView] = useState<'communities' | 'borders'>('communities');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Globe className="h-7 w-7 text-teal-600" />
                            Migrations & Réfugiés
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalForeigners.toLocaleString()} résidents étrangers ({GLOBAL.foreignPct}%) · {GLOBAL.borderPosts} postes frontières
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGDI · UNHCR · OIM</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-teal-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-teal-500" />
                            <div><p className="text-lg font-bold text-teal-600">{(GLOBAL.totalForeigners / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Résidents étrangers</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.titresValides / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Titres valides</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.refugees.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Réfugiés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Plane className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{(GLOBAL.visasDelivres / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Visas délivrés</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'communities' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('communities')}>Communautés</Button>
                    <Button variant={view === 'borders' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('borders')}>Postes frontières</Button>
                </div>

                {view === 'communities' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Nationalité</th>
                                    <th className="text-center py-2 px-2">Résidents</th>
                                    <th className="text-center py-2 px-2">Permis 2025</th>
                                    <th className="text-center py-2 px-2">Travailleurs</th>
                                    <th className="text-center py-2 px-2">Tendance</th>
                                </tr></thead>
                                <tbody>{COMMUNITIES.map((c, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold"><span className="mr-1">{c.flag}</span>{c.nationality}</td>
                                        <td className="text-center py-2 px-2 font-mono">{c.residents.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 font-mono text-blue-600">{c.permits2025.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 font-mono">{c.workers.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">
                                            <Badge className={`text-[6px] h-3 ${c.trend === 'up' ? 'bg-green-100 text-green-700' : c.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            <div className="p-3 text-[9px] text-muted-foreground">
                                {GLOBAL.refugees.toLocaleString()} réfugiés + {GLOBAL.asylumSeekers} demandeurs d'asile · Diaspora gabonaise estimée : {GLOBAL.diasporaEstimate.toLocaleString()} · Partenaire UNHCR
                            </div>
                        </CardContent>
                    </Card>
                )}

                {view === 'borders' && (
                    <div className="space-y-2">
                        {BORDER_POSTS.map((b, i) => {
                            const typeBadge = { aérien: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', terrestre: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', maritime: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' };
                            const statusBadge = { opérationnel: 'bg-green-100 text-green-700', modernisation: 'bg-amber-100 text-amber-700', limité: 'bg-red-100 text-red-700' };
                            return (
                                <Card key={i} className={b.status === 'modernisation' ? 'border-l-4 border-l-amber-500' : b.status === 'limité' ? 'border-l-4 border-l-red-400' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                                            {b.type === 'aérien' ? <Plane className="h-4 w-4 text-teal-500" /> : b.type === 'maritime' ? <Flag className="h-4 w-4 text-cyan-500" /> : <MapPin className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${typeBadge[b.type]}`}>{b.type}</Badge>
                                                <Badge className={`text-[6px] h-3 ${statusBadge[b.status]}`}>{b.status === 'opérationnel' ? '✓' : b.status === 'modernisation' ? '🔧' : '⚠️'} {b.status}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{b.name}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{b.location}, {b.province}</span>
                                                <span><b className="text-teal-600">{b.crossings2025.toLocaleString()}</b> passages/an</span>
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
