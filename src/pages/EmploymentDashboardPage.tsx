/**
 * SGG Digital — Emploi & Formation Professionnelle
 *
 * Suivi du marché de l'emploi et formation :
 *   - Taux de chômage et emploi
 *   - Secteurs recruteurs
 *   - Formations professionnelles
 *   - Programmes d'insertion
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Briefcase, Users, TrendingUp, TrendingDown,
    GraduationCap, MapPin, Building2, Clock,
    BarChart3, Target,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface SectorEmployment {
    sector: string;
    employed: number;
    openPositions: number;
    avgSalary: number; // FCFA/mois
    trend: 'up' | 'down' | 'stable';
}

interface TrainingProgram {
    name: string;
    type: string;
    provider: string;
    beneficiaries: number;
    duration: string;
    location: string;
    fundedBy: string;
}

const GLOBAL = {
    activePopulation: 680_000,
    employed: 510_000,
    unemployed: 170_000,
    unemploymentRate: 25,
    youthUnemployment: 38,
    womenEmployment: 42,
    informalSector: 48, // %
    publicSector: 95_000,
    privateSector: 185_000,
    selfEmployed: 230_000,
    openPositions: 4_200,
    minWage: 150_000, // FCFA
};

const SECTORS: SectorEmployment[] = [
    { sector: 'Administration publique', employed: 95_000, openPositions: 350, avgSalary: 450_000, trend: 'stable' },
    { sector: 'Pétrole & Mines', employed: 12_000, openPositions: 180, avgSalary: 1_200_000, trend: 'down' },
    { sector: 'Commerce & Distribution', employed: 85_000, openPositions: 620, avgSalary: 180_000, trend: 'up' },
    { sector: 'BTP & Construction', employed: 35_000, openPositions: 450, avgSalary: 250_000, trend: 'up' },
    { sector: 'Bois & Industrie', employed: 28_000, openPositions: 320, avgSalary: 220_000, trend: 'down' },
    { sector: 'Banque & Finance', employed: 8_500, openPositions: 150, avgSalary: 650_000, trend: 'stable' },
    { sector: 'Technologies', employed: 5_200, openPositions: 380, avgSalary: 550_000, trend: 'up' },
    { sector: 'Santé', employed: 12_000, openPositions: 280, avgSalary: 380_000, trend: 'up' },
    { sector: 'Éducation', employed: 18_500, openPositions: 420, avgSalary: 320_000, trend: 'up' },
    { sector: 'Transport & Logistique', employed: 22_000, openPositions: 250, avgSalary: 200_000, trend: 'stable' },
];

const PROGRAMS: TrainingProgram[] = [
    { name: 'Programme ONE (Office Nat. Emploi)', type: 'Insertion', provider: 'ONE', beneficiaries: 8_500, duration: '6-12 mois', location: 'National', fundedBy: 'État' },
    { name: 'Formation aux métiers du numérique', type: 'Formation', provider: 'ANINF / Partenaires', beneficiaries: 1_200, duration: '6 mois', location: 'Libreville', fundedBy: 'BM / État' },
    { name: 'Stage de qualification BTP', type: 'Qualification', provider: 'CFPP', beneficiaries: 3_500, duration: '9 mois', location: 'Multi-villes', fundedBy: 'État / BAD' },
    { name: 'Entrepreneuriat jeunes (FAGA)', type: 'Entrepreneuriat', provider: 'FAGA', beneficiaries: 2_800, duration: '3 mois + suivi', location: 'National', fundedBy: 'État' },
    { name: 'Apprentissage dual — Secteur pétrolier', type: 'Alternance', provider: 'Total / Assala', beneficiaries: 450, duration: '2 ans', location: 'Port-Gentil', fundedBy: 'Entreprises' },
    { name: 'Reconversion militaires CTRI', type: 'Reconversion', provider: 'Ministère Défense', beneficiaries: 800, duration: '6 mois', location: 'Libreville / Franceville', fundedBy: 'État' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function EmploymentDashboardPage() {
    const [view, setView] = useState<'sectors' | 'programs'>('sectors');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Briefcase className="h-7 w-7 text-orange-600" />
                            Emploi & Formation Professionnelle
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.activePopulation.toLocaleString()} actifs · Chômage : {GLOBAL.unemploymentRate}% · {GLOBAL.openPositions.toLocaleString()} postes ouverts
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">ONE · SMIG : {GLOBAL.minWage.toLocaleString()} FCFA</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.unemploymentRate}%</p><p className="text-[10px] text-muted-foreground">Chômage</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-500" />
                            <div><p className="text-lg font-bold text-orange-600">{GLOBAL.youthUnemployment}%</p><p className="text-[10px] text-muted-foreground">Chômage jeunes</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.informalSector}%</p><p className="text-[10px] text-muted-foreground">Secteur informel</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.openPositions.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Postes ouverts</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Employment breakdown */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-1">
                            {[
                                { label: 'Public', pct: 19, color: 'bg-blue-400', val: GLOBAL.publicSector },
                                { label: 'Privé formel', pct: 36, color: 'bg-green-400', val: GLOBAL.privateSector },
                                { label: 'Indépendants / Informel', pct: 45, color: 'bg-amber-400', val: GLOBAL.selfEmployed },
                            ].map((s, i) => (
                                <div key={i} className="text-center" style={{ flex: s.pct }}>
                                    <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 2 ? 'rounded-r' : ''}`} />
                                    <p className="text-[7px] mt-0.5">{s.label} ({(s.val / 1000).toFixed(0)}k)</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'sectors' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('sectors')}>Secteurs</Button>
                    <Button variant={view === 'programs' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('programs')}>Formations</Button>
                </div>

                {view === 'sectors' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Secteur</th>
                                    <th className="text-center py-2 px-2">Employés</th>
                                    <th className="text-center py-2 px-2">Postes</th>
                                    <th className="text-center py-2 px-2">Salaire moy.</th>
                                    <th className="text-center py-2 px-2">Tend.</th>
                                </tr></thead>
                                <tbody>{SECTORS.map((s, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold">{s.sector}</td>
                                        <td className="text-center py-2 px-2 font-mono">{s.employed.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 text-green-600 font-bold">{s.openPositions}</td>
                                        <td className="text-center py-2 px-2 text-[9px]">{(s.avgSalary / 1000).toFixed(0)}k FCFA</td>
                                        <td className="text-center py-2 px-2">
                                            {s.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500 mx-auto" /> :
                                                s.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500 mx-auto" /> :
                                                    <span className="text-gray-400">—</span>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'programs' && (
                    <div className="space-y-2">
                        {PROGRAMS.map((p, i) => (
                            <Card key={i}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                        <GraduationCap className="h-3.5 w-3.5 text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{p.name}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <Badge variant="outline" className="text-[7px] h-3">{p.type}</Badge>
                                            <span className="font-bold text-foreground">{p.beneficiaries.toLocaleString()} bénéficiaires</span>
                                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{p.duration}</span>
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}</span>
                                        </div>
                                        <p className="text-[8px] text-muted-foreground mt-0.5">{p.provider} · Financé par {p.fundedBy}</p>
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
