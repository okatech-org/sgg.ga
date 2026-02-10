/**
 * SGG Digital — Documentation Juridique
 *
 * Base de données juridique nationale :
 *   - Lois et ordonnances
 *   - Décrets et arrêtés
 *   - Traités et conventions
 *   - Journal Officiel numérique
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    BookOpen, Search, FileText, Scale,
    Calendar, Tag, Download, ScrollText,
    Gavel, Globe, Building2,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type LegalType = 'loi' | 'ordonnance' | 'decret' | 'arrete' | 'traite' | 'constitution';

interface LegalDocument {
    id: string;
    ref: string;
    title: string;
    type: LegalType;
    date: string;
    year: number;
    domain: string;
    authority: string;
    status: 'en vigueur' | 'abrogé' | 'modifié';
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<LegalType, { label: string; icon: typeof FileText; badge: string }> = {
    constitution: { label: 'Constitution', icon: ScrollText, badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    loi: { label: 'Loi', icon: Scale, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ordonnance: { label: 'Ordonnance', icon: Gavel, badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    decret: { label: 'Décret', icon: FileText, badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    arrete: { label: 'Arrêté', icon: FileText, badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    traite: { label: 'Traité', icon: Globe, badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const DOCUMENTS: LegalDocument[] = [
    { id: 'd1', ref: 'Constitution 2026', title: 'Constitution de la République Gabonaise (projet référendum)', type: 'constitution', date: 'Avril 2026', year: 2026, domain: 'Droit constitutionnel', authority: 'Assemblée constituante / CTRI', status: 'en vigueur' },
    { id: 'd2', ref: 'Loi n° 001/2025', title: 'Loi organique relative au Conseil constitutionnel', type: 'loi', date: '15 mars 2025', year: 2025, domain: 'Institutions', authority: 'Assemblée nationale', status: 'en vigueur' },
    { id: 'd3', ref: 'Ordonnance n° 015/2024', title: 'Portant organisation de la transition', type: 'ordonnance', date: '30 août 2024', year: 2024, domain: 'Droit constitutionnel', authority: 'CTRI', status: 'en vigueur' },
    { id: 'd4', ref: 'Décret n° 0042/2026', title: 'Fixant les modalités d\'organisation du référendum constitutionnel', type: 'decret', date: '5 fév 2026', year: 2026, domain: 'Élections', authority: 'Premier Ministre', status: 'en vigueur' },
    { id: 'd5', ref: 'Loi n° 016/2022', title: 'Relative au Code du travail', type: 'loi', date: '10 déc 2022', year: 2022, domain: 'Droit du travail', authority: 'Assemblée nationale', status: 'en vigueur' },
    { id: 'd6', ref: 'Loi n° 007/2014', title: 'Relative à la protection de l\'environnement', type: 'loi', date: '1 août 2014', year: 2014, domain: 'Environnement', authority: 'Assemblée nationale', status: 'modifié' },
    { id: 'd7', ref: 'Décret n° 0185/2025', title: 'Portant réforme du système foncier national', type: 'decret', date: '20 oct 2025', year: 2025, domain: 'Foncier', authority: 'Premier Ministre', status: 'en vigueur' },
    { id: 'd8', ref: 'Arrêté n° 0023/2026', title: 'Fixant le barème des frais d\'inscription au RCCM', type: 'arrete', date: '12 jan 2026', year: 2026, domain: 'Commerce', authority: 'Ministre de la Justice', status: 'en vigueur' },
    { id: 'd9', ref: 'Traité CEMAC révisé', title: 'Traité révisé de la CEMAC', type: 'traite', date: '25 jun 2008', year: 2008, domain: 'Intégration régionale', authority: 'Conférence des Chefs d\'État CEMAC', status: 'en vigueur' },
    { id: 'd10', ref: 'Loi n° 042/2018', title: 'Portant Code des marchés publics', type: 'loi', date: '5 jul 2018', year: 2018, domain: 'Marchés publics', authority: 'Assemblée nationale', status: 'en vigueur' },
];

const GLOBAL = {
    totalDocuments: 12_450,
    laws: 2_800,
    ordinances: 450,
    decrees: 5_200,
    arretes: 3_600,
    treaties: 215,
    constitutions: 8,
    joPublished: 1_850,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function LegalDocumentationPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<LegalType | 'all'>('all');

    const filtered = useMemo(() => {
        return DOCUMENTS.filter(d => {
            if (typeFilter !== 'all' && d.type !== typeFilter) return false;
            if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.ref.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <BookOpen className="h-7 w-7 text-amber-600" />
                            Documentation Juridique
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalDocuments.toLocaleString()} textes juridiques · {GLOBAL.joPublished.toLocaleString()} JO numérisés
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Journal Officiel numérique</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Scale className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.laws.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Lois</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.decrees.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Décrets</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.ordinances}</p><p className="text-[10px] text-muted-foreground">Ordonnances</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-cyan-500" />
                            <div><p className="text-lg font-bold text-cyan-600">{GLOBAL.treaties}</p><p className="text-[10px] text-muted-foreground">Traités</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un texte juridique..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                        {(Object.keys(TYPE_CFG) as LegalType[]).map(t => (
                            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {filtered.map(d => {
                        const tcfg = TYPE_CFG[d.type];
                        const Icon = tcfg.icon;
                        return (
                            <Card key={d.id} className={d.type === 'constitution' ? 'border-l-4 border-l-amber-500' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                            <Icon className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge className={`text-[7px] h-3.5 ${tcfg.badge}`}>{tcfg.label}</Badge>
                                                <Badge variant="outline" className="text-[7px] h-3">{d.domain}</Badge>
                                                <Badge variant="outline" className={`text-[7px] h-3 ${d.status === 'abrogé' ? 'text-red-600 border-red-200' : d.status === 'modifié' ? 'text-amber-600 border-amber-200' : ''}`}>{d.status}</Badge>
                                            </div>
                                            <p className="text-[9px] font-mono text-muted-foreground mb-0.5">{d.ref}</p>
                                            <p className="text-xs font-bold">{d.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{d.date}</span>
                                                <span className="flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{d.authority}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0"><Download className="h-3 w-3" /></Button>
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
