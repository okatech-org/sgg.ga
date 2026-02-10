/**
 * SGG Digital — Centre de Formations
 *
 * Plateforme e-learning pour les agents publics :
 *   - Catalogue de formations
 *   - Progression et certifications
 *   - Modules par compétence
 *   - Suivi des points focaux
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    GraduationCap, Search, Clock, Users,
    CheckCircle2, Play, Award, BookOpen,
    Star, BarChart3, Lock, ChevronRight,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type CourseLevel = 'débutant' | 'intermédiaire' | 'avancé';
type CourseStatus = 'completed' | 'in-progress' | 'available' | 'locked';
type CourseCategory = 'Plateforme SGG' | 'GAR & Reporting' | 'Sécurité' | 'Leadership' | 'Bureautique' | 'Juridique';

interface Course {
    id: string;
    title: string;
    description: string;
    category: CourseCategory;
    level: CourseLevel;
    duration: string;
    modules: number;
    completedModules: number;
    status: CourseStatus;
    enrolled: number;
    rating: number;
    instructor: string;
    certificate: boolean;
}

// ── Config ──────────────────────────────────────────────────────────────────

const LEVEL_CFG: Record<CourseLevel, { color: string }> = {
    'débutant': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'intermédiaire': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    'avancé': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const CAT_COLORS: Record<CourseCategory, string> = {
    'Plateforme SGG': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'GAR & Reporting': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Sécurité': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Leadership': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Bureautique': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'Juridique': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const COURSES: Course[] = [
    { id: 'c1', title: 'Prise en main de la plateforme SGG Digital', description: 'Découverte complète de l\'interface, navigation, tableau de bord personnel et fonctionnalités clés.', category: 'Plateforme SGG', level: 'débutant', duration: '2h', modules: 6, completedModules: 6, status: 'completed', enrolled: 342, rating: 4.8, instructor: 'Équipe SGG', certificate: true },
    { id: 'c2', title: 'Rédaction et soumission des rapports GAR', description: 'Guide complet pour rédiger, formater et soumettre les rapports GAR via la plateforme numérique.', category: 'GAR & Reporting', level: 'débutant', duration: '3h', modules: 8, completedModules: 5, status: 'in-progress', enrolled: 248, rating: 4.6, instructor: 'Marie OBAME', certificate: true },
    { id: 'c3', title: 'Sécurité numérique pour agents publics', description: 'Bonnes pratiques de cybersécurité : mots de passe, phishing, MFA, protection des données sensibles.', category: 'Sécurité', level: 'débutant', duration: '1h30', modules: 5, completedModules: 5, status: 'completed', enrolled: 510, rating: 4.9, instructor: 'DSI', certificate: true },
    { id: 'c4', title: 'Analyse de données et KPI avancés', description: 'Maîtriser les tableaux de bord analytiques, créer des KPI personnalisés et interpréter les tendances.', category: 'GAR & Reporting', level: 'intermédiaire', duration: '4h', modules: 10, completedModules: 3, status: 'in-progress', enrolled: 128, rating: 4.5, instructor: 'Paul ABIAGA', certificate: true },
    { id: 'c5', title: 'Leadership et transformation numérique', description: 'Accompagnement au changement, communication stratégique et pilotage de projets de transformation.', category: 'Leadership', level: 'avancé', duration: '6h', modules: 12, completedModules: 0, status: 'available', enrolled: 85, rating: 4.7, instructor: 'Françoise ELLA', certificate: true },
    { id: 'c6', title: 'Module point focal : rôles et responsabilités', description: 'Formation dédiée aux points focaux ministériels : collecte, vérification, soumission et suivi.', category: 'Plateforme SGG', level: 'intermédiaire', duration: '3h', modules: 7, completedModules: 7, status: 'completed', enrolled: 58, rating: 4.4, instructor: 'Rose MABIKA', certificate: true },
    { id: 'c7', title: 'Gestion documentaire et archives numériques', description: 'Organisation, classement, versionning et archivage des documents officiels sur la plateforme.', category: 'Bureautique', level: 'débutant', duration: '2h', modules: 5, completedModules: 0, status: 'available', enrolled: 192, rating: 4.3, instructor: 'Équipe SGG', certificate: false },
    { id: 'c8', title: 'Rédaction juridique des décrets et arrêtés', description: 'Techniques de rédaction des textes réglementaires conformes aux normes juridiques gabonaises.', category: 'Juridique', level: 'avancé', duration: '5h', modules: 10, completedModules: 0, status: 'locked', enrolled: 42, rating: 4.6, instructor: 'DAJ', certificate: true },
    { id: 'c9', title: 'Workflow et processus administratifs', description: 'Comprendre et utiliser les workflows digitaux : nominations, GAR, décrets, validations.', category: 'Plateforme SGG', level: 'intermédiaire', duration: '2h30', modules: 6, completedModules: 2, status: 'in-progress', enrolled: 165, rating: 4.5, instructor: 'Jean NZE', certificate: true },
    { id: 'c10', title: 'Protection des données personnelles (RGPD)', description: 'Cadre juridique, obligations des agents publics et procédures de traitement des données.', category: 'Juridique', level: 'intermédiaire', duration: '3h', modules: 8, completedModules: 0, status: 'available', enrolled: 95, rating: 4.7, instructor: 'DAJ', certificate: true },
    { id: 'c11', title: 'Excel avancé pour le reporting', description: 'Fonctions avancées, tableaux croisés dynamiques, macros et intégration avec les exports SGG.', category: 'Bureautique', level: 'intermédiaire', duration: '4h', modules: 10, completedModules: 0, status: 'available', enrolled: 218, rating: 4.2, instructor: 'DSI', certificate: false },
    { id: 'c12', title: 'Communication de crise gouvernementale', description: 'Stratégies de communication en situation de crise, gestion médiatique et coordination inter-services.', category: 'Leadership', level: 'avancé', duration: '4h', modules: 8, completedModules: 0, status: 'locked', enrolled: 30, rating: 4.8, instructor: 'MINCOM', certificate: true },
];

const CATEGORIES: CourseCategory[] = ['Plateforme SGG', 'GAR & Reporting', 'Sécurité', 'Leadership', 'Bureautique', 'Juridique'];

// ── Component ───────────────────────────────────────────────────────────────

export default function TrainingCenterPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = useMemo(() => {
        return COURSES.filter(c => {
            if (catFilter !== 'all' && c.category !== catFilter) return false;
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, catFilter, statusFilter]);

    const completed = COURSES.filter(c => c.status === 'completed').length;
    const inProgress = COURSES.filter(c => c.status === 'in-progress').length;
    const totalCerts = COURSES.filter(c => c.status === 'completed' && c.certificate).length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GraduationCap className="h-7 w-7 text-violet-600" />
                            Centre de Formations
                        </h1>
                        <p className="text-muted-foreground">
                            {COURSES.length} formations · {completed} terminées · {totalCerts} certificats obtenus
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{completed}</p><p className="text-[10px] text-muted-foreground">Terminées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'in-progress' ? 'all' : 'in-progress')}>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{inProgress}</p><p className="text-[10px] text-muted-foreground">En cours</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{totalCerts}</p><p className="text-[10px] text-muted-foreground">Certificats</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{COURSES.reduce((s, c) => s + c.enrolled, 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Inscriptions</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une formation..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Toutes</Button>
                        {CATEGORIES.map(c => (
                            <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(c)}>{c}</Button>
                        ))}
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map(course => {
                        const progress = course.modules > 0 ? Math.round((course.completedModules / course.modules) * 100) : 0;
                        return (
                            <Card key={course.id} className={`hover:shadow-md transition-shadow ${course.status === 'locked' ? 'opacity-60' : ''}`}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${course.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                                                course.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                    course.status === 'locked' ? 'bg-gray-100 dark:bg-gray-800' :
                                                        'bg-violet-100 dark:bg-violet-900/30'
                                            }`}>
                                            {course.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                                                course.status === 'in-progress' ? <Play className="h-5 w-5 text-blue-500" /> :
                                                    course.status === 'locked' ? <Lock className="h-5 w-5 text-gray-400" /> :
                                                        <BookOpen className="h-5 w-5 text-violet-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold leading-snug">{course.title}</p>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <Badge className={`text-[8px] h-3.5 ${CAT_COLORS[course.category]}`}>{course.category}</Badge>
                                                <Badge className={`text-[8px] h-3.5 ${LEVEL_CFG[course.level].color}`}>{course.level}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{course.description}</p>

                                    {(course.status === 'in-progress' || course.status === 'completed') && (
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                                <span>{course.completedModules}/{course.modules} modules</span>
                                                <span className="font-bold">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            <span><Clock className="h-2.5 w-2.5 inline mr-0.5" />{course.duration}</span>
                                            <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{course.enrolled}</span>
                                            <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />{course.rating}</span>
                                        </div>
                                        {course.certificate && <Award className="h-3 w-3 text-amber-500" />}
                                    </div>

                                    <div className="flex gap-1.5">
                                        {course.status === 'completed' && course.certificate && (
                                            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 gap-1"><Award className="h-3 w-3" /> Certificat</Button>
                                        )}
                                        <Button size="sm" className={`flex-1 text-[10px] h-7 gap-1 ${course.status === 'locked' ? '' : ''}`} disabled={course.status === 'locked'}>
                                            {course.status === 'completed' ? 'Revoir' : course.status === 'in-progress' ? 'Continuer' : course.status === 'locked' ? 'Verrouillé' : 'Commencer'}
                                            <ChevronRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune formation trouvée</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
