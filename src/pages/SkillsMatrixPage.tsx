/**
 * SGG Digital — Matrice des Compétences
 *
 * Cartographie des compétences numériques des agents :
 *   - Compétences par ministère
 *   - Niveaux de maîtrise
 *   - Gaps identifiés
 *   - Recommandations formation
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Puzzle, Users, GraduationCap, AlertTriangle,
    CheckCircle2, Target, TrendingUp, ChevronRight,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type SkillLevel = 0 | 1 | 2 | 3 | 4; // 0=Non évalué, 1=Débutant, 2=Opérationnel, 3=Avancé, 4=Expert

interface Skill {
    name: string;
    category: string;
}

interface MinistrySkills {
    ministry: string;
    abbrev: string;
    agents: number;
    skills: SkillLevel[];
    avgScore: number;
}

// ── Data ────────────────────────────────────────────────────────────────────

const SKILLS: Skill[] = [
    { name: 'Navigation Plateforme', category: 'Digital' },
    { name: 'Soumission GAR', category: 'Métier' },
    { name: 'Analyse Données', category: 'Digital' },
    { name: 'Sécurité Numérique', category: 'Sécurité' },
    { name: 'Rédaction Décrets', category: 'Juridique' },
    { name: 'Gestion Documents', category: 'Digital' },
    { name: 'Workflow Digital', category: 'Métier' },
    { name: 'Excel / Reporting', category: 'Bureautique' },
    { name: 'Communication', category: 'Transversal' },
    { name: 'Leadership Digit.', category: 'Transversal' },
];

const MINISTRIES: MinistrySkills[] = [
    { ministry: 'Secrétariat Général du Gouvernement', abbrev: 'SGG', agents: 85, skills: [4, 4, 3, 3, 3, 4, 4, 3, 3, 3], avgScore: 3.4 },
    { ministry: 'Ministère des Finances', abbrev: 'MINEFI', agents: 120, skills: [3, 3, 4, 2, 2, 3, 2, 4, 2, 2], avgScore: 2.7 },
    { ministry: 'Ministère de l\'Éducation', abbrev: 'MENETP', agents: 95, skills: [3, 2, 2, 2, 1, 2, 2, 3, 3, 2], avgScore: 2.2 },
    { ministry: 'Ministère de la Santé', abbrev: 'MINSANTE', agents: 78, skills: [2, 2, 2, 1, 1, 2, 1, 2, 2, 1], avgScore: 1.6 },
    { ministry: 'Ministère des Transports', abbrev: 'MINTRANS', agents: 65, skills: [3, 3, 2, 2, 2, 3, 3, 2, 2, 2], avgScore: 2.4 },
    { ministry: 'Ministère de la Justice', abbrev: 'MINJUSTICE', agents: 72, skills: [2, 2, 2, 2, 4, 3, 2, 2, 3, 2], avgScore: 2.4 },
    { ministry: 'Ministère de la Communication', abbrev: 'MINCOM', agents: 48, skills: [3, 2, 2, 2, 2, 2, 2, 2, 4, 3], avgScore: 2.4 },
    { ministry: 'Ministère Économie Numérique', abbrev: 'MTNHDN', agents: 55, skills: [4, 3, 4, 4, 2, 3, 3, 3, 3, 3], avgScore: 3.2 },
    { ministry: 'Affaires Étrangères', abbrev: 'MAECICPG', agents: 62, skills: [3, 2, 2, 2, 3, 2, 2, 2, 3, 2], avgScore: 2.3 },
    { ministry: 'Mines et Ressources', abbrev: 'MINER', agents: 45, skills: [3, 3, 3, 2, 2, 2, 2, 3, 2, 2], avgScore: 2.4 },
];

const LEVEL_LABELS = ['N/E', 'Débutant', 'Opérationnel', 'Avancé', 'Expert'];
const LEVEL_COLORS = [
    'bg-gray-200 dark:bg-gray-700',
    'bg-red-400 dark:bg-red-600',
    'bg-amber-400 dark:bg-amber-500',
    'bg-blue-400 dark:bg-blue-500',
    'bg-green-500 dark:bg-green-600',
];

// ── Component ───────────────────────────────────────────────────────────────

export default function SkillsMatrixPage() {
    const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);

    const globalAvg = +(MINISTRIES.reduce((s, m) => s + m.avgScore, 0) / MINISTRIES.length).toFixed(1);
    const totalAgents = MINISTRIES.reduce((s, m) => s + m.agents, 0);

    // Identify gaps (skills with average < 2.5 across all ministries)
    const skillAverages = SKILLS.map((_, i) => {
        const avg = MINISTRIES.reduce((s, m) => s + m.skills[i], 0) / MINISTRIES.length;
        return +avg.toFixed(1);
    });
    const gaps = skillAverages.filter(a => a < 2.5).length;

    const detail = selectedMinistry ? MINISTRIES.find(m => m.abbrev === selectedMinistry) : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Puzzle className="h-7 w-7 text-violet-600" />
                            Matrice des Compétences
                        </h1>
                        <p className="text-muted-foreground">
                            {MINISTRIES.length} ministères · {totalAgents} agents · {SKILLS.length} compétences évaluées
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{globalAvg}/4</p><p className="text-[10px] text-muted-foreground">Score moyen global</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{totalAgents}</p><p className="text-[10px] text-muted-foreground">Agents évalués</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{gaps}</p><p className="text-[10px] text-muted-foreground">Compétences en gap</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{SKILLS.length}</p><p className="text-[10px] text-muted-foreground">Compétences suivies</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Matrix */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Matrice Compétences × Ministères</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left pb-2 pr-3 w-24 font-semibold">Ministère</th>
                                        {SKILLS.map((skill, i) => (
                                            <th key={i} className="text-center pb-2 px-0.5 font-normal">
                                                <div className="writing-mode-vertical-lr transform -rotate-45 origin-bottom-left h-16 text-[8px] whitespace-nowrap">
                                                    {skill.name}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="text-center pb-2 pl-2 font-semibold">Moy.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MINISTRIES.map(ministry => (
                                        <tr key={ministry.abbrev} className={`border-b hover:bg-muted/30 cursor-pointer ${selectedMinistry === ministry.abbrev ? 'bg-primary/5' : ''}`}
                                            onClick={() => setSelectedMinistry(selectedMinistry === ministry.abbrev ? null : ministry.abbrev)}>
                                            <td className="py-1.5 pr-3 font-bold">{ministry.abbrev}</td>
                                            {ministry.skills.map((level, i) => (
                                                <td key={i} className="text-center py-1.5 px-0.5">
                                                    <div className={`w-5 h-5 rounded mx-auto flex items-center justify-center text-[8px] font-bold text-white ${LEVEL_COLORS[level]}`}>
                                                        {level}
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="text-center py-1.5 pl-2">
                                                <span className={`font-bold ${ministry.avgScore >= 3 ? 'text-green-600' : ministry.avgScore >= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {ministry.avgScore}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Average Row */}
                                    <tr className="border-t-2 font-bold bg-muted/30">
                                        <td className="py-1.5 pr-3">MOY.</td>
                                        {skillAverages.map((avg, i) => (
                                            <td key={i} className="text-center py-1.5 px-0.5">
                                                <span className={`text-[9px] ${avg >= 3 ? 'text-green-600' : avg >= 2.5 ? 'text-blue-600' : avg >= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {avg}
                                                </span>
                                            </td>
                                        ))}
                                        <td className="text-center py-1.5 pl-2 text-blue-600">{globalAvg}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                    <CardContent className="p-3 flex flex-wrap gap-3 text-[10px]">
                        {LEVEL_LABELS.map((label, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div className={`w-4 h-4 rounded ${LEVEL_COLORS[i]}`} />
                                <span>{i} = {label}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Detail Panel */}
                {detail && (
                    <Card className="border-primary/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {detail.ministry} ({detail.abbrev})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-[10px] text-center">
                                <div className="p-2 bg-muted/50 rounded"><p className="font-bold">{detail.agents}</p><p className="text-muted-foreground">Agents</p></div>
                                <div className="p-2 bg-muted/50 rounded"><p className={`font-bold ${detail.avgScore >= 3 ? 'text-green-600' : detail.avgScore >= 2 ? 'text-amber-600' : 'text-red-600'}`}>{detail.avgScore}/4</p><p className="text-muted-foreground">Score moyen</p></div>
                                <div className="p-2 bg-muted/50 rounded"><p className="font-bold">{detail.skills.filter(s => s >= 3).length}/{SKILLS.length}</p><p className="text-muted-foreground">Compétences ≥ Avancé</p></div>
                            </div>
                            <div className="space-y-1.5">
                                {SKILLS.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <span className="flex-1">{skill.name}</span>
                                        <Badge variant="outline" className="text-[8px] h-3.5">{skill.category}</Badge>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4].map(lvl => (
                                                <div key={lvl} className={`w-3 h-3 rounded-sm ${lvl <= detail.skills[i] ? LEVEL_COLORS[detail.skills[i]] : 'bg-muted'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-bold w-14 text-right">{LEVEL_LABELS[detail.skills[i]]}</span>
                                    </div>
                                ))}
                            </div>
                            {detail.skills.some(s => s < 2) && (
                                <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" /> Formations recommandées
                                    </p>
                                    <div className="mt-1 space-y-0.5">
                                        {SKILLS.filter((_, i) => detail.skills[i] < 2).map((skill, i) => (
                                            <p key={i} className="text-[9px] text-amber-600 dark:text-amber-400">
                                                → {skill.name} ({skill.category})
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
