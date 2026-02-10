/**
 * SGG Digital — Propriété Intellectuelle
 *
 * Registre national de la propriété intellectuelle :
 *   - Brevets, marques, dessins industriels
 *   - Droits d'auteur et droits voisins
 *   - Demandes et enregistrements OAPI
 *   - Protection et contentieux
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Lightbulb, Shield, FileText, Search,
    TrendingUp, BarChart3, Globe,
    CheckCircle2, Clock, Users,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type IPType = 'brevet' | 'marque' | 'dessin' | 'droit_auteur' | 'indication_geo';

interface IPRecord {
    title: string;
    type: IPType;
    holder: string;
    filingDate: string;
    status: 'registered' | 'pending' | 'expired';
    sector: string;
    oapi: boolean;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<IPType, { label: string; color: string }> = {
    brevet: { label: 'Brevet', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    marque: { label: 'Marque', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    dessin: { label: 'Dessin industriel', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    droit_auteur: { label: 'Droit d\'auteur', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    indication_geo: { label: 'Indication géo.', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const GLOBAL = {
    totalRegistrations: 2_850,
    brevets: 85,
    marques: 1_800,
    dessins: 280,
    droitAuteur: 620,
    indicationsGeo: 65,
    pendingRequests: 340,
    annualFilings: 450,
    oapiMember: true,
    contentieux: 28,
    agents: 12,
};

const RECORDS: IPRecord[] = [
    { title: 'Procédé de transformation de l\'Okoumé', type: 'brevet', holder: 'IRAF / État gabonais', filingDate: '2024-03-15', status: 'registered', sector: 'Bois / Industrie', oapi: true },
    { title: 'Chocolat de Ntoum — Fèves du Gabon', type: 'marque', holder: 'Société Cacao Gabon SA', filingDate: '2023-11-20', status: 'registered', sector: 'Agroalimentaire', oapi: true },
    { title: 'Logo République Gabonaise (nouvelle charte)', type: 'dessin', holder: 'État gabonais / CTRI', filingDate: '2024-09-01', status: 'registered', sector: 'Identité visuelle', oapi: false },
    { title: 'Musique traditionnelle Bwiti — Compilation', type: 'droit_auteur', holder: 'BUGADA', filingDate: '2023-06-10', status: 'registered', sector: 'Musique', oapi: false },
    { title: 'Application mobile Service-Public.ga', type: 'brevet', holder: 'ANINF', filingDate: '2025-01-08', status: 'pending', sector: 'Technologies', oapi: true },
    { title: 'Iboga du Gabon', type: 'indication_geo', holder: 'République Gabonaise', filingDate: '2022-05-12', status: 'registered', sector: 'Pharmacopée', oapi: true },
    { title: 'Motifs textiles Gabonais — Collection Nzèbi', type: 'dessin', holder: 'Artisanat Gabon SARL', filingDate: '2024-07-22', status: 'registered', sector: 'Textile / Artisanat', oapi: true },
    { title: 'Sauce Odika — Recette brevetée', type: 'brevet', holder: 'Gabon Food Innovation', filingDate: '2025-02-01', status: 'pending', sector: 'Agroalimentaire', oapi: true },
    { title: 'GABON 24 — Marque audiovisuelle', type: 'marque', holder: 'RTG / État', filingDate: '2024-01-15', status: 'registered', sector: 'Médias', oapi: true },
    { title: 'Roman \"Les Enfants de la Forêt\"', type: 'droit_auteur', holder: 'Bessora (autrice)', filingDate: '2023-09-30', status: 'registered', sector: 'Littérature', oapi: false },
    { title: 'Vanille de Tchibanga', type: 'indication_geo', holder: 'Coopérative Nyanga', filingDate: '2024-11-05', status: 'pending', sector: 'Agriculture', oapi: true },
];

const ANNUAL_STATS = [
    { year: 2020, filings: 280, registered: 210 },
    { year: 2021, filings: 310, registered: 245 },
    { year: 2022, filings: 350, registered: 290 },
    { year: 2023, filings: 390, registered: 320 },
    { year: 2024, filings: 420, registered: 355 },
    { year: 2025, filings: 450, registered: 380 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function IntellectualPropertyPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<IPType | 'all'>('all');
    const [view, setView] = useState<'records' | 'stats'>('records');

    const filtered = useMemo(() => {
        return RECORDS.filter(r => {
            if (typeFilter !== 'all' && r.type !== typeFilter) return false;
            if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Lightbulb className="h-7 w-7 text-yellow-600" />
                            Propriété Intellectuelle
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalRegistrations.toLocaleString()} enregistrements · {GLOBAL.annualFilings} dépôts/an · OAPI membre
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">OAPI · DGPI · {GLOBAL.contentieux} contentieux</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.brevets}</p><p className="text-[10px] text-muted-foreground">Brevets</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-500" />
                            <div><p className="text-lg font-bold text-purple-600">{GLOBAL.marques.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Marques</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.dessins}</p><p className="text-[10px] text-muted-foreground">Dessins ind.</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.droitAuteur}</p><p className="text-[10px] text-muted-foreground">Droits d'auteur</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.pendingRequests}</p><p className="text-[10px] text-muted-foreground">En attente</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un titre..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={view === 'records' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('records')}>Registre</Button>
                        <Button variant={view === 'stats' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('stats')}>Statistiques</Button>
                    </div>
                </div>

                {view === 'records' && (
                    <>
                        <div className="flex gap-1 flex-wrap">
                            <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                            {(Object.keys(TYPE_CFG) as IPType[]).map(t => (
                                <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {filtered.map((r, i) => {
                                const tcfg = TYPE_CFG[r.type];
                                const statusIcon = r.status === 'registered' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
                                return (
                                    <Card key={i}>
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                    <Badge className={`text-[7px] h-3 ${tcfg.color}`}>{tcfg.label}</Badge>
                                                    {r.oapi && <Badge variant="outline" className="text-[6px] h-3">OAPI</Badge>}
                                                </div>
                                                <p className="text-xs font-bold">{r.title}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                    <span>{r.holder}</span>
                                                    <span>{r.sector}</span>
                                                    <span className="text-[8px]">{r.filingDate}</span>
                                                </div>
                                            </div>
                                            {statusIcon}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}

                {view === 'stats' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Dépôts et enregistrements par année</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {ANNUAL_STATS.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-8 font-bold shrink-0">{s.year}</span>
                                    <div className="flex-1 flex items-center gap-0.5">
                                        <div className="h-4 bg-yellow-300 rounded-l" style={{ width: `${(s.filings / 500) * 100}%` }} />
                                        <div className="h-4 bg-green-400 rounded-r" style={{ width: `${(s.registered / 500) * 100}%` }} />
                                    </div>
                                    <span className="w-20 text-right text-[9px] shrink-0">{s.filings} / {s.registered}</span>
                                </div>
                            ))}
                            <div className="flex justify-center gap-4 mt-2 text-[8px]">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-300" /> Dépôts</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" /> Enregistrés</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
