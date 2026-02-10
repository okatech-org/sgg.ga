/**
 * SGG Digital — Tourisme & Hôtellerie
 *
 * Suivi du secteur touristique national :
 *   - Arrivées de touristes et revenus
 *   - Parcs nationaux et sites naturels
 *   - Capacité hôtelière par province
 *   - Statistiques de fréquentation
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Palmtree, Hotel, Plane, MapPin,
    TrendingUp, DollarSign, Users, Star,
    Camera, TreePine, Globe,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface NationalPark {
    name: string;
    province: string;
    surface: number;
    highlight: string;
    visitors2025: number;
    status: 'ouvert' | 'accès limité' | 'recherche';
}

interface HotelCapacity {
    province: string;
    hotels: number;
    rooms: number;
    occupancy: number;
    avgRate: number;
}

const GLOBAL = {
    totalTourists2025: 285_000,
    tourismGDP: 2.8,
    tourismRevenue: 125,
    hotelRooms: 4_800,
    avgStayDays: 4.2,
    nationalParks: 13,
    parkSurface: 29_500,
    pctTerritory: 11,
    airArrivals: 185_000,
    directEmployees: 12_000,
    topOrigin: 'France',
};

const PARKS: NationalPark[] = [
    { name: 'Lopé', province: 'Ogooué-Ivindo / Ogooué-Lolo', surface: 4_970, highlight: 'UNESCO · Gorilles, éléphants, forêt-savane', visitors2025: 18_500, status: 'ouvert' },
    { name: 'Loango', province: 'Ogooué-Maritime', surface: 1_550, highlight: 'Éléphants sur la plage, baleines, surfing hippos', visitors2025: 12_200, status: 'ouvert' },
    { name: 'Ivindo', province: 'Ogooué-Ivindo', surface: 3_000, highlight: 'UNESCO · Chutes de Kongou, gorilles', visitors2025: 8_800, status: 'ouvert' },
    { name: 'Akanda', province: 'Estuaire', surface: 540, highlight: 'Mangroves, oiseaux migrateurs, tortues', visitors2025: 15_200, status: 'ouvert' },
    { name: 'Pongara', province: 'Estuaire', surface: 929, highlight: 'Plages, tortues luth, dauphins', visitors2025: 22_000, status: 'ouvert' },
    { name: 'Mayumba', province: 'Nyanga', surface: 970, highlight: 'Plus grande plage de ponte tortues luth au monde', visitors2025: 6_500, status: 'ouvert' },
    { name: 'Moukalaba-Doudou', province: 'Nyanga / Ngounié', surface: 4_500, highlight: 'Gorilles habitués, forêt dense', visitors2025: 4_200, status: 'accès limité' },
    { name: 'Minkébé', province: 'Woleu-Ntem', surface: 7_570, highlight: 'Plus grande forêt intacte, éléphants', visitors2025: 1_200, status: 'recherche' },
    { name: 'Waka', province: 'Ngounié', surface: 1_070, highlight: 'Inselbergs, chimpanzés', visitors2025: 2_800, status: 'accès limité' },
    { name: 'Birougou', province: 'Ngounié', surface: 690, highlight: 'Forêt de montagne, primates', visitors2025: 1_500, status: 'recherche' },
    { name: 'Monts de Cristal', province: 'Estuaire / Woleu-Ntem', surface: 1_200, highlight: 'Biodiversité floristique exceptionnelle', visitors2025: 3_800, status: 'accès limité' },
    { name: 'Plateaux Batéké', province: 'Haut-Ogooué', surface: 2_050, highlight: 'Savanes, réintroduction gorilles (PPG)', visitors2025: 5_500, status: 'ouvert' },
    { name: 'Mwagna', province: 'Ogooué-Ivindo', surface: 1_160, highlight: 'Bai (clairières), méga-faune', visitors2025: 900, status: 'recherche' },
];

const HOTEL_CAP: HotelCapacity[] = [
    { province: 'Estuaire (Libreville)', hotels: 85, rooms: 2_400, occupancy: 62, avgRate: 75_000 },
    { province: 'Ogooué-Maritime (Port-Gentil)', hotels: 28, rooms: 850, occupancy: 58, avgRate: 85_000 },
    { province: 'Haut-Ogooué (Franceville)', hotels: 18, rooms: 420, occupancy: 45, avgRate: 55_000 },
    { province: 'Moyen-Ogooué (Lambaréné)', hotels: 12, rooms: 280, occupancy: 52, avgRate: 45_000 },
    { province: 'Ogooué-Ivindo (Makokou)', hotels: 8, rooms: 150, occupancy: 38, avgRate: 40_000 },
    { province: 'Ngounié (Mouila)', hotels: 6, rooms: 120, occupancy: 35, avgRate: 35_000 },
    { province: 'Nyanga (Tchibanga)', hotels: 5, rooms: 110, occupancy: 40, avgRate: 38_000 },
    { province: 'Woleu-Ntem (Oyem)', hotels: 10, rooms: 250, occupancy: 42, avgRate: 42_000 },
    { province: 'Ogooué-Lolo (Koulamoutou)', hotels: 4, rooms: 80, occupancy: 30, avgRate: 32_000 },
];

export default function TourismDashboardPage() {
    const [view, setView] = useState<'parks' | 'hotels'>('parks');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Palmtree className="h-7 w-7 text-emerald-600" />
                            Tourisme & Hôtellerie
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalTourists2025.toLocaleString()} visiteurs · {GLOBAL.nationalParks} parcs nationaux · {GLOBAL.pctTerritory}% du territoire protégé
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">ANGT · IGPNT · {GLOBAL.tourismGDP}% PIB</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Plane className="h-5 w-5 text-emerald-500" />
                            <div><p className="text-lg font-bold text-emerald-600">{(GLOBAL.totalTourists2025 / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Touristes 2025</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.tourismRevenue} Mds</p><p className="text-[10px] text-muted-foreground">Revenus FCFA</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Hotel className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.hotelRooms.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Chambres</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TreePine className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{(GLOBAL.parkSurface / 1000).toFixed(1)}k km²</p><p className="text-[10px] text-muted-foreground">Parcs nationaux</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'parks' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('parks')}>Parcs nationaux</Button>
                    <Button variant={view === 'hotels' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('hotels')}>Hôtellerie</Button>
                </div>

                {view === 'parks' && (
                    <div className="space-y-2">
                        {PARKS.map((p, i) => {
                            const statusBadge = { ouvert: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 'accès limité': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', recherche: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
                            return (
                                <Card key={i} className={p.highlight.includes('UNESCO') ? 'border-l-4 border-l-amber-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                            <TreePine className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${statusBadge[p.status]}`}>{p.status === 'ouvert' ? '✓ Ouvert' : p.status === 'accès limité' ? '⚠️ Accès limité' : '🔬 Recherche'}</Badge>
                                                {p.highlight.includes('UNESCO') && <Badge className="text-[6px] h-3 bg-amber-100 text-amber-700">🏛️ UNESCO</Badge>}
                                            </div>
                                            <p className="text-xs font-bold">Parc National de la {p.name}</p>
                                            <p className="text-[9px] text-muted-foreground">{p.highlight}</p>
                                            <div className="flex items-center gap-3 text-[9px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.province}</span>
                                                <span><b className="text-foreground">{p.surface.toLocaleString()}</b> km²</span>
                                                <span className="flex items-center gap-0.5"><Camera className="h-2.5 w-2.5" /><b className="text-emerald-600">{p.visitors2025.toLocaleString()}</b> visiteurs</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'hotels' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Province</th>
                                    <th className="text-center py-2 px-2">Hôtels</th>
                                    <th className="text-center py-2 px-2">Chambres</th>
                                    <th className="text-center py-2 px-2">Occupation</th>
                                    <th className="text-center py-2 px-2">Tarif moy.</th>
                                </tr></thead>
                                <tbody>{HOTEL_CAP.map((h, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold">{h.province}</td>
                                        <td className="text-center py-2 px-2 font-mono">{h.hotels}</td>
                                        <td className="text-center py-2 px-2 font-mono">{h.rooms.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${h.occupancy >= 55 ? 'bg-green-500' : h.occupancy >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${h.occupancy}%` }} />
                                                </div>
                                                <span className="text-[9px] font-bold">{h.occupancy}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center py-2 px-2 font-mono text-[9px]">{h.avgRate.toLocaleString()} F</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            <div className="p-3 text-[9px] text-muted-foreground">
                                Séjour moyen : {GLOBAL.avgStayDays} jours · Origine principale : {GLOBAL.topOrigin} · {GLOBAL.directEmployees.toLocaleString()} emplois directs
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
