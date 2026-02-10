/**
 * SGG Digital — Workflow Builder (Processus Administratifs)
 *
 * Visualisation et gestion des processus gouvernementaux :
 *   - Workflows types avec étapes
 *   - Statut par étape
 *   - Délais et responsables
 *   - Suivi en temps réel
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Workflow, CheckCircle2, Clock, XCircle,
    ArrowRight, Users, Plus, Play,
    Pause, RotateCcw, Search, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type StepStatus = 'completed' | 'in-progress' | 'pending' | 'blocked';

interface WorkflowStep {
    id: string;
    name: string;
    assignee: string;
    duration: string;
    status: StepStatus;
}

interface WorkflowDef {
    id: string;
    name: string;
    description: string;
    category: string;
    steps: WorkflowStep[];
    createdAt: string;
    instances: number;
    avgDuration: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STEP_CONFIG: Record<StepStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    completed: { label: 'Terminé', color: 'bg-green-500', icon: CheckCircle2 },
    'in-progress': { label: 'En cours', color: 'bg-blue-500', icon: Play },
    pending: { label: 'En attente', color: 'bg-gray-300 dark:bg-gray-600', icon: Clock },
    blocked: { label: 'Bloqué', color: 'bg-red-500', icon: XCircle },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const WORKFLOWS: WorkflowDef[] = [
    {
        id: 'w1', name: 'Processus de Nomination', description: 'Circuit complet de nomination d\'un haut fonctionnaire, du dossier à la publication J.O.',
        category: 'Nominations', createdAt: 'Jan 2026', instances: 45, avgDuration: '12 jours',
        steps: [
            { id: 's1', name: 'Réception du dossier', assignee: 'Service Courrier', duration: '1 jour', status: 'completed' },
            { id: 's2', name: 'Vérification conformité', assignee: 'DAJ', duration: '2 jours', status: 'completed' },
            { id: 's3', name: 'Avis technique ministère', assignee: 'Ministère de tutelle', duration: '3 jours', status: 'completed' },
            { id: 's4', name: 'Validation Secrétaire Général', assignee: 'SG du Gouvernement', duration: '1 jour', status: 'in-progress' },
            { id: 's5', name: 'Signature Présidence', assignee: 'Présidence', duration: '3 jours', status: 'pending' },
            { id: 's6', name: 'Publication Journal Officiel', assignee: 'Direction J.O.', duration: '2 jours', status: 'pending' },
        ],
    },
    {
        id: 'w2', name: 'Rapport GAR Trimestriel', description: 'Soumission et validation des rapports de Gestion Axée sur les Résultats par les ministères.',
        category: 'GAR', createdAt: 'Jan 2026', instances: 140, avgDuration: '8 jours',
        steps: [
            { id: 's7', name: 'Notification ouverture période', assignee: 'SGG Digital', duration: '1 jour', status: 'completed' },
            { id: 's8', name: 'Saisie données par ministère', assignee: 'Points focaux', duration: '5 jours', status: 'completed' },
            { id: 's9', name: 'Contrôle qualité automatique', assignee: 'Système', duration: 'Instant', status: 'completed' },
            { id: 's10', name: 'Validation SGG', assignee: 'Équipe GAR', duration: '2 jours', status: 'in-progress' },
            { id: 's11', name: 'Publication résultats', assignee: 'SGG Digital', duration: '1 jour', status: 'pending' },
        ],
    },
    {
        id: 'w3', name: 'Projet de Décret', description: 'Élaboration, examen et publication d\'un projet de décret gouvernemental.',
        category: 'Textes Juridiques', createdAt: 'Fév 2026', instances: 14, avgDuration: '21 jours',
        steps: [
            { id: 's12', name: 'Rédaction projet', assignee: 'Ministère initiateur', duration: '5 jours', status: 'completed' },
            { id: 's13', name: 'Examen juridique DAJ', assignee: 'DAJ', duration: '3 jours', status: 'completed' },
            { id: 's14', name: 'Consultation interministérielle', assignee: 'Ministères concernés', duration: '7 jours', status: 'in-progress' },
            { id: 's15', name: 'Mise en forme finale', assignee: 'SGG', duration: '2 jours', status: 'pending' },
            { id: 's16', name: 'Examen Conseil des Ministres', assignee: 'Conseil', duration: '1 jour', status: 'pending' },
            { id: 's17', name: 'Signature Président', assignee: 'Présidence', duration: '2 jours', status: 'pending' },
            { id: 's18', name: 'Publication J.O.', assignee: 'Direction J.O.', duration: '1 jour', status: 'pending' },
        ],
    },
    {
        id: 'w4', name: 'Audit de Performance Ministère', description: 'Processus d\'évaluation de la performance d\'un ministère sur la plateforme SGG.',
        category: 'Performance', createdAt: 'Fév 2026', instances: 8, avgDuration: '15 jours',
        steps: [
            { id: 's19', name: 'Collecte indicateurs', assignee: 'Système', duration: 'Automatique', status: 'completed' },
            { id: 's20', name: 'Analyse comparative', assignee: 'Équipe Performance', duration: '3 jours', status: 'completed' },
            { id: 's21', name: 'Rédaction rapport benchmark', assignee: 'Analyste SGG', duration: '5 jours', status: 'completed' },
            { id: 's22', name: 'Revue avec ministère', assignee: 'Point focal', duration: '3 jours', status: 'blocked' },
            { id: 's23', name: 'Plan d\'amélioration', assignee: 'Ministère + SGG', duration: '4 jours', status: 'pending' },
        ],
    },
    {
        id: 'w5', name: 'Onboarding Nouveau Ministère', description: 'Intégration d\'un nouveau ministère ou entité sur la plateforme SGG Digital.',
        category: 'Administration', createdAt: 'Jan 2026', instances: 3, avgDuration: '10 jours',
        steps: [
            { id: 's24', name: 'Création compte administrateur', assignee: 'Équipe Tech', duration: '1 jour', status: 'completed' },
            { id: 's25', name: 'Configuration modules', assignee: 'Équipe Tech', duration: '2 jours', status: 'completed' },
            { id: 's26', name: 'Formation point focal', assignee: 'Formation SGG', duration: '2 jours', status: 'completed' },
            { id: 's27', name: 'Import données initiales', assignee: 'Point focal', duration: '3 jours', status: 'completed' },
            { id: 's28', name: 'Validation et go-live', assignee: 'SG + Ministère', duration: '2 jours', status: 'completed' },
        ],
    },
];

const CATEGORIES = [...new Set(WORKFLOWS.map(w => w.category))];

// ── Component ───────────────────────────────────────────────────────────────

export default function WorkflowBuilderPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['w1']));

    const toggle = (id: string) => {
        setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    };

    const filtered = useMemo(() => {
        return WORKFLOWS.filter(w => {
            if (catFilter !== 'all' && w.category !== catFilter) return false;
            if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, catFilter]);

    const totalSteps = WORKFLOWS.reduce((s, w) => s + w.steps.length, 0);
    const completedSteps = WORKFLOWS.reduce((s, w) => s + w.steps.filter(st => st.status === 'completed').length, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Workflow className="h-7 w-7 text-teal-600" />
                            Workflow Builder
                        </h1>
                        <p className="text-muted-foreground">
                            {WORKFLOWS.length} processus · {totalSteps} étapes · {completedSteps} terminées
                        </p>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => toast({ title: '➕ Nouveau workflow', description: 'Concepteur disponible prochainement' })}>
                        <Plus className="h-4 w-4" /> Nouveau Workflow
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.entries(STEP_CONFIG) as [StepStatus, typeof STEP_CONFIG.completed][]).map(([key, conf]) => {
                        const count = WORKFLOWS.reduce((s, w) => s + w.steps.filter(st => st.status === key).length, 0);
                        const Icon = conf.icon;
                        return (
                            <Card key={key}><CardContent className="pt-3 pb-2 text-center">
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                    <Icon className="h-3.5 w-3.5" />
                                    <p className="text-xl font-bold">{count}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{conf.label}</p>
                            </CardContent></Card>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Tous</Button>
                        {CATEGORIES.map(c => (
                            <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(c)}>{c}</Button>
                        ))}
                    </div>
                </div>

                {/* Workflow List */}
                <div className="space-y-3">
                    {filtered.map(wf => {
                        const isOpen = expandedIds.has(wf.id);
                        const done = wf.steps.filter(s => s.status === 'completed').length;
                        const pct = Math.round((done / wf.steps.length) * 100);
                        const currentStep = wf.steps.find(s => s.status === 'in-progress');
                        const isBlocked = wf.steps.some(s => s.status === 'blocked');
                        const allDone = done === wf.steps.length;

                        return (
                            <Card key={wf.id} className={isBlocked ? 'border-red-300 dark:border-red-800' : allDone ? 'border-green-300 dark:border-green-800' : ''}>
                                <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors" onClick={() => toggle(wf.id)}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${allDone ? 'bg-green-100 dark:bg-green-900/30' : isBlocked ? 'bg-red-100 dark:bg-red-900/30' : 'bg-teal-100 dark:bg-teal-900/30'
                                        }`}>
                                        {allDone ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : isBlocked ? <XCircle className="h-5 w-5 text-red-600" /> : <Workflow className="h-5 w-5 text-teal-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold">{wf.name}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] h-4">{wf.category}</Badge>
                                            <span>{wf.instances} instances</span>
                                            <span>Moy. {wf.avgDuration}</span>
                                            {currentStep && <span className="text-blue-600 font-semibold">→ {currentStep.name}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold">{pct}%</p>
                                            <p className="text-[9px] text-muted-foreground">{done}/{wf.steps.length}</p>
                                        </div>
                                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mt-3 mb-4">{wf.description}</p>

                                        {/* Progress bar */}
                                        <div className="mb-4">
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : isBlocked ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>

                                        {/* Steps Pipeline */}
                                        <div className="space-y-1.5">
                                            {wf.steps.map((step, i) => {
                                                const conf = STEP_CONFIG[step.status];
                                                const StepIcon = conf.icon;
                                                return (
                                                    <div key={step.id} className="flex items-center gap-2">
                                                        {/* Connector */}
                                                        <div className="flex flex-col items-center w-5 shrink-0">
                                                            <div className={`w-3 h-3 rounded-full ${conf.color} flex items-center justify-center`}>
                                                                {step.status === 'completed' && <CheckCircle2 className="h-2 w-2 text-white" />}
                                                            </div>
                                                            {i < wf.steps.length - 1 && <div className="w-0.5 h-4 bg-muted" />}
                                                        </div>
                                                        {/* Step detail */}
                                                        <div className={`flex-1 p-2 rounded-lg border text-xs flex items-center gap-2 ${step.status === 'in-progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' :
                                                                step.status === 'blocked' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : ''
                                                            }`}>
                                                            <span className="font-semibold flex-1">{step.name}</span>
                                                            <span className="text-[10px] text-muted-foreground hidden sm:block"><Users className="h-2.5 w-2.5 inline mr-0.5" />{step.assignee}</span>
                                                            <span className="text-[10px] text-muted-foreground hidden md:block"><Clock className="h-2.5 w-2.5 inline mr-0.5" />{step.duration}</span>
                                                            <Badge className={`text-[8px] h-3.5 ${step.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                    step.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                        step.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                                }`}>{conf.label}</Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Workflow className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun workflow trouvé</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
