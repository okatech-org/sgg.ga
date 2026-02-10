/**
 * SGG Digital — Registre des Associations & ONG
 *
 * Base de données des organisations de la société civile :
 *   - Associations déclarées
 *   - ONG nationales et internationales
 *   - Secteurs d'intervention
 *   - Statut juridique et agrément
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Heart, Users, Search, MapPin,
    Globe, CheckCircle2, Clock,
    HandHeart, Scale, Leaf,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type OrgType = 'association' | 'ong_nationale' | 'ong_internationale' | 'fondation' | 'syndicat';
type Sector = 'santé' | 'éducation' | 'environnement' | 'droits humains' | 'développement' | 'culture' | 'jeunesse';

interface CivilOrg {
    name: string;
    acronym: string;
    type: OrgType;
    sector: Sector;
    location: string;
    founded: number;
    members: number;
    status: 'agréée' | 'déclarée' | 'en attente';
    description: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<OrgType, { label: string; color: string }> = {
    association: { label: 'Association', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ong_nationale: { label: 'ONG nationale', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    ong_internationale: { label: 'ONG internationale', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    fondation: { label: 'Fondation', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    syndicat: { label: 'Syndicat', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const GLOBAL = {
    totalOrgs: 3_450,
    associations: 2_800,
    ongNationales: 280,
    ongInternationales: 85,
    fondations: 45,
    syndicats: 240,
    agreees: 1_850,
    declarees: 1_200,
    enAttente: 400,
    totalMembers: 185_000,
};

const ORGS: CivilOrg[] = [
    { name: 'Croix-Rouge Gabonaise', acronym: 'CRG', type: 'ong_nationale', sector: 'santé', location: 'Libreville', founded: 1966, members: 8_500, status: 'agréée', description: 'Secours, urgences, premiers soins, formation' },
    { name: 'Brainforest', acronym: 'BF', type: 'ong_nationale', sector: 'environnement', location: 'Libreville', founded: 1998, members: 450, status: 'agréée', description: 'Protection forêts, droits communautés, transparence extractive' },
    { name: 'WWF Gabon', acronym: 'WWF', type: 'ong_internationale', sector: 'environnement', location: 'Libreville', founded: 2000, members: 120, status: 'agréée', description: 'Conservation biodiversité, parcs nationaux, lutte braconnage' },
    { name: 'Médecins Sans Frontières', acronym: 'MSF', type: 'ong_internationale', sector: 'santé', location: 'Libreville', founded: 1985, members: 95, status: 'agréée', description: 'Urgences médicales, accès soins populations vulnérables' },
    { name: 'Association Mères et Enfants du Gabon', acronym: 'AMEG', type: 'association', sector: 'santé', location: 'Libreville', founded: 2008, members: 1_200, status: 'agréée', description: 'Santé maternelle, nutrition infantile, vaccination' },
    { name: 'Réseau des Organisations de la Société Civile', acronym: 'ROSCEVAO', type: 'ong_nationale', sector: 'droits humains', location: 'Libreville', founded: 2005, members: 2_500, status: 'agréée', description: 'Coordination société civile, transparence, gouvernance' },
    { name: 'Fondation Sylvia Bongo Ondimba', acronym: 'FSBO', type: 'fondation', sector: 'développement', location: 'Libreville', founded: 2011, members: 350, status: 'agréée', description: 'Aide sociale, éducation, autonomisation femmes' },
    { name: 'WCS Gabon (Wildlife Conservation Society)', acronym: 'WCS', type: 'ong_internationale', sector: 'environnement', location: 'Libreville', founded: 1985, members: 180, status: 'agréée', description: 'Conservation faune, gestion parcs, recherche scientifique' },
    { name: 'Association des Jeunes Entrepreneurs du Gabon', acronym: 'AJEG', type: 'association', sector: 'jeunesse', location: 'Libreville', founded: 2015, members: 3_200, status: 'agréée', description: 'Entrepreneuriat jeune, formation, mentorat, incubation' },
    { name: 'Synergie Nationale des Instituteurs', acronym: 'SYNAFI', type: 'syndicat', sector: 'éducation', location: 'Libreville', founded: 1995, members: 4_800, status: 'agréée', description: 'Défense droits enseignants, conditions travail, formation' },
    { name: 'Gabon ma Terre', acronym: 'GMT', type: 'association', sector: 'environnement', location: 'Libreville', founded: 2018, members: 850, status: 'déclarée', description: 'Éducation environnementale, recyclage, nettoyage plages' },
    { name: 'Union Générale des Travailleurs du Gabon', acronym: 'UGTG', type: 'syndicat', sector: 'droits humains', location: 'Libreville', founded: 1969, members: 12_000, status: 'agréée', description: 'Défense des droits des travailleurs, négociations collectives' },
];

const SECTOR_STATS = [
    { sector: 'Santé', count: 680, pct: 20 },
    { sector: 'Éducation', count: 520, pct: 15 },
    { sector: 'Environnement', count: 450, pct: 13 },
    { sector: 'Développement', count: 620, pct: 18 },
    { sector: 'Droits humains', count: 380, pct: 11 },
    { sector: 'Culture', count: 420, pct: 12 },
    { sector: 'Jeunesse & Sport', count: 380, pct: 11 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AssociationsRegistryPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<OrgType | 'all'>('all');
    const [view, setView] = useState<'list' | 'stats'>('list');

    const filtered = useMemo(() => {
        return ORGS.filter(o => {
            if (typeFilter !== 'all' && o.type !== typeFilter) return false;
            if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.acronym.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Heart className="h-7 w-7 text-pink-600" />
                            Associations & ONG
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalOrgs.toLocaleString()} organisations · {GLOBAL.totalMembers.toLocaleString()} membres · {GLOBAL.agreees.toLocaleString()} agréées
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGAT · Loi 35/62 associations</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.associations / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Associations</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <HandHeart className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.ongNationales}</p><p className="text-[10px] text-muted-foreground">ONG nationales</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-purple-500" />
                            <div><p className="text-lg font-bold text-purple-600">{GLOBAL.ongInternationales}</p><p className="text-[10px] text-muted-foreground">ONG internat.</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.agreees.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Agréées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Scale className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.syndicats}</p><p className="text-[10px] text-muted-foreground">Syndicats</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une organisation..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('list')}>Registre</Button>
                        <Button variant={view === 'stats' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('stats')}>Par secteur</Button>
                    </div>
                </div>

                {view === 'list' && (
                    <>
                        <div className="flex gap-1 flex-wrap">
                            <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                            {(Object.keys(TYPE_CFG) as OrgType[]).map(t => (
                                <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {filtered.map((o, i) => {
                                const tcfg = TYPE_CFG[o.type];
                                const statusIcon = o.status === 'agréée' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : o.status === 'déclarée' ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> : <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
                                return (
                                    <Card key={i}>
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center shrink-0">
                                                <Heart className="h-4 w-4 text-pink-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                    <Badge variant="outline" className="text-[7px] h-3 font-bold">{o.acronym}</Badge>
                                                    <Badge className={`text-[6px] h-3 ${tcfg.color}`}>{tcfg.label}</Badge>
                                                </div>
                                                <p className="text-xs font-bold">{o.name}</p>
                                                <p className="text-[9px] text-muted-foreground">{o.description}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5 flex-wrap">
                                                    <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{o.location}</span>
                                                    <span><b className="text-foreground">{o.members.toLocaleString()}</b> membres</span>
                                                    <span>Depuis {o.founded}</span>
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
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Organisations par secteur d'intervention</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {SECTOR_STATS.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-24 font-bold shrink-0">{s.sector}</span>
                                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-400 rounded-full flex items-center justify-end pr-1" style={{ width: `${s.pct * 4.5}%` }}>
                                            <span className="text-[7px] text-white font-bold">{s.pct}%</span>
                                        </div>
                                    </div>
                                    <span className="w-10 text-right font-mono shrink-0">{s.count}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
