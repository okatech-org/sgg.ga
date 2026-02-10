/**
 * SGG Digital — Tableau de Bord Personnel
 *
 * Dashboard personnalisable avec widgets :
 *   - Widgets activables/désactivables
 *   - Résumé personnel des tâches et activités
 *   - Raccourcis rapides
 *   - Métriques personnelles
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, Eye, EyeOff, Star,
    CheckCircle2, Clock, FileText, Users,
    BarChart3, Calendar, Bell, Zap,
    TrendingUp, ArrowRight, Settings2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Types ───────────────────────────────────────────────────────────────────

interface Widget {
    id: string;
    title: string;
    icon: typeof Star;
    enabled: boolean;
    size: 'sm' | 'md' | 'lg';
}

// ── Config ──────────────────────────────────────────────────────────────────

const INITIAL_WIDGETS: Widget[] = [
    { id: 'tasks', title: 'Mes Tâches', icon: CheckCircle2, enabled: true, size: 'md' },
    { id: 'stats', title: 'Mes Statistiques', icon: BarChart3, enabled: true, size: 'md' },
    { id: 'shortcuts', title: 'Raccourcis', icon: Zap, enabled: true, size: 'md' },
    { id: 'recent', title: 'Activité Récente', icon: Clock, enabled: true, size: 'md' },
    { id: 'calendar', title: 'Agenda du Jour', icon: Calendar, enabled: true, size: 'sm' },
    { id: 'notifications', title: 'Notifications', icon: Bell, enabled: true, size: 'sm' },
    { id: 'docs', title: 'Derniers Documents', icon: FileText, enabled: false, size: 'md' },
    { id: 'team', title: 'Mon Équipe', icon: Users, enabled: false, size: 'sm' },
];

// ── Mock Data ───────────────────────────────────────────────────────────────

const MY_TASKS = [
    { id: 't1', text: 'Valider décret n°004/2026', priority: 'haute', deadline: '12 fév', done: false },
    { id: 't2', text: 'Préparer ordre du jour Conseil', priority: 'haute', deadline: '14 fév', done: false },
    { id: 't3', text: 'Relire rapport consolidé T4', priority: 'moyenne', deadline: '18 fév', done: false },
    { id: 't4', text: 'Réunion SGG-SGPR synchro hebdo', priority: 'moyenne', deadline: 'Aujourd\'hui', done: true },
    { id: 't5', text: 'Envoyer circulaire reporting mensuel', priority: 'basse', deadline: '20 fév', done: false },
];

const RECENT_ACTIVITY = [
    { text: 'Rapport GAR T4 MINFI validé', time: 'il y a 30 min', type: 'success' },
    { text: 'Nouveau message de Paul ABIAGA', time: 'il y a 1h', type: 'info' },
    { text: 'Nomination DG ANPI soumise', time: 'il y a 2h', type: 'info' },
    { text: 'Alerte : MINTRANS en retard GAR', time: 'il y a 3h', type: 'warning' },
    { text: 'Export rapport consolidé terminé', time: 'il y a 5h', type: 'success' },
];

const SHORTCUTS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Kanban', href: '/kanban', icon: CheckCircle2 },
    { label: 'Messagerie', href: '/messagerie', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Calendrier', href: '/calendar', icon: Calendar },
    { label: 'Benchmark', href: '/benchmark', icon: TrendingUp },
];

const TODAY_EVENTS = [
    { time: '09:00', text: 'Réunion de coordination SGG', category: 'Réunion' },
    { time: '11:00', text: 'Visioconf. points focaux MINTRANS', category: 'Formation' },
    { time: '14:30', text: 'Revue dossier nominations DG', category: 'Validation' },
    { time: '16:00', text: 'Comité éditorial Journal Officiel', category: 'Comité' },
];

const NOTIFICATIONS_DATA = [
    { text: '3 rapports GAR en attente de validation', type: 'warning' },
    { text: 'Mise à jour plateforme v15.0 effectuée', type: 'info' },
    { text: 'Sondage "Format rapports" — 150 votes', type: 'info' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function PersonalDashboardPage() {
    const [widgets, setWidgets] = useState(INITIAL_WIDGETS);
    const [tasks, setTasks] = useState(MY_TASKS);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    const toggleWidget = (id: string) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const enabledWidgets = widgets.filter(w => w.enabled);
    const doneTasks = tasks.filter(t => t.done).length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Star className="h-7 w-7 text-yellow-500" />
                            Mon Tableau de Bord
                        </h1>
                        <p className="text-muted-foreground">
                            Bonjour, Albert NDONG — {doneTasks}/{tasks.length} tâches terminées aujourd'hui
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSettings(!showSettings)}>
                        <Settings2 className="h-4 w-4" />
                        {showSettings ? 'Fermer' : 'Personnaliser'}
                    </Button>
                </div>

                {/* Widget Settings Panel */}
                {showSettings && (
                    <Card className="border-2 border-dashed border-primary/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Personnaliser les widgets</CardTitle>
                            <CardDescription className="text-xs">Activez ou désactivez les widgets visibles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {widgets.map(w => {
                                    const Icon = w.icon;
                                    return (
                                        <button
                                            key={w.id}
                                            onClick={() => toggleWidget(w.id)}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${w.enabled ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                                                }`}
                                        >
                                            {w.enabled ? <Eye className="h-3.5 w-3.5 text-primary shrink-0" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs truncate">{w.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Widget Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Tasks Widget */}
                    {enabledWidgets.find(w => w.id === 'tasks') && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Mes Tâches
                                    <Badge variant="secondary" className="text-[10px] ml-auto">{doneTasks}/{tasks.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5">
                                {tasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${task.done ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'
                                            }`}>
                                            {task.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className={`text-xs flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                                            {task.text}
                                        </span>
                                        <Badge className={`text-[9px] h-4 ${task.priority === 'haute' ? 'bg-red-100 text-red-700' : task.priority === 'moyenne' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {task.deadline}
                                        </Badge>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Widget */}
                    {enabledWidgets.find(w => w.id === 'stats') && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-600" /> Mes Statistiques
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <p className="text-xl font-bold text-blue-600">23</p>
                                        <p className="text-[9px] text-muted-foreground">Rapports validés</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <p className="text-xl font-bold text-green-600">95%</p>
                                        <p className="text-[9px] text-muted-foreground">Taux de traitement</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <p className="text-xl font-bold text-amber-600">4.2h</p>
                                        <p className="text-[9px] text-muted-foreground">Temps moyen</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <p className="text-xl font-bold text-purple-600">12</p>
                                        <p className="text-[9px] text-muted-foreground">Décrets traités</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Shortcuts Widget */}
                    {enabledWidgets.find(w => w.id === 'shortcuts') && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" /> Raccourcis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2">
                                    {SHORTCUTS.map(sc => {
                                        const Icon = sc.icon;
                                        return (
                                            <button
                                                key={sc.href}
                                                onClick={() => navigate(sc.href)}
                                                className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                                            >
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-[10px] font-medium">{sc.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Activity Widget */}
                    {enabledWidgets.find(w => w.id === 'recent') && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-purple-600" /> Activité Récente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {RECENT_ACTIVITY.map((act, i) => (
                                    <div key={i} className="flex items-start gap-2 p-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${act.type === 'success' ? 'bg-green-500' : act.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <div>
                                            <p className="text-xs">{act.text}</p>
                                            <p className="text-[10px] text-muted-foreground">{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Calendar Widget */}
                    {enabledWidgets.find(w => w.id === 'calendar') && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-teal-600" /> Agenda du Jour
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {TODAY_EVENTS.map((ev, i) => (
                                    <div key={i} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30 transition-colors">
                                        <span className="text-[10px] font-mono text-muted-foreground w-10 shrink-0">{ev.time}</span>
                                        <div className="w-0.5 h-6 bg-teal-400 rounded shrink-0" />
                                        <div>
                                            <p className="text-xs">{ev.text}</p>
                                            <Badge variant="outline" className="text-[9px] h-3.5">{ev.category}</Badge>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full text-xs gap-1 h-7" onClick={() => navigate('/calendar')}>
                                    Voir le calendrier <ArrowRight className="h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notifications Widget */}
                    {enabledWidgets.find(w => w.id === 'notifications') && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-red-500" /> Notifications
                                    <Badge className="bg-red-500 text-white text-[10px] ml-auto">{NOTIFICATIONS_DATA.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {NOTIFICATIONS_DATA.map((notif, i) => (
                                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        <p className="text-xs">{notif.text}</p>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full text-xs gap-1 h-7" onClick={() => navigate('/notifications')}>
                                    Toutes les notifications <ArrowRight className="h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
