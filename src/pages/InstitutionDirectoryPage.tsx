/**
 * SGG Digital — Annuaire Institutionnel
 *
 * Répertoire complet des institutions de la République :
 *   - Classification par type et tutelle
 *   - Informations de contact
 *   - Recherche et filtrage
 *   - Vue grille/liste
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Landmark, Search, Grid3X3, List,
    MapPin, Phone, Mail, Globe,
    Users, Building2, ChevronRight,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type InstitutionType = 'Ministère' | 'Agence' | 'Commission' | 'Secrétariat' | 'Autorité';

interface Institution {
    id: string;
    name: string;
    acronym: string;
    type: InstitutionType;
    head: string;
    headTitle: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    effectifs: number;
    website?: string;
    isActive: boolean;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<InstitutionType, string> = {
    Ministère: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Agence: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Commission: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Secrétariat: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Autorité: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const INSTITUTIONS: Institution[] = [
    { id: 'i1', name: 'Secrétariat Général du Gouvernement', acronym: 'SGG', type: 'Secrétariat', head: 'Jean-Fidèle OTANDAULT', headTitle: 'Secrétaire Général', phone: '+241 01 76 45 00', email: 'sg@gouvernement.ga', address: 'Boulevard Triomphal, Libreville', province: 'Estuaire', effectifs: 450, website: 'www.sgg.ga', isActive: true },
    { id: 'i2', name: 'Ministère de l\'Économie et de la Relance', acronym: 'MINER', type: 'Ministère', head: 'Nicole JEANINE LYSSA', headTitle: 'Ministre', phone: '+241 01 76 21 10', email: 'contact@economie.gouv.ga', address: 'Bd de l\'Indépendance, Libreville', province: 'Estuaire', effectifs: 1250, isActive: true },
    { id: 'i3', name: 'Ministère de la Santé', acronym: 'MINSANTE', type: 'Ministère', head: 'Adrien NKOGHE ESSINGONE', headTitle: 'Ministre', phone: '+241 01 76 32 15', email: 'contact@sante.gouv.ga', address: 'Rue Alfred Marche, Libreville', province: 'Estuaire', effectifs: 3200, isActive: true },
    { id: 'i4', name: 'Ministère de l\'Éducation Nationale', acronym: 'MENETP', type: 'Ministère', head: 'Camélia NTOUTOUME-LECLERCQ', headTitle: 'Ministre', phone: '+241 01 72 10 50', email: 'contact@education.gouv.ga', address: 'BP 2217, Libreville', province: 'Estuaire', effectifs: 8500, isActive: true },
    { id: 'i5', name: 'Agence Nationale de Promotion des Investissements', acronym: 'ANPI', type: 'Agence', head: 'Poste vacant', headTitle: 'Directeur Général', phone: '+241 01 44 97 00', email: 'info@anpi.ga', address: 'Immeuble Rénovation, Libreville', province: 'Estuaire', effectifs: 120, website: 'www.anpi.ga', isActive: true },
    { id: 'i6', name: 'Commission Nationale de Lutte contre la Corruption', acronym: 'CNLCEI', type: 'Commission', head: 'Nestor MBOU', headTitle: 'Président', phone: '+241 01 76 80 50', email: 'contact@cnlcei.ga', address: 'Libreville Centre', province: 'Estuaire', effectifs: 65, isActive: true },
    { id: 'i7', name: 'Autorité de Régulation des Communications', acronym: 'ARCEP', type: 'Autorité', head: 'Lin MOMBO', headTitle: 'Président', phone: '+241 01 44 93 00', email: 'info@arcep.ga', address: 'Bd du Bord de Mer, Libreville', province: 'Estuaire', effectifs: 85, website: 'www.arcep.ga', isActive: true },
    { id: 'i8', name: 'Ministère de la Défense Nationale', acronym: 'MDN', type: 'Ministère', head: 'Brigitte ONKANOWA', headTitle: 'Ministre', phone: '+241 01 76 10 00', email: 'contact@defense.gouv.ga', address: 'Camp Baraka, Libreville', province: 'Estuaire', effectifs: 6000, isActive: true },
    { id: 'i9', name: 'Ministère des Affaires Étrangères', acronym: 'MAECICPG', type: 'Ministère', head: 'Michael MOUSSA-ADAMO', headTitle: 'Ministre', phone: '+241 01 72 21 00', email: 'contact@diplomatie.gouv.ga', address: 'Bd de l\'Indépendance, Libreville', province: 'Estuaire', effectifs: 1800, isActive: true },
    { id: 'i10', name: 'Agence Gabonaise de Développement et d\'Aménagement', acronym: 'AGDA', type: 'Agence', head: 'Martin BOGUIENET', headTitle: 'Directeur Général', phone: '+241 01 73 45 00', email: 'contact@agda.ga', address: 'Zone industrielle, Libreville', province: 'Estuaire', effectifs: 200, isActive: true },
    { id: 'i11', name: 'Secrétariat Général de la Présidence', acronym: 'SGPR', type: 'Secrétariat', head: 'Murielle MINKOUE MINTSA', headTitle: 'Secrétaire Général', phone: '+241 01 76 00 01', email: 'sg@presidence.ga', address: 'Palais Rénovation, Libreville', province: 'Estuaire', effectifs: 350, isActive: true },
    { id: 'i12', name: 'Ministère des Transports', acronym: 'MINTRANS', type: 'Ministère', head: 'Loïc MOUYABI', headTitle: 'Ministre', phone: '+241 01 76 40 00', email: 'contact@transports.gouv.ga', address: 'BP 803, Libreville', province: 'Estuaire', effectifs: 800, isActive: false },
];

const TYPES: InstitutionType[] = ['Ministère', 'Agence', 'Commission', 'Secrétariat', 'Autorité'];

// ── Component ───────────────────────────────────────────────────────────────

export default function InstitutionDirectoryPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return INSTITUTIONS.filter(inst => {
            if (typeFilter !== 'all' && inst.type !== typeFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!inst.name.toLowerCase().includes(q) && !inst.acronym.toLowerCase().includes(q) && !inst.head.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [search, typeFilter]);

    const selected = selectedId ? INSTITUTIONS.find(i => i.id === selectedId) : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Landmark className="h-7 w-7 text-amber-600" />
                        Annuaire Institutionnel
                    </h1>
                    <p className="text-muted-foreground">
                        {INSTITUTIONS.length} institutions · {INSTITUTIONS.reduce((s, i) => s + i.effectifs, 0).toLocaleString()} agents
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TYPES.map(t => (
                        <Card key={t}><CardContent className="pt-3 pb-2 text-center">
                            <p className="text-lg font-bold">{INSTITUTIONS.filter(i => i.type === t).length}</p>
                            <p className="text-[10px] text-muted-foreground">{t}s</p>
                        </CardContent></Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher institution, acronyme, dirigeant..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                        {TYPES.map(t => (
                            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{t}</Button>
                        ))}
                    </div>
                    <div className="flex border rounded-md ml-auto">
                        <Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView('grid')}><Grid3X3 className="h-4 w-4" /></Button>
                        <Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Institutions */}
                    <div className={selected ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        {view === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {filtered.map(inst => (
                                    <Card key={inst.id} className={`cursor-pointer hover:shadow-md transition-shadow ${selectedId === inst.id ? 'ring-2 ring-primary' : ''} ${!inst.isActive ? 'opacity-60' : ''}`} onClick={() => setSelectedId(inst.id)}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold">{inst.acronym}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{inst.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                        <Badge className={`text-[9px] h-3.5 ${TYPE_COLORS[inst.type]}`}>{inst.type}</Badge>
                                                        <span className="text-[9px] text-muted-foreground"><Users className="h-2.5 w-2.5 inline mr-0.5" />{inst.effectifs}</span>
                                                        {!inst.isActive && <Badge variant="outline" className="text-[8px] h-3 text-red-500">Inactif</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    {filtered.map(inst => (
                                        <button key={inst.id} className={`w-full text-left flex items-center gap-3 p-3 border-b hover:bg-muted/30 transition-colors ${selectedId === inst.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedId(inst.id)}>
                                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-bold w-20 shrink-0">{inst.acronym}</span>
                                            <span className="text-xs flex-1 truncate">{inst.name}</span>
                                            <Badge className={`text-[9px] h-3.5 ${TYPE_COLORS[inst.type]}`}>{inst.type}</Badge>
                                            <span className="text-[10px] text-muted-foreground hidden sm:block">{inst.effectifs} agents</span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {selected && (
                        <Card className="lg:col-span-1 h-fit">
                            <CardContent className="p-4 space-y-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                                        <Landmark className="h-8 w-8 text-amber-600" />
                                    </div>
                                    <p className="text-sm font-bold">{selected.acronym}</p>
                                    <p className="text-[10px] text-muted-foreground">{selected.name}</p>
                                    <Badge className={`mt-1 text-[9px] ${TYPE_COLORS[selected.type]}`}>{selected.type}</Badge>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">{selected.headTitle}</p>
                                            <p className="font-semibold">{selected.head}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <p>{selected.phone}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <p>{selected.email}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <p>{selected.address}</p>
                                    </div>
                                    {selected.website && (
                                        <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                                            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <p>{selected.website}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-sm font-bold">{selected.effectifs.toLocaleString()}</p>
                                        <p className="text-muted-foreground">Effectifs</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-sm font-bold">{selected.province}</p>
                                        <p className="text-muted-foreground">Province</p>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <Badge className={selected.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                        {selected.isActive ? '● Actif' : '● Inactif'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Landmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune institution trouvée</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
