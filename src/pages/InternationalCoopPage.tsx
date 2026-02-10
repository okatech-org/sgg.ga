/**
 * SGG Digital — Coopération Internationale
 *
 * Suivi des partenariats et accords internationaux :
 *   - Accords bilatéraux et multilatéraux
 *   - Projets financés par les bailleurs
 *   - Représentations diplomatiques
 *   - Volume d'aide au développement
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Handshake, Globe, Trophy, DollarSign,
    Building2, Users, Calendar, TrendingUp,
    Flag, CheckCircle2, Clock, MapPin,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type PartnerType = 'bilateral' | 'multilateral' | 'ong' | 'ppp';
type ProjectStatus = 'active' | 'completed' | 'negotiation';

interface Partner {
    id: string;
    name: string;
    type: PartnerType;
    country?: string;
    sectors: string[];
    totalFunding: number; // Millions USD
    activeProjects: number;
    since: number;
}

interface CoopProject {
    id: string;
    title: string;
    partner: string;
    funding: number;
    status: ProjectStatus;
    sector: string;
    province: string;
    startYear: number;
    endYear: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<PartnerType, { label: string; badge: string }> = {
    bilateral: { label: 'Bilatéral', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    multilateral: { label: 'Multilatéral', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    ong: { label: 'ONG', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    ppp: { label: 'PPP', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const PARTNERS: Partner[] = [
    { id: 'p1', name: 'France (AFD)', type: 'bilateral', country: '🇫🇷', sectors: ['Éducation', 'Santé', 'Gouvernance'], totalFunding: 320, activeProjects: 8, since: 1960 },
    { id: 'p2', name: 'Chine', type: 'bilateral', country: '🇨🇳', sectors: ['Infrastructure', 'Numérique', 'Énergie'], totalFunding: 580, activeProjects: 12, since: 1974 },
    { id: 'p3', name: 'Banque Mondiale', type: 'multilateral', sectors: ['Gouvernance', 'Réforme fiscale', 'Climat'], totalFunding: 450, activeProjects: 6, since: 1963 },
    { id: 'p4', name: 'FMI', type: 'multilateral', sectors: ['Politique économique', 'Dette'], totalFunding: 400, activeProjects: 2, since: 1963 },
    { id: 'p5', name: 'Union Européenne', type: 'multilateral', country: '🇪🇺', sectors: ['Forêt', 'Gouvernance', 'Commerce'], totalFunding: 180, activeProjects: 5, since: 1975 },
    { id: 'p6', name: 'BAD (Banque Africaine)', type: 'multilateral', sectors: ['Transports', 'Énergie', 'Agriculture'], totalFunding: 290, activeProjects: 7, since: 1972 },
    { id: 'p7', name: 'OMS', type: 'multilateral', sectors: ['Santé publique'], totalFunding: 45, activeProjects: 3, since: 1960 },
    { id: 'p8', name: 'PNUD', type: 'multilateral', sectors: ['ODD', 'Gouvernance', 'Environnement'], totalFunding: 65, activeProjects: 4, since: 1965 },
    { id: 'p9', name: 'WWF Gabon', type: 'ong', sectors: ['Conservation', 'Parcs nationaux'], totalFunding: 35, activeProjects: 3, since: 2002 },
    { id: 'p10', name: 'Olam International', type: 'ppp', country: '🇸🇬', sectors: ['ZES Nkok', 'Huile de palme', 'Bois'], totalFunding: 250, activeProjects: 4, since: 2010 },
];

const PROJECTS: CoopProject[] = [
    { id: 'cp1', title: 'Programme d\'appui à la gouvernance (PAGOS)', partner: 'France (AFD)', funding: 45, status: 'active', sector: 'Gouvernance', province: 'National', startYear: 2024, endYear: 2027 },
    { id: 'cp2', title: 'Construction Pont Kango', partner: 'Chine', funding: 130, status: 'active', sector: 'Infrastructure', province: 'Estuaire', startYear: 2025, endYear: 2028 },
    { id: 'cp3', title: 'Extended Credit Facility', partner: 'FMI', funding: 400, status: 'active', sector: 'Économie', province: 'National', startYear: 2026, endYear: 2029 },
    { id: 'cp4', title: 'Programme FLEGT — Bois légal', partner: 'Union Européenne', funding: 25, status: 'active', sector: 'Forêt', province: 'National', startYear: 2023, endYear: 2026 },
    { id: 'cp5', title: 'Réhabilitation route Franceville-Bongoville', partner: 'BAD', funding: 85, status: 'active', sector: 'Transports', province: 'Haut-Ogooué', startYear: 2024, endYear: 2027 },
    { id: 'cp6', title: 'Gabon Bleu — Aires marines protégées', partner: 'WWF Gabon', funding: 12, status: 'active', sector: 'Environnement', province: 'Multi-provinces', startYear: 2020, endYear: 2030 },
    { id: 'cp7', title: 'Vaccination COVID + maladies infantiles', partner: 'OMS', funding: 18, status: 'completed', sector: 'Santé', province: 'National', startYear: 2021, endYear: 2025 },
    { id: 'cp8', title: 'Centrale solaire Nkok (50 MW)', partner: 'Olam International', funding: 75, status: 'active', sector: 'Énergie', province: 'Estuaire', startYear: 2025, endYear: 2027 },
];

const GLOBAL = {
    totalPartners: PARTNERS.length,
    totalFunding: PARTNERS.reduce((s, p) => s + p.totalFunding, 0),
    activeProjects: PROJECTS.filter(p => p.status === 'active').length,
    completedProjects: PROJECTS.filter(p => p.status === 'completed').length,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function InternationalCoopPage() {
    const [view, setView] = useState<'partners' | 'projects'>('partners');
    const [typeFilter, setTypeFilter] = useState<PartnerType | 'all'>('all');

    const filteredPartners = typeFilter === 'all' ? PARTNERS : PARTNERS.filter(p => p.type === typeFilter);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Handshake className="h-7 w-7 text-sky-600" />
                            Coopération Internationale
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalPartners} partenaires · {GLOBAL.totalFunding.toLocaleString()} M USD · {GLOBAL.activeProjects} projets actifs
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">🇬🇦 Diplomatie multilatérale</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-sky-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-sky-500" />
                            <div><p className="text-lg font-bold text-sky-600">{GLOBAL.totalPartners}</p><p className="text-[10px] text-muted-foreground">Partenaires</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{(GLOBAL.totalFunding / 1000).toFixed(1)} Mds</p><p className="text-[10px] text-muted-foreground">USD mobilisés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.activeProjects}</p><p className="text-[10px] text-muted-foreground">Projets actifs</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.completedProjects}</p><p className="text-[10px] text-muted-foreground">Projets terminés</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* View toggle */}
                <div className="flex gap-1">
                    <Button variant={view === 'partners' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('partners')}>Partenaires</Button>
                    <Button variant={view === 'projects' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('projects')}>Projets</Button>
                </div>

                {/* Partners */}
                {view === 'partners' && (
                    <>
                        <div className="flex gap-1 flex-wrap">
                            <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                            {(['bilateral', 'multilateral', 'ong', 'ppp'] as PartnerType[]).map(t => (
                                <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredPartners.map(p => (
                                <Card key={p.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {p.country && <span className="text-lg">{p.country}</span>}
                                            <p className="text-xs font-bold flex-1">{p.name}</p>
                                            <Badge className={`text-[7px] h-3.5 ${TYPE_CFG[p.type].badge}`}>{TYPE_CFG[p.type].label}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1.5">
                                            <span className="font-bold text-foreground">{p.totalFunding} M USD</span>
                                            <span>{p.activeProjects} projets actifs</span>
                                            <span>Depuis {p.since}</span>
                                        </div>
                                        <div className="flex gap-1 flex-wrap">
                                            {p.sectors.map((s, i) => (
                                                <Badge key={i} variant="outline" className="text-[7px] h-3">{s}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Projects */}
                {view === 'projects' && (
                    <div className="space-y-2">
                        {PROJECTS.map(p => (
                            <Card key={p.id} className={p.status === 'completed' ? 'opacity-70' : ''}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${p.status === 'active' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        {p.status === 'active' ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{p.title}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <span className="font-bold text-foreground">{p.funding} M USD</span>
                                            <span>→ {p.partner}</span>
                                            <Badge variant="outline" className="text-[7px] h-3">{p.sector}</Badge>
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.province}</span>
                                            <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{p.startYear}–{p.endYear}</span>
                                        </div>
                                    </div>
                                    <Badge className={`text-[7px] h-3.5 ${p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {p.status === 'active' ? 'Actif' : 'Terminé'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
