/**
 * SGG Digital — Registre des Cultes & Confessions Religieuses
 *
 * Suivi de la liberté religieuse et des confessions :
 *   - Églises, mosquées, temples enregistrés
 *   - Confessions reconnues officiellement
 *   - Répartition géographique
 *   - Demandes d'agrément
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Church, Search, MapPin, Users,
    CheckCircle2, Clock, Scale,
    BookOpen, Star,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ConfessionType = 'christianisme' | 'islam' | 'animisme' | 'autre';

interface ReligiousOrg {
    name: string;
    type: ConfessionType;
    branch: string;
    registered: number;
    lieux: number; // nombre de lieux de culte
    adherents: number;
    headquarters: string;
    status: 'reconnue' | 'déclarée' | 'en attente';
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<ConfessionType, { label: string; color: string }> = {
    christianisme: { label: 'Christianisme', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    islam: { label: 'Islam', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    animisme: { label: 'Religions traditionnelles', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    autre: { label: 'Autre', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const GLOBAL = {
    totalOrgs: 1_280,
    totalLieux: 4_500,
    reconnues: 480,
    declarees: 650,
    enAttente: 150,
    chretiens: 73, // %
    musulmans: 12,
    animistes: 10,
    autres: 5,
    totalAdherents: 2_150_000,
};

const ORGS: ReligiousOrg[] = [
    { name: 'Église Catholique du Gabon', type: 'christianisme', branch: 'Catholique', registered: 1842, lieux: 850, adherents: 680_000, headquarters: 'Libreville (Archevêché)', status: 'reconnue' },
    { name: 'Église Évangélique du Gabon', type: 'christianisme', branch: 'Protestant (réformé)', registered: 1842, lieux: 320, adherents: 280_000, headquarters: 'Libreville', status: 'reconnue' },
    { name: 'Alliance Chrétienne et Missionnaire', type: 'christianisme', branch: 'Protestant (évangélique)', registered: 1934, lieux: 220, adherents: 180_000, headquarters: 'Libreville', status: 'reconnue' },
    { name: 'Assemblées de Dieu du Gabon', type: 'christianisme', branch: 'Pentecôtiste', registered: 1965, lieux: 380, adherents: 250_000, headquarters: 'Libreville', status: 'reconnue' },
    { name: 'Église Adventiste du 7e Jour', type: 'christianisme', branch: 'Adventiste', registered: 1958, lieux: 150, adherents: 95_000, headquarters: 'Libreville', status: 'reconnue' },
    { name: 'Conseil Supérieur Islamique du Gabon', type: 'islam', branch: 'Sunnite / Malékite', registered: 1970, lieux: 280, adherents: 250_000, headquarters: 'Libreville (Grande Mosquée)', status: 'reconnue' },
    { name: 'Bwiti (tradition initiatique Fang)', type: 'animisme', branch: 'Initiatique / Iboga', registered: 0, lieux: 0, adherents: 150_000, headquarters: 'Pratique communautaire', status: 'reconnue' },
    { name: 'Mwiri (tradition initiatique)', type: 'animisme', branch: 'Initiatique masculine', registered: 0, lieux: 0, adherents: 80_000, headquarters: 'Pratique communautaire', status: 'reconnue' },
    { name: 'Église du Plein Évangile', type: 'christianisme', branch: 'Pentecôtiste', registered: 1985, lieux: 120, adherents: 65_000, headquarters: 'Libreville', status: 'déclarée' },
    { name: 'Église de Jésus-Christ des Saints des Derniers Jours', type: 'christianisme', branch: 'Mormon', registered: 1990, lieux: 8, adherents: 5_000, headquarters: 'Libreville', status: 'déclarée' },
    { name: 'Communauté Bahá\'íe du Gabon', type: 'autre', branch: 'Bahá\'í', registered: 1970, lieux: 12, adherents: 8_000, headquarters: 'Libreville', status: 'déclarée' },
    { name: 'Témoins de Jéhovah', type: 'christianisme', branch: 'Témoins de Jéhovah', registered: 1968, lieux: 45, adherents: 15_000, headquarters: 'Libreville', status: 'déclarée' },
];

const PROVINCE_STATS = [
    { province: 'Estuaire', lieux: 1_200, pct: 27 },
    { province: 'Haut-Ogooué', lieux: 580, pct: 13 },
    { province: 'Ogooué-Maritime', lieux: 420, pct: 9 },
    { province: 'Woleu-Ntem', lieux: 520, pct: 12 },
    { province: 'Ngounié', lieux: 380, pct: 8 },
    { province: 'Moyen-Ogooué', lieux: 350, pct: 8 },
    { province: 'Nyanga', lieux: 280, pct: 6 },
    { province: 'Ogooué-Ivindo', lieux: 400, pct: 9 },
    { province: 'Ogooué-Lolo', lieux: 370, pct: 8 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ReligiousRegistryPage() {
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'list' | 'stats'>('list');

    const filtered = useMemo(() => {
        return ORGS.filter(o => {
            if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.branch.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Church className="h-7 w-7 text-violet-600" />
                            Cultes & Confessions Religieuses
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalOrgs.toLocaleString()} organisations · {GLOBAL.totalLieux.toLocaleString()} lieux de culte · Art. 1 Constitution (laïcité)
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGAT · Loi 35/62 · Laïcité</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Church className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.chretiens}%</p><p className="text-[10px] text-muted-foreground">Chrétiens</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Star className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.musulmans}%</p><p className="text-[10px] text-muted-foreground">Musulmans</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.animistes}%</p><p className="text-[10px] text-muted-foreground">Religions trad.</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.reconnues}</p><p className="text-[10px] text-muted-foreground">Reconnues</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Répartition bar */}
                <Card>
                    <CardContent className="p-3">
                        <p className="text-[9px] text-muted-foreground mb-1.5">Répartition confessionnelle</p>
                        <div className="flex items-center gap-0.5">
                            {[
                                { label: 'Chrétiens', pct: GLOBAL.chretiens, color: 'bg-blue-400' },
                                { label: 'Musulmans', pct: GLOBAL.musulmans, color: 'bg-green-400' },
                                { label: 'Trad.', pct: GLOBAL.animistes, color: 'bg-amber-400' },
                                { label: 'Autres', pct: GLOBAL.autres, color: 'bg-gray-300' },
                            ].map((s, i) => (
                                <div key={i} className="text-center" style={{ flex: s.pct }}>
                                    <div className={`h-4 ${s.color} ${i === 0 ? 'rounded-l' : ''} ${i === 3 ? 'rounded-r' : ''}`} />
                                    <p className="text-[7px] mt-0.5">{s.label} ({s.pct}%)</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-2 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une confession..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('list')}>Registre</Button>
                        <Button variant={view === 'stats' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('stats')}>Par province</Button>
                    </div>
                </div>

                {view === 'list' && (
                    <div className="space-y-2">
                        {filtered.map((o, i) => {
                            const tcfg = TYPE_CFG[o.type];
                            const statusIcon = o.status === 'reconnue' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : o.status === 'déclarée' ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> : <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
                            return (
                                <Card key={i}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                                            <Church className="h-4 w-4 text-violet-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${tcfg.color}`}>{tcfg.label}</Badge>
                                                <Badge variant="outline" className="text-[6px] h-3">{o.branch}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{o.name}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5 flex-wrap">
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{o.headquarters}</span>
                                                <span><b className="text-foreground">{o.adherents.toLocaleString()}</b> fidèles</span>
                                                {o.lieux > 0 && <span>{o.lieux} lieux de culte</span>}
                                                {o.registered > 0 && <span>Depuis {o.registered}</span>}
                                            </div>
                                        </div>
                                        {statusIcon}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'stats' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Lieux de culte par province</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {PROVINCE_STATS.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-24 font-bold shrink-0">{s.province}</span>
                                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-400 rounded-full flex items-center justify-end pr-1" style={{ width: `${s.pct * 3.5}%` }}>
                                            <span className="text-[7px] text-white font-bold">{s.pct}%</span>
                                        </div>
                                    </div>
                                    <span className="w-12 text-right font-mono shrink-0">{s.lieux.toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
