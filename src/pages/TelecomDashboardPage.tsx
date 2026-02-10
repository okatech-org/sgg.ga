/**
 * SGG Digital — Télécommunications & Numérique
 *
 * Suivi du secteur télécom et économie numérique :
 *   - Opérateurs et couverture réseau
 *   - Pénétration mobile et internet
 *   - Infrastructures fibre optique
 *   - Projets de digitalisation
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Wifi, Smartphone, Globe, Signal,
    TrendingUp, DollarSign, Users,
    MapPin, Cable, Server,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface TelecomOperator {
    name: string;
    type: 'mobile' | 'isp' | 'fixe';
    ownership: string;
    subscribers: number;
    marketShare: number;
    coverage4G: number;
    technologies: string[];
    status: 'active' | 'licence suspendue';
}

const GLOBAL = {
    population: 2_400_000,
    mobileSubscriptions: 2_950_000,
    mobilePenetration: 123, // %
    internetUsers: 1_450_000,
    internetPenetration: 60, // %
    fixedBroadband: 28_000,
    fiberKm: 8_500,
    telecomGDP: 4.2, // %
    telecomRevenue: 480, // Mds FCFA
    coverage4G: 72, // %
    coverage3G: 88, // %
    coverage2G: 95, // %
    datacenters: 3,
    ixp: 1, // GABIX
};

const OPERATORS: TelecomOperator[] = [
    { name: 'Airtel Gabon', type: 'mobile', ownership: 'Bharti Airtel (Inde)', subscribers: 1_350_000, marketShare: 46, coverage4G: 78, technologies: ['4G LTE', '3G', '2G', 'Airtel Money'], status: 'active' },
    { name: 'Moov Africa (ex-Gabon Télécom)', type: 'mobile', ownership: 'Maroc Télécom / État', subscribers: 1_250_000, marketShare: 42, coverage4G: 72, technologies: ['4G LTE', '3G', '2G', 'Moov Money'], status: 'active' },
    { name: 'Libertis (Gabon Télécom)', type: 'fixe', ownership: 'Maroc Télécom / État', subscribers: 28_000, marketShare: 100, coverage4G: 0, technologies: ['ADSL', 'Fibre FTTH', 'RTC'], status: 'active' },
    { name: 'GDC (Gabon Data Center)', type: 'isp', ownership: 'État / Partenariat', subscribers: 0, marketShare: 0, coverage4G: 0, technologies: ['Hébergement', 'Cloud', 'Colocation'], status: 'active' },
    { name: 'Matrix Telecoms', type: 'isp', ownership: 'Privé gabonais', subscribers: 12_000, marketShare: 3, coverage4G: 0, technologies: ['VSAT', 'Fibre entreprise', 'WiMAX'], status: 'active' },
    { name: 'Azur (ex-Bintel)', type: 'mobile', ownership: 'Groupe Azur', subscribers: 350_000, marketShare: 12, coverage4G: 35, technologies: ['3G', '2G'], status: 'active' },
];

const INFRA_PROJECTS = [
    { name: 'CAB (Central African Backbone)', status: 'opérationnel', investment: 85, description: 'Dorsale fibre optique nationale 2 800 km reliant 9 provinces' },
    { name: 'ACE (câble sous-marin)', status: 'opérationnel', investment: 45, description: 'Câble sous-marin Libreville-Europe, capacité 12.8 Tbps' },
    { name: 'SAIL (câble sous-marin)', status: 'opérationnel', investment: 35, description: 'Câble Cameroun-Brésil via Libreville, redondance' },
    { name: 'GABIX (Point d\'échange)', status: 'opérationnel', investment: 5, description: 'Internet Exchange Point national, réduction latence locale' },
    { name: 'Smart Gabon — Phase 2', status: 'en cours', investment: 120, description: 'e-Gouvernement, identité numérique, plateforme services publics' },
    { name: 'Couverture 4G rurale', status: 'en cours', investment: 65, description: 'Extension 4G zones rurales, objectif 90% couverture 2027' },
    { name: '5G Libreville (pilote)', status: 'planifié', investment: 40, description: 'Réseau 5G pilote zone économique spéciale de Nkok' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function TelecomDashboardPage() {
    const [view, setView] = useState<'operators' | 'infra'>('operators');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Wifi className="h-7 w-7 text-indigo-600" />
                            Télécommunications & Numérique
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.mobilePenetration}% pénétration mobile · {GLOBAL.internetPenetration}% internet · {GLOBAL.telecomGDP}% du PIB
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">ARCEP · ANINF · Code télécom 2019</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-indigo-500" />
                            <div><p className="text-lg font-bold text-indigo-600">{(GLOBAL.mobileSubscriptions / 1_000_000).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Abonnés mobile</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.internetUsers / 1_000_000).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Utilisateurs internet</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Cable className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{(GLOBAL.fiberKm / 1000).toFixed(1)}k km</p><p className="text-[10px] text-muted-foreground">Fibre optique</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.telecomRevenue} Mds</p><p className="text-[10px] text-muted-foreground">Revenus FCFA</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coverage bar */}
                <Card>
                    <CardContent className="p-3">
                        <p className="text-[9px] text-muted-foreground mb-1.5">Couverture réseau nationale</p>
                        <div className="flex items-center gap-1">
                            {[
                                { label: '4G', pct: GLOBAL.coverage4G, color: 'bg-indigo-400' },
                                { label: '3G', pct: GLOBAL.coverage3G - GLOBAL.coverage4G, color: 'bg-blue-300' },
                                { label: '2G', pct: GLOBAL.coverage2G - GLOBAL.coverage3G, color: 'bg-gray-300' },
                            ].map((s, i) => (
                                <div key={i} className="text-center" style={{ flex: s.pct }}>
                                    <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 2 ? 'rounded-r' : ''}`} />
                                    <p className="text-[7px] mt-0.5">{s.label} ({i === 0 ? GLOBAL.coverage4G : i === 1 ? GLOBAL.coverage3G : GLOBAL.coverage2G}%)</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'operators' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('operators')}>Opérateurs</Button>
                    <Button variant={view === 'infra' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('infra')}>Infrastructures</Button>
                </div>

                {view === 'operators' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Opérateur</th>
                                    <th className="text-center py-2 px-2">Type</th>
                                    <th className="text-center py-2 px-2">Abonnés</th>
                                    <th className="text-center py-2 px-2">Part marché</th>
                                    <th className="text-center py-2 px-2">4G</th>
                                </tr></thead>
                                <tbody>{OPERATORS.map((o, i) => {
                                    const typeBadge = { mobile: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', isp: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', fixe: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
                                    return (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2 px-3"><p className="font-bold">{o.name}</p><p className="text-[8px] text-muted-foreground">{o.ownership}</p></td>
                                            <td className="text-center py-2 px-2"><Badge className={`text-[6px] h-3 ${typeBadge[o.type]}`}>{o.type}</Badge></td>
                                            <td className="text-center py-2 px-2 font-mono">{o.subscribers > 0 ? (o.subscribers >= 1_000_000 ? `${(o.subscribers / 1_000_000).toFixed(1)}M` : `${(o.subscribers / 1000).toFixed(0)}k`) : '—'}</td>
                                            <td className="text-center py-2 px-2 font-bold">{o.marketShare > 0 ? `${o.marketShare}%` : '—'}</td>
                                            <td className="text-center py-2 px-2">{o.coverage4G > 0 ? <span className="font-bold text-indigo-600">{o.coverage4G}%</span> : '—'}</td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                            <div className="p-3 text-[9px] text-muted-foreground flex gap-2 flex-wrap">
                                {OPERATORS.filter(o => o.type === 'mobile').map((o, i) => (
                                    <span key={i}>{o.technologies.join(' · ')}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {view === 'infra' && (
                    <div className="space-y-2">
                        {INFRA_PROJECTS.map((p, i) => {
                            const statusBadge = { 'opérationnel': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 'en cours': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 'planifié': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
                            return (
                                <Card key={i}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                            <Server className="h-4 w-4 text-indigo-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${statusBadge[p.status as keyof typeof statusBadge]}`}>{p.status === 'opérationnel' ? '✓ Opérationnel' : p.status === 'en cours' ? '🔧 En cours' : '📋 Planifié'}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{p.name}</p>
                                            <p className="text-[9px] text-muted-foreground">{p.description}</p>
                                            <p className="text-[9px] text-amber-600 font-bold mt-0.5">{p.investment} Mds FCFA</p>
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
