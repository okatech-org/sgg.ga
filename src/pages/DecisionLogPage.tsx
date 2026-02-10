/**
 * SGG Digital — Journal des Décisions
 *
 * Registre chronologique des décisions gouvernementales :
 *   - Décisions du Conseil des Ministres
 *   - Décisions du SGG
 *   - Directives présidentielles
 *   - Suivi de mise en œuvre
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    BookOpen, Search, Calendar, Users, CheckCircle2,
    Clock, AlertTriangle, XCircle, ChevronDown,
    ChevronRight, Plus, FileText,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type DecisionType = 'Conseil des Ministres' | 'SGG' | 'Directive Présidentielle' | 'Interministériel';
type DecisionStatus = 'implemented' | 'in-progress' | 'pending' | 'overdue';

interface Decision {
    id: string;
    ref: string;
    date: string;
    title: string;
    description: string;
    type: DecisionType;
    status: DecisionStatus;
    deadline: string;
    responsible: string;
    ministry?: string;
    implementation: number; // 0-100
    actions: string[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<DecisionStatus, { label: string; icon: typeof CheckCircle2; color: string; badge: string }> = {
    implemented: { label: 'Exécutée', icon: CheckCircle2, color: 'text-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'in-progress': { label: 'En cours', icon: Clock, color: 'text-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    pending: { label: 'En attente', icon: AlertTriangle, color: 'text-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    overdue: { label: 'En retard', icon: XCircle, color: 'text-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const TYPE_COLORS: Record<DecisionType, string> = {
    'Conseil des Ministres': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'SGG': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Directive Présidentielle': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Interministériel': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const DECISIONS: Decision[] = [
    {
        id: 'd1', ref: 'CM-2026-007', date: '5 fév 2026', title: 'Accélération de la digitalisation des procédures administratives',
        description: 'Le Conseil des Ministres a décidé d\'accélérer la dématérialisation de 100% des procédures administratives clés d\'ici décembre 2026.',
        type: 'Conseil des Ministres', status: 'in-progress', deadline: 'Déc 2026', responsible: 'SGG', ministry: 'Tous',
        implementation: 35, actions: ['Inventorier les 50 procédures prioritaires', 'Développer les formulaires en ligne', 'Former les agents', 'Communiquer aux usagers'],
    },
    {
        id: 'd2', ref: 'DP-2026-003', date: '28 jan 2026', title: 'Nomination DG de l\'ANPI',
        description: 'Le Président de la République a décidé de procéder à la nomination du nouveau Directeur Général de l\'ANPI dans un délai de 30 jours.',
        type: 'Directive Présidentielle', status: 'overdue', deadline: '28 fév 2026', responsible: 'MENJPC', ministry: 'MENJPC',
        implementation: 60, actions: ['Appel à candidatures', 'Entretiens commission', 'Avis final SGG', 'Décret de nomination'],
    },
    {
        id: 'd3', ref: 'SGG-2026-015', date: '3 fév 2026', title: 'Standardisation des rapports GAR T1 2026',
        description: 'Le SGG impose un nouveau format standardisé pour les rapports GAR du T1 2026, incluant des indicateurs de performance obligatoires.',
        type: 'SGG', status: 'in-progress', deadline: '15 mar 2026', responsible: 'DGA', ministry: 'Tous',
        implementation: 50, actions: ['Publication du nouveau template', 'Formation points focaux', 'Mise à jour plateforme'],
    },
    {
        id: 'd4', ref: 'CM-2026-005', date: '22 jan 2026', title: 'Création du Comité interministériel de la transition numérique',
        description: 'Mise en place d\'un comité permanent chargé de coordonner la stratégie numérique du gouvernement.',
        type: 'Conseil des Ministres', status: 'implemented', deadline: '15 fév 2026', responsible: 'SGG',
        implementation: 100, actions: ['Rédaction du décret', 'Désignation des membres', 'Installation officielle'],
    },
    {
        id: 'd5', ref: 'IM-2026-002', date: '15 jan 2026', title: 'Harmonisation budgets numériques 2026',
        description: 'Décision interministérielle d\'harmoniser les budgets dédiés au numérique selon une nomenclature commune.',
        type: 'Interministériel', status: 'pending', deadline: '31 mar 2026', responsible: 'MBCPFPRE',
        implementation: 15, actions: ['Définir la nomenclature', 'Circulaire budgétaire', 'Formation DAF', 'Vérification conformité'],
    },
    {
        id: 'd6', ref: 'SGG-2026-012', date: '10 jan 2026', title: 'Déploiement MFA obligatoire',
        description: 'Activation de l\'authentification multi-facteurs pour l\'ensemble des utilisateurs de la plateforme SGG.',
        type: 'SGG', status: 'implemented', deadline: '31 jan 2026', responsible: 'DSI',
        implementation: 100, actions: ['Paramétrage technique', 'Déploiement pilote', 'Extension générale'],
    },
    {
        id: 'd7', ref: 'DP-2026-001', date: '8 jan 2026', title: 'Connectivité des 9 provinces',
        description: 'Directive pour assurer la connexion de toutes les provinces à la plateforme SGG Digital avant septembre 2026.',
        type: 'Directive Présidentielle', status: 'in-progress', deadline: 'Sep 2026', responsible: 'MTNHDN', ministry: 'MTNHDN',
        implementation: 78, actions: ['Audit connectivité actuelle', 'Partenariats télécom', 'Installation Nyanga', 'Installation Ogooué-Ivindo'],
    },
    {
        id: 'd8', ref: 'CM-2026-009', date: '8 fév 2026', title: 'Réforme du cadre juridique des décrets',
        description: 'Modernisation du processus d\'élaboration et de publication des textes réglementaires.',
        type: 'Conseil des Ministres', status: 'pending', deadline: 'Juin 2026', responsible: 'DAJ',
        implementation: 5, actions: ['Groupe de travail juridique', 'Propositions de réforme', 'Consultation publique', 'Adoption du nouveau cadre'],
    },
    {
        id: 'd9', ref: 'IM-2026-004', date: '1 fév 2026', title: 'Partage de données inter-administrations',
        description: 'Protocole d\'échange de données entre ministères via API sécurisée pour réduire les doublons et accélérer les traitements.',
        type: 'Interministériel', status: 'in-progress', deadline: 'Avr 2026', responsible: 'ANINF',
        implementation: 40, actions: ['Normes d\'interopérabilité', 'API Gateway partagée', 'Protocoles sécurité', 'Pilote 3 ministères'],
    },
    {
        id: 'd10', ref: 'SGG-2026-018', date: '7 fév 2026', title: 'Audit de performance des ministères T4 2025',
        description: 'Lancement d\'un audit de performance couvrant le T4 2025 pour les 8 ministères avec score < 70.',
        type: 'SGG', status: 'in-progress', deadline: '28 fév 2026', responsible: 'IGS',
        implementation: 45, actions: ['Collecte indicateurs', 'Analyse comparative', 'Rapport préliminaire', 'Recommandations'],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DecisionLogPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>('d1');

    const filtered = useMemo(() => {
        return DECISIONS.filter(d => {
            if (typeFilter !== 'all' && d.type !== typeFilter) return false;
            if (statusFilter !== 'all' && d.status !== statusFilter) return false;
            if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.ref.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, typeFilter, statusFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <BookOpen className="h-7 w-7 text-indigo-600" />
                            Journal des Décisions
                        </h1>
                        <p className="text-muted-foreground">
                            {DECISIONS.length} décisions · {DECISIONS.filter(d => d.status === 'implemented').length} exécutées · {DECISIONS.filter(d => d.status === 'overdue').length} en retard
                        </p>
                    </div>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nouvelle Décision</Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.entries(STATUS_CFG) as [DecisionStatus, typeof STATUS_CFG.implemented][]).map(([key, conf]) => {
                        const count = DECISIONS.filter(d => d.status === key).length;
                        const Icon = conf.icon;
                        return (
                            <Card key={key} className={`cursor-pointer ${statusFilter === key ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}>
                                <CardContent className="pt-3 pb-2 flex items-center gap-2">
                                    <Icon className={`h-5 w-5 ${conf.color}`} />
                                    <div>
                                        <p className="text-lg font-bold">{count}</p>
                                        <p className="text-[10px] text-muted-foreground">{conf.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher par titre ou référence..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Tous</Button>
                        {(['Conseil des Ministres', 'SGG', 'Directive Présidentielle', 'Interministériel'] as DecisionType[]).map(t => (
                            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>
                                {t === 'Conseil des Ministres' ? 'CM' : t === 'Directive Présidentielle' ? 'DP' : t}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Decision List */}
                <div className="space-y-2">
                    {filtered.map(decision => {
                        const isOpen = expandedId === decision.id;
                        const conf = STATUS_CFG[decision.status];
                        const StatusIcon = conf.icon;
                        const actionsDone = decision.actions.filter((_, i) => i < Math.floor(decision.actions.length * decision.implementation / 100)).length;

                        return (
                            <Card key={decision.id} className={decision.status === 'overdue' ? 'border-red-300 dark:border-red-800' : ''}>
                                <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isOpen ? null : decision.id)}>
                                    <StatusIcon className={`h-5 w-5 ${conf.color} shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{decision.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                                            <Badge className={`text-[8px] h-3.5 ${TYPE_COLORS[decision.type]}`}>{decision.type}</Badge>
                                            <span className="font-mono">{decision.ref}</span>
                                            <span><Calendar className="h-2.5 w-2.5 inline mr-0.5" />{decision.date}</span>
                                            {decision.ministry && <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{decision.ministry}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge className={`text-[8px] h-4 ${conf.badge}`}>{conf.label}</Badge>
                                        <span className="text-xs font-bold">{decision.implementation}%</span>
                                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mt-3 mb-3">{decision.description}</p>

                                        <div className="grid grid-cols-3 gap-2 mb-3 text-center text-[10px]">
                                            <div className="p-1.5 bg-muted/50 rounded">
                                                <p className="font-bold">{decision.responsible}</p><p className="text-muted-foreground">Responsable</p>
                                            </div>
                                            <div className="p-1.5 bg-muted/50 rounded">
                                                <p className="font-bold">{decision.deadline}</p><p className="text-muted-foreground">Échéance</p>
                                            </div>
                                            <div className="p-1.5 bg-muted/50 rounded">
                                                <p className="font-bold">{decision.implementation}%</p><p className="text-muted-foreground">Exécution</p>
                                            </div>
                                        </div>

                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                                            <div className={`h-full rounded-full ${decision.implementation === 100 ? 'bg-green-500' : decision.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${decision.implementation}%` }} />
                                        </div>

                                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">ACTIONS ({actionsDone}/{decision.actions.length})</p>
                                        <div className="space-y-1">
                                            {decision.actions.map((action, i) => {
                                                const isDone = i < actionsDone;
                                                return (
                                                    <div key={i} className="flex items-center gap-2 p-1.5 rounded text-xs">
                                                        {isDone ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> : <Clock className="h-3 w-3 text-muted-foreground shrink-0" />}
                                                        <span className={isDone ? 'line-through text-muted-foreground' : ''}>{action}</span>
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
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune décision trouvée</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
