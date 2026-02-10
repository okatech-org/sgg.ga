/**
 * SGG Digital — Gestion des Catastrophes Naturelles
 *
 * Centre national de gestion des risques majeurs :
 *   - Inondations, glissements de terrain, feux
 *   - Plans de contingence et évacuation
 *   - Historique des événements
 *   - Capacités de réponse
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle, Waves, Flame, Mountain,
    MapPin, Users, Shield, Clock,
    HeartPulse, Truck, Radio,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type DisasterType = 'flood' | 'landslide' | 'fire' | 'storm' | 'erosion' | 'epidemic';

interface DisasterEvent {
    title: string;
    type: DisasterType;
    date: string;
    zone: string;
    province: string;
    affected: number;
    casualties: number;
    damages: number; // millions FCFA
    response: string;
    status: 'resolved' | 'ongoing' | 'monitoring';
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<DisasterType, { label: string; icon: typeof Waves; color: string }> = {
    flood: { label: 'Inondation', icon: Waves, color: 'text-blue-500' },
    landslide: { label: 'Glissement terrain', icon: Mountain, color: 'text-amber-600' },
    fire: { label: 'Incendie', icon: Flame, color: 'text-red-500' },
    storm: { label: 'Tempête', icon: AlertTriangle, color: 'text-violet-500' },
    erosion: { label: 'Érosion côtière', icon: Waves, color: 'text-cyan-500' },
    epidemic: { label: 'Épidémie', icon: HeartPulse, color: 'text-pink-500' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const GLOBAL = {
    totalEvents2024: 18,
    totalEvents2025: 8,
    totalAffected: 45_000,
    totalDamages: 28_500, // millions FCFA
    evacuationCenters: 35,
    riskZones: 42,
    firstResponders: 3_200,
    contingencyPlans: 9,
    alertLevel: 'yellow' as const,
};

const EVENTS: DisasterEvent[] = [
    { title: 'Inondation quartiers bas Libreville', type: 'flood', date: '2025-01-15', zone: 'Akébé / Nzeng-Ayong', province: 'Estuaire', affected: 12_000, casualties: 3, damages: 8_500, response: 'COSEP + Croix-Rouge', status: 'resolved' },
    { title: 'Glissement de terrain PK8-PK12', type: 'landslide', date: '2025-02-03', zone: 'Route nationale 1', province: 'Estuaire', affected: 850, casualties: 1, damages: 3_200, response: 'Génie militaire + BTP', status: 'ongoing' },
    { title: 'Érosion côtière Cap Estérias', type: 'erosion', date: '2024-12-20', zone: 'Littoral nord', province: 'Estuaire', affected: 2_500, casualties: 0, damages: 4_500, response: 'Enrochement en cours', status: 'ongoing' },
    { title: 'Inondation Lambaréné — crue Ogooué', type: 'flood', date: '2024-11-08', zone: 'Centre-ville', province: 'Moyen-Ogooué', affected: 8_200, casualties: 2, damages: 5_800, response: 'BNSP + Armée', status: 'resolved' },
    { title: 'Feux de brousse Haut-Ogooué', type: 'fire', date: '2024-10-15', zone: 'Savanes Franceville', province: 'Haut-Ogooué', affected: 1_200, casualties: 0, damages: 1_500, response: 'Pompiers + Volontaires', status: 'resolved' },
    { title: 'Tempête tropicale côte sud', type: 'storm', date: '2024-08-22', zone: 'Mayumba / Ndougou', province: 'Nyanga', affected: 3_500, casualties: 0, damages: 2_800, response: 'Marine + COSEP', status: 'resolved' },
    { title: 'Inondation Port-Gentil (quartiers sur pilotis)', type: 'flood', date: '2025-01-28', zone: 'Grand Village / Balise', province: 'Ogooué-Maritime', affected: 5_200, casualties: 1, damages: 4_200, response: 'BNSP + Mairie', status: 'monitoring' },
    { title: 'Épidémie dengue Woleu-Ntem', type: 'epidemic', date: '2024-09-10', zone: 'Oyem / Bitam', province: 'Woleu-Ntem', affected: 4_800, casualties: 5, damages: 800, response: 'OMS + Min. Santé', status: 'resolved' },
];

const RESPONSE_CAPACITY = [
    { resource: 'Pompiers (BNSP)', count: 1_200, deployed: 850, readiness: 92 },
    { resource: 'Militaires (génie)', count: 800, deployed: 350, readiness: 95 },
    { resource: 'Croix-Rouge Gabon', count: 450, deployed: 280, readiness: 88 },
    { resource: 'Volontaires COSEP', count: 520, deployed: 180, readiness: 75 },
    { resource: 'Personnel médical urgence', count: 230, deployed: 120, readiness: 82 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DisasterManagementPage() {
    const [view, setView] = useState<'events' | 'capacity'>('events');

    const alertBadge = {
        green: 'bg-green-100 text-green-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        orange: 'bg-orange-100 text-orange-700',
        red: 'bg-red-100 text-red-700',
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-7 w-7 text-orange-600" />
                            Gestion des Catastrophes Naturelles
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalEvents2025} événements 2025 · {GLOBAL.totalAffected.toLocaleString()} personnes affectées · {GLOBAL.riskZones} zones à risque
                        </p>
                    </div>
                    <Badge className={`text-xs ${alertBadge[GLOBAL.alertLevel]}`}>
                        ⚠️ Alerte {GLOBAL.alertLevel === 'yellow' ? 'Jaune' : GLOBAL.alertLevel === 'orange' ? 'Orange' : 'Rouge'}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div><p className="text-lg font-bold text-orange-600">{GLOBAL.totalEvents2024 + GLOBAL.totalEvents2025}</p><p className="text-[10px] text-muted-foreground">Événements (24-25)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{(GLOBAL.totalAffected / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Personnes affectées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.firstResponders.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Secouristes</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.evacuationCenters}</p><p className="text-[10px] text-muted-foreground">Centres évacuation</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'events' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('events')}>Événements</Button>
                    <Button variant={view === 'capacity' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('capacity')}>Capacité</Button>
                </div>

                {view === 'events' && (
                    <div className="space-y-2">
                        {EVENTS.map((e, i) => {
                            const tcfg = TYPE_CFG[e.type];
                            const Icon = tcfg.icon;
                            const statusBadge = {
                                resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                ongoing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                monitoring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            };
                            return (
                                <Card key={i} className={e.status === 'ongoing' ? 'border-l-4 border-l-red-500' : e.status === 'monitoring' ? 'border-l-4 border-l-amber-500' : ''}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                            <Icon className={`h-4 w-4 ${tcfg.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <Badge className={`text-[6px] h-3 ${statusBadge[e.status]}`}>{e.status === 'resolved' ? '✓ Résolu' : e.status === 'ongoing' ? '🔴 En cours' : '👁️ Surveillance'}</Badge>
                                                <Badge variant="outline" className="text-[6px] h-3">{tcfg.label}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{e.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{e.zone}, {e.province}</span>
                                                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{e.date}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] mt-0.5">
                                                <span><b className="text-red-600">{e.affected.toLocaleString()}</b> affectés</span>
                                                {e.casualties > 0 && <span className="text-red-600 font-bold">{e.casualties} victimes</span>}
                                                <span className="text-amber-600 font-bold">{(e.damages / 1000).toFixed(1)} Mds dégâts</span>
                                                <span className="text-[8px] text-muted-foreground">{e.response}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'capacity' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Capacité de réponse nationale</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Ressource</th>
                                    <th className="text-center py-2 px-2">Effectif</th>
                                    <th className="text-center py-2 px-2">Déployés</th>
                                    <th className="text-center py-2 px-2">Disponibilité</th>
                                </tr></thead>
                                <tbody>{RESPONSE_CAPACITY.map((r, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2 px-3 font-bold">{r.resource}</td>
                                        <td className="text-center py-2 px-2 font-mono">{r.count.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2 font-mono text-blue-600">{r.deployed.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${r.readiness >= 90 ? 'bg-green-500' : r.readiness >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${r.readiness}%` }} />
                                                </div>
                                                <span className="text-[9px] font-bold">{r.readiness}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            <div className="p-3 text-[9px] text-muted-foreground flex items-center gap-1">
                                <Radio className="h-3 w-3" />
                                {GLOBAL.contingencyPlans} plans de contingence actifs · Coordination : COSEP / BNSP / Forces armées
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
