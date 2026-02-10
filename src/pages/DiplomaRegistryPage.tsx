/**
 * SGG Digital — Registre des Diplômes & Certifications
 *
 * Base de données des diplômes nationaux :
 *   - Universités et grandes écoles
 *   - Diplômes délivrés par année
 *   - Filières et niveaux
 *   - Reconnaissance et équivalences
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    GraduationCap, Award, BookOpen, Users,
    Search, MapPin, TrendingUp, Building2,
    CheckCircle2,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type DegreeLevel = 'BAC' | 'BTS/DUT' | 'Licence' | 'Master' | 'Doctorat' | 'Ingénieur';

interface Institution {
    name: string;
    acronym: string;
    type: 'public' | 'private';
    location: string;
    students: number;
    diplomesParAn: number;
    specialties: string[];
    accredited: boolean;
    yearFounded: number;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const GLOBAL = {
    totalDiplomes2025: 12_800,
    totalEtudiants: 45_000,
    institutions: 28,
    publicInstitutions: 12,
    privateInstitutions: 16,
    tauxReussite: 42,
    diplomesReconnus: 95,
    equivalences: 680,
    boursiers: 3_200,
};

const DEGREE_STATS: { level: DegreeLevel; count: number; pct: number }[] = [
    { level: 'BAC', count: 4_500, pct: 35 },
    { level: 'BTS/DUT', count: 2_100, pct: 16 },
    { level: 'Licence', count: 3_200, pct: 25 },
    { level: 'Master', count: 2_200, pct: 17 },
    { level: 'Doctorat', count: 180, pct: 2 },
    { level: 'Ingénieur', count: 620, pct: 5 },
];

const INSTITUTIONS: Institution[] = [
    { name: 'Université Omar Bongo', acronym: 'UOB', type: 'public', location: 'Libreville', students: 18_000, diplomesParAn: 3_500, specialties: ['Droit', 'Lettres', 'Sciences humaines', 'Économie'], accredited: true, yearFounded: 1970 },
    { name: 'Université des Sciences et Techniques de Masuku', acronym: 'USTM', type: 'public', location: 'Franceville', students: 6_500, diplomesParAn: 1_200, specialties: ['Sciences', 'Technologie', 'Médecine', 'Mines'], accredited: true, yearFounded: 1986 },
    { name: 'Université des Sciences de la Santé', acronym: 'USS', type: 'public', location: 'Owendo', students: 2_800, diplomesParAn: 450, specialties: ['Médecine', 'Pharmacie', 'Odontologie'], accredited: true, yearFounded: 2002 },
    { name: 'École Nationale des Eaux et Forêts', acronym: 'ENEF', type: 'public', location: 'Cap Estérias', students: 350, diplomesParAn: 85, specialties: ['Foresterie', 'Environnement', 'Faune'], accredited: true, yearFounded: 1975 },
    { name: 'École Polytechnique de Masuku', acronym: 'EPM', type: 'public', location: 'Franceville', students: 800, diplomesParAn: 120, specialties: ['Génie civil', 'Génie mécanique', 'Informatique'], accredited: true, yearFounded: 1986 },
    { name: 'École Normale Supérieure', acronym: 'ENS', type: 'public', location: 'Libreville', students: 1_200, diplomesParAn: 280, specialties: ['Formation enseignants', 'Pédagogie'], accredited: true, yearFounded: 1971 },
    { name: 'Institut Africain d\'Informatique', acronym: 'IAI', type: 'public', location: 'Libreville', students: 600, diplomesParAn: 150, specialties: ['Informatique', 'Réseaux', 'Cybersécurité'], accredited: true, yearFounded: 1971 },
    { name: 'Université Internationale de Libreville', acronym: 'UIL', type: 'private', location: 'Libreville', students: 2_500, diplomesParAn: 680, specialties: ['Gestion', 'Commerce', 'Relations internationales'], accredited: true, yearFounded: 2012 },
    { name: 'Institut Supérieur de Technologie', acronym: 'IST', type: 'public', location: 'Libreville', students: 1_800, diplomesParAn: 420, specialties: ['BTS industriels', 'Maintenance', 'Électronique'], accredited: true, yearFounded: 1984 },
    { name: 'Université La Salle', acronym: 'ULS', type: 'private', location: 'Libreville', students: 800, diplomesParAn: 220, specialties: ['Droit', 'Gestion', 'Communication'], accredited: true, yearFounded: 2015 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DiplomaRegistryPage() {
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'institutions' | 'levels'>('institutions');

    const filtered = useMemo(() => {
        return INSTITUTIONS.filter(inst => {
            if (search && !inst.name.toLowerCase().includes(search.toLowerCase()) && !inst.acronym.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GraduationCap className="h-7 w-7 text-blue-600" />
                            Registre des Diplômes & Certifications
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalDiplomes2025.toLocaleString()} diplômes/an · {GLOBAL.institutions} institutions · {GLOBAL.totalEtudiants.toLocaleString()} étudiants
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">MESRSFC · CAMES · LMD</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Award className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{(GLOBAL.totalDiplomes2025 / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Diplômes 2025</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{(GLOBAL.totalEtudiants / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Étudiants</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.tauxReussite}%</p><p className="text-[10px] text-muted-foreground">Taux réussite</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.boursiers.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Boursiers</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une institution..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        <Button variant={view === 'institutions' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('institutions')}>Institutions</Button>
                        <Button variant={view === 'levels' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('levels')}>Par niveau</Button>
                    </div>
                </div>

                {view === 'institutions' && (
                    <div className="space-y-2">
                        {filtered.map((inst, i) => (
                            <Card key={i}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                        <GraduationCap className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <Badge variant="outline" className="text-[7px] h-3 font-bold">{inst.acronym}</Badge>
                                            <Badge className={`text-[7px] h-3 ${inst.type === 'public' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{inst.type === 'public' ? 'Public' : 'Privé'}</Badge>
                                            {inst.accredited && <Badge className="text-[6px] h-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">CAMES ✓</Badge>}
                                        </div>
                                        <p className="text-xs font-bold">{inst.name}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{inst.location}</span>
                                            <span><b className="text-foreground">{inst.students.toLocaleString()}</b> étudiants</span>
                                            <span><b className="text-foreground">{inst.diplomesParAn.toLocaleString()}</b> diplômes/an</span>
                                            <span className="text-[8px]">Depuis {inst.yearFounded}</span>
                                        </div>
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {inst.specialties.map((s, j) => <Badge key={j} variant="outline" className="text-[6px] h-3">{s}</Badge>)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'levels' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Diplômes par niveau — 2025</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {DEGREE_STATS.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-16 font-bold shrink-0">{d.level}</span>
                                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full flex items-center justify-end pr-1" style={{ width: `${d.pct * 2.5}%` }}>
                                            <span className="text-[7px] text-white font-bold">{d.pct}%</span>
                                        </div>
                                    </div>
                                    <span className="w-14 text-right font-mono shrink-0">{d.count.toLocaleString()}</span>
                                </div>
                            ))}
                            <p className="text-[9px] text-muted-foreground mt-2">
                                Système LMD (Licence-Master-Doctorat) · {GLOBAL.equivalences} équivalences traitées · {GLOBAL.diplomesReconnus}% diplômes reconnus CAMES
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
