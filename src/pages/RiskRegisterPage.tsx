/**
 * SGG Digital — Registre des Risques & Conformité
 *
 * Cartographie et suivi des risques stratégiques :
 *   - Matrice impact × probabilité
 *   - Plans d'atténuation
 *   - Suivi des actions correctives
 *   - Indicateurs de conformité
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ShieldAlert, Search, ChevronDown, ChevronRight,
    TrendingUp, TrendingDown, Minus, CheckCircle2,
    Clock, AlertTriangle, Users, Plus,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
type RiskCategory = 'Opérationnel' | 'Sécurité' | 'Financier' | 'Juridique' | 'Stratégique';
type RiskTrend = 'up' | 'down' | 'stable';

interface MitigationAction {
    id: string;
    action: string;
    status: 'done' | 'in-progress' | 'planned';
    deadline: string;
}

interface Risk {
    id: string;
    title: string;
    description: string;
    category: RiskCategory;
    impact: number;      // 1-5
    probability: number; // 1-5
    level: RiskLevel;
    owner: string;
    trend: RiskTrend;
    lastReview: string;
    mitigations: MitigationAction[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
    critical: { label: 'Critique', color: 'text-red-700', bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    high: { label: 'Élevé', color: 'text-orange-700', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    medium: { label: 'Moyen', color: 'text-amber-700', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    low: { label: 'Faible', color: 'text-green-700', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const CAT_COLORS: Record<RiskCategory, string> = {
    'Opérationnel': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Sécurité': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Financier': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Juridique': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Stratégique': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const RISKS: Risk[] = [
    {
        id: 'r1', title: 'Défaut de soumission GAR généralisé', description: 'Plus de 20% des ministères ne soumettent pas leurs rapports GAR dans les délais, compromettant la consolidation nationale.',
        category: 'Opérationnel', impact: 5, probability: 3, level: 'critical', owner: 'Marie OBAME', trend: 'down', lastReview: '8 fév 2026',
        mitigations: [
            { id: 'm1', action: 'Mise en place de rappels automatiques J-7/J-3/J-1', status: 'done', deadline: 'Jan 2026' },
            { id: 'm2', action: 'Escalade automatique au Secrétaire Général après J+5', status: 'in-progress', deadline: 'Fév 2026' },
            { id: 'm3', action: 'Tableau de suivi public des retardataires', status: 'planned', deadline: 'Mar 2026' },
        ],
    },
    {
        id: 'r2', title: 'Cyberattaque sur la plateforme SGG', description: 'Tentative d\'intrusion ou d\'exfiltration de données sensibles gouvernementales via la plateforme.',
        category: 'Sécurité', impact: 5, probability: 2, level: 'high', owner: 'Équipe Tech', trend: 'stable', lastReview: '5 fév 2026',
        mitigations: [
            { id: 'm4', action: 'Audit de sécurité trimestriel par cabinet externe', status: 'done', deadline: 'Déc 2025' },
            { id: 'm5', action: 'MFA obligatoire pour tous les utilisateurs', status: 'done', deadline: 'Jan 2026' },
            { id: 'm6', action: 'WAF et monitoring 24/7 avec alerting', status: 'in-progress', deadline: 'Mar 2026' },
            { id: 'm7', action: 'Plan de continuité d\'activité (PCA)', status: 'planned', deadline: 'Avr 2026' },
        ],
    },
    {
        id: 'r3', title: 'Sous-exécution budgétaire > 40%', description: 'Risque de sous-consommation des crédits alloués aux projets de transformation numérique du gouvernement.',
        category: 'Financier', impact: 4, probability: 3, level: 'high', owner: 'Paul ABIAGA', trend: 'up', lastReview: '7 fév 2026',
        mitigations: [
            { id: 'm8', action: 'Suivi mensuel de l\'exécution par programme', status: 'done', deadline: 'Jan 2026' },
            { id: 'm9', action: 'Alertes automatiques si taux < 50% au S1', status: 'in-progress', deadline: 'Fév 2026' },
        ],
    },
    {
        id: 'r4', title: 'Non-conformité RGPD données agents', description: 'Traitement de données personnelles des agents publics sans base légale suffisante ou mesures de protection adéquates.',
        category: 'Juridique', impact: 4, probability: 2, level: 'medium', owner: 'DAJ', trend: 'down', lastReview: '3 fév 2026',
        mitigations: [
            { id: 'm10', action: 'Registre des traitements de données', status: 'done', deadline: 'Nov 2025' },
            { id: 'm11', action: 'Politique de conservation des données', status: 'done', deadline: 'Déc 2025' },
            { id: 'm12', action: 'Formation DPO points focaux', status: 'in-progress', deadline: 'Mar 2026' },
        ],
    },
    {
        id: 'r5', title: 'Résistance au changement des ministères', description: 'Adoption insuffisante de la plateforme par les agents ministériels, freinant la transformation numérique.',
        category: 'Stratégique', impact: 4, probability: 4, level: 'high', owner: 'Françoise ELLA', trend: 'down', lastReview: '9 fév 2026',
        mitigations: [
            { id: 'm13', action: 'Programme de formation continue', status: 'done', deadline: 'Jan 2026' },
            { id: 'm14', action: 'Ambassadeurs numériques dans chaque ministère', status: 'in-progress', deadline: 'Mar 2026' },
            { id: 'm15', action: 'Gamification et certificats de compétences', status: 'planned', deadline: 'Juin 2026' },
        ],
    },
    {
        id: 'r6', title: 'Panne infrastructure provinces', description: 'Connectivité insuffisante dans les provinces éloignées compromettant l\'accès à la plateforme.',
        category: 'Opérationnel', impact: 3, probability: 4, level: 'medium', owner: 'Rose MABIKA', trend: 'stable', lastReview: '6 fév 2026',
        mitigations: [
            { id: 'm16', action: 'Mode hors-ligne pour saisie des rapports', status: 'in-progress', deadline: 'Avr 2026' },
            { id: 'm17', action: 'Partenariat avec opérateurs télécom', status: 'planned', deadline: 'Juin 2026' },
        ],
    },
    {
        id: 'r7', title: 'Délai nomination critique > 60 jours', description: 'Certains dossiers de nomination dépassent largement les délais réglementaires, créant un vide juridique.',
        category: 'Juridique', impact: 3, probability: 3, level: 'medium', owner: 'Jean NZE', trend: 'stable', lastReview: '4 fév 2026',
        mitigations: [
            { id: 'm18', action: 'Workflow digital avec SLA par étape', status: 'done', deadline: 'Jan 2026' },
            { id: 'm19', action: 'Tableau de bord délais en temps réel', status: 'done', deadline: 'Jan 2026' },
        ],
    },
    {
        id: 'r8', title: 'Perte de données suite incident', description: 'Risque de corruption ou perte de données en l\'absence de sauvegarde géographiquement distribuée.',
        category: 'Sécurité', impact: 5, probability: 1, level: 'medium', owner: 'Équipe Tech', trend: 'down', lastReview: '2 fév 2026',
        mitigations: [
            { id: 'm20', action: 'Backup automatique quotidien', status: 'done', deadline: 'Oct 2025' },
            { id: 'm21', action: 'Réplication géographique cloud', status: 'done', deadline: 'Déc 2025' },
            { id: 'm22', action: 'Test de restauration trimestriel', status: 'done', deadline: 'Jan 2026' },
        ],
    },
    {
        id: 'r9', title: 'Incohérence données inter-modules', description: 'Divergence de données entre modules (GAR, Budget, Effectifs) suite à saisies non synchronisées.',
        category: 'Opérationnel', impact: 3, probability: 2, level: 'low', owner: 'Équipe Tech', trend: 'down', lastReview: '1 fév 2026',
        mitigations: [
            { id: 'm23', action: 'Système de réconciliation automatique', status: 'done', deadline: 'Nov 2025' },
            { id: 'm24', action: 'Identifiants uniques cross-modules', status: 'done', deadline: 'Déc 2025' },
        ],
    },
    {
        id: 'r10', title: 'Rotation élevée des points focaux', description: 'Changements fréquents de points focaux ministériels entraînant une perte de connaissance et de continuité.',
        category: 'Stratégique', impact: 3, probability: 3, level: 'medium', owner: 'Françoise ELLA', trend: 'up', lastReview: '5 fév 2026',
        mitigations: [
            { id: 'm25', action: 'Base de connaissances et documentation', status: 'done', deadline: 'Jan 2026' },
            { id: 'm26', action: 'Processus d\'onboarding accéléré (3 jours)', status: 'in-progress', deadline: 'Mar 2026' },
        ],
    },
];

const CATEGORIES: RiskCategory[] = ['Opérationnel', 'Sécurité', 'Financier', 'Juridique', 'Stratégique'];

// ── Heat map cell ───────────────────────────────────────────────────────────

function HeatCell({ impact, prob }: { impact: number; prob: number }) {
    const score = impact * prob;
    const bg = score >= 15 ? 'bg-red-500' : score >= 10 ? 'bg-orange-400' : score >= 5 ? 'bg-amber-400' : 'bg-green-400';
    const count = RISKS.filter(r => r.impact === impact && r.probability === prob).length;
    return (
        <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold text-white ${bg} ${count > 0 ? 'ring-2 ring-white dark:ring-gray-800' : 'opacity-40'}`}>
            {count > 0 ? count : ''}
        </div>
    );
}

// ── Component ───────────────────────────────────────────────────────────────

export default function RiskRegisterPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>('r1');

    const filtered = useMemo(() => {
        return RISKS.filter(r => {
            if (catFilter !== 'all' && r.category !== catFilter) return false;
            if (levelFilter !== 'all' && r.level !== levelFilter) return false;
            if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, catFilter, levelFilter]);

    const totalMitigations = RISKS.reduce((s, r) => s + r.mitigations.length, 0);
    const doneMitigations = RISKS.reduce((s, r) => s + r.mitigations.filter(m => m.status === 'done').length, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <ShieldAlert className="h-7 w-7 text-red-600" />
                            Registre des Risques
                        </h1>
                        <p className="text-muted-foreground">
                            {RISKS.length} risques identifiés · {doneMitigations}/{totalMitigations} actions terminées
                        </p>
                    </div>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nouveau Risque</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Heat Map */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Matrice Impact × Probabilité</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] w-5 text-right text-muted-foreground">5</span>
                                    {[1, 2, 3, 4, 5].map(p => <HeatCell key={p} impact={5} prob={p} />)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] w-5 text-right text-muted-foreground">4</span>
                                    {[1, 2, 3, 4, 5].map(p => <HeatCell key={p} impact={4} prob={p} />)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] w-5 text-right text-muted-foreground">3</span>
                                    {[1, 2, 3, 4, 5].map(p => <HeatCell key={p} impact={3} prob={p} />)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] w-5 text-right text-muted-foreground">2</span>
                                    {[1, 2, 3, 4, 5].map(p => <HeatCell key={p} impact={2} prob={p} />)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] w-5 text-right text-muted-foreground">1</span>
                                    {[1, 2, 3, 4, 5].map(p => <HeatCell key={p} impact={1} prob={p} />)}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="w-5" />
                                    {[1, 2, 3, 4, 5].map(p => <span key={p} className="w-8 text-center text-[8px] text-muted-foreground">{p}</span>)}
                                </div>
                                <div className="text-center text-[8px] text-muted-foreground mt-1">
                                    ← Probabilité → | ↑ Impact
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(Object.entries(LEVEL_CONFIG) as [RiskLevel, typeof LEVEL_CONFIG.critical][]).map(([key, conf]) => {
                            const count = RISKS.filter(r => r.level === key).length;
                            return (
                                <Card key={key} className={`cursor-pointer ${levelFilter === key ? 'ring-2 ring-primary' : ''}`} onClick={() => setLevelFilter(levelFilter === key ? 'all' : key)}>
                                    <CardContent className="pt-3 pb-2 text-center">
                                        <p className={`text-2xl font-bold ${conf.color}`}>{count}</p>
                                        <p className="text-[10px] text-muted-foreground">{conf.label}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un risque..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Toutes</Button>
                        {CATEGORIES.map(c => (
                            <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(c)}>{c}</Button>
                        ))}
                    </div>
                </div>

                {/* Risk List */}
                <div className="space-y-2">
                    {filtered.map(risk => {
                        const isOpen = expandedId === risk.id;
                        const levelConf = LEVEL_CONFIG[risk.level];
                        const score = risk.impact * risk.probability;
                        const mitigDone = risk.mitigations.filter(m => m.status === 'done').length;

                        return (
                            <Card key={risk.id} className={risk.level === 'critical' ? 'border-red-300 dark:border-red-800' : ''}>
                                <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isOpen ? null : risk.id)}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${levelConf.bg}`}>
                                        {score}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{risk.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                            <Badge className={`text-[9px] h-3.5 ${CAT_COLORS[risk.category]}`}>{risk.category}</Badge>
                                            <span>I:{risk.impact} × P:{risk.probability}</span>
                                            <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{risk.owner}</span>
                                            <span>{mitigDone}/{risk.mitigations.length} actions</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {risk.trend === 'down' ? <TrendingDown className="h-3 w-3 text-green-500" /> : risk.trend === 'up' ? <TrendingUp className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-gray-400" />}
                                        <Badge className={`text-[9px] h-4 ${levelConf.bg}`}>{levelConf.label}</Badge>
                                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mt-3 mb-3">{risk.description}</p>

                                        <div className="grid grid-cols-3 gap-2 mb-3 text-center text-[10px]">
                                            <div className="p-1.5 bg-muted/50 rounded">
                                                <p className="font-bold">{risk.impact}/5</p><p className="text-muted-foreground">Impact</p>
                                            </div>
                                            <div className="p-1.5 bg-muted/50 rounded">
                                                <p className="font-bold">{risk.probability}/5</p><p className="text-muted-foreground">Probabilité</p>
                                            </div>
                                            <div className="p-1.5 bg-muted/50 rounded">
                                                <p className="font-bold">{score}/25</p><p className="text-muted-foreground">Score</p>
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">PLAN D'ATTÉNUATION ({risk.mitigations.length})</p>
                                        <div className="space-y-1">
                                            {risk.mitigations.map(m => (
                                                <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg border text-xs">
                                                    {m.status === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                                                        m.status === 'in-progress' ? <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" /> :
                                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                                    <span className={`flex-1 ${m.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{m.action}</span>
                                                    <Badge variant="outline" className="text-[8px] h-3">{m.deadline}</Badge>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-[9px] text-muted-foreground mt-2">Dernière revue : {risk.lastReview}</p>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun risque dans cette catégorie</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
