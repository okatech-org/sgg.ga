/**
 * SGG Digital — Patrimoine Public
 *
 * Gestion du patrimoine immobilier et mobilier de l'État :
 *   - Bâtiments publics
 *   - Véhicules et matériel roulant
 *   - Inventaire et valorisation
 *   - État de conservation
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building, Car, MapPin, DollarSign,
    AlertTriangle, CheckCircle2, Wrench,
    BarChart3, Archive,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface PublicBuilding {
    name: string;
    ministry: string;
    province: string;
    surface: number; // m²
    yearBuilt: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    value: number; // millions FCFA
    type: 'administratif' | 'santé' | 'éducation' | 'sécurité' | 'résidentiel';
}

const GLOBAL = {
    totalBuildings: 2_450,
    totalSurface: 3_800_000, // m²
    totalVehicles: 8_500,
    vehiclesOperational: 5_200,
    totalValue: 4_500, // Mds FCFA
    buildingExcellent: 12,
    buildingGood: 35,
    buildingFair: 38,
    buildingPoor: 15,
    maintenanceBudget: 45, // Mds FCFA
    digitalizedPct: 28,
};

const BUILDINGS: PublicBuilding[] = [
    { name: 'Palais Léon Mba (Présidence)', ministry: 'Présidence de la République', province: 'Estuaire', surface: 15_000, yearBuilt: 1970, condition: 'excellent', value: 85_000, type: 'administratif' },
    { name: 'Immeuble du SGG', ministry: 'Secrétariat Général du Gouvernement', province: 'Estuaire', surface: 4_200, yearBuilt: 1985, condition: 'good', value: 12_000, type: 'administratif' },
    { name: 'CHU de Libreville', ministry: 'Santé', province: 'Estuaire', surface: 28_000, yearBuilt: 1978, condition: 'fair', value: 42_000, type: 'santé' },
    { name: 'Cité de la Démocratie', ministry: 'Assemblée Nationale', province: 'Estuaire', surface: 35_000, yearBuilt: 2015, condition: 'excellent', value: 120_000, type: 'administratif' },
    { name: 'Lycée National Léon Mba', ministry: 'Éducation Nationale', province: 'Estuaire', surface: 8_500, yearBuilt: 1960, condition: 'fair', value: 5_500, type: 'éducation' },
    { name: 'Camp de Gaulle (Barkhane)', ministry: 'Défense / Forces françaises', province: 'Estuaire', surface: 45_000, yearBuilt: 1964, condition: 'good', value: 35_000, type: 'sécurité' },
    { name: 'Hôpital régional de Franceville', ministry: 'Santé', province: 'Haut-Ogooué', surface: 12_000, yearBuilt: 1995, condition: 'good', value: 18_000, type: 'santé' },
    { name: 'Gouvernorat de Port-Gentil', ministry: 'Intérieur', province: 'Ogooué-Maritime', surface: 2_800, yearBuilt: 1975, condition: 'poor', value: 3_200, type: 'administratif' },
    { name: 'UOB — Campus central', ministry: 'Enseignement Supérieur', province: 'Estuaire', surface: 22_000, yearBuilt: 1970, condition: 'fair', value: 28_000, type: 'éducation' },
    { name: 'Ministère des Finances (Boulevard Triomphal)', ministry: 'Économie & Finances', province: 'Estuaire', surface: 6_500, yearBuilt: 1982, condition: 'good', value: 15_000, type: 'administratif' },
];

const VEHICLE_FLEET = [
    { category: 'Berlines / Véhicules de fonction', count: 2_800, operational: 1_600, avgAge: 8 },
    { category: '4x4 / SUV (terrain)', count: 1_900, operational: 1_200, avgAge: 6 },
    { category: 'Minibus / Transport collectif', count: 850, operational: 520, avgAge: 10 },
    { category: 'Camions / Poids lourds', count: 680, operational: 450, avgAge: 12 },
    { category: 'Véhicules spéciaux (ambulances, pompiers)', count: 420, operational: 280, avgAge: 9 },
    { category: 'Engins (BTP, agricoles)', count: 350, operational: 180, avgAge: 15 },
    { category: 'Motos / 2 roues', count: 1_500, operational: 970, avgAge: 4 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function PublicPropertyPage() {
    const [view, setView] = useState<'buildings' | 'vehicles' | 'condition'>('buildings');

    const condCfg = {
        excellent: { label: 'Excellent', color: 'text-green-600', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        good: { label: 'Bon', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        fair: { label: 'Passable', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        poor: { label: 'Mauvais', color: 'text-red-600', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Building className="h-7 w-7 text-slate-600" />
                            Patrimoine Public
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalBuildings.toLocaleString()} bâtiments · {GLOBAL.totalVehicles.toLocaleString()} véhicules · Valeur : {GLOBAL.totalValue.toLocaleString()} Mds FCFA
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGPP · Inventaire digitalisé {GLOBAL.digitalizedPct}%</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-slate-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building className="h-5 w-5 text-slate-500" />
                            <div><p className="text-lg font-bold text-slate-600">{(GLOBAL.totalBuildings / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Bâtiments</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Car className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.vehiclesOperational / 1000).toFixed(1)}k/{(GLOBAL.totalVehicles / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Véhicules opér.</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.totalValue.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Mds FCFA valeur</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.buildingPoor}%</p><p className="text-[10px] text-muted-foreground">En mauvais état</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Condition summary */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-1">
                        {[
                            { label: 'Excellent', pct: GLOBAL.buildingExcellent, color: 'bg-green-400' },
                            { label: 'Bon', pct: GLOBAL.buildingGood, color: 'bg-blue-400' },
                            { label: 'Passable', pct: GLOBAL.buildingFair, color: 'bg-amber-400' },
                            { label: 'Mauvais', pct: GLOBAL.buildingPoor, color: 'bg-red-400' },
                        ].map((s, i) => (
                            <div key={i} className="text-center" style={{ flex: s.pct }}>
                                <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 3 ? 'rounded-r' : ''}`} />
                                <p className="text-[7px] mt-0.5">{s.label} ({s.pct}%)</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'buildings' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('buildings')}>Bâtiments</Button>
                    <Button variant={view === 'vehicles' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('vehicles')}>Véhicules</Button>
                </div>

                {view === 'buildings' && (
                    <div className="space-y-2">
                        {BUILDINGS.map((b, i) => {
                            const cc = condCfg[b.condition];
                            return (
                                <Card key={i} className={b.condition === 'poor' ? 'border-l-4 border-l-red-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center shrink-0">
                                            <Building className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${cc.badge}`}>{cc.label}</Badge>
                                                <Badge variant="outline" className="text-[6px] h-3">{b.type}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{b.name}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                <span>{b.ministry}</span>
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{b.province}</span>
                                                <span>{b.surface.toLocaleString()} m²</span>
                                                <span className="font-bold text-amber-600">{(b.value / 1000).toFixed(0)} Mds</span>
                                                <span className="text-[8px]">{b.yearBuilt}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'vehicles' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Catégorie</th>
                                    <th className="text-center py-2 px-2">Total</th>
                                    <th className="text-center py-2 px-2">Opérationnel</th>
                                    <th className="text-center py-2 px-2">Taux</th>
                                    <th className="text-center py-2 px-2">Âge moy.</th>
                                </tr></thead>
                                <tbody>{VEHICLE_FLEET.map((v, i) => {
                                    const rate = Math.round((v.operational / v.count) * 100);
                                    return (
                                        <tr key={i} className={`border-b hover:bg-muted/20 ${rate < 55 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                            <td className="py-2 px-3 font-bold">{v.category}</td>
                                            <td className="text-center py-2 px-2 font-mono">{v.count.toLocaleString()}</td>
                                            <td className="text-center py-2 px-2 font-mono font-bold text-green-600">{v.operational.toLocaleString()}</td>
                                            <td className="text-center py-2 px-2">
                                                <span className={`font-bold ${rate < 55 ? 'text-red-600' : rate < 70 ? 'text-amber-600' : 'text-green-600'}`}>{rate}%</span>
                                            </td>
                                            <td className="text-center py-2 px-2 text-muted-foreground">{v.avgAge} ans</td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                            <div className="p-3 text-[9px] text-muted-foreground flex items-center gap-1">
                                <Wrench className="h-3 w-3" />
                                Budget maintenance : {GLOBAL.maintenanceBudget} Mds FCFA · Engins BTP : seulement 51% opérationnels (vétusté)
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
