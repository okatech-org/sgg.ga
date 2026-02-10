/**
 * SGG Digital — Planning Stratégique (Gantt simplifié)
 *
 * Timeline de projets gouvernementaux :
 *   - Phases et jalons
 *   - Barres de progression temporelle
 *   - Dépendances visuelles
 *   - Filtrage par statut et priorité
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    GanttChart, CheckCircle2, Clock, AlertTriangle,
    Calendar, Users, ChevronDown, ChevronRight,
    Plus, Filter,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ProjectStatus = 'completed' | 'in-progress' | 'planned' | 'delayed';
type ProjectPriority = 'critical' | 'high' | 'medium';

interface Milestone {
    name: string;
    date: string;
    done: boolean;
}

interface Project {
    id: string;
    name: string;
    description: string;
    category: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    startMonth: number; // 1-12
    endMonth: number;
    progress: number;
    owner: string;
    milestones: Milestone[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ProjectStatus, { label: string; color: string; bar: string }> = {
    completed: { label: 'Terminé', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', bar: 'bg-green-500' },
    'in-progress': { label: 'En cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', bar: 'bg-blue-500' },
    planned: { label: 'Planifié', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', bar: 'bg-gray-400' },
    delayed: { label: 'En retard', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', bar: 'bg-red-500' },
};

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// ── Mock Data ───────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
    {
        id: 'p1', name: 'Digitalisation complète GAR', description: 'Soumission 100% numérique des rapports GAR par tous les ministères.',
        category: 'Transformation', status: 'in-progress', priority: 'critical', startMonth: 1, endMonth: 6, progress: 78, owner: 'Marie OBAME',
        milestones: [
            { name: 'Module saisie déployé', date: 'Jan 2026', done: true },
            { name: 'Formation 100% points focaux', date: 'Mar 2026', done: false },
            { name: 'Suppression soumission papier', date: 'Juin 2026', done: false },
        ],
    },
    {
        id: 'p2', name: 'Couverture 9/9 provinces', description: 'Connecter toutes les provinces du Gabon à la plateforme SGG Digital.',
        category: 'Infrastructure', status: 'delayed', priority: 'critical', startMonth: 1, endMonth: 9, progress: 45, owner: 'Rose MABIKA',
        milestones: [
            { name: '7 provinces connectées', date: 'Jan 2026', done: true },
            { name: 'Nyanga connectée', date: 'Avr 2026', done: false },
            { name: 'Ogooué-Ivindo connectée', date: 'Sep 2026', done: false },
        ],
    },
    {
        id: 'p3', name: 'Journal Officiel numérique', description: 'Publication 100% digitale du J.O. avec recherche avancée et abonnements.',
        category: 'Modernisation', status: 'completed', priority: 'high', startMonth: 1, endMonth: 3, progress: 100, owner: 'Rose MABIKA',
        milestones: [
            { name: 'Numérisation archives', date: 'Jan 2026', done: true },
            { name: 'Moteur de recherche', date: 'Fév 2026', done: true },
            { name: 'Go-live public', date: 'Mar 2026', done: true },
        ],
    },
    {
        id: 'p4', name: '50 projets PAG 2026', description: 'Suivi et achèvement de 50 projets structurants du Plan d\'Accélération.',
        category: 'Performance', status: 'in-progress', priority: 'critical', startMonth: 1, endMonth: 12, progress: 36, owner: 'Albert NDONG',
        milestones: [
            { name: '10 projets achevés', date: 'Mar 2026', done: true },
            { name: '25 projets achevés', date: 'Juin 2026', done: false },
            { name: '50 projets achevés', date: 'Déc 2026', done: false },
        ],
    },
    {
        id: 'p5', name: 'MFA pour tous les utilisateurs', description: 'Déploiement de l\'authentification multi-facteurs obligatoire.',
        category: 'Sécurité', status: 'completed', priority: 'high', startMonth: 1, endMonth: 2, progress: 100, owner: 'Équipe Tech',
        milestones: [
            { name: 'Pilote 50 utilisateurs', date: 'Jan 2026', done: true },
            { name: 'Déploiement général', date: 'Fév 2026', done: true },
        ],
    },
    {
        id: 'p6', name: 'Workflow nominations digital', description: 'Circuit de nomination entièrement numérique avec SLA par étape.',
        category: 'Transformation', status: 'in-progress', priority: 'high', startMonth: 2, endMonth: 8, progress: 55, owner: 'Jean NZE',
        milestones: [
            { name: 'Conception workflow', date: 'Fév 2026', done: true },
            { name: 'Développement module', date: 'Mai 2026', done: false },
            { name: 'Formation utilisateurs', date: 'Jul 2026', done: false },
            { name: 'Go-live', date: 'Aoû 2026', done: false },
        ],
    },
    {
        id: 'p7', name: 'Benchmark automatisé trimestriel', description: 'Génération automatique du classement ministères chaque trimestre.',
        category: 'Performance', status: 'planned', priority: 'medium', startMonth: 4, endMonth: 7, progress: 0, owner: 'Paul ABIAGA',
        milestones: [
            { name: 'Définition métriques', date: 'Avr 2026', done: false },
            { name: 'Développement auto-calcul', date: 'Juin 2026', done: false },
            { name: 'Publication pilote T3', date: 'Jul 2026', done: false },
        ],
    },
    {
        id: 'p8', name: 'Plan de continuité d\'activité', description: 'PCA complet pour la plateforme SGG Digital incluant DR et basculement.',
        category: 'Sécurité', status: 'planned', priority: 'high', startMonth: 3, endMonth: 6, progress: 0, owner: 'Équipe Tech',
        milestones: [
            { name: 'Analyse d\'impact', date: 'Mar 2026', done: false },
            { name: 'Plan DR rédigé', date: 'Mai 2026', done: false },
            { name: 'Test basculement', date: 'Juin 2026', done: false },
        ],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function StrategicPlanningPage() {
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>('p1');

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return PROJECTS;
        return PROJECTS.filter(p => p.status === statusFilter);
    }, [statusFilter]);

    // Current month (Feb 2026 = 2)
    const currentMonth = 2;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GanttChart className="h-7 w-7 text-indigo-600" />
                            Planning Stratégique 2026
                        </h1>
                        <p className="text-muted-foreground">
                            {PROJECTS.length} projets · {PROJECTS.filter(p => p.status === 'completed').length} terminés · {PROJECTS.filter(p => p.status === 'delayed').length} en retard
                        </p>
                    </div>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nouveau Projet</Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.entries(STATUS_CFG) as [ProjectStatus, typeof STATUS_CFG.completed][]).map(([key, conf]) => {
                        const count = PROJECTS.filter(p => p.status === key).length;
                        return (
                            <Card key={key} className={`cursor-pointer ${statusFilter === key ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}>
                                <CardContent className="pt-3 pb-2 text-center">
                                    <p className="text-xl font-bold">{count}</p>
                                    <p className="text-[10px] text-muted-foreground">{conf.label}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Timeline Header */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-0.5">
                            <div className="w-[180px] shrink-0 text-[9px] font-semibold text-muted-foreground">PROJET</div>
                            {MONTHS.map((m, i) => (
                                <div key={i} className={`flex-1 text-center text-[8px] font-semibold py-1 rounded ${i + 1 === currentMonth ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                                    {m}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Projects */}
                <div className="space-y-2">
                    {filtered.map(proj => {
                        const isOpen = expandedId === proj.id;
                        const conf = STATUS_CFG[proj.status];
                        const milestoneDone = proj.milestones.filter(m => m.done).length;

                        return (
                            <Card key={proj.id} className={proj.status === 'delayed' ? 'border-red-300 dark:border-red-800' : ''}>
                                {/* Gantt row */}
                                <button className="w-full text-left p-3 hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isOpen ? null : proj.id)}>
                                    <div className="flex items-center gap-0.5">
                                        {/* Project name */}
                                        <div className="w-[180px] shrink-0 flex items-center gap-1.5">
                                            {isOpen ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold truncate">{proj.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <Badge className={`text-[7px] h-3 ${conf.color}`}>{conf.label}</Badge>
                                                    <span className="text-[8px] text-muted-foreground">{proj.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Gantt bars */}
                                        {MONTHS.map((_, i) => {
                                            const monthNum = i + 1;
                                            const inRange = monthNum >= proj.startMonth && monthNum <= proj.endMonth;
                                            const isStart = monthNum === proj.startMonth;
                                            const isEnd = monthNum === proj.endMonth;
                                            const isCurrent = monthNum === currentMonth;
                                            const progressMonth = proj.startMonth + ((proj.endMonth - proj.startMonth) * proj.progress) / 100;

                                            if (!inRange) return <div key={i} className={`flex-1 h-6 ${isCurrent ? 'border-l border-primary/30' : ''}`} />;

                                            return (
                                                <div key={i} className={`flex-1 h-6 flex items-center ${isCurrent ? 'border-l border-primary/30' : ''}`}>
                                                    <div className={`w-full h-3.5 ${conf.bar} ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''} ${proj.progress === 100 ? 'opacity-90' : 'opacity-70'}`}>
                                                        {monthNum <= progressMonth && (
                                                            <div className={`h-full ${conf.bar} rounded-inherit opacity-100`} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </button>

                                {/* Detail */}
                                {isOpen && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mt-3 mb-2">{proj.description}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3 flex-wrap">
                                            <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{proj.owner}</span>
                                            <span><Calendar className="h-2.5 w-2.5 inline mr-0.5" />{MONTHS[proj.startMonth - 1]} → {MONTHS[proj.endMonth - 1]} 2026</span>
                                            <Badge variant="outline" className="text-[8px] h-3">{proj.category}</Badge>
                                            <Badge variant="outline" className={`text-[8px] h-3 ${proj.priority === 'critical' ? 'border-red-300 text-red-600' : proj.priority === 'high' ? 'border-amber-300 text-amber-600' : ''}`}>{proj.priority}</Badge>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                                <span>Progression</span><span className="font-bold">{proj.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${conf.bar}`} style={{ width: `${proj.progress}%` }} />
                                            </div>
                                        </div>

                                        {/* Milestones */}
                                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">JALONS ({milestoneDone}/{proj.milestones.length})</p>
                                        <div className="space-y-1">
                                            {proj.milestones.map((ms, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    {ms.done ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> : <Clock className="h-3 w-3 text-muted-foreground shrink-0" />}
                                                    <span className={ms.done ? 'line-through text-muted-foreground' : ''}>{ms.name}</span>
                                                    <span className="text-[9px] text-muted-foreground ml-auto">{ms.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
