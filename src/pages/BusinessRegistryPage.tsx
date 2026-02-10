/**
 * SGG Digital — Registre du Commerce & Entreprises
 *
 * Suivi du tissu économique national :
 *   - Entreprises enregistrées
 *   - Créations et radiations
 *   - Secteurs d'activité
 *   - Investissements
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Briefcase, Search, Building2, TrendingUp,
    MapPin, Calendar, Users, BarChart3,
    Factory, Store, Globe,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type CompanySize = 'TPE' | 'PME' | 'GE' | 'Multinationale';
type CompanyStatus = 'active' | 'suspended' | 'liquidation';

interface Company {
    id: string;
    name: string;
    rccm: string;
    sector: string;
    size: CompanySize;
    status: CompanyStatus;
    employees: number;
    capital: number; // Millions FCFA
    city: string;
    province: string;
    created: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const SIZE_CFG: Record<CompanySize, { badge: string }> = {
    TPE: { badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    PME: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    GE: { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    Multinationale: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const COMPANIES: Company[] = [
    { id: 'e1', name: 'Total Energies Gabon', rccm: 'GA-LBV-01-2024-B12', sector: 'Pétrole & Gaz', size: 'Multinationale', status: 'active', employees: 1_200, capital: 85_000, city: 'Port-Gentil', province: 'Ogooué-Maritime', created: 1962 },
    { id: 'e2', name: 'Comilog (Eramet)', rccm: 'GA-FCV-01-2024-B08', sector: 'Mines & Métallurgie', size: 'GE', status: 'active', employees: 3_800, capital: 120_000, city: 'Moanda', province: 'Haut-Ogooué', created: 1953 },
    { id: 'e3', name: 'Olam Gabon', rccm: 'GA-LBV-01-2024-B15', sector: 'Agro-industrie', size: 'GE', status: 'active', employees: 8_500, capital: 95_000, city: 'Libreville', province: 'Estuaire', created: 1999 },
    { id: 'e4', name: 'OKA Tech', rccm: 'GA-LBV-01-2025-B42', sector: 'Technologies & Numérique', size: 'PME', status: 'active', employees: 35, capital: 500, city: 'Libreville', province: 'Estuaire', created: 2024 },
    { id: 'e5', name: 'Assala Energy', rccm: 'GA-POG-01-2024-B03', sector: 'Pétrole & Gaz', size: 'GE', status: 'active', employees: 650, capital: 250_000, city: 'Port-Gentil', province: 'Ogooué-Maritime', created: 2017 },
    { id: 'e6', name: 'BGFI Bank', rccm: 'GA-LBV-01-2024-B01', sector: 'Banque & Finance', size: 'GE', status: 'active', employees: 2_200, capital: 180_000, city: 'Libreville', province: 'Estuaire', created: 1971 },
    { id: 'e7', name: 'Gabon Télécom (Airtel)', rccm: 'GA-LBV-01-2024-B05', sector: 'Télécommunications', size: 'GE', status: 'active', employees: 800, capital: 42_000, city: 'Libreville', province: 'Estuaire', created: 2004 },
    { id: 'e8', name: 'SEEG (Eau & Électricité)', rccm: 'GA-LBV-01-2024-B02', sector: 'Énergie & Utilities', size: 'GE', status: 'active', employees: 2_800, capital: 35_000, city: 'Libreville', province: 'Estuaire', created: 1963 },
    { id: 'e9', name: 'Boulangerie Moderne de Libreville', rccm: 'GA-LBV-03-2022-B180', sector: 'Agroalimentaire', size: 'TPE', status: 'active', employees: 12, capital: 25, city: 'Libreville', province: 'Estuaire', created: 2015 },
    { id: 'e10', name: 'Transport Express Gabon', rccm: 'GA-LBV-02-2020-B95', sector: 'Transport & Logistique', size: 'PME', status: 'suspended', employees: 45, capital: 150, city: 'Libreville', province: 'Estuaire', created: 2012 },
];

const GLOBAL = {
    totalCompanies: 28_500,
    active: 22_100,
    created2025: 3_200,
    dissolved2025: 850,
    foreignInvestment: 1_450, // Mds FCFA
    tpe: 18_200,
    pme: 3_800,
    ge: 420,
    multi: 85,
};

const SECTORS = [
    { sector: 'Commerce & Distribution', companies: 8_500, pct: 30 },
    { sector: 'Services', companies: 5_700, pct: 20 },
    { sector: 'BTP & Construction', companies: 3_400, pct: 12 },
    { sector: 'Transport & Logistique', companies: 2_850, pct: 10 },
    { sector: 'Agroalimentaire', companies: 2_280, pct: 8 },
    { sector: 'Technologies & Numérique', companies: 1_710, pct: 6 },
    { sector: 'Banque & Finance', companies: 1_140, pct: 4 },
    { sector: 'Pétrole & Mines', companies: 850, pct: 3 },
    { sector: 'Autres', companies: 2_070, pct: 7 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function BusinessRegistryPage() {
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'directory' | 'sectors'>('directory');

    const filtered = useMemo(() => {
        if (!search) return COMPANIES;
        return COMPANIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.rccm.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Briefcase className="h-7 w-7 text-emerald-600" />
                            Registre du Commerce & Entreprises
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalCompanies.toLocaleString()} entreprises · {GLOBAL.active.toLocaleString()} actives · +{GLOBAL.created2025.toLocaleString()} créations 2025
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">RCCM · ANPI-Gabon</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald-500" />
                            <div><p className="text-lg font-bold text-emerald-600">{(GLOBAL.active / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Entreprises actives</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">+{GLOBAL.created2025.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Créations 2025</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.foreignInvestment.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Mds IDE 2025</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-400">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-gray-500" />
                            <div><p className="text-lg font-bold">{GLOBAL.multi}</p><p className="text-[10px] text-muted-foreground">Multinationales</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'directory' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('directory')}>Répertoire</Button>
                    <Button variant={view === 'sectors' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('sectors')}>Secteurs</Button>
                </div>

                {view === 'directory' && (
                    <>
                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Nom ou RCCM..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            {filtered.map(c => (
                                <Card key={c.id} className={c.status === 'suspended' ? 'opacity-60' : ''}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                                {c.size === 'Multinationale' || c.size === 'GE' ? <Factory className="h-4 w-4 text-emerald-500" /> : <Store className="h-4 w-4 text-emerald-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                    <Badge className={`text-[7px] h-3.5 ${SIZE_CFG[c.size].badge}`}>{c.size}</Badge>
                                                    <Badge variant="outline" className="text-[7px] h-3">{c.sector}</Badge>
                                                    {c.status === 'suspended' && <Badge className="text-[7px] h-3 bg-amber-100 text-amber-700">Suspendue</Badge>}
                                                </div>
                                                <p className="text-xs font-bold">{c.name}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                    <span className="font-mono">{c.rccm}</span>
                                                    <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{c.employees} emp.</span>
                                                    <span>{(c.capital / 1000).toFixed(c.capital >= 1000 ? 0 : 1)} Mds FCFA</span>
                                                    <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{c.city}</span>
                                                    <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{c.created}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {view === 'sectors' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Répartition par secteur d'activité</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {SECTORS.map((s, i) => {
                                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-red-400', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-500', 'bg-gray-400'];
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                            <span className="font-bold">{s.sector}</span>
                                            <span>{s.companies.toLocaleString()} ({s.pct}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${s.pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
