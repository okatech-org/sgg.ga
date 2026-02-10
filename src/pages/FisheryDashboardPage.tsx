/**
 * SGG Digital — Pêche & Aquaculture
 *
 * Suivi du secteur halieutique national :
 *   - Production de pêche (maritime, continentale, aquaculture)
 *   - Flotte et licences
 *   - Zones de pêche et espèces
 *   - Lutte contre la pêche INN
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Fish, Anchor, Ship, MapPin,
    TrendingUp, DollarSign, AlertTriangle,
    Users, ShieldAlert, Waves,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface FishingZone {
    name: string;
    type: 'maritime' | 'continental' | 'aquaculture';
    province: string;
    production: number; // tonnes
    mainSpecies: string[];
    vessels: number;
    status: 'active' | 'restricted' | 'closed';
}

interface FishSpecies {
    name: string;
    scientific: string;
    catch2025: number; // tonnes
    value: number; // Mds FCFA
    zone: string;
    protection: 'none' | 'regulated' | 'protected';
}

const GLOBAL = {
    totalProduction: 42_000, // tonnes
    maritimeProduction: 28_000,
    continentalProduction: 11_000,
    aquacultureProduction: 3_000,
    fishingGDP: 1.8, // %
    exportValue: 35, // Mds FCFA
    artisanalFishers: 8_500,
    industrialVessels: 45,
    artisanalPirogues: 2_800,
    licenses: 180,
    innIncidents: 12, // 2025
    coastline: 885, // km
    eezArea: 213_000, // km²
};

const ZONES: FishingZone[] = [
    { name: 'Zone Estuaire / Libreville', type: 'maritime', province: 'Estuaire', production: 8_500, mainSpecies: ['Bar', 'Capitaine', 'Crevette'], vessels: 420, status: 'active' },
    { name: 'Zone Port-Gentil / Cap Lopez', type: 'maritime', province: 'Ogooué-Maritime', production: 12_000, mainSpecies: ['Thon', 'Sardine', 'Machoiron'], vessels: 580, status: 'active' },
    { name: 'Zone Mayumba', type: 'maritime', province: 'Nyanga', production: 4_500, mainSpecies: ['Ethmalose', 'Bar', 'Raie'], vessels: 280, status: 'restricted' },
    { name: 'Zone Gamba / Setté Cama', type: 'maritime', province: 'Ogooué-Maritime', production: 3_000, mainSpecies: ['Crevette', 'Sole', 'Bar'], vessels: 150, status: 'restricted' },
    { name: 'Lac Onangué', type: 'continental', province: 'Moyen-Ogooué', production: 3_500, mainSpecies: ['Tilapia', 'Silure', 'Carpe'], vessels: 320, status: 'active' },
    { name: 'Ogooué (fleuve)', type: 'continental', province: 'Multi-provinces', production: 5_200, mainSpecies: ['Tilapia', 'Clarias', 'Perche du Nil'], vessels: 450, status: 'active' },
    { name: 'Lac Ezanga', type: 'continental', province: 'Moyen-Ogooué', production: 2_300, mainSpecies: ['Tilapia', 'Silure'], vessels: 180, status: 'active' },
    { name: 'Fermes Nkok / Owendo', type: 'aquaculture', province: 'Estuaire', production: 1_800, mainSpecies: ['Tilapia d\'élevage', 'Clarias'], vessels: 0, status: 'active' },
    { name: 'Projet aquacole Lambaréné', type: 'aquaculture', province: 'Moyen-Ogooué', production: 1_200, mainSpecies: ['Tilapia', 'Silure d\'élevage'], vessels: 0, status: 'active' },
];

const SPECIES: FishSpecies[] = [
    { name: 'Thon (Albacore)', scientific: 'Thunnus albacares', catch2025: 8_500, value: 12.5, zone: 'Maritime (large)', protection: 'regulated' },
    { name: 'Crevette rose', scientific: 'Penaeus notialis', catch2025: 3_200, value: 8.0, zone: 'Estuaire / Gamba', protection: 'regulated' },
    { name: 'Ethmalose', scientific: 'Ethmalosa fimbriata', catch2025: 6_800, value: 4.5, zone: 'Maritime côtière', protection: 'none' },
    { name: 'Bar (Loup)', scientific: 'Pseudotolithus', catch2025: 4_200, value: 5.5, zone: 'Maritime / Estuaire', protection: 'none' },
    { name: 'Tilapia', scientific: 'Oreochromis niloticus', catch2025: 5_500, value: 3.8, zone: 'Continental / Aquaculture', protection: 'none' },
    { name: 'Capitaine', scientific: 'Polydactylus quadrifilis', catch2025: 2_800, value: 4.2, zone: 'Estuaire', protection: 'none' },
    { name: 'Tortue marine', scientific: 'Dermochelys coriacea', catch2025: 0, value: 0, zone: 'Maritime (Mayumba)', protection: 'protected' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function FisheryDashboardPage() {
    const [view, setView] = useState<'zones' | 'species'>('zones');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Fish className="h-7 w-7 text-cyan-600" />
                            Pêche & Aquaculture
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalProduction.toLocaleString()} t/an · {GLOBAL.coastline} km de côtes · ZEE : {GLOBAL.eezArea.toLocaleString()} km²
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGPA · Lutte INN · {GLOBAL.innIncidents} incidents 2025</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Waves className="h-5 w-5 text-cyan-500" />
                            <div><p className="text-lg font-bold text-cyan-600">{(GLOBAL.maritimeProduction / 1000).toFixed(0)}k t</p><p className="text-[10px] text-muted-foreground">Pêche maritime</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Fish className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.continentalProduction / 1000).toFixed(0)}k t</p><p className="text-[10px] text-muted-foreground">Pêche continentale</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Anchor className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{(GLOBAL.aquacultureProduction / 1000).toFixed(0)}k t</p><p className="text-[10px] text-muted-foreground">Aquaculture</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{(GLOBAL.artisanalFishers / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Pêcheurs artisanaux</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Production mix */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-1">
                        {[
                            { label: 'Maritime', pct: Math.round(GLOBAL.maritimeProduction / GLOBAL.totalProduction * 100), color: 'bg-cyan-400' },
                            { label: 'Continentale', pct: Math.round(GLOBAL.continentalProduction / GLOBAL.totalProduction * 100), color: 'bg-blue-400' },
                            { label: 'Aquaculture', pct: Math.round(GLOBAL.aquacultureProduction / GLOBAL.totalProduction * 100), color: 'bg-green-400' },
                        ].map((s, i) => (
                            <div key={i} className="text-center" style={{ flex: s.pct }}>
                                <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 2 ? 'rounded-r' : ''}`} />
                                <p className="text-[7px] mt-0.5">{s.label} ({s.pct}%)</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'zones' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('zones')}>Zones</Button>
                    <Button variant={view === 'species' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('species')}>Espèces</Button>
                </div>

                {view === 'zones' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Zone</th>
                                    <th className="text-center py-2 px-2">Type</th>
                                    <th className="text-center py-2 px-2">Production</th>
                                    <th className="text-left py-2 px-2">Espèces</th>
                                    <th className="text-center py-2 px-2">Statut</th>
                                </tr></thead>
                                <tbody>{ZONES.map((z, i) => {
                                    const typeBadge = { maritime: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', continental: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', aquaculture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
                                    const statusBadge = { active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', restricted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', closed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
                                    return (
                                        <tr key={i} className={`border-b hover:bg-muted/20 ${z.status === 'restricted' ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}`}>
                                            <td className="py-2 px-3"><p className="font-bold">{z.name}</p><p className="text-[8px] text-muted-foreground flex items-center gap-0.5"><MapPin className="h-2 w-2" />{z.province}</p></td>
                                            <td className="text-center py-2 px-2"><Badge className={`text-[6px] h-3 ${typeBadge[z.type]}`}>{z.type}</Badge></td>
                                            <td className="text-center py-2 px-2 font-mono font-bold">{z.production.toLocaleString()} t</td>
                                            <td className="py-2 px-2 text-[8px] text-muted-foreground">{z.mainSpecies.join(', ')}</td>
                                            <td className="text-center py-2 px-2"><Badge className={`text-[6px] h-3 ${statusBadge[z.status]}`}>{z.status === 'active' ? 'Actif' : z.status === 'restricted' ? '⚠️ Restreint' : 'Fermé'}</Badge></td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'species' && (
                    <div className="space-y-2">
                        {SPECIES.map((s, i) => {
                            const protBadge = { none: '', regulated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', protected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
                            return (
                                <Card key={i} className={s.protection === 'protected' ? 'border-l-4 border-l-red-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0">
                                            <Fish className="h-3.5 w-3.5 text-cyan-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <p className="text-xs font-bold">{s.name}</p>
                                                <span className="text-[8px] text-muted-foreground italic">{s.scientific}</span>
                                                {s.protection !== 'none' && <Badge className={`text-[6px] h-3 ${protBadge[s.protection]}`}>{s.protection === 'protected' ? '🔒 Protégée' : '⚠️ Réglementée'}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                                                <span className="font-bold text-foreground">{s.catch2025.toLocaleString()} t</span>
                                                {s.value > 0 && <span>{s.value} Mds FCFA</span>}
                                                <span>{s.zone}</span>
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
