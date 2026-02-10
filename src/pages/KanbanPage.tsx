/**
 * SGG Digital — Tableau Kanban
 *
 * Gestion visuelle des tâches et projets internes :
 *   - 4 colonnes : À faire, En cours, En validation, Terminé
 *   - Drag & drop simulé
 *   - Badges priorité, assignation, deadline
 *   - Ajout et déplacement de tâches
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Kanban, Plus, ChevronRight, Clock,
    AlertTriangle, User, Calendar,
    CheckCircle2, ArrowRight, GripVertical,
    Flag, X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type ColumnId = 'todo' | 'in_progress' | 'review' | 'done';
type Priority = 'haute' | 'moyenne' | 'basse';

interface KanbanTask {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: Priority;
    deadline?: string;
    column: ColumnId;
    tags: string[];
    createdAt: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const COLUMNS: { id: ColumnId; label: string; color: string; bgColor: string }[] = [
    { id: 'todo', label: 'À faire', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800/50' },
    { id: 'in_progress', label: 'En cours', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
    { id: 'review', label: 'En validation', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/20' },
    { id: 'done', label: 'Terminé', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20' },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: typeof Flag }> = {
    haute: { label: 'Haute', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Flag },
    moyenne: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Flag },
    basse: { label: 'Basse', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Flag },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_TASKS: KanbanTask[] = [
    { id: 'k1', title: 'Valider décret n°004/2026', description: 'Revue juridique et signature du SGG pour le décret portant organisation de la DGME.', assignee: 'Albert NDONG', priority: 'haute', deadline: '2026-02-12', column: 'todo', tags: ['Juridique', 'Urgent'], createdAt: '2026-02-08' },
    { id: 'k2', title: 'Compléter rapports GAR T4 — MINTRANS', description: 'Relancer le point focal MINTRANS pour la soumission du rapport trimestriel.', assignee: 'Marie OBAME', priority: 'haute', deadline: '2026-02-15', column: 'todo', tags: ['GAR', 'Relance'], createdAt: '2026-02-09' },
    { id: 'k3', title: 'Préparer ordre du jour Conseil des Ministres', description: 'Compilation des 8 points soumis par les ministères. Mise en page et envoi au SGPR.', assignee: 'Albert NDONG', priority: 'haute', deadline: '2026-02-14', column: 'in_progress', tags: ['Conseil', 'SGPR'], createdAt: '2026-02-07' },
    { id: 'k4', title: 'Intégrer nouveaux indicateurs PAG 2026', description: 'Ajouter 12 indicateurs de suivi pour les axes 3 et 4 du PAG.', assignee: 'Pierre MBOUMBA', priority: 'moyenne', deadline: '2026-02-20', column: 'in_progress', tags: ['PAG', 'Données'], createdAt: '2026-02-05' },
    { id: 'k5', title: 'Former points focaux — module PTM', description: 'Session de formation sur la nouvelle matrice PTM pour 15 points focaux.', assignee: 'Françoise ELLA', priority: 'moyenne', deadline: '2026-02-18', column: 'in_progress', tags: ['Formation', 'PTM'], createdAt: '2026-02-06' },
    { id: 'k6', title: 'Vérifier cohérence données MINSANTE', description: 'Audit des données soumises par le Ministère de la Santé — incohérences détectées.', assignee: 'Sylvie MOUSSAVOU', priority: 'moyenne', column: 'review', tags: ['Audit', 'Données'], createdAt: '2026-02-04' },
    { id: 'k7', title: 'Publication JO n°24 — relecture finale', description: 'Dernier contrôle avant publication officielle du Journal Officiel n°24.', assignee: 'Jean NZE', priority: 'haute', deadline: '2026-02-25', column: 'review', tags: ['JO', 'Publication'], createdAt: '2026-02-03' },
    { id: 'k8', title: 'Mise à jour profils utilisateurs DGME', description: 'Mise à jour des rôles et permissions pour 8 agents de la DGME.', assignee: 'Marie OBAME', priority: 'basse', column: 'done', tags: ['Utilisateurs', 'Permissions'], createdAt: '2026-02-01' },
    { id: 'k9', title: 'Export rapport consolidé Q4 2025', description: 'Génération et envoi du rapport trimestriel au SGPR.', assignee: 'Albert NDONG', priority: 'haute', column: 'done', tags: ['Rapport', 'SGPR'], createdAt: '2026-01-28' },
    { id: 'k10', title: 'Migration données institutions anciennes', description: 'Import de 45 fiches institutions depuis l\'ancien système.', assignee: 'Rose MABIKA', priority: 'basse', column: 'done', tags: ['Migration', 'Import'], createdAt: '2026-01-25' },
    { id: 'k11', title: 'Rédiger note circulaire reporting mensuel', description: 'Note aux SG ministériels sur les nouvelles procédures de reporting.', assignee: 'Jean NZE', priority: 'moyenne', column: 'todo', tags: ['Communication', 'Reporting'], createdAt: '2026-02-10' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function KanbanPage() {
    const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS);
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const moveTask = (taskId: string, direction: 'next' | 'prev') => {
        setTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            const colIndex = COLUMNS.findIndex(c => c.id === t.column);
            const newIndex = direction === 'next' ? Math.min(colIndex + 1, COLUMNS.length - 1) : Math.max(colIndex - 1, 0);
            if (colIndex === newIndex) return t;
            toast({ title: `📋 Tâche déplacée → ${COLUMNS[newIndex].label}` });
            return { ...t, column: COLUMNS[newIndex].id };
        }));
    };

    const addTask = () => {
        if (!newTitle.trim()) return;
        const newTask: KanbanTask = {
            id: `k${Date.now()}`,
            title: newTitle.trim(),
            description: '',
            assignee: 'Non assigné',
            priority: 'moyenne',
            column: 'todo',
            tags: [],
            createdAt: new Date().toISOString().split('T')[0],
        };
        setTasks(prev => [newTask, ...prev]);
        setNewTitle('');
        setShowAdd(false);
        toast({ title: '✅ Tâche ajoutée' });
    };

    const stats = useMemo(() => ({
        total: tasks.length,
        todo: tasks.filter(t => t.column === 'todo').length,
        inProgress: tasks.filter(t => t.column === 'in_progress').length,
        review: tasks.filter(t => t.column === 'review').length,
        done: tasks.filter(t => t.column === 'done').length,
        urgent: tasks.filter(t => t.priority === 'haute' && t.column !== 'done').length,
    }), [tasks]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Kanban className="h-7 w-7 text-violet-600" />
                            Tableau Kanban
                        </h1>
                        <p className="text-muted-foreground">
                            {stats.total} tâches — {stats.urgent} urgente(s) en attente
                        </p>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => setShowAdd(!showAdd)}>
                        <Plus className="h-4 w-4" /> Nouvelle tâche
                    </Button>
                </div>

                {/* Quick Add */}
                {showAdd && (
                    <Card className="border-2 border-primary/30">
                        <CardContent className="pt-4 flex items-center gap-3">
                            <Input
                                placeholder="Titre de la nouvelle tâche..."
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTask()}
                                autoFocus
                            />
                            <Button size="sm" onClick={addTask} disabled={!newTitle.trim()}>Ajouter</Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAdd(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {COLUMNS.map(col => (
                        <Card key={col.id}>
                            <CardContent className="pt-2 pb-1 text-center">
                                <p className={`text-lg font-bold ${col.color}`}>{tasks.filter(t => t.column === col.id).length}</p>
                                <p className="text-[9px] text-muted-foreground">{col.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="hidden sm:block">
                        <CardContent className="pt-2 pb-1 text-center">
                            <p className="text-lg font-bold text-red-600">{stats.urgent}</p>
                            <p className="text-[9px] text-muted-foreground">Urgentes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {COLUMNS.map(col => {
                        const colTasks = tasks.filter(t => t.column === col.id);
                        return (
                            <div key={col.id} className={`rounded-xl p-3 ${col.bgColor}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm font-semibold ${col.color} flex items-center gap-2`}>
                                        {col.label}
                                        <Badge variant="secondary" className="text-[10px]">{colTasks.length}</Badge>
                                    </h3>
                                </div>

                                <div className="space-y-2 min-h-[100px]">
                                    {colTasks.map(task => {
                                        const prioConf = PRIORITY_CONFIG[task.priority];
                                        const colIndex = COLUMNS.findIndex(c => c.id === task.column);
                                        return (
                                            <Card key={task.id} className="shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                                                <CardContent className="p-3 space-y-2">
                                                    {/* Priority + Title */}
                                                    <div className="flex items-start gap-2">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5 group-hover:text-muted-foreground transition-colors" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold leading-tight">{task.title}</p>
                                                            {task.description && (
                                                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    {task.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {task.tags.map(tag => (
                                                                <Badge key={tag} variant="outline" className="text-[9px] h-4">{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Meta */}
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`text-[9px] h-4 ${prioConf.color}`}>
                                                                {prioConf.label}
                                                            </Badge>
                                                            <span className="flex items-center gap-0.5">
                                                                <User className="h-2.5 w-2.5" />{task.assignee.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                        {task.deadline && (
                                                            <span className="flex items-center gap-0.5">
                                                                <Calendar className="h-2.5 w-2.5" />{task.deadline.slice(5)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Move Buttons */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {colIndex > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-[10px] px-2 flex-1"
                                                                onClick={() => moveTask(task.id, 'prev')}
                                                            >
                                                                ← {COLUMNS[colIndex - 1].label}
                                                            </Button>
                                                        )}
                                                        {colIndex < COLUMNS.length - 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-[10px] px-2 flex-1"
                                                                onClick={() => moveTask(task.id, 'next')}
                                                            >
                                                                {COLUMNS[colIndex + 1].label} →
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
