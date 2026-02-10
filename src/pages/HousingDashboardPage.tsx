/**
 * SGG Digital — Habitat & Urbanisme
 *
 * Suivi du secteur immobilier et aménagement urbain :
 *   - Permis de construire et conformité
 *   - Projets d'urbanisation
 *   - Logements sociaux
 *   - Schéma directeur d'aménagement
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Home, Building2, MapPin, FileCheck,
    TrendingUp, DollarSign, HardHat,
    AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ConstructionPermit {
    project: string;
    type: 'résidentiel' | 'commercial' | 'industriel' | 'social' | 'infrastructure';
    location: string;
    province: string;
    promoter: string;
    investment: number; // Mds FCFA
    units: number;
    status: 'approuvé' | 'en cours' | 'en instruction' | 'refusé';
    year: number;
}

const GLOBAL = {
    permitsDelivered2025: 2_850,
    permitsRefused: 420,
    permitsInProgress: 680,
    socialHousingBuilt: 5_200,
    socialHousingTarget: 15_000,
    housingDeficit: 120_000,
    urbanizationRate: 89, // %
    investmentTotal: 1_850, // Mds FCFA
    sdauLibreville: true, // Schéma directeur
    constructionEmployees: 28_000,
};

const PERMITS: ConstructionPermit[] = [
    { project: 'Cité ANOG Phase 3 — Bikélé', type: 'social', location: 'Bikélé', province: 'Estuaire', promoter: 'ANUTTC / État', investment: 85, units: 2_000, status: 'en cours', year: 2024 },
    { project: 'Résidence Les Collines — Angondjé', type: 'résidentiel', location: 'Angondjé', province: 'Estuaire', promoter: 'SCI Collines', investment: 35, units: 120, status: 'approuvé', year: 2025 },
    { project: 'Centre Commercial Oloumi', type: 'commercial', location: 'Oloumi', province: 'Estuaire', promoter: 'SOCOFI Gabon', investment: 28, units: 1, status: 'en cours', year: 2024 },
    { project: 'Cité Sociale Ntoum Phase 2', type: 'social', location: 'Ntoum', province: 'Estuaire', promoter: 'SNI / ANUTTC', investment: 42, units: 800, status: 'en cours', year: 2023 },
    { project: 'Tour Quartier du Champ Triomphal', type: 'commercial', location: 'Centre-ville', province: 'Estuaire', promoter: 'Gabon First Properties', investment: 120, units: 1, status: 'en instruction', year: 2025 },
    { project: 'Logements GIKAYA — Port-Gentil', type: 'résidentiel', location: 'Port-Gentil', province: 'Ogooué-Maritime', promoter: 'GIKAYA SA', investment: 55, units: 350, status: 'en cours', year: 2024 },
    { project: 'Zone Industrielle Nkok Extension', type: 'industriel', location: 'Nkok', province: 'Estuaire', promoter: 'GSEZ / Olam', investment: 180, units: 45, status: 'approuvé', year: 2025 },
    { project: 'Maisons sociales Franceville', type: 'social', location: 'Franceville', province: 'Haut-Ogooué', promoter: 'ANUTTC', investment: 25, units: 500, status: 'en cours', year: 2024 },
    { project: 'Boulevard Ali Bongo — Voirie', type: 'infrastructure', location: 'Libreville', province: 'Estuaire', promoter: 'SOGEA-SATOM', investment: 65, units: 0, status: 'en cours', year: 2023 },
    { project: 'HLM Owendo Phase 4', type: 'social', location: 'Owendo', province: 'Estuaire', promoter: 'SNI', investment: 38, units: 600, status: 'approuvé', year: 2025 },
];

const PROVINCE_HOUSING = [
    { province: 'Estuaire', permits: 1_800, housing: 3_200, deficit: 65_000 },
    { province: 'Haut-Ogooué', permits: 280, housing: 500, deficit: 12_000 },
    { province: 'Ogooué-Maritime', permits: 220, housing: 450, deficit: 10_000 },
    { province: 'Woleu-Ntem', permits: 120, housing: 280, deficit: 8_000 },
    { province: 'Ngounié', permits: 85, housing: 180, deficit: 5_500 },
    { province: 'Moyen-Ogooué', permits: 95, housing: 200, deficit: 6_000 },
    { province: 'Nyanga', permits: 65, housing: 120, deficit: 4_000 },
    { province: 'Ogooué-Ivindo', permits: 75, housing: 150, deficit: 5_000 },
    { province: 'Ogooué-Lolo', permits: 110, housing: 120, deficit: 4_500 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function HousingDashboardPage() {
    const [view, setView] = useState<'projects' | 'provinces'>('projects');

    const statusBadge: Record<string, string> = {
        'approuvé': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'en cours': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'en instruction': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'refusé': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const typeBadge: Record<string, string> = {
        'résidentiel': 'bg-blue-100 text-blue-700',
        'commercial': 'bg-purple-100 text-purple-700',
        'industriel': 'bg-gray-100 text-gray-600',
        'social': 'bg-green-100 text-green-700',
        'infrastructure': 'bg-amber-100 text-amber-700',
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Home className="h-7 w-7 text-orange-600" />
                            Habitat & Urbanisme
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.permitsDelivered2025.toLocaleString()} permis · {GLOBAL.housingDeficit.toLocaleString()} déficit logements · {GLOBAL.urbanizationRate}% urbanisation
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">ANUTTC · SNI · SDAU Libreville</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-orange-500" />
                            <div><p className="text-lg font-bold text-orange-600">{GLOBAL.permitsDelivered2025.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Permis délivrés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Home className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.socialHousingBuilt.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Logements sociaux</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{(GLOBAL.housingDeficit / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Déficit logements</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.investmentTotal.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Invest. Mds FCFA</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Social housing progress */}
                <Card>
                    <CardContent className="p-3">
                        <p className="text-[9px] text-muted-foreground mb-1">Logements sociaux : {GLOBAL.socialHousingBuilt.toLocaleString()} / {GLOBAL.socialHousingTarget.toLocaleString()} (objectif)</p>
                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full flex items-center justify-end pr-1.5" style={{ width: `${(GLOBAL.socialHousingBuilt / GLOBAL.socialHousingTarget) * 100}%` }}>
                                <span className="text-[7px] text-white font-bold">{Math.round((GLOBAL.socialHousingBuilt / GLOBAL.socialHousingTarget) * 100)}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'projects' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('projects')}>Projets</Button>
                    <Button variant={view === 'provinces' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('provinces')}>Par province</Button>
                </div>

                {view === 'projects' && (
                    <div className="space-y-2">
                        {PERMITS.map((p, i) => (
                            <Card key={i} className={p.type === 'social' ? 'border-l-4 border-l-green-500' : ''}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                        {p.type === 'infrastructure' ? <HardHat className="h-4 w-4 text-orange-500" /> : <Building2 className="h-4 w-4 text-orange-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <Badge className={`text-[6px] h-3 ${statusBadge[p.status]}`}>
                                                {p.status === 'approuvé' ? '✓' : p.status === 'en cours' ? '🔧' : p.status === 'en instruction' ? '⏳' : '✗'} {p.status}
                                            </Badge>
                                            <Badge className={`text-[6px] h-3 ${typeBadge[p.type]}`}>{p.type}</Badge>
                                        </div>
                                        <p className="text-xs font-bold">{p.project}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5 flex-wrap">
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}, {p.province}</span>
                                            <span>{p.promoter}</span>
                                            <span className="font-bold text-amber-600">{p.investment} Mds</span>
                                            {p.units > 0 && <span><b>{p.units.toLocaleString()}</b> unités</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'provinces' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Province</th>
                                    <th className="text-center py-2 px-2">Permis</th>
                                    <th className="text-center py-2 px-2">Logements</th>
                                    <th className="text-center py-2 px-2">Déficit</th>
                                </tr></thead>
                                <tbody>{PROVINCE_HOUSING.map((p, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold">{p.province}</td>
                                        <td className="text-center py-2 px-2 font-mono">{p.permits.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 font-mono text-green-600">{p.housing.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 font-mono text-red-600">{p.deficit.toLocaleString()}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            <div className="p-3 text-[9px] text-muted-foreground">
                                {GLOBAL.constructionEmployees.toLocaleString()} emplois BTP · Taux urbanisation {GLOBAL.urbanizationRate}%
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
