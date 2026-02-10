/**
 * SGG Digital — Page Workflow Visuel
 *
 * Interface de gestion des circuits d'approbation :
 *   - Liste des instances de workflow actives
 *   - Visualisation interactive des étapes
 *   - Actions d'approbation/rejet/retour
 *   - Filtrage par statut, type, priorité
 *   - Templates prédéfinis
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    GitBranch, Check, X, ArrowLeft, ArrowRight, Clock,
    AlertTriangle, CheckCircle2, XCircle, Filter,
    Search, Plus, Send, MessageSquare, ChevronDown,
    Zap, FileText, Users as UsersIcon, Scale,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface WorkflowStep {
    index: number;
    name: string;
    requiredRoles: string[];
    actionLabel: string;
    deadlineHours?: number;
}

interface WorkflowInstance {
    id: string;
    workflowName: string;
    dossierType: string;
    dossierTitle: string;
    currentStep: number;
    totalSteps: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'escalated';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    steps: WorkflowStep[];
    createdBy: string;
    startedAt: string;
    deadline?: string;
    lastAction?: { actor: string; action: string; date: string; comment?: string };
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_INSTANCES: WorkflowInstance[] = [
    {
        id: 'wf-001',
        workflowName: 'Circuit Décret Présidentiel',
        dossierType: 'decret',
        dossierTitle: 'Décret n°001/2026 — Réorganisation MINTP',
        currentStep: 3,
        totalSteps: 6,
        status: 'in_progress',
        priority: 'high',
        steps: [
            { index: 0, name: 'Rédaction', requiredRoles: ['sg_ministere'], actionLabel: 'Soumettre', deadlineHours: 72 },
            { index: 1, name: 'Contrôle Juridique', requiredRoles: ['directeur_sgg'], actionLabel: 'Valider', deadlineHours: 48 },
            { index: 2, name: 'Visa SG', requiredRoles: ['admin_sgg'], actionLabel: 'Apposer visa', deadlineHours: 24 },
            { index: 3, name: 'Approbation SGPR', requiredRoles: ['sgpr'], actionLabel: 'Approuver', deadlineHours: 48 },
            { index: 4, name: 'Signature', requiredRoles: ['sgpr'], actionLabel: 'Signer' },
            { index: 5, name: 'Publication JO', requiredRoles: ['dgjo'], actionLabel: 'Publier', deadlineHours: 24 },
        ],
        createdBy: 'sg.mintp@mintp.ga',
        startedAt: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(),
        deadline: new Date(Date.now() + 2 * 24 * 3600_000).toISOString(),
        lastAction: { actor: 'admin@sgg.ga', action: 'Visa apposé', date: new Date(Date.now() - 2 * 3600_000).toISOString(), comment: 'Conforme aux dispositions légales' },
    },
    {
        id: 'wf-002',
        workflowName: 'Circuit Nomination',
        dossierType: 'nomination',
        dossierTitle: 'Nomination DG Agence Nationale de l\'Eau',
        currentStep: 2,
        totalSteps: 5,
        status: 'in_progress',
        priority: 'normal',
        steps: [
            { index: 0, name: 'Proposition', requiredRoles: ['ministre'], actionLabel: 'Proposer' },
            { index: 1, name: 'Examen SGG', requiredRoles: ['directeur_sgg'], actionLabel: 'Examiner', deadlineHours: 48 },
            { index: 2, name: 'Validation SGPR', requiredRoles: ['sgpr'], actionLabel: 'Valider', deadlineHours: 72 },
            { index: 3, name: 'Conseil Ministres', requiredRoles: ['premier_ministre'], actionLabel: 'Approuver' },
            { index: 4, name: 'Publication', requiredRoles: ['dgjo'], actionLabel: 'Publier', deadlineHours: 24 },
        ],
        createdBy: 'ministre@mineha.ga',
        startedAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
        lastAction: { actor: 'directeur@sgg.ga', action: 'Examen favorable', date: new Date(Date.now() - 8 * 3600_000).toISOString() },
    },
    {
        id: 'wf-003',
        workflowName: 'Circuit Rapport GAR',
        dossierType: 'rapport',
        dossierTitle: 'Rapport Performance MINFI T4 2025',
        currentStep: 4,
        totalSteps: 4,
        status: 'approved',
        priority: 'normal',
        steps: [
            { index: 0, name: 'Soumission', requiredRoles: ['point_focal'], actionLabel: 'Soumettre' },
            { index: 1, name: 'Validation SG', requiredRoles: ['sg_ministere'], actionLabel: 'Valider' },
            { index: 2, name: 'Contrôle SGG', requiredRoles: ['directeur_sgg'], actionLabel: 'Contrôler' },
            { index: 3, name: 'Approbation', requiredRoles: ['admin_sgg'], actionLabel: 'Approuver' },
        ],
        createdBy: 'pf.minfi@minfi.ga',
        startedAt: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(),
        lastAction: { actor: 'admin@sgg.ga', action: 'Approuvé', date: new Date(Date.now() - 24 * 3600_000).toISOString(), comment: 'Excellent rapport, objectifs atteints.' },
    },
    {
        id: 'wf-004',
        workflowName: 'Circuit Décret Présidentiel',
        dossierType: 'decret',
        dossierTitle: 'Décret n°003/2026 — Budget rectificatif',
        currentStep: 1,
        totalSteps: 6,
        status: 'rejected',
        priority: 'urgent',
        steps: [
            { index: 0, name: 'Rédaction', requiredRoles: ['sg_ministere'], actionLabel: 'Soumettre' },
            { index: 1, name: 'Contrôle Juridique', requiredRoles: ['directeur_sgg'], actionLabel: 'Valider' },
            { index: 2, name: 'Visa SG', requiredRoles: ['admin_sgg'], actionLabel: 'Apposer visa' },
            { index: 3, name: 'Approbation SGPR', requiredRoles: ['sgpr'], actionLabel: 'Approuver' },
            { index: 4, name: 'Signature', requiredRoles: ['sgpr'], actionLabel: 'Signer' },
            { index: 5, name: 'Publication JO', requiredRoles: ['dgjo'], actionLabel: 'Publier' },
        ],
        createdBy: 'sg.minpb@minpb.ga',
        startedAt: new Date(Date.now() - 10 * 24 * 3600_000).toISOString(),
        lastAction: { actor: 'directeur@sgg.ga', action: 'Rejeté', date: new Date(Date.now() - 48 * 3600_000).toISOString(), comment: 'Non-conformité article 12 de la Constitution' },
    },
    {
        id: 'wf-005',
        workflowName: 'Circuit Texte Législatif',
        dossierType: 'texte_legislatif',
        dossierTitle: 'PL — Réforme Code du Travail',
        currentStep: 1,
        totalSteps: 5,
        status: 'escalated',
        priority: 'urgent',
        steps: [
            { index: 0, name: 'Rédaction', requiredRoles: ['sg_ministere'], actionLabel: 'Soumettre' },
            { index: 1, name: 'Examen Inter.', requiredRoles: ['directeur_sgg'], actionLabel: 'Examiner' },
            { index: 2, name: 'Arbitrage SGPR', requiredRoles: ['sgpr'], actionLabel: 'Arbitrer' },
            { index: 3, name: 'Conseil Ministres', requiredRoles: ['premier_ministre'], actionLabel: 'Adopter' },
            { index: 4, name: 'Transmission', requiredRoles: ['admin_sgg'], actionLabel: 'Transmettre' },
        ],
        createdBy: 'sg.mintrav@mintrav.ga',
        startedAt: new Date(Date.now() - 21 * 24 * 3600_000).toISOString(),
        deadline: new Date(Date.now() - 24 * 3600_000).toISOString(),
        lastAction: { actor: 'system', action: 'Escaladé (deadline dépassée)', date: new Date(Date.now() - 24 * 3600_000).toISOString() },
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function WorkflowPage() {
    const [instances] = useState(MOCK_INSTANCES);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return instances.filter(inst => {
            if (statusFilter !== 'all' && inst.status !== statusFilter) return false;
            if (typeFilter !== 'all' && inst.dossierType !== typeFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return inst.dossierTitle.toLowerCase().includes(q) ||
                    inst.workflowName.toLowerCase().includes(q) ||
                    inst.createdBy.toLowerCase().includes(q);
            }
            return true;
        });
    }, [instances, search, statusFilter, typeFilter]);

    const stats = useMemo(() => ({
        total: instances.length,
        inProgress: instances.filter(i => i.status === 'in_progress').length,
        approved: instances.filter(i => i.status === 'approved').length,
        rejected: instances.filter(i => i.status === 'rejected').length,
        escalated: instances.filter(i => i.status === 'escalated').length,
    }), [instances]);

    // ── Helpers ─────────────────────────────────────────────────────────────

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'En attente', color: 'bg-gray-100 text-gray-700', icon: Clock };
            case 'in_progress': return { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: ArrowRight };
            case 'approved': return { label: 'Approuvé', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
            case 'rejected': return { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: XCircle };
            case 'escalated': return { label: 'Escaladé', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
            default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'urgent': return { label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200' };
            case 'high': return { label: 'Haute', color: 'text-orange-600 bg-orange-50 border-orange-200' };
            case 'normal': return { label: 'Normale', color: 'text-blue-600 bg-blue-50 border-blue-200' };
            case 'low': return { label: 'Basse', color: 'text-gray-500 bg-gray-50 border-gray-200' };
            default: return { label: priority, color: 'text-gray-500 bg-gray-50' };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'decret': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'nomination': return <UsersIcon className="h-4 w-4 text-purple-500" />;
            case 'rapport': return <Zap className="h-4 w-4 text-green-500" />;
            case 'texte_legislatif': return <Scale className="h-4 w-4 text-orange-500" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatRelative = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 3600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `Il y a ${Math.floor(diff / 3600_000)}h`;
        return `Il y a ${Math.floor(diff / 86400_000)}j`;
    };

    const selected = selectedInstance ? instances.find(i => i.id === selectedInstance) : null;

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GitBranch className="h-7 w-7 text-blue-600" />
                            Circuits d'Approbation
                        </h1>
                        <p className="text-muted-foreground">
                            Suivi des workflows et processus de validation
                        </p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nouveau Workflow
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Total', value: stats.total, icon: GitBranch, color: 'text-gray-600' },
                        { label: 'En cours', value: stats.inProgress, icon: ArrowRight, color: 'text-blue-600' },
                        { label: 'Approuvés', value: stats.approved, icon: CheckCircle2, color: 'text-green-600' },
                        { label: 'Rejetés', value: stats.rejected, icon: XCircle, color: 'text-red-600' },
                        { label: 'Escaladés', value: stats.escalated, icon: AlertTriangle, color: 'text-orange-600' },
                    ].map(stat => (
                        <Card key={stat.label} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-4 pb-3 flex items-center gap-3">
                                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un dossier..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-1 items-center">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        {['all', 'in_progress', 'approved', 'rejected', 'escalated'].map(s => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === 'all' ? 'Tous' : getStatusConfig(s).label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Main content: List + Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Instance List */}
                    <div className="lg:col-span-2 space-y-3">
                        {filtered.map(inst => {
                            const statusConf = getStatusConfig(inst.status);
                            const priorityConf = getPriorityConfig(inst.priority);
                            const isSelected = selectedInstance === inst.id;
                            const progress = Math.round((inst.currentStep / inst.totalSteps) * 100);

                            return (
                                <Card
                                    key={inst.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary shadow-md' : ''
                                        }`}
                                    onClick={() => setSelectedInstance(inst.id)}
                                >
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(inst.dossierType)}
                                                <span className="text-xs text-muted-foreground">{inst.workflowName}</span>
                                            </div>
                                            <Badge className={`text-[10px] ${priorityConf.color}`}>{priorityConf.label}</Badge>
                                        </div>
                                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{inst.dossierTitle}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={`text-[10px] ${statusConf.color}`}>
                                                <statusConf.icon className="h-3 w-3 mr-1" />
                                                {statusConf.label}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                Étape {Math.min(inst.currentStep + 1, inst.totalSteps)}/{inst.totalSteps}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all ${inst.status === 'approved' ? 'bg-green-500' :
                                                        inst.status === 'rejected' ? 'bg-red-500' :
                                                            inst.status === 'escalated' ? 'bg-orange-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                                            <span>{inst.createdBy}</span>
                                            <span>{formatRelative(inst.startedAt)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filtered.length === 0 && (
                            <Card>
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucun workflow trouvé</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-3">
                        {selected ? (
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{selected.dossierTitle}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                {getTypeIcon(selected.dossierType)}
                                                {selected.workflowName}
                                            </CardDescription>
                                        </div>
                                        <Badge className={getStatusConfig(selected.status).color}>
                                            {getStatusConfig(selected.status).label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Step Timeline */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-4">Progression du circuit</h4>
                                        <div className="relative">
                                            {selected.steps.map((step, idx) => {
                                                const isCompleted = idx < selected.currentStep;
                                                const isCurrent = idx === selected.currentStep && !['approved', 'rejected'].includes(selected.status);
                                                const isFuture = idx > selected.currentStep;
                                                const isLast = idx === selected.steps.length - 1;

                                                return (
                                                    <div key={idx} className="flex items-start gap-3 mb-1">
                                                        {/* Timeline dot & line */}
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                                    isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                                                                        'bg-muted border-muted-foreground/30 text-muted-foreground'
                                                                }`}>
                                                                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                                                            </div>
                                                            {!isLast && (
                                                                <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                                                                    }`} />
                                                            )}
                                                        </div>
                                                        {/* Step info */}
                                                        <div className={`pt-1 pb-3 ${isFuture ? 'opacity-50' : ''}`}>
                                                            <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                                                                {step.name}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {step.requiredRoles.join(', ')}
                                                                {step.deadlineHours && ` · ${step.deadlineHours}h`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Last action */}
                                    {selected.lastAction && (
                                        <div className="p-3 rounded-lg bg-muted/50 border">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Dernière action</span>
                                            </div>
                                            <p className="text-sm">{selected.lastAction.action}</p>
                                            {selected.lastAction.comment && (
                                                <p className="text-xs text-muted-foreground italic mt-1">"{selected.lastAction.comment}"</p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                {selected.lastAction.actor} · {formatRelative(selected.lastAction.date)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Meta */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 rounded-lg bg-muted/30">
                                            <p className="text-[11px] text-muted-foreground">Initiateur</p>
                                            <p className="font-medium truncate">{selected.createdBy}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/30">
                                            <p className="text-[11px] text-muted-foreground">Démarré le</p>
                                            <p className="font-medium">{formatDate(selected.startedAt)}</p>
                                        </div>
                                        {selected.deadline && (
                                            <div className={`p-3 rounded-lg col-span-2 ${new Date(selected.deadline) < new Date() ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : 'bg-muted/30'
                                                }`}>
                                                <p className="text-[11px] text-muted-foreground">Deadline</p>
                                                <p className={`font-medium ${new Date(selected.deadline) < new Date() ? 'text-red-600' : ''}`}>
                                                    {formatDate(selected.deadline)}
                                                    {new Date(selected.deadline) < new Date() && ' ⚠️ Dépassée'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {selected.status === 'in_progress' && (
                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button className="flex-1 gap-2" variant="default">
                                                <Check className="h-4 w-4" />
                                                {selected.steps[selected.currentStep]?.actionLabel || 'Approuver'}
                                            </Button>
                                            <Button variant="outline" className="gap-2">
                                                <ArrowLeft className="h-4 w-4" />
                                                Retourner
                                            </Button>
                                            <Button variant="destructive" className="gap-2">
                                                <X className="h-4 w-4" />
                                                Rejeter
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
                                    <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-lg font-medium">Sélectionnez un workflow</p>
                                    <p className="text-sm mt-1">Cliquez sur un circuit pour voir les détails</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
