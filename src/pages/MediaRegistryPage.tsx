/**
 * SGG Digital — Registre des Médias & Presse
 *
 * Annuaire du paysage médiatique national :
 *   - Presse écrite, audiovisuel, en ligne
 *   - Licences et agréments CNC
 *   - Liberté de presse et pluralisme
 *   - Agences et correspondants
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Newspaper, Radio, Tv, Globe,
    Search, Users, MapPin, CheckCircle2,
    AlertTriangle, Mic,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type MediaType = 'print' | 'tv' | 'radio' | 'online' | 'agency';

interface MediaOutlet {
    name: string;
    type: MediaType;
    owner: string;
    status: 'active' | 'suspended' | 'inactive';
    location: string;
    audience: string;
    isPublic: boolean;
    year: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<MediaType, { label: string; icon: typeof Newspaper }> = {
    print: { label: 'Presse écrite', icon: Newspaper },
    tv: { label: 'Télévision', icon: Tv },
    radio: { label: 'Radio', icon: Radio },
    online: { label: 'En ligne', icon: Globe },
    agency: { label: 'Agence', icon: Mic },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const OUTLETS: MediaOutlet[] = [
    { name: 'Gabon 1ère (Télévision)', type: 'tv', owner: 'État / RTG', status: 'active', location: 'Libreville', audience: 'Nationale', isPublic: true, year: 1963 },
    { name: 'Gabon 1ère (Radio)', type: 'radio', owner: 'État / RTG', status: 'active', location: 'Libreville', audience: 'Nationale + FM', isPublic: true, year: 1959 },
    { name: 'Gabon 24', type: 'tv', owner: 'État', status: 'active', location: 'Libreville', audience: 'Continue / Info', isPublic: true, year: 2024 },
    { name: 'L\'Union', type: 'print', owner: 'État / Sonapresse', status: 'active', location: 'Libreville', audience: 'Quotidien national', isPublic: true, year: 1974 },
    { name: 'Gabon Media Time (GMT)', type: 'online', owner: 'Privé', status: 'active', location: 'Libreville', audience: 'Web / Réseaux', isPublic: false, year: 2015 },
    { name: 'Radio Africa n°1', type: 'radio', owner: 'Privé (Afrimedit)', status: 'active', location: 'Libreville', audience: 'Panafricaine', isPublic: false, year: 1981 },
    { name: 'TV+', type: 'tv', owner: 'Groupe TV+', status: 'active', location: 'Libreville', audience: 'Nationale', isPublic: false, year: 2005 },
    { name: 'AGP (Agence Gabonaise de Presse)', type: 'agency', owner: 'État', status: 'active', location: 'Libreville', audience: 'Dépêches', isPublic: true, year: 1966 },
    { name: 'Echos du Nord', type: 'print', owner: 'Privé', status: 'active', location: 'Libreville', audience: 'Hebdomadaire', isPublic: false, year: 2007 },
    { name: 'Info241', type: 'online', owner: 'Privé', status: 'active', location: 'Libreville / Paris', audience: 'Web diaspora', isPublic: false, year: 2012 },
    { name: 'Gabonreview', type: 'online', owner: 'Privé', status: 'active', location: 'Libreville', audience: 'Web analyse', isPublic: false, year: 2011 },
    { name: 'Radio Sainte-Marie', type: 'radio', owner: 'Église catholique', status: 'active', location: 'Libreville', audience: 'Communautaire', isPublic: false, year: 1998 },
];

const GLOBAL = {
    totalMedia: 85,
    tvChannels: 8,
    radioStations: 25,
    printMedia: 18,
    onlineMedia: 28,
    agencies: 6,
    publicMedia: 12,
    privateMedia: 73,
    journalists: 450,
    pressFreedomRank: 92, // RSF
    cncLicenses: 62,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function MediaRegistryPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');

    const filtered = useMemo(() => {
        return OUTLETS.filter(o => {
            if (typeFilter !== 'all' && o.type !== typeFilter) return false;
            if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Newspaper className="h-7 w-7 text-indigo-600" />
                            Registre des Médias & Presse
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalMedia} médias · {GLOBAL.journalists} journalistes · CNC : {GLOBAL.cncLicenses} licences
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">CNC · RSF : {GLOBAL.pressFreedomRank}e mondial</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Tv className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.tvChannels}</p><p className="text-[10px] text-muted-foreground">TV</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Radio className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.radioStations}</p><p className="text-[10px] text-muted-foreground">Radios</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-gray-500" />
                            <div><p className="text-lg font-bold text-gray-600">{GLOBAL.printMedia}</p><p className="text-[10px] text-muted-foreground">Presse</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.onlineMedia}</p><p className="text-[10px] text-muted-foreground">En ligne</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.journalists}</p><p className="text-[10px] text-muted-foreground">Journalistes</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un média..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                        {(Object.keys(TYPE_CFG) as MediaType[]).map(t => (
                            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {filtered.map((o, i) => {
                        const tcfg = TYPE_CFG[o.type];
                        const Icon = tcfg.icon;
                        return (
                            <Card key={i}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <Badge variant="outline" className="text-[7px] h-3">{tcfg.label}</Badge>
                                            {o.isPublic && <Badge className="text-[7px] h-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Public</Badge>}
                                            {!o.isPublic && <Badge className="text-[7px] h-3 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Privé</Badge>}
                                        </div>
                                        <p className="text-xs font-bold">{o.name}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <span>{o.owner}</span>
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{o.location}</span>
                                            <span>{o.audience}</span>
                                            <span className="text-[8px]">Depuis {o.year}</span>
                                        </div>
                                    </div>
                                    {o.status === 'active' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
