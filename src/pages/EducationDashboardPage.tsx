/**
 * SGG Digital — Tableau de Bord Éducation
 *
 * Suivi du système éducatif national :
 *   - Effectifs scolaires et universitaires
 *   - Infrastructures par province
 *   - Taux de réussite aux examens
 *   - Personnel enseignant
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    GraduationCap, School, BookOpen, Users,
    TrendingUp, TrendingDown, Minus, Award,
    MapPin, Building2,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface ExamResult {
    exam: string;
    year: number;
    candidates: number;
    passed: number;
    rate: number;
    trend: 'up' | 'down' | 'stable';
}

interface ProvinceEducation {
    province: string;
    primarySchools: number;
    secondarySchools: number;
    students: number;
    teachers: number;
    ratioStudentTeacher: number;
}

const GLOBAL = {
    totalStudents: 620_000,
    primaryStudents: 380_000,
    secondaryStudents: 185_000,
    universityStudents: 55_000,
    totalSchools: 1_850,
    totalTeachers: 18_500,
    literacyRate: 84,
    budgetEducation: 620, // Mds FCFA
    genderParity: 0.98,
};

const EXAMS: ExamResult[] = [
    { exam: 'CEP (Primaire)', year: 2025, candidates: 52_000, passed: 38_500, rate: 74, trend: 'up' },
    { exam: 'BEPC', year: 2025, candidates: 38_000, passed: 21_300, rate: 56, trend: 'up' },
    { exam: 'Baccalauréat Série A', year: 2025, candidates: 8_200, passed: 3_600, rate: 44, trend: 'stable' },
    { exam: 'Baccalauréat Série C', year: 2025, candidates: 4_500, passed: 2_250, rate: 50, trend: 'up' },
    { exam: 'Baccalauréat Série D', year: 2025, candidates: 6_800, passed: 2_850, rate: 42, trend: 'down' },
    { exam: 'BTS', year: 2025, candidates: 3_200, passed: 1_920, rate: 60, trend: 'up' },
    { exam: 'Licence (UOB)', year: 2025, candidates: 5_500, passed: 3_300, rate: 60, trend: 'stable' },
];

const PROVINCES: ProvinceEducation[] = [
    { province: 'Estuaire', primarySchools: 420, secondarySchools: 85, students: 245_000, teachers: 7_200, ratioStudentTeacher: 34 },
    { province: 'Haut-Ogooué', primarySchools: 180, secondarySchools: 35, students: 72_000, teachers: 2_400, ratioStudentTeacher: 30 },
    { province: 'Ogooué-Maritime', primarySchools: 120, secondarySchools: 25, students: 48_000, teachers: 1_600, ratioStudentTeacher: 30 },
    { province: 'Woleu-Ntem', primarySchools: 190, secondarySchools: 28, students: 52_000, teachers: 1_500, ratioStudentTeacher: 35 },
    { province: 'Ngounié', primarySchools: 140, secondarySchools: 22, students: 35_000, teachers: 1_100, ratioStudentTeacher: 32 },
    { province: 'Moyen-Ogooué', primarySchools: 85, secondarySchools: 15, students: 22_000, teachers: 700, ratioStudentTeacher: 31 },
    { province: 'Ogooué-Ivindo', primarySchools: 75, secondarySchools: 12, students: 18_000, teachers: 520, ratioStudentTeacher: 35 },
    { province: 'Ogooué-Lolo', primarySchools: 80, secondarySchools: 14, students: 20_000, teachers: 580, ratioStudentTeacher: 34 },
    { province: 'Nyanga', primarySchools: 60, secondarySchools: 10, students: 15_000, teachers: 450, ratioStudentTeacher: 33 },
];

const UNIVERSITIES = [
    { name: 'Université Omar Bongo (UOB)', city: 'Libreville', students: 28_000, faculties: 6 },
    { name: 'Université des Sciences et Tech. (USTM)', city: 'Franceville', students: 8_500, faculties: 4 },
    { name: 'École Normale Supérieure (ENS)', city: 'Libreville', students: 3_200, faculties: 3 },
    { name: 'INSG (Sciences de Gestion)', city: 'Libreville', students: 2_800, faculties: 2 },
    { name: 'IAI (Informatique)', city: 'Libreville', students: 1_500, faculties: 1 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function EducationDashboardPage() {
    const [view, setView] = useState<'overview' | 'exams' | 'provinces'>('overview');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GraduationCap className="h-7 w-7 text-blue-600" />
                            Tableau de Bord Éducation
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalStudents.toLocaleString()} élèves et étudiants · Budget : {GLOBAL.budgetEducation} Mds FCFA
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Année scolaire 2025-2026</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <School className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.totalSchools.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Établissements</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.totalTeachers.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Enseignants</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.literacyRate}%</p><p className="text-[10px] text-muted-foreground">Taux d'alphabétisation</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.genderParity}</p><p className="text-[10px] text-muted-foreground">Indice parité F/H</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                    <Button variant={view === 'overview' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('overview')}>Synthèse</Button>
                    <Button variant={view === 'exams' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('exams')}>Examens</Button>
                    <Button variant={view === 'provinces' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('provinces')}>Provinces</Button>
                </div>

                {view === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Student distribution */}
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Répartition des effectifs</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { label: 'Primaire', count: GLOBAL.primaryStudents, color: 'bg-blue-500', pct: Math.round(GLOBAL.primaryStudents / GLOBAL.totalStudents * 100) },
                                    { label: 'Secondaire', count: GLOBAL.secondaryStudents, color: 'bg-violet-500', pct: Math.round(GLOBAL.secondaryStudents / GLOBAL.totalStudents * 100) },
                                    { label: 'Supérieur', count: GLOBAL.universityStudents, color: 'bg-amber-500', pct: Math.round(GLOBAL.universityStudents / GLOBAL.totalStudents * 100) },
                                ].map((lvl, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                            <span className="font-bold">{lvl.label}</span>
                                            <span>{lvl.count.toLocaleString()} ({lvl.pct}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${lvl.color}`} style={{ width: `${lvl.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Universities */}
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Enseignement supérieur</CardTitle></CardHeader>
                            <CardContent className="space-y-1.5">
                                {UNIVERSITIES.map((u, i) => (
                                    <div key={i} className="p-2 bg-muted/30 rounded flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold truncate">{u.name}</p>
                                            <p className="text-[8px] text-muted-foreground">{u.city} · {u.faculties} facultés</p>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 shrink-0">{u.students.toLocaleString()}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {view === 'exams' && (
                    <div className="space-y-2">
                        {EXAMS.map((e, i) => (
                            <Card key={i} className={e.rate < 50 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-xs font-bold">{e.exam}</p>
                                            {e.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                                                e.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                                                    <Minus className="h-3 w-3 text-gray-400" />}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{e.candidates.toLocaleString()} candidats · {e.passed.toLocaleString()} admis</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-xl font-bold ${e.rate >= 60 ? 'text-green-600' : e.rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{e.rate}%</p>
                                        <p className="text-[8px] text-muted-foreground">taux de réussite {e.year}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'provinces' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                        <th className="text-left py-2 px-3">Province</th>
                                        <th className="text-center py-2 px-2">Primaires</th>
                                        <th className="text-center py-2 px-2">Secondaires</th>
                                        <th className="text-center py-2 px-2">Élèves</th>
                                        <th className="text-center py-2 px-2">Enseignants</th>
                                        <th className="text-center py-2 px-2">Ratio É/E</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PROVINCES.map(p => (
                                        <tr key={p.province} className={`border-b hover:bg-muted/20 ${p.ratioStudentTeacher > 34 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                            <td className="py-2 px-3 font-bold flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.province}</td>
                                            <td className="text-center py-2 px-2">{p.primarySchools}</td>
                                            <td className="text-center py-2 px-2">{p.secondarySchools}</td>
                                            <td className="text-center py-2 px-2 font-bold">{p.students.toLocaleString()}</td>
                                            <td className="text-center py-2 px-2">{p.teachers.toLocaleString()}</td>
                                            <td className="text-center py-2 px-2">
                                                <span className={p.ratioStudentTeacher > 34 ? 'text-red-600 font-bold' : 'text-green-600'}>{p.ratioStudentTeacher}:1</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
