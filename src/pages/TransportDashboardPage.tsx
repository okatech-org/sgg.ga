/**
 * SGG Digital — Transports & Infrastructures
 *
 * Suivi du réseau de transport national :
 *   - Routes nationales et provinciales
 *   - Ports et aéroports
 *   - Projets d'infrastructure
 *   - État du réseau
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Truck, Plane, Ship, MapPin,
    TrendingUp, AlertTriangle, CheckCircle2,
    Clock, Hammer, Route,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface RoadSegment {
    name: string;
    from: string;
    to: string;
    length: number; // km
    condition: 'good' | 'fair' | 'poor' | 'critical';
    paved: boolean;
    lastRehab: number;
}

interface InfraProject {
    name: string;
    type: string;
    location: string;
    budget: number; // Mds FCFA
    completion: number;
    year: number;
    contractor: string;
}

const GLOBAL = {
    totalRoads: 9_170, // km
    pavedRoads: 1_210,
    unpaved: 7_960,
    pavedPct: 13,
    airports: 3,
    airstrips: 52,
    ports: 3,
    bridges: 420,
    budgetInfra: 850, // Mds FCFA
};

const ROADS: RoadSegment[] = [
    { name: 'RN1', from: 'Libreville', to: 'Ndjolé', length: 250, condition: 'fair', paved: true, lastRehab: 2019 },
    { name: 'RN1', from: 'Ndjolé', to: 'Franceville', length: 430, condition: 'poor', paved: false, lastRehab: 2010 },
    { name: 'RN2', from: 'Libreville', to: 'Lambaréné', length: 240, condition: 'good', paved: true, lastRehab: 2022 },
    { name: 'RN3', from: 'Ntoum', to: 'Kango', length: 80, condition: 'critical', paved: true, lastRehab: 2014 },
    { name: 'RN4', from: 'Carrefour Léon Mba', to: 'Oyem', length: 400, condition: 'poor', paved: false, lastRehab: 2008 },
    { name: 'RN5', from: 'Mouila', to: 'Ndendé', length: 180, condition: 'fair', paved: false, lastRehab: 2017 },
    { name: 'RN6', from: 'Franceville', to: 'Bongoville', length: 95, condition: 'fair', paved: true, lastRehab: 2020 },
    { name: 'Transgabonaise', from: 'Libreville', to: 'Franceville', length: 680, condition: 'poor', paved: false, lastRehab: 2015 },
];

const AIRPORTS = [
    { name: 'Aéroport Léon Mba', city: 'Libreville', code: 'LBV', international: true, passengers2025: 820_000, runwayLength: 3000 },
    { name: 'Aéroport de Mvengué', city: 'Franceville', code: 'MVB', international: true, passengers2025: 95_000, runwayLength: 2800 },
    { name: 'Aéroport de Port-Gentil', city: 'Port-Gentil', code: 'POG', international: true, passengers2025: 180_000, runwayLength: 2600 },
];

const PORTS = [
    { name: 'Port d\'Owendo', city: 'Libreville', type: 'Commercial', teu2025: 185_000, tonnage: 8_500_000 },
    { name: 'Port de Port-Gentil', city: 'Port-Gentil', type: 'Pétrolier', teu2025: 0, tonnage: 12_000_000 },
    { name: 'Port Môle de Libreville', city: 'Libreville', type: 'Pêche/Passagers', teu2025: 5_000, tonnage: 250_000 },
];

const PROJECTS: InfraProject[] = [
    { name: 'Pont sur le Komo (Kango)', type: 'Pont', location: 'Estuaire', budget: 85, completion: 35, year: 2028, contractor: 'China Road & Bridge' },
    { name: 'Transgabonaise - Phase 2', type: 'Route', location: 'Multi-provinces', budget: 320, completion: 15, year: 2030, contractor: 'Consortium Afrique Routes' },
    { name: 'Réhabilitation RN1 Kango-Ntoum', type: 'Route', location: 'Estuaire', budget: 32, completion: 55, year: 2027, contractor: 'Colas Gabon' },
    { name: 'Extension Port d\'Owendo', type: 'Port', location: 'Estuaire', budget: 120, completion: 25, year: 2028, contractor: 'Bolloré Transport' },
    { name: 'Modernisation Aéroport LBV', type: 'Aéroport', location: 'Estuaire', budget: 95, completion: 60, year: 2027, contractor: 'Vinci Airports' },
    { name: 'Route Franceville-Bongoville', type: 'Route', location: 'Haut-Ogooué', budget: 45, completion: 40, year: 2027, contractor: 'BAD / Entreprises locales' },
];

const CONDITION_CFG = {
    good: { label: 'Bon', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    fair: { label: 'Acceptable', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    poor: { label: 'Dégradé', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    critical: { label: 'Critique', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Component ───────────────────────────────────────────────────────────────

export default function TransportDashboardPage() {
    const [view, setView] = useState<'roads' | 'airports' | 'ports' | 'projects'>('roads');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Truck className="h-7 w-7 text-sky-600" />
                            Transports & Infrastructures
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalRoads.toLocaleString()} km routes · {GLOBAL.airports} aéroports · {GLOBAL.ports} ports · Budget : {GLOBAL.budgetInfra} Mds
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Plan Directeur 2026-2030</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-sky-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Route className="h-5 w-5 text-sky-500" />
                            <div><p className="text-lg font-bold text-sky-600">{GLOBAL.totalRoads.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">km de routes</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.pavedPct}%</p><p className="text-[10px] text-muted-foreground">Revêtues</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Plane className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.airports + GLOBAL.airstrips}</p><p className="text-[10px] text-muted-foreground">Aérodromes</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Hammer className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{PROJECTS.length}</p><p className="text-[10px] text-muted-foreground">Projets en cours</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1 flex-wrap">
                    {([['roads', 'Routes'], ['airports', 'Aéroports'], ['ports', 'Ports'], ['projects', 'Projets']] as const).map(([k, l]) => (
                        <Button key={k} variant={view === k ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView(k)}>{l}</Button>
                    ))}
                </div>

                {view === 'roads' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Tronçon</th><th className="text-center py-2 px-2">De → À</th><th className="text-center py-2 px-2">Km</th><th className="text-center py-2 px-2">Revêtue</th><th className="text-center py-2 px-2">État</th><th className="text-center py-2 px-2">Réhab.</th>
                                </tr></thead>
                                <tbody>{ROADS.map((r, i) => {
                                    const cfg = CONDITION_CFG[r.condition];
                                    return (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2 px-3 font-bold">{r.name}</td>
                                            <td className="text-center py-2 px-2 text-[9px]">{r.from} → {r.to}</td>
                                            <td className="text-center py-2 px-2 font-mono">{r.length}</td>
                                            <td className="text-center py-2 px-2">{r.paved ? '✅' : '❌'}</td>
                                            <td className="text-center py-2 px-2"><Badge className={`text-[7px] h-3.5 ${cfg.color}`}>{cfg.label}</Badge></td>
                                            <td className="text-center py-2 px-2 text-[9px]">{r.lastRehab}</td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'airports' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {AIRPORTS.map((a, i) => (
                            <Card key={i}>
                                <CardContent className="p-4 text-center">
                                    <Plane className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                                    <p className="text-xs font-bold">{a.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{a.city} ({a.code})</p>
                                    <p className="text-lg font-bold text-blue-600 mt-1">{(a.passengers2025 / 1000).toFixed(0)}k</p>
                                    <p className="text-[8px] text-muted-foreground">passagers 2025</p>
                                    <p className="text-[9px] mt-1">Piste : {a.runwayLength}m · {a.international ? '🌍 International' : 'Domestic'}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'ports' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PORTS.map((p, i) => (
                            <Card key={i}>
                                <CardContent className="p-4 text-center">
                                    <Ship className="h-6 w-6 mx-auto mb-1 text-cyan-500" />
                                    <p className="text-xs font-bold">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{p.city} · {p.type}</p>
                                    <p className="text-lg font-bold text-cyan-600 mt-1">{(p.tonnage / 1_000_000).toFixed(1)}M</p>
                                    <p className="text-[8px] text-muted-foreground">tonnes/an</p>
                                    {p.teu2025 > 0 && <p className="text-[9px] mt-0.5">{p.teu2025.toLocaleString()} TEU</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'projects' && (
                    <div className="space-y-2">
                        {PROJECTS.map((p, i) => (
                            <Card key={i}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                        <Hammer className="h-3.5 w-3.5 text-sky-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{p.name}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <Badge variant="outline" className="text-[7px] h-3">{p.type}</Badge>
                                            <span className="font-bold text-foreground">{p.budget} Mds FCFA</span>
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}</span>
                                            <span>→ {p.contractor}</span>
                                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{p.year}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${p.completion >= 50 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${p.completion}%` }} />
                                        </div>
                                        <span className="text-[9px] font-bold">{p.completion}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
