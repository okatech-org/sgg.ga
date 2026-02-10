/**
 * SGG Digital — Communication Gouvernementale
 *
 * Centre de suivi des communications officielles :
 *   - Communiqués de presse
 *   - Discours officiels
 *   - Conférences de presse
 *   - Couverture médiatique
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Megaphone, Newspaper, Mic2, FileText,
    Calendar, Eye, TrendingUp, Radio,
    Tv, Globe, Clock, Users,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type CommType = 'communique' | 'discours' | 'conference' | 'point-presse';
type CommChannel = 'Gabon 1ère' | 'Presse écrite' | 'Réseaux sociaux' | 'Radio' | 'Web officiel' | 'Multiple';

interface Communication {
    id: string;
    title: string;
    type: CommType;
    speaker: string;
    institution: string;
    date: string;
    channel: CommChannel;
    reach: number;
    summary: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<CommType, { label: string; icon: typeof Megaphone; badge: string }> = {
    communique: { label: 'Communiqué', icon: FileText, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    discours: { label: 'Discours', icon: Mic2, badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    conference: { label: 'Conférence', icon: Tv, badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'point-presse': { label: 'Point presse', icon: Radio, badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const COMMS: Communication[] = [
    { id: 'c1', title: 'Convocation du Conseil des Ministres du 7 février 2026', type: 'communique', speaker: 'Porte-parole du Gouvernement', institution: 'Primature', date: '6 fév 2026', channel: 'Multiple', reach: 850_000, summary: 'Ordre du jour : réforme foncière, budget supplémentaire, nominations.' },
    { id: 'c2', title: 'Discours à la Nation — Bilan de la Transition', type: 'discours', speaker: 'Président de la Transition', institution: 'Présidence', date: '5 fév 2026', channel: 'Gabon 1ère', reach: 1_200_000, summary: 'Bilan des 18 mois de transition, calendrier électoral, réformes structurelles.' },
    { id: 'c3', title: 'Point de presse sur la campagne de vaccination', type: 'point-presse', speaker: 'Ministre de la Santé', institution: 'MINSANTE', date: '4 fév 2026', channel: 'Radio', reach: 420_000, summary: 'Lancement de la campagne DTC3 dans les 9 provinces, objectif 90% couverture d\'ici juin.' },
    { id: 'c4', title: 'Conférence internationale sur la forêt gabonaise', type: 'conference', speaker: 'Ministre des Eaux et Forêts', institution: 'MINEF', date: '3 fév 2026', channel: 'Web officiel', reach: 180_000, summary: 'Présentation du programme « Gabon Vert » et des résultats REDD+.' },
    { id: 'c5', title: 'Résultats du concours d\'entrée à la Fonction Publique', type: 'communique', speaker: 'DG Fonction Publique', institution: 'MFPRE', date: '2 fév 2026', channel: 'Presse écrite', reach: 320_000, summary: '2 500 postes pourvus sur 8 000 candidatures. Publication des listes sur le portail officiel.' },
    { id: 'c6', title: 'Position du Gabon au Sommet de l\'Union Africaine', type: 'discours', speaker: 'Ministre des Affaires Étrangères', institution: 'MAECICPG', date: '1 fév 2026', channel: 'Gabon 1ère', reach: 680_000, summary: 'Plaidoyer pour la réforme du Conseil de Sécurité et la force continentale de sécurité.' },
    { id: 'c7', title: 'Mise en service de la fibre optique à Port-Gentil', type: 'communique', speaker: 'Ministre du Numérique', institution: 'MTNHDN', date: '30 jan 2026', channel: 'Réseaux sociaux', reach: 550_000, summary: '15 000 foyers connectés. Débit moyen de 50 Mbps. Prochaine phase : Franceville.' },
    { id: 'c8', title: 'Conférence de presse sur la loi de finances rectificative', type: 'conference', speaker: 'Ministre de l\'Économie', institution: 'MINEFI', date: '28 jan 2026', channel: 'Multiple', reach: 720_000, summary: 'Ajustements budgétaires suite à la baisse des cours pétroliers. Mesures d\'austérité ciblées.' },
];

const GLOBAL = {
    totalComms: 248,
    thisMonth: 15,
    totalReach: 12_500_000,
    channels: 6,
};

const CHANNEL_STATS = [
    { channel: 'Gabon 1ère (TV)', reach: 4_200_000, pct: 34, color: 'bg-blue-500' },
    { channel: 'Réseaux sociaux', reach: 3_800_000, pct: 30, color: 'bg-violet-500' },
    { channel: 'Radio nationale', reach: 2_100_000, pct: 17, color: 'bg-amber-500' },
    { channel: 'Presse écrite', reach: 1_200_000, pct: 10, color: 'bg-green-500' },
    { channel: 'Web officiel', reach: 800_000, pct: 6, color: 'bg-cyan-500' },
    { channel: 'Agences presse', reach: 400_000, pct: 3, color: 'bg-gray-400' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function GovCommunicationPage() {
    const [typeFilter, setTypeFilter] = useState<CommType | 'all'>('all');

    const filtered = useMemo(() => {
        if (typeFilter === 'all') return COMMS;
        return COMMS.filter(c => c.type === typeFilter);
    }, [typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Megaphone className="h-7 w-7 text-orange-500" />
                            Communication Gouvernementale
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalComms} communications · Audience cumulée : {(GLOBAL.totalReach / 1_000_000).toFixed(1)}M
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Porte-parole du Gouvernement</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-orange-500" />
                            <div><p className="text-lg font-bold text-orange-600">{GLOBAL.thisMonth}</p><p className="text-[10px] text-muted-foreground">Ce mois</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.totalReach / 1_000_000).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Audience cumulée</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.totalComms}</p><p className="text-[10px] text-muted-foreground">Total 2026</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Radio className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.channels}</p><p className="text-[10px] text-muted-foreground">Canaux actifs</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Channel reach */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Portée par canal</CardTitle></CardHeader>
                        <CardContent className="space-y-1.5">
                            {CHANNEL_STATS.map((ch, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] mb-0.5">
                                        <span className="font-bold">{ch.channel}</span>
                                        <span>{(ch.reach / 1_000_000).toFixed(1)}M ({ch.pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Type breakdown */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Par type</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {(Object.entries(TYPE_CFG) as [CommType, typeof TYPE_CFG[CommType]][]).map(([key, cfg]) => {
                                const count = COMMS.filter(c => c.type === key).length;
                                const Icon = cfg.icon;
                                return (
                                    <div key={key} className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="text-[10px] flex-1 font-bold">{cfg.label}</span>
                                        <span className="text-xs font-bold">{count}</span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Filter */}
                <div className="flex gap-1">
                    <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                    {(Object.entries(TYPE_CFG) as [CommType, typeof TYPE_CFG[CommType]][]).map(([key, cfg]) => (
                        <Button key={key} variant={typeFilter === key ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(key)}>{cfg.label}</Button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-2">
                    {filtered.map(c => {
                        const tcfg = TYPE_CFG[c.type];
                        const Icon = tcfg.icon;
                        return (
                            <Card key={c.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                            <Icon className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge className={`text-[7px] h-3.5 ${tcfg.badge}`}>{tcfg.label}</Badge>
                                                <Badge variant="outline" className="text-[7px] h-3">{c.channel}</Badge>
                                                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{c.date}</span>
                                            </div>
                                            <p className="text-xs font-bold mb-0.5">{c.title}</p>
                                            <p className="text-[10px] text-muted-foreground mb-1">{c.summary}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                                                <span className="font-bold">{c.speaker}</span>
                                                <span>·</span>
                                                <span>{c.institution}</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{(c.reach / 1000).toFixed(0)}k audience</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
