/**
 * SGG Digital — Registre des Associations & ONG
 *
 * Registre officiel des organisations de la société civile :
 *   - Associations déclarées
 *   - ONG nationales et internationales
 *   - Fondations
 *   - Statuts et domaines d'intervention
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Heart, Search, Building2, Users,
    MapPin, Calendar, CheckCircle2, Clock,
    AlertTriangle, Globe, Leaf, Stethoscope,
    GraduationCap, Shield,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type OrgType = 'association' | 'ong-nationale' | 'ong-internationale' | 'fondation';
type OrgStatus = 'active' | 'suspended' | 'dissolved';
type OrgDomain = 'Environnement' | 'Santé' | 'Éducation' | 'Droits humains' | 'Développement' | 'Culture' | 'Jeunesse' | 'Femmes';

interface Organization {
    id: string;
    name: string;
    acronym?: string;
    type: OrgType;
    status: OrgStatus;
    domain: OrgDomain;
    president: string;
    founded: number;
    members: number;
    province: string;
    description: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<OrgType, { label: string; badge: string }> = {
    association: { label: 'Association', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    'ong-nationale': { label: 'ONG Nationale', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'ong-internationale': { label: 'ONG Internationale', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    fondation: { label: 'Fondation', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const DOMAIN_ICONS: Record<OrgDomain, typeof Globe> = {
    Environnement: Leaf,
    Santé: Stethoscope,
    Éducation: GraduationCap,
    'Droits humains': Shield,
    Développement: Globe,
    Culture: Heart,
    Jeunesse: Users,
    Femmes: Users,
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const ORGANIZATIONS: Organization[] = [
    { id: 'o1', name: 'Brainforest', type: 'ong-nationale', status: 'active', domain: 'Environnement', president: 'Marc Ona Essangui', founded: 1998, members: 85, province: 'Estuaire', description: 'Défense de l\'environnement et gouvernance des ressources naturelles.' },
    { id: 'o2', name: 'Croix-Rouge gabonaise', acronym: 'CRG', type: 'ong-nationale', status: 'active', domain: 'Santé', president: 'Dr. Mboumba', founded: 1966, members: 2500, province: 'National', description: 'Action humanitaire, secours d\'urgence et aide aux populations vulnérables.' },
    { id: 'o3', name: 'WWF Gabon', type: 'ong-internationale', status: 'active', domain: 'Environnement', president: 'Délégation régionale', founded: 2002, members: 120, province: 'Multi-provinces', description: 'Conservation de la biodiversité et gestion durable des forêts gabonaises.' },
    { id: 'o4', name: 'Fondation Sylvia Bongo Ondimba', acronym: 'FSBO', type: 'fondation', status: 'active', domain: 'Femmes', president: 'Sylvia Bongo Ondimba', founded: 2011, members: 320, province: 'National', description: 'Droits des femmes, lutte contre les violences basées sur le genre.' },
    { id: 'o5', name: 'Association des Jeunes Engagés du Gabon', acronym: 'AJEG', type: 'association', status: 'active', domain: 'Jeunesse', president: 'Alain Mouanga', founded: 2018, members: 450, province: 'Estuaire', description: 'Insertion professionnelle et engagement citoyen des jeunes.' },
    { id: 'o6', name: 'Médecins du Monde — Gabon', type: 'ong-internationale', status: 'active', domain: 'Santé', president: 'Dr. Fournier', founded: 2005, members: 65, province: 'Estuaire', description: 'Accès aux soins pour les populations les plus vulnérables.' },
    { id: 'o7', name: 'Réseau des Organisations Libres pour la Bonne Gouvernance', acronym: 'ROLBG', type: 'ong-nationale', status: 'active', domain: 'Droits humains', president: 'Georges Mpaga', founded: 2006, members: 180, province: 'Estuaire', description: 'Transparence, gouvernance démocratique et droits de l\'homme.' },
    { id: 'o8', name: 'Fondation Raponda Walker', type: 'fondation', status: 'active', domain: 'Culture', president: 'Pierre Nzambi', founded: 2001, members: 95, province: 'Estuaire', description: 'Promotion du patrimoine culturel et linguistique du Gabon.' },
    { id: 'o9', name: 'Association des Parents d\'Élèves de Mouila', acronym: 'APEM', type: 'association', status: 'active', domain: 'Éducation', president: 'Marie-Claire Mboula', founded: 2012, members: 380, province: 'Ngounié', description: 'Accompagnement scolaire et infrastructure éducative à Mouila.' },
    { id: 'o10', name: 'Action Sociale de Développement', acronym: 'ASD', type: 'association', status: 'suspended', domain: 'Développement', president: 'N/A', founded: 2015, members: 45, province: 'Haut-Ogooué', description: 'Développement communautaire en milieu rural — activité suspendue.' },
];

const GLOBAL = {
    totalOrgs: 3_420,
    active: 2_850,
    associations: 2_100,
    ongNationales: 680,
    ongInternationales: 120,
    fondations: 85,
    suspended: 435,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function NGORegistryPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<OrgType | 'all'>('all');

    const filtered = useMemo(() => {
        return ORGANIZATIONS.filter(o => {
            if (typeFilter !== 'all' && o.type !== typeFilter) return false;
            if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !(o.acronym?.toLowerCase().includes(search.toLowerCase()))) return false;
            return true;
        });
    }, [search, typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Heart className="h-7 w-7 text-rose-500" />
                            Registre des Associations & ONG
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalOrgs.toLocaleString()} organisations enregistrées · {GLOBAL.active.toLocaleString()} actives
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Loi 35/62 sur les associations</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.associations.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Associations</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.ongNationales}</p><p className="text-[10px] text-muted-foreground">ONG Nationales</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.ongInternationales}</p><p className="text-[10px] text-muted-foreground">ONG Internationales</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.suspended}</p><p className="text-[10px] text-muted-foreground">Suspendues</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher par nom ou sigle..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                        {(Object.keys(TYPE_CFG) as OrgType[]).map(t => (
                            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {filtered.map(o => {
                        const tcfg = TYPE_CFG[o.type];
                        const DomainIcon = DOMAIN_ICONS[o.domain];
                        return (
                            <Card key={o.id} className={o.status === 'suspended' ? 'opacity-60 border-amber-200 dark:border-amber-800' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                                            <DomainIcon className="h-4 w-4 text-rose-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge className={`text-[7px] h-3.5 ${tcfg.badge}`}>{tcfg.label}</Badge>
                                                <Badge variant="outline" className="text-[7px] h-3">{o.domain}</Badge>
                                                {o.status === 'suspended' && <Badge className="text-[7px] h-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Suspendue</Badge>}
                                            </div>
                                            <p className="text-xs font-bold">{o.name}{o.acronym && <span className="text-muted-foreground"> ({o.acronym})</span>}</p>
                                            <p className="text-[10px] text-muted-foreground mb-0.5">{o.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{o.members} membres</span>
                                                <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />Depuis {o.founded}</span>
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{o.province}</span>
                                                <span>Présidence : {o.president}</span>
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
