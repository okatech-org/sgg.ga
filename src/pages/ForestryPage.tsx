/**
 * SGG Digital — Eaux & Forêts
 *
 * Gestion des ressources forestières :
 *   - Couverture forestière et déforestation
 *   - Concessions forestières
 *   - Exploitation du bois et traçabilité
 *   - Biodiversité et aires protégées
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    TreePine, Leaf, MapPin, Factory,
    Shield, TrendingDown, AlertTriangle,
    BarChart3, Droplets, Bug,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ForestConcession {
    name: string;
    operator: string;
    area: number; // ha
    province: string;
    certified: boolean; // FSC/PEFC
    type: 'CFAD' | 'PFA' | 'forêt communautaire';
    annualVolume: number; // m³
}

interface WoodSpecies {
    name: string;
    scientific: string;
    volume: number; // m³/an
    value: number; // Mds FCFA
    protection: 'none' | 'regulated' | 'protected';
}

const GLOBAL = {
    forestCover: 88, // %
    forestArea: 23_500_000, // ha
    deforestationRate: 0.08, // %/an
    concessions: 152,
    concessionArea: 14_200_000, // ha
    annualProduction: 2_800_000, // m³
    transformationRate: 75, // % bois transformé localement
    woodExportRevenue: 420, // Mds FCFA
    protectedAreas: 13,
    protectedAreaPct: 11, // %
    carbonStock: 6_800, // Mt CO2
    speciesKnown: 8_000,
};

const CONCESSIONS: ForestConcession[] = [
    { name: 'CFAD Haut-Abanga', operator: 'Rougier Gabon', area: 580_000, province: 'Woleu-Ntem', certified: true, type: 'CFAD', annualVolume: 120_000 },
    { name: 'CFAD Ogooué-Ivindo Nord', operator: 'CEB (Precious Woods)', area: 620_000, province: 'Ogooué-Ivindo', certified: true, type: 'CFAD', annualVolume: 95_000 },
    { name: 'CFAD Mévang', operator: 'OLAM Timber', area: 450_000, province: 'Woleu-Ntem', certified: false, type: 'CFAD', annualVolume: 85_000 },
    { name: 'PFA Ngounié-Sud', operator: 'BSO (Bordamur)', area: 320_000, province: 'Ngounié', certified: false, type: 'PFA', annualVolume: 65_000 },
    { name: 'CFAD Lopé-Lastoursville', operator: 'SEEF', area: 380_000, province: 'Ogooué-Lolo', certified: true, type: 'CFAD', annualVolume: 78_000 },
    { name: 'Forêt communautaire Minkébé', operator: 'Communauté locale', area: 15_000, province: 'Woleu-Ntem', certified: false, type: 'forêt communautaire', annualVolume: 2_500 },
    { name: 'CFAD Mayumba-Ndougou', operator: 'TBI (Thanry)', area: 280_000, province: 'Nyanga', certified: false, type: 'CFAD', annualVolume: 55_000 },
];

const SPECIES: WoodSpecies[] = [
    { name: 'Okoumé', scientific: 'Aucoumea klaineana', volume: 1_200_000, value: 180, protection: 'regulated' },
    { name: 'Ozigo', scientific: 'Dacryodes buettneri', volume: 350_000, value: 42, protection: 'none' },
    { name: 'Padouk', scientific: 'Pterocarpus soyauxii', volume: 180_000, value: 35, protection: 'none' },
    { name: 'Kevazingo', scientific: 'Guibourtia tessmannii', volume: 8_000, value: 25, protection: 'protected' },
    { name: 'Moabi', scientific: 'Baillonella toxisperma', volume: 45_000, value: 18, protection: 'regulated' },
    { name: 'Azobé', scientific: 'Lophira alata', volume: 120_000, value: 28, protection: 'none' },
    { name: 'Sapelli', scientific: 'Entandrophragma cylindricum', volume: 95_000, value: 22, protection: 'regulated' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ForestryPage() {
    const [view, setView] = useState<'concessions' | 'species'>('concessions');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <TreePine className="h-7 w-7 text-green-600" />
                            Eaux & Forêts
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.forestCover}% de couverture · {(GLOBAL.forestArea / 1_000_000).toFixed(1)}M ha · {GLOBAL.concessions} concessions
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">🌿 2e forêt du Bassin du Congo · MINEF</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TreePine className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.forestCover}%</p><p className="text-[10px] text-muted-foreground">Couverture</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Factory className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{(GLOBAL.annualProduction / 1_000_000).toFixed(1)}M m³</p><p className="text-[10px] text-muted-foreground">Production/an</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <div><p className="text-lg font-bold text-emerald-600">{GLOBAL.protectedAreaPct}%</p><p className="text-[10px] text-muted-foreground">Aires protégées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-teal-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-teal-500" />
                            <div><p className="text-lg font-bold text-teal-600">{GLOBAL.transformationRate}%</p><p className="text-[10px] text-muted-foreground">Transformation locale</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Carbon stock */}
                <Card>
                    <CardContent className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-500" />
                            <span className="font-bold">Stock carbone : {GLOBAL.carbonStock.toLocaleString()} Mt CO₂</span>
                            <span className="text-muted-foreground">· Déforestation : {GLOBAL.deforestationRate}%/an (très faible)</span>
                            <span className="text-muted-foreground">· {GLOBAL.speciesKnown.toLocaleString()} espèces connues</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[7px]">Gabon Vert</Badge>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'concessions' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('concessions')}>Concessions</Button>
                    <Button variant={view === 'species' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('species')}>Essences</Button>
                </div>

                {view === 'concessions' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Concession</th>
                                    <th className="text-left py-2 px-2">Opérateur</th>
                                    <th className="text-center py-2 px-2">Surface</th>
                                    <th className="text-center py-2 px-2">Volume</th>
                                    <th className="text-center py-2 px-2">Certifié</th>
                                </tr></thead>
                                <tbody>{CONCESSIONS.map((c, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3">
                                            <p className="font-bold">{c.name}</p>
                                            <p className="text-[8px] text-muted-foreground flex items-center gap-0.5"><MapPin className="h-2 w-2" />{c.province}</p>
                                        </td>
                                        <td className="py-2 px-2 text-[9px]">{c.operator}</td>
                                        <td className="text-center py-2 px-2 font-mono">{(c.area / 1000).toFixed(0)}k ha</td>
                                        <td className="text-center py-2 px-2 font-mono">{(c.annualVolume / 1000).toFixed(0)}k m³</td>
                                        <td className="text-center py-2 px-2">
                                            {c.certified ? <Badge className="text-[6px] h-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">FSC ✓</Badge> : <span className="text-[8px] text-muted-foreground">—</span>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'species' && (
                    <div className="space-y-2">
                        {SPECIES.map((s, i) => {
                            const protBadge = {
                                none: '',
                                regulated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                protected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            };
                            return (
                                <Card key={i} className={s.protection === 'protected' ? 'border-l-4 border-l-red-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                            <TreePine className="h-3.5 w-3.5 text-green-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <p className="text-xs font-bold">{s.name}</p>
                                                <span className="text-[8px] text-muted-foreground italic">{s.scientific}</span>
                                                {s.protection !== 'none' && <Badge className={`text-[6px] h-3 ${protBadge[s.protection]}`}>{s.protection === 'protected' ? '🔒 Protégée' : '⚠️ Réglementée'}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                                                <span className="font-bold text-foreground">{s.volume.toLocaleString()} m³/an</span>
                                                <span>{s.value} Mds FCFA</span>
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
