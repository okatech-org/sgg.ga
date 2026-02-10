/**
 * SGG Digital — Gestion des Risques & Catastrophes
 *
 * Centre de suivi des risques naturels et crises :
 *   - Alertes actives
 *   - Historique des catastrophes
 *   - Capacité de réponse
 *   - Zones à risque
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ShieldAlert, AlertTriangle, CloudRain, Flame,
    Waves, Mountain, MapPin, Calendar,
    Users, Truck, CheckCircle2, Clock,
    Siren,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';
type RiskType = 'Inondation' | 'Glissement' | 'Incendie' | 'Érosion' | 'Épidémie' | 'Tempête';

interface ActiveAlert {
    id: string;
    title: string;
    type: RiskType;
    level: RiskLevel;
    province: string;
    commune: string;
    date: string;
    affectedPop: number;
    status: string;
}

interface ResponseCapacity {
    resource: string;
    available: number;
    deployed: number;
    unit: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const LEVEL_CFG: Record<RiskLevel, { label: string; badge: string; bg: string }> = {
    critical: { label: 'Critique', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', bg: 'border-red-500' },
    high: { label: 'Élevé', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', bg: 'border-orange-500' },
    moderate: { label: 'Modéré', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', bg: 'border-amber-500' },
    low: { label: 'Faible', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', bg: 'border-green-500' },
};

const TYPE_ICONS: Record<RiskType, typeof Waves> = {
    Inondation: Waves,
    Glissement: Mountain,
    Incendie: Flame,
    Érosion: CloudRain,
    Épidémie: ShieldAlert,
    Tempête: CloudRain,
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const ALERTS: ActiveAlert[] = [
    { id: 'a1', title: 'Inondations quartier Nzeng-Ayong', type: 'Inondation', level: 'critical', province: 'Estuaire', commune: 'Libreville 6e', date: '8 fév 2026', affectedPop: 12_000, status: 'Évacuation en cours' },
    { id: 'a2', title: 'Glissement de terrain route Kango', type: 'Glissement', level: 'high', province: 'Estuaire', commune: 'Kango', date: '7 fév 2026', affectedPop: 3_500, status: 'Route coupée — déviation' },
    { id: 'a3', title: 'Érosion côtière Cap Estérias', type: 'Érosion', level: 'moderate', province: 'Estuaire', commune: 'Akanda', date: '5 fév 2026', affectedPop: 850, status: 'Surveillance renforcée' },
    { id: 'a4', title: 'Incendie marché Mont-Bouët', type: 'Incendie', level: 'high', province: 'Estuaire', commune: 'Libreville 3e', date: '3 fév 2026', affectedPop: 5_200, status: 'Maîtrisé — Évaluation dégâts' },
    { id: 'a5', title: 'Crue de la Ngounié — Mouila', type: 'Inondation', level: 'moderate', province: 'Ngounié', commune: 'Mouila', date: '1 fév 2026', affectedPop: 4_000, status: 'Niveau d\'eau en baisse' },
    { id: 'a6', title: 'Risque épidémiologique Choléra — Owendo', type: 'Épidémie', level: 'high', province: 'Estuaire', commune: 'Owendo', date: '30 jan 2026', affectedPop: 8_000, status: 'Campagne prévention active' },
    { id: 'a7', title: 'Tempête tropicale — Ogooué-Maritime', type: 'Tempête', level: 'moderate', province: 'Ogooué-Maritime', commune: 'Port-Gentil', date: '28 jan 2026', affectedPop: 2_500, status: 'Alerte météo levée' },
    { id: 'a8', title: 'Glissement Melen 5 — Libreville', type: 'Glissement', level: 'critical', province: 'Estuaire', commune: 'Libreville 5e', date: '10 fév 2026', affectedPop: 6_300, status: 'Relogement d\'urgence' },
];

const CAPACITY: ResponseCapacity[] = [
    { resource: 'Sapeurs-pompiers', available: 1_200, deployed: 380, unit: 'agents' },
    { resource: 'Militaires (Génie)', available: 800, deployed: 150, unit: 'soldats' },
    { resource: 'Croix-Rouge', available: 2_500, deployed: 420, unit: 'volontaires' },
    { resource: 'Véhicules d\'urgence', available: 180, deployed: 45, unit: 'véhicules' },
    { resource: 'Centres d\'hébergement', available: 35, deployed: 8, unit: 'sites' },
    { resource: 'Kits de secours', available: 15_000, deployed: 3_200, unit: 'kits' },
];

const GLOBAL = {
    activeAlerts: ALERTS.filter(a => a.level === 'critical' || a.level === 'high').length,
    totalAffected: ALERTS.reduce((s, a) => s + a.affectedPop, 0),
    eventsThisYear: 42,
    responseTime: 45, // minutes
};

// ── Component ───────────────────────────────────────────────────────────────

export default function RiskManagementPage() {
    const [levelFilter, setLevelFilter] = useState<RiskLevel | 'all'>('all');

    const filtered = useMemo(() => {
        if (levelFilter === 'all') return ALERTS;
        return ALERTS.filter(a => a.level === levelFilter);
    }, [levelFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Siren className="h-7 w-7 text-red-600" />
                            Gestion des Risques & Catastrophes
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.activeAlerts} alertes critiques/élevées · {GLOBAL.totalAffected.toLocaleString()} personnes affectées
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-red-200 text-red-600">🔴 Centre opérationnel actif</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.activeAlerts}</p><p className="text-[10px] text-muted-foreground">Alertes actives</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-500" />
                            <div><p className="text-lg font-bold text-orange-600">{(GLOBAL.totalAffected / 1000).toFixed(1)}k</p><p className="text-[10px] text-muted-foreground">Personnes affectées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.responseTime}min</p><p className="text-[10px] text-muted-foreground">Temps de réponse</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.eventsThisYear}</p><p className="text-[10px] text-muted-foreground">Événements 2026</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Response Capacity */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> Capacité de réponse</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CAPACITY.map((c, i) => {
                                const pct = Math.round((c.deployed / c.available) * 100);
                                return (
                                    <div key={i} className="p-2 bg-muted/30 rounded">
                                        <p className="text-[10px] font-bold">{c.resource}</p>
                                        <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                                            <span>{c.deployed}/{c.available} {c.unit}</span>
                                            <span className={pct > 50 ? 'text-orange-600 font-bold' : ''}>{pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${pct > 50 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Filter */}
                <div className="flex gap-1">
                    <Button variant={levelFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setLevelFilter('all')}>Toutes</Button>
                    {(['critical', 'high', 'moderate', 'low'] as RiskLevel[]).map(l => (
                        <Button key={l} variant={levelFilter === l ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setLevelFilter(l)}>{LEVEL_CFG[l].label}</Button>
                    ))}
                </div>

                {/* Alerts */}
                <div className="space-y-2">
                    {filtered.map(a => {
                        const lcfg = LEVEL_CFG[a.level];
                        const Icon = TYPE_ICONS[a.type];
                        return (
                            <Card key={a.id} className={`border-l-4 ${lcfg.bg}`}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <Badge className={`text-[7px] h-3.5 ${lcfg.badge}`}>{lcfg.label}</Badge>
                                            <Badge variant="outline" className="text-[7px] h-3">{a.type}</Badge>
                                        </div>
                                        <p className="text-xs font-bold">{a.title}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{a.commune}, {a.province}</span>
                                            <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{a.date}</span>
                                            <span className="font-bold text-foreground">{a.affectedPop.toLocaleString()} personnes</span>
                                        </div>
                                        <p className="text-[9px] mt-0.5 text-amber-600 dark:text-amber-400 font-medium">⚡ {a.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
