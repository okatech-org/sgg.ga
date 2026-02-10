/**
 * SGG Digital — Changelog / Notes de Version
 *
 * Historique des versions de la plateforme :
 *   - Timeline des releases avec détails
 *   - Catégorisation : fonctionnalités, corrections, améliorations
 *   - Filtrage par type de changement
 *   - Numéro de version et date
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    History, Star, Bug, Zap, Shield,
    ChevronDown, ChevronRight, Package,
    Sparkles, Wrench, AlertTriangle,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ChangeType = 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';

interface ChangeEntry {
    type: ChangeType;
    description: string;
    module?: string;
}

interface Release {
    version: string;
    date: string;
    title: string;
    description: string;
    changes: ChangeEntry[];
    isLatest?: boolean;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ChangeType, { label: string; icon: typeof Star; color: string; bg: string }> = {
    feature: { label: 'Fonctionnalité', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    fix: { label: 'Correction', icon: Bug, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    improvement: { label: 'Amélioration', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    security: { label: 'Sécurité', icon: Shield, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    breaking: { label: 'Breaking Change', icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const RELEASES: Release[] = [
    {
        version: '14.0', date: '10 février 2026', title: 'Sprint 14 — Collaboration & Personnalisation', isLatest: true,
        description: 'Outils de collaboration renforcés avec messagerie, organigramme et traçabilité des versions.',
        changes: [
            { type: 'feature', description: 'Organigramme institutionnel interactif avec vue arbre hiérarchique', module: 'Organigramme' },
            { type: 'feature', description: 'Messagerie interne avec conversations, messages et indicateurs', module: 'Messagerie' },
            { type: 'feature', description: 'Page Changelog avec historique complet des versions', module: 'Changelog' },
            { type: 'improvement', description: 'Mise à jour du GlobalSearch avec 3 nouvelles entrées', module: 'Navigation' },
            { type: 'improvement', description: 'Breadcrumbs enrichis pour les nouvelles routes', module: 'Navigation' },
        ],
    },
    {
        version: '13.0', date: '10 février 2026', title: 'Sprint 13 — Gestion Projets & Développeur',
        description: 'Kanban, archives, et documentation API pour les développeurs.',
        changes: [
            { type: 'feature', description: 'Tableau Kanban avec 4 colonnes et gestion de tâches', module: 'Kanban' },
            { type: 'feature', description: 'Archives & Corbeille avec restauration et purge auto 30j', module: 'Archives' },
            { type: 'feature', description: 'Centre API avec 14 endpoints documentés et guide cURL', module: 'API Docs' },
            { type: 'improvement', description: 'Sidebar enrichie avec 3 nouveaux liens', module: 'Navigation' },
        ],
    },
    {
        version: '12.0', date: '10 février 2026', title: 'Sprint 12 — Intelligence & Temps Réel',
        description: 'Benchmark entre ministères, rapports automatisés et flux d\'activité en direct.',
        changes: [
            { type: 'feature', description: 'Benchmark Ministères avec classement 6 dimensions et comparaison', module: 'Benchmark' },
            { type: 'feature', description: 'Rapports Automatisés avec planification multi-fréquence', module: 'Rapports' },
            { type: 'feature', description: 'Activité Temps Réel avec flux live auto-refresh 5s', module: 'Monitoring' },
            { type: 'improvement', description: 'Command Palette étendue à +9 entrées', module: 'Navigation' },
        ],
    },
    {
        version: '11.0', date: '10 février 2026', title: 'Sprint 11 — Navigation & Outils Opérationnels',
        description: 'Calendrier, annuaire des contacts et outils admin avancés.',
        changes: [
            { type: 'feature', description: 'Calendrier institutionnel avec 5 catégories d\'événements', module: 'Calendrier' },
            { type: 'feature', description: 'Annuaire des contacts avec filtres et grille/liste', module: 'Contacts' },
            { type: 'feature', description: 'Administration avancée : maintenance, feature flags, cache', module: 'Admin' },
            { type: 'feature', description: 'Composant Breadcrumbs dynamique intégré globalement', module: 'Navigation' },
        ],
    },
    {
        version: '10.0', date: '10 février 2026', title: 'Sprint 10 — Outils Exécutifs & Gouvernance',
        description: 'Journal d\'audit, statistiques système et centre d\'aide.',
        changes: [
            { type: 'feature', description: 'Journal d\'Audit avec timeline et filtres', module: 'Audit' },
            { type: 'feature', description: 'Statistiques Système avec métriques serveur', module: 'Système' },
            { type: 'feature', description: 'Centre d\'Aide avec FAQ, guides et raccourcis', module: 'Aide' },
            { type: 'feature', description: 'Vue Consolidée multi-module avec score global', module: 'Dashboard' },
        ],
    },
    {
        version: '9.0', date: '9 février 2026', title: 'Sprint 9 — Modules de Supervision',
        description: 'Permissions, workflows visuels, import/export et analytics avancés.',
        changes: [
            { type: 'feature', description: 'Gestion des permissions avec matrice rôles/modules', module: 'Permissions' },
            { type: 'feature', description: 'Workflow visuel avec éditeur drag & drop', module: 'Workflows' },
            { type: 'feature', description: 'Import/Export de données multi-format', module: 'Data Exchange' },
            { type: 'feature', description: 'Dashboard analytique avec KPIs avancés', module: 'Analytics' },
            { type: 'security', description: 'Middleware de rate limiting sur toutes les API', module: 'Backend' },
        ],
    },
    {
        version: '8.0', date: '8 février 2026', title: 'Sprint 8 — Backend & Intégration',
        description: 'Consolidation du backend Express et intégration Cloud Functions.',
        changes: [
            { type: 'feature', description: 'Cloud Functions pour archives (folders, versions, sharing)', module: 'Backend' },
            { type: 'improvement', description: 'Hook useArchiveData avec fallback mock', module: 'Frontend' },
            { type: 'security', description: 'Rate limiting appliqué aux 5 modules backend', module: 'Sécurité' },
            { type: 'fix', description: 'Correction hydration mismatch thème et texte', module: 'Frontend' },
        ],
    },
    {
        version: '5.0', date: '7 février 2026', title: 'Sprint 5 — Modules de Gestion',
        description: 'GAR, Nominations, Journal Officiel, Institutions et e-GOP.',
        changes: [
            { type: 'feature', description: 'Module GAR : suivi des résultats avec indicateurs et scores', module: 'GAR' },
            { type: 'feature', description: 'Module Nominations : soumission, validation, workflow', module: 'Nominations' },
            { type: 'feature', description: 'Module Journal Officiel : publications et recherche', module: 'J.O.' },
            { type: 'feature', description: 'Module Institutions : fiches entités gouvernementales', module: 'Institutions' },
            { type: 'feature', description: 'Module e-GOP : gestion des opérations gouvernementales', module: 'e-GOP' },
        ],
    },
    {
        version: '1.0', date: '5 février 2026', title: 'Version Initiale — Fondations',
        description: 'Architecture de base, authentification, dashboard et design system.',
        changes: [
            { type: 'feature', description: 'Architecture React + Vite + TypeScript', module: 'Core' },
            { type: 'feature', description: 'Système d\'authentification avec rôles', module: 'Auth' },
            { type: 'feature', description: 'Dashboard principal avec KPIs', module: 'Dashboard' },
            { type: 'feature', description: 'Design system avec composants shadcn/ui', module: 'UI' },
            { type: 'feature', description: 'Internationalisation FR/EN', module: 'I18n' },
            { type: 'security', description: 'ProtectedRoute avec vérification de rôles', module: 'Auth' },
        ],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ChangelogPage() {
    const [filter, setFilter] = useState<ChangeType | 'all'>('all');
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([RELEASES[0].version]));

    const toggleVersion = (v: string) => {
        setExpandedVersions(prev => {
            const next = new Set(prev);
            if (next.has(v)) next.delete(v); else next.add(v);
            return next;
        });
    };

    const filteredReleases = useMemo(() => {
        if (filter === 'all') return RELEASES;
        return RELEASES.filter(r => r.changes.some(c => c.type === filter)).map(r => ({
            ...r,
            changes: r.changes.filter(c => c.type === filter),
        }));
    }, [filter]);

    const totalFeatures = RELEASES.reduce((s, r) => s + r.changes.filter(c => c.type === 'feature').length, 0);
    const totalFixes = RELEASES.reduce((s, r) => s + r.changes.filter(c => c.type === 'fix').length, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <History className="h-7 w-7 text-violet-600" />
                        Changelog
                    </h1>
                    <p className="text-muted-foreground">
                        {RELEASES.length} versions · {totalFeatures} fonctionnalités · {totalFixes} corrections
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.entries(TYPE_CONFIG) as [ChangeType, typeof TYPE_CONFIG.feature][]).map(([key, conf]) => {
                        const Icon = conf.icon;
                        const count = RELEASES.reduce((s, r) => s + r.changes.filter(c => c.type === key).length, 0);
                        return (
                            <Card key={key}>
                                <CardContent className="pt-2 pb-1 text-center">
                                    <Icon className={`h-4 w-4 mx-auto ${conf.color} mb-0.5`} />
                                    <p className="text-lg font-bold">{count}</p>
                                    <p className="text-[9px] text-muted-foreground">{conf.label}s</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filter */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setFilter('all')}>Tous</Button>
                    {(Object.entries(TYPE_CONFIG) as [ChangeType, typeof TYPE_CONFIG.feature][]).map(([key, conf]) => {
                        const Icon = conf.icon;
                        return (
                            <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setFilter(key)}>
                                <Icon className="h-3 w-3" /> {conf.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                    {filteredReleases.map(release => {
                        const isExpanded = expandedVersions.has(release.version);
                        return (
                            <Card key={release.version} className={release.isLatest ? 'border-2 border-primary/30' : ''}>
                                <button
                                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                                    onClick={() => toggleVersion(release.version)}
                                >
                                    {/* Timeline dot */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${release.isLatest ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <Package className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant={release.isLatest ? 'default' : 'outline'} className="text-[10px]">v{release.version}</Badge>
                                            <span className="text-sm font-bold">{release.title}</span>
                                            {release.isLatest && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[9px]">Dernière</Badge>}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{release.date} · {release.changes.length} changements</p>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {[...new Set(release.changes.map(c => c.type))].map(t => {
                                            const conf = TYPE_CONFIG[t];
                                            const Icon = conf.icon;
                                            return <Icon key={t} className={`h-3 w-3 ${conf.color}`} />;
                                        })}
                                        {isExpanded ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <p className="text-xs text-muted-foreground mb-3 mt-3">{release.description}</p>
                                        <div className="space-y-1.5">
                                            {release.changes.map((change, i) => {
                                                const conf = TYPE_CONFIG[change.type];
                                                const Icon = conf.icon;
                                                return (
                                                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                                        <div className={`p-1 rounded ${conf.bg} shrink-0`}>
                                                            <Icon className={`h-3 w-3 ${conf.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs">{change.description}</p>
                                                        </div>
                                                        {change.module && (
                                                            <Badge variant="outline" className="text-[9px] h-4 shrink-0">{change.module}</Badge>
                                                        )}
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
            </div>
        </DashboardLayout>
    );
}
