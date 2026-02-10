/**
 * SGG Digital — Administration Avancée
 *
 * Panneau de contrôle pour administrateurs SGG :
 *   - Mode Maintenance (basculer la plateforme en maintenance)
 *   - Feature Flags (activer/désactiver des fonctionnalités)
 *   - Cache Management (purger les caches)
 *   - Tâches planifiées (crons, jobs de fond)
 *   - Configurations système
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Wrench, Power, Flag, Trash2, Clock,
    Settings, AlertTriangle, CheckCircle2,
    Shield, Database, Zap, RefreshCw,
    ToggleLeft, ToggleRight, Save,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    category: string;
    lastModified: string;
    modifiedBy: string;
}

interface ScheduledJob {
    id: string;
    name: string;
    schedule: string;
    lastRun: string;
    nextRun: string;
    status: 'success' | 'running' | 'failed';
    duration?: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_FLAGS: FeatureFlag[] = [
    { id: 'f1', name: 'Workflow multi-niveaux', description: 'Circuit d\'approbation avec escalade automatique', enabled: true, category: 'Workflows', lastModified: '2026-02-08', modifiedBy: 'admin@sgg.ga' },
    { id: 'f2', name: 'Notifications push', description: 'Notifications temps réel via WebSocket', enabled: true, category: 'Notifications', lastModified: '2026-02-05', modifiedBy: 'admin@sgg.ga' },
    { id: 'f3', name: 'Export PDF avancé', description: 'Export PDF avec charts et mise en page automatique', enabled: true, category: 'Export', lastModified: '2026-01-20', modifiedBy: 'admin@sgg.ga' },
    { id: 'f4', name: 'Import CSV batch', description: 'Import en masse avec validation de schéma', enabled: true, category: 'Import', lastModified: '2026-02-01', modifiedBy: 'admin@sgg.ga' },
    { id: 'f5', name: 'Dashboard Analytics v2', description: 'Version avancée du dashboard avec graphiques interactifs', enabled: true, category: 'Analytics', lastModified: '2026-02-10', modifiedBy: 'admin@sgg.ga' },
    { id: 'f6', name: 'Mode sombre', description: 'Thème sombre pour l\'interface', enabled: true, category: 'Interface', lastModified: '2026-01-15', modifiedBy: 'admin@sgg.ga' },
    { id: 'f7', name: 'Chat inter-utilisateurs', description: 'Messagerie instantanée entre utilisateurs (bêta)', enabled: false, category: 'Communication', lastModified: '2026-02-10', modifiedBy: 'admin@sgg.ga' },
    { id: 'f8', name: 'IA prédictive GAR', description: 'Prédiction des scores GAR via machine learning', enabled: false, category: 'Analytics', lastModified: '2026-02-10', modifiedBy: 'admin@sgg.ga' },
    { id: 'f9', name: 'Signature électronique', description: 'Signature numérique des décrets et textes officiels', enabled: false, category: 'Sécurité', lastModified: '2026-02-08', modifiedBy: 'admin@sgg.ga' },
    { id: 'f10', name: 'API publique v1', description: 'Endpoints REST publics pour intégrations tierces', enabled: false, category: 'API', lastModified: '2026-02-10', modifiedBy: 'admin@sgg.ga' },
];

const SCHEDULED_JOBS: ScheduledJob[] = [
    { id: 'j1', name: 'Sauvegarde base de données', schedule: 'Quotidien 02:00', lastRun: new Date(Date.now() - 8 * 3600_000).toISOString(), nextRun: new Date(Date.now() + 16 * 3600_000).toISOString(), status: 'success', duration: '12min 34s' },
    { id: 'j2', name: 'Nettoyage sessions expirées', schedule: 'Toutes les 6 heures', lastRun: new Date(Date.now() - 2 * 3600_000).toISOString(), nextRun: new Date(Date.now() + 4 * 3600_000).toISOString(), status: 'success', duration: '45s' },
    { id: 'j3', name: 'Envoi rapports hebdomadaires', schedule: 'Lundi 08:00', lastRun: new Date(Date.now() - 24 * 3600_000).toISOString(), nextRun: new Date(Date.now() + 6 * 86400_000).toISOString(), status: 'success', duration: '2min 12s' },
    { id: 'j4', name: 'Indexation recherche', schedule: 'Quotidien 04:00', lastRun: new Date(Date.now() - 6 * 3600_000).toISOString(), nextRun: new Date(Date.now() + 18 * 3600_000).toISOString(), status: 'running', duration: undefined },
    { id: 'j5', name: 'Vérification intégrité fichiers', schedule: 'Hebdomadaire Dim 23:00', lastRun: new Date(Date.now() - 3 * 86400_000).toISOString(), nextRun: new Date(Date.now() + 4 * 86400_000).toISOString(), status: 'failed', duration: '1min 05s' },
    { id: 'j6', name: 'Calcul scores GAR', schedule: 'Quotidien 06:00', lastRun: new Date(Date.now() - 5 * 3600_000).toISOString(), nextRun: new Date(Date.now() + 19 * 3600_000).toISOString(), status: 'success', duration: '3min 42s' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminAdvancedPage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [featureFlags, setFeatureFlags] = useState(INITIAL_FLAGS);
    const [maintenanceMessage, setMaintenanceMessage] = useState('La plateforme est en cours de maintenance. Veuillez réessayer dans quelques minutes.');

    const handleToggleMaintenance = () => {
        setMaintenanceMode(!maintenanceMode);
        toast({
            title: maintenanceMode ? '✅ Maintenance désactivée' : '🔧 Maintenance activée',
            description: maintenanceMode ? 'La plateforme est de nouveau accessible.' : 'Les utilisateurs verront le message de maintenance.',
        });
    };

    const handleToggleFlag = (id: string) => {
        setFeatureFlags(prev => prev.map(f =>
            f.id === id ? { ...f, enabled: !f.enabled, lastModified: new Date().toISOString().split('T')[0], modifiedBy: 'admin@sgg.ga' } : f
        ));
        const flag = featureFlags.find(f => f.id === id);
        toast({
            title: flag?.enabled ? `🔴 ${flag.name} désactivé` : `🟢 ${flag?.name} activé`,
            description: 'La modification est effective immédiatement.',
        });
    };

    const handlePurgeCache = (cacheName: string) => {
        toast({
            title: '🗑️ Cache purgé',
            description: `Le cache "${cacheName}" a été vidé avec succès.`,
        });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const diff = Date.now() - d.getTime();
        if (diff < 0) {
            const absDiff = Math.abs(diff);
            if (absDiff < 3600_000) return `dans ${Math.floor(absDiff / 60_000)} min`;
            if (absDiff < 86400_000) return `dans ${Math.floor(absDiff / 3600_000)}h`;
            return `dans ${Math.floor(absDiff / 86400_000)}j`;
        }
        if (diff < 3600_000) return `il y a ${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `il y a ${Math.floor(diff / 3600_000)}h`;
        return `il y a ${Math.floor(diff / 86400_000)}j`;
    };

    const enabledCount = featureFlags.filter(f => f.enabled).length;
    const categories = [...new Set(featureFlags.map(f => f.category))];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Wrench className="h-7 w-7 text-slate-600" />
                        Administration Avancée
                    </h1>
                    <p className="text-muted-foreground">
                        Configuration système et contrôle de la plateforme
                    </p>
                </div>

                {/* Maintenance Mode */}
                <Card className={`border-2 ${maintenanceMode ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10' : 'border-green-300 dark:border-green-800'}`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Power className={`h-5 w-5 ${maintenanceMode ? 'text-red-600' : 'text-green-600'}`} />
                                    Mode Maintenance
                                </CardTitle>
                                <CardDescription>
                                    {maintenanceMode ? 'La plateforme est en maintenance — les utilisateurs ne peuvent pas se connecter' : 'La plateforme est opérationnelle'}
                                </CardDescription>
                            </div>
                            <Button
                                variant={maintenanceMode ? 'destructive' : 'outline'}
                                className="gap-2"
                                onClick={handleToggleMaintenance}
                            >
                                {maintenanceMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                {maintenanceMode ? 'Désactiver' : 'Activer'}
                            </Button>
                        </div>
                    </CardHeader>
                    {maintenanceMode && (
                        <CardContent className="pt-0">
                            <label className="text-xs text-muted-foreground mb-1 block">Message affiché aux utilisateurs :</label>
                            <Input value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} className="text-sm" />
                        </CardContent>
                    )}
                </Card>

                {/* Feature Flags + Cache */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feature Flags */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Flag className="h-5 w-5 text-blue-600" />
                                Feature Flags
                            </CardTitle>
                            <CardDescription>{enabledCount}/{featureFlags.length} activés</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {featureFlags.map(flag => (
                                    <div key={flag.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                        <button
                                            className="shrink-0"
                                            onClick={() => handleToggleFlag(flag.id)}
                                        >
                                            {flag.enabled
                                                ? <ToggleRight className="h-6 w-6 text-green-600" />
                                                : <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                            }
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${!flag.enabled ? 'text-muted-foreground' : ''}`}>{flag.name}</span>
                                                <Badge variant="secondary" className="text-[10px]">{flag.category}</Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{flag.description}</p>
                                        </div>
                                        <div className="text-right text-[10px] text-muted-foreground hidden sm:block">
                                            <p>{flag.lastModified}</p>
                                            <p className="font-mono">{flag.modifiedBy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cache Management */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Database className="h-4 w-4 text-amber-600" />
                                    Gestion du Cache
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { name: 'Redis — Données API', size: '1.2 GB', icon: Zap },
                                    { name: 'CDN — Assets statiques', size: '340 MB', icon: RefreshCw },
                                    { name: 'Sessions utilisateurs', size: '45 MB', icon: Shield },
                                    { name: 'Index de recherche', size: '128 MB', icon: Database },
                                ].map(cache => (
                                    <div key={cache.name} className="flex items-center gap-2 p-2 rounded-lg border">
                                        <cache.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{cache.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{cache.size}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-600 hover:text-red-700" onClick={() => handlePurgeCache(cache.name)}>
                                            <Trash2 className="h-3 w-3 mr-1" /> Purger
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-slate-600" />
                                    Actions Rapides
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-2">
                                <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast({ title: '📊 Reindex lancé', description: 'La réindexation de la recherche est en cours.' })}>
                                    <RefreshCw className="h-3.5 w-3.5" /> Réindexer la recherche
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast({ title: '📧 Test email envoyé', description: 'Un email de test a été envoyé à admin@sgg.ga.' })}>
                                    <Zap className="h-3.5 w-3.5" /> Tester l'envoi email
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast({ title: '💾 Sauvegarde lancée', description: 'La sauvegarde manuelle est en cours.' })}>
                                    <Save className="h-3.5 w-3.5" /> Sauvegarde manuelle
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Scheduled Jobs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Tâches Planifiées
                        </CardTitle>
                        <CardDescription>{SCHEDULED_JOBS.length} jobs programmés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {SCHEDULED_JOBS.map(job => (
                                <div key={job.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium">{job.name}</p>
                                        {job.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                        {job.status === 'running' && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                                        {job.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] mb-2">{job.schedule}</Badge>
                                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground mt-2">
                                        <div>Dernier : {formatTime(job.lastRun)}</div>
                                        <div>Prochain : {formatTime(job.nextRun)}</div>
                                        {job.duration && <div>Durée : {job.duration}</div>}
                                        <div>
                                            <Badge variant="secondary" className={`text-[10px] ${job.status === 'success' ? 'text-green-600' :
                                                    job.status === 'running' ? 'text-blue-600' : 'text-red-600'
                                                }`}>
                                                {job.status === 'success' ? 'Succès' : job.status === 'running' ? 'En cours' : 'Échec'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
