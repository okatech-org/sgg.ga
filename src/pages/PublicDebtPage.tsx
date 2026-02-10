/**
 * SGG Digital — Dette Publique
 *
 * Suivi de l'endettement de l'État gabonais :
 *   - Encours dette (intérieure, extérieure)
 *   - Créanciers et instruments
 *   - Ratios de soutenabilité
 *   - Service de la dette et amortissement
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Landmark, TrendingDown, DollarSign, PieChart,
    AlertTriangle, BarChart3, Globe, Building2,
    ArrowDown, ArrowUp,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface DebtInstrument {
    name: string;
    type: 'eurobond' | 'bilateral' | 'multilateral' | 'domestic' | 'concessional';
    creditor: string;
    amount: number; // Mds FCFA
    currency: string;
    maturity: string;
    rate: string;
    status: 'active' | 'in_grace' | 'maturing';
}

const GLOBAL = {
    totalDebt: 6_850, // Mds FCFA
    externalDebt: 4_200, // Mds
    domesticDebt: 2_650, // Mds
    debtToGDP: 52.8, // %
    debtService2025: 1_450, // Mds FCFA
    interestPayments: 520,
    principalRepayments: 930,
    gdpNominal: 12_970, // Mds FCFA
    fiscalRevenue: 3_200, // Mds
    debtServiceToRevenue: 45.3, // %
    avgInterestRate: 5.8, // %
    avgMaturity: 8.5, // years
    concessionalShare: 22, // %
};

const DEBT_EVOLUTION = [
    { year: 2019, total: 4_800, external: 3_100, domestic: 1_700, ratio: 58.2 },
    { year: 2020, total: 5_600, external: 3_500, domestic: 2_100, ratio: 77.3 },
    { year: 2021, total: 6_100, external: 3_800, domestic: 2_300, ratio: 66.5 },
    { year: 2022, total: 6_400, external: 3_950, domestic: 2_450, ratio: 57.8 },
    { year: 2023, total: 6_600, external: 4_050, domestic: 2_550, ratio: 54.2 },
    { year: 2024, total: 6_750, external: 4_150, domestic: 2_600, ratio: 53.5 },
    { year: 2025, total: 6_850, external: 4_200, domestic: 2_650, ratio: 52.8 },
];

const INSTRUMENTS: DebtInstrument[] = [
    { name: 'Eurobond 2025 — 6.375%', type: 'eurobond', creditor: 'Marchés internationaux', amount: 850, currency: 'USD', maturity: '2025-06', rate: '6.375%', status: 'maturing' },
    { name: 'Eurobond 2028 — 6.95%', type: 'eurobond', creditor: 'Marchés internationaux', amount: 620, currency: 'USD', maturity: '2028-01', rate: '6.95%', status: 'active' },
    { name: 'Eurobond 2031 — 7.00%', type: 'eurobond', creditor: 'Marchés internationaux', amount: 580, currency: 'USD', maturity: '2031-11', rate: '7.00%', status: 'active' },
    { name: 'FMI — Facilité élargie de crédit', type: 'multilateral', creditor: 'FMI', amount: 450, currency: 'DTS', maturity: '2029', rate: '2.1%', status: 'active' },
    { name: 'Banque Mondiale — IDA / IBRD', type: 'multilateral', creditor: 'Banque Mondiale', amount: 380, currency: 'USD', maturity: '2035', rate: '1.8%', status: 'active' },
    { name: 'BAD — Budget appui', type: 'multilateral', creditor: 'BAD', amount: 280, currency: 'UC', maturity: '2032', rate: '2.5%', status: 'active' },
    { name: 'AFD — C2D Gabon', type: 'bilateral', creditor: 'France (AFD)', amount: 320, currency: 'EUR', maturity: '2030', rate: '1.2%', status: 'active' },
    { name: 'China Eximbank — Infrastructures', type: 'bilateral', creditor: 'Chine', amount: 420, currency: 'CNY', maturity: '2033', rate: '3.5%', status: 'active' },
    { name: 'OTA — Bons du Trésor BEAC', type: 'domestic', creditor: 'Marché régional CEMAC', amount: 850, currency: 'FCFA', maturity: 'Court terme', rate: '4.5%', status: 'active' },
    { name: 'OAT — Obligations assimilables', type: 'domestic', creditor: 'Marché régional CEMAC', amount: 1_100, currency: 'FCFA', maturity: '5-10 ans', rate: '6.2%', status: 'active' },
    { name: 'Fonds Koweitien', type: 'concessional', creditor: 'Koweït', amount: 85, currency: 'KWD', maturity: '2038', rate: '1.0%', status: 'active' },
    { name: 'BID — Développement social', type: 'concessional', creditor: 'Banque Islamique', amount: 120, currency: 'USD', maturity: '2036', rate: '1.5%', status: 'in_grace' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function PublicDebtPage() {
    const [view, setView] = useState<'instruments' | 'evolution'>('instruments');

    const typeCfg: Record<string, { label: string; color: string }> = {
        eurobond: { label: 'Eurobond', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        bilateral: { label: 'Bilatéral', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        multilateral: { label: 'Multilatéral', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        domestic: { label: 'Domestique', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        concessional: { label: 'Concessionnel', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Landmark className="h-7 w-7 text-red-600" />
                            Dette Publique
                        </h1>
                        <p className="text-muted-foreground">
                            Encours : {GLOBAL.totalDebt.toLocaleString()} Mds FCFA · Ratio dette/PIB : {GLOBAL.debtToGDP}%
                        </p>
                    </div>
                    <Badge className={`text-xs ${GLOBAL.debtToGDP > 60 ? 'bg-red-100 text-red-700' : GLOBAL.debtToGDP > 45 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {GLOBAL.debtToGDP > 60 ? '🔴 Zone critique' : GLOBAL.debtToGDP > 45 ? '🟡 Zone surveillance' : '🟢 Soutenable'}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{(GLOBAL.externalDebt / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Dette extérieure (Mds)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{(GLOBAL.domesticDebt / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Dette intérieure (Mds)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.debtService2025.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Service dette 2025</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.debtServiceToRevenue}%</p><p className="text-[10px] text-muted-foreground">Service/Recettes</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Debt composition bar */}
                <Card>
                    <CardContent className="p-3 flex items-center gap-1">
                        {[
                            { label: 'Extérieure', pct: Math.round(GLOBAL.externalDebt / GLOBAL.totalDebt * 100), color: 'bg-red-400' },
                            { label: 'Intérieure', pct: Math.round(GLOBAL.domesticDebt / GLOBAL.totalDebt * 100), color: 'bg-amber-400' },
                        ].map((s, i) => (
                            <div key={i} className="text-center" style={{ flex: s.pct }}>
                                <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : 'rounded-r'}`} />
                                <p className="text-[7px] mt-0.5">{s.label} ({s.pct}%)</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex gap-1">
                    <Button variant={view === 'instruments' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('instruments')}>Instruments</Button>
                    <Button variant={view === 'evolution' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('evolution')}>Évolution</Button>
                </div>

                {view === 'instruments' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Instrument</th>
                                    <th className="text-center py-2 px-2">Type</th>
                                    <th className="text-center py-2 px-2">Montant</th>
                                    <th className="text-center py-2 px-2">Taux</th>
                                    <th className="text-center py-2 px-2">Échéance</th>
                                </tr></thead>
                                <tbody>{INSTRUMENTS.map((d, i) => {
                                    const tc = typeCfg[d.type] || typeCfg.bilateral;
                                    return (
                                        <tr key={i} className={`border-b hover:bg-muted/20 ${d.status === 'maturing' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                            <td className="py-2 px-3"><p className="font-bold text-[10px]">{d.name}</p><p className="text-[8px] text-muted-foreground">{d.creditor}</p></td>
                                            <td className="text-center py-2 px-2"><Badge className={`text-[6px] h-3 ${tc.color}`}>{tc.label}</Badge></td>
                                            <td className="text-center py-2 px-2 font-mono font-bold">{d.amount} Mds</td>
                                            <td className="text-center py-2 px-2 font-mono text-[9px]">{d.rate}</td>
                                            <td className="text-center py-2 px-2 text-[9px]">
                                                {d.status === 'maturing' && <Badge className="text-[6px] h-3 bg-red-100 text-red-700">⚠️ Échéance</Badge>}
                                                {d.status !== 'maturing' && <span>{d.maturity}</span>}
                                            </td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'evolution' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Évolution de la dette 2019-2025</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {DEBT_EVOLUTION.map((d, i) => {
                                const prev = i > 0 ? DEBT_EVOLUTION[i - 1] : null;
                                const diff = prev ? d.ratio - prev.ratio : 0;
                                return (
                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-8 font-bold shrink-0">{d.year}</span>
                                        <div className="flex-1 flex gap-0.5">
                                            <div className="h-4 bg-red-400 rounded-l" style={{ width: `${(d.external / 8000) * 100}%` }} />
                                            <div className="h-4 bg-amber-400 rounded-r" style={{ width: `${(d.domestic / 8000) * 100}%` }} />
                                        </div>
                                        <span className="w-16 text-right font-mono shrink-0">{d.total.toLocaleString()}</span>
                                        <span className={`w-12 text-right font-bold shrink-0 ${d.ratio > 60 ? 'text-red-600' : d.ratio > 50 ? 'text-amber-600' : 'text-green-600'}`}>{d.ratio}%</span>
                                        {diff !== 0 && (
                                            <span className={`text-[8px] ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {diff > 0 ? <ArrowUp className="h-2.5 w-2.5 inline" /> : <ArrowDown className="h-2.5 w-2.5 inline" />}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="flex justify-center gap-4 mt-2 text-[8px]">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" /> Extérieure</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400" /> Intérieure</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-2">
                                Taux moyen : {GLOBAL.avgInterestRate}% · Maturité moyenne : {GLOBAL.avgMaturity} ans · Part concessionnelle : {GLOBAL.concessionalShare}%
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
