/**
 * SGG Digital — Protection Sociale
 *
 * Suivi de la couverture sociale nationale :
 *   - CNAMGS (Caisse Nationale d'Assurance Maladie)
 *   - Pensions et retraites
 *   - Filets sociaux et transferts
 *   - Aide à l'enfance et PMR
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    HeartHandshake, Users, Shield, DollarSign,
    Baby, Accessibility, Stethoscope, PiggyBank,
    TrendingUp, CheckCircle2,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface SocialProgram {
    name: string;
    type: 'assurance' | 'pension' | 'transfert' | 'aide' | 'handicap';
    operator: string;
    beneficiaries: number;
    budget: number; // Mds FCFA
    coverage: number; // %
    description: string;
    status: 'actif' | 'en expansion' | 'pilote';
}

const GLOBAL = {
    totalBeneficiaries: 1_250_000,
    cnamgsInsured: 980_000,
    cnamgsCoverage: 42, // %
    pensioners: 45_000,
    socialTransfers: 85_000,
    socialBudget: 380, // Mds FCFA
    socialPctGDP: 2.9,
    healthCenters: 850,
    pharmacies: 320,
    childrenAided: 28_000,
    pmrRegistered: 15_000,
};

const PROGRAMS: SocialProgram[] = [
    { name: 'CNAMGS — Gabonais Économiquement Faibles', type: 'assurance', operator: 'CNAMGS', beneficiaries: 520_000, budget: 85, coverage: 22, description: 'Assurance maladie gratuite pour GEF, accès soins, médicaments', status: 'actif' },
    { name: 'CNAMGS — Agents publics', type: 'assurance', operator: 'CNAMGS', beneficiaries: 280_000, budget: 120, coverage: 12, description: 'Couverture fonctionnaires et familles, hospitalisation, soins', status: 'actif' },
    { name: 'CNAMGS — Salariés privés', type: 'assurance', operator: 'CNAMGS', beneficiaries: 180_000, budget: 95, coverage: 8, description: 'Assurance employés secteur privé formel', status: 'en expansion' },
    { name: 'CNSS — Pensions retraite', type: 'pension', operator: 'CNSS', beneficiaries: 32_000, budget: 65, coverage: 0, description: 'Pensions vieillesse, invalidité, survivants', status: 'actif' },
    { name: 'CNSS — Allocations familiales', type: 'pension', operator: 'CNSS', beneficiaries: 45_000, budget: 28, coverage: 0, description: 'Prestations familiales, aide à la maternité', status: 'actif' },
    { name: 'Fond de Garantie Sociale', type: 'transfert', operator: 'FGS / Min. Social', beneficiaries: 35_000, budget: 15, coverage: 0, description: 'Transferts monétaires aux ménages vulnérables', status: 'actif' },
    { name: 'Programme Graine', type: 'transfert', operator: 'Min. Agriculture', beneficiaries: 25_000, budget: 18, coverage: 0, description: 'Sécurité alimentaire, agriculture familiale, microcrédits', status: 'en expansion' },
    { name: 'Protection de l\'Enfance', type: 'aide', operator: 'Min. Social / UNICEF', beneficiaries: 28_000, budget: 12, coverage: 0, description: 'Orphelinats, placement familial, protection enfants vulnérables', status: 'actif' },
    { name: 'Allocation Personnes Handicapées', type: 'handicap', operator: 'Min. Social', beneficiaries: 15_000, budget: 8, coverage: 0, description: 'Allocation mensuelle, accessibilité, insertion professionnelle', status: 'actif' },
    { name: 'Couverture Santé Universelle (CSU)', type: 'assurance', operator: 'CNAMGS / État', beneficiaries: 0, budget: 45, coverage: 0, description: 'Extension couverture à 80% de la population d\'ici 2030', status: 'pilote' },
];

const CNAMGS_EVOLUTION = [
    { year: 2018, insured: 450_000, coverage: 19 },
    { year: 2019, insured: 550_000, coverage: 23 },
    { year: 2020, insured: 620_000, coverage: 26 },
    { year: 2021, insured: 720_000, coverage: 30 },
    { year: 2022, insured: 800_000, coverage: 34 },
    { year: 2023, insured: 880_000, coverage: 37 },
    { year: 2024, insured: 950_000, coverage: 40 },
    { year: 2025, insured: 980_000, coverage: 42 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function SocialProtectionPage() {
    const [view, setView] = useState<'programs' | 'evolution'>('programs');

    const typeCfg: Record<string, { label: string; color: string; icon: typeof Shield }> = {
        assurance: { label: 'Assurance', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Stethoscope },
        pension: { label: 'Pension', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: PiggyBank },
        transfert: { label: 'Transfert', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: DollarSign },
        aide: { label: 'Aide sociale', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: Baby },
        handicap: { label: 'Handicap', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: Accessibility },
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <HeartHandshake className="h-7 w-7 text-rose-600" />
                            Protection Sociale
                        </h1>
                        <p className="text-muted-foreground">
                            {(GLOBAL.totalBeneficiaries / 1_000_000).toFixed(2)}M bénéficiaires · CNAMGS {GLOBAL.cnamgsCoverage}% couverture · {GLOBAL.socialPctGDP}% PIB
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">CNAMGS · CNSS · Min. Social</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.cnamgsInsured / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Assurés CNAMGS</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <PiggyBank className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.pensioners.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Pensionnés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.socialBudget} Mds</p><p className="text-[10px] text-muted-foreground">Budget social</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-rose-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Baby className="h-5 w-5 text-rose-500" />
                            <div><p className="text-lg font-bold text-rose-600">{(GLOBAL.childrenAided / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Enfants aidés</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* CNAMGS Coverage */}
                <Card>
                    <CardContent className="p-3">
                        <p className="text-[9px] text-muted-foreground mb-1">Couverture CNAMGS : {GLOBAL.cnamgsInsured.toLocaleString()} assurés sur ~2.4M ({GLOBAL.cnamgsCoverage}%)</p>
                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-1.5" style={{ width: `${GLOBAL.cnamgsCoverage}%` }}>
                                <span className="text-[7px] text-white font-bold">{GLOBAL.cnamgsCoverage}%</span>
                            </div>
                        </div>
                        <p className="text-[8px] text-muted-foreground mt-1">Objectif CSU : 80% d'ici 2030</p>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'programs' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('programs')}>Programmes</Button>
                    <Button variant={view === 'evolution' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('evolution')}>Évolution</Button>
                </div>

                {view === 'programs' && (
                    <div className="space-y-2">
                        {PROGRAMS.map((p, i) => {
                            const tc = typeCfg[p.type];
                            const statusBadge = { actif: 'bg-green-100 text-green-700', 'en expansion': 'bg-blue-100 text-blue-700', pilote: 'bg-amber-100 text-amber-700' };
                            return (
                                <Card key={i} className={p.status === 'pilote' ? 'border-l-4 border-l-amber-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                                            <tc.icon className="h-4 w-4 text-rose-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${statusBadge[p.status]}`}>{p.status === 'actif' ? '✓' : p.status === 'en expansion' ? '📈' : '🧪'} {p.status}</Badge>
                                                <Badge className={`text-[6px] h-3 ${tc.color}`}>{tc.label}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{p.name}</p>
                                            <p className="text-[9px] text-muted-foreground">{p.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                                                <span>{p.operator}</span>
                                                {p.beneficiaries > 0 && <span><b className="text-foreground">{p.beneficiaries.toLocaleString()}</b> bénéficiaires</span>}
                                                <span className="font-bold text-amber-600">{p.budget} Mds</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'evolution' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Évolution couverture CNAMGS 2018-2025</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {CNAMGS_EVOLUTION.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-8 font-bold shrink-0">{d.year}</span>
                                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full flex items-center justify-end pr-1" style={{ width: `${d.coverage * 2.2}%` }}>
                                            <span className="text-[7px] text-white font-bold">{d.coverage}%</span>
                                        </div>
                                    </div>
                                    <span className="w-14 text-right font-mono shrink-0">{(d.insured / 1000).toFixed(0)}k</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
