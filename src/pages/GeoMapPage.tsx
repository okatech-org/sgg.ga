/**
 * SGG Digital — Carte Géographique des Institutions
 *
 * Visualisation des institutions gouvernementales par province :
 *   - Carte interactive du Gabon par province (9 provinces)
 *   - Liste des institutions par province sélectionnée
 *   - Statistiques par zone géographique
 *   - Indicateurs de couverture et performance
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MapPin, Building2, Users, BarChart3,
    Globe, ChevronRight, CheckCircle2,
    AlertTriangle, TrendingUp,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Province {
    id: string;
    name: string;
    capital: string;
    institutions: number;
    agents: number;
    coverage: number; // 0-100
    performance: number; // 0-100
    color: string;
    details: { name: string; type: string; agents: number; status: 'actif' | 'partiel' | 'inactif' }[];
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const PROVINCES: Province[] = [
    {
        id: 'estuaire', name: 'Estuaire', capital: 'Libreville', institutions: 45, agents: 1250, coverage: 95, performance: 88, color: 'bg-blue-500',
        details: [
            { name: 'Secrétariat Général du Gouvernement', type: 'Central', agents: 85, status: 'actif' },
            { name: 'Ministère de l\'Économie et des Finances', type: 'Ministère', agents: 120, status: 'actif' },
            { name: 'Ministère de l\'Éducation Nationale', type: 'Ministère', agents: 95, status: 'actif' },
            { name: 'Ministère de la Santé', type: 'Ministère', agents: 110, status: 'actif' },
            { name: 'Direction Générale des Impôts', type: 'Direction', agents: 65, status: 'actif' },
            { name: 'ANPI — Agence de Promotion des Investissements', type: 'Agence', agents: 35, status: 'actif' },
            { name: 'CNAMGS', type: 'Organisme', agents: 80, status: 'partiel' },
        ],
    },
    {
        id: 'haut-ogooue', name: 'Haut-Ogooué', capital: 'Franceville', institutions: 12, agents: 180, coverage: 72, performance: 65, color: 'bg-green-500',
        details: [
            { name: 'Gouvernorat du Haut-Ogooué', type: 'Gouvernorat', agents: 25, status: 'actif' },
            { name: 'Direction Provinciale de l\'Éducation', type: 'Direction', agents: 30, status: 'actif' },
            { name: 'Hôpital Régional de Franceville', type: 'Santé', agents: 45, status: 'partiel' },
            { name: 'COMILOG — Compagnie Minière', type: 'Partenaire', agents: 80, status: 'actif' },
        ],
    },
    {
        id: 'moyen-ogooue', name: 'Moyen-Ogooué', capital: 'Lambaréné', institutions: 8, agents: 95, coverage: 60, performance: 58, color: 'bg-teal-500',
        details: [
            { name: 'Gouvernorat du Moyen-Ogooué', type: 'Gouvernorat', agents: 18, status: 'actif' },
            { name: 'Direction Provinciale de la Santé', type: 'Direction', agents: 22, status: 'partiel' },
            { name: 'Hôpital Albert Schweitzer', type: 'Santé', agents: 55, status: 'actif' },
        ],
    },
    {
        id: 'ngounie', name: 'Ngounié', capital: 'Mouila', institutions: 7, agents: 85, coverage: 55, performance: 52, color: 'bg-amber-500',
        details: [
            { name: 'Gouvernorat de la Ngounié', type: 'Gouvernorat', agents: 15, status: 'actif' },
            { name: 'Direction Provinciale de l\'Éducation', type: 'Direction', agents: 25, status: 'partiel' },
            { name: 'Tribunal de Mouila', type: 'Justice', agents: 20, status: 'actif' },
        ],
    },
    {
        id: 'nyanga', name: 'Nyanga', capital: 'Tchibanga', institutions: 5, agents: 65, coverage: 48, performance: 45, color: 'bg-orange-500',
        details: [
            { name: 'Gouvernorat de la Nyanga', type: 'Gouvernorat', agents: 12, status: 'actif' },
            { name: 'Direction Provinciale de la Santé', type: 'Direction', agents: 18, status: 'inactif' },
        ],
    },
    {
        id: 'ogooue-ivindo', name: 'Ogooué-Ivindo', capital: 'Makokou', institutions: 6, agents: 70, coverage: 42, performance: 40, color: 'bg-emerald-500',
        details: [
            { name: 'Gouvernorat de l\'Ogooué-Ivindo', type: 'Gouvernorat', agents: 14, status: 'actif' },
            { name: 'Parc National de l\'Ivindo', type: 'Partenaire', agents: 30, status: 'actif' },
            { name: 'Direction Provinciale des Eaux & Forêts', type: 'Direction', agents: 26, status: 'partiel' },
        ],
    },
    {
        id: 'ogooue-lolo', name: 'Ogooué-Lolo', capital: 'Koulamoutou', institutions: 5, agents: 55, coverage: 38, performance: 42, color: 'bg-lime-500',
        details: [
            { name: 'Gouvernorat de l\'Ogooué-Lolo', type: 'Gouvernorat', agents: 12, status: 'actif' },
            { name: 'Direction Provinciale de l\'Éducation', type: 'Direction', agents: 20, status: 'partiel' },
        ],
    },
    {
        id: 'ogooue-maritime', name: 'Ogooué-Maritime', capital: 'Port-Gentil', institutions: 15, agents: 280, coverage: 78, performance: 72, color: 'bg-cyan-500',
        details: [
            { name: 'Gouvernorat de l\'Ogooué-Maritime', type: 'Gouvernorat', agents: 22, status: 'actif' },
            { name: 'Direction Provinciale des Hydrocarbures', type: 'Direction', agents: 45, status: 'actif' },
            { name: 'Port Autonome de Port-Gentil', type: 'Organisme', agents: 65, status: 'actif' },
            { name: 'SOGARA — Société Gabonaise de Raffinage', type: 'Partenaire', agents: 80, status: 'actif' },
            { name: 'Hôpital Régional', type: 'Santé', agents: 68, status: 'partiel' },
        ],
    },
    {
        id: 'woleu-ntem', name: 'Woleu-Ntem', capital: 'Oyem', institutions: 9, agents: 120, coverage: 62, performance: 55, color: 'bg-violet-500',
        details: [
            { name: 'Gouvernorat du Woleu-Ntem', type: 'Gouvernorat', agents: 20, status: 'actif' },
            { name: 'Direction Provinciale de l\'Éducation', type: 'Direction', agents: 28, status: 'actif' },
            { name: 'Direction Provinciale de l\'Agriculture', type: 'Direction', agents: 22, status: 'partiel' },
            { name: 'Tribunal d\'Oyem', type: 'Justice', agents: 18, status: 'actif' },
        ],
    },
];

const STATUS_CONFIG = {
    actif: { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    partiel: { label: 'Partiel', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    inactif: { label: 'Inactif', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Component ───────────────────────────────────────────────────────────────

export default function GeoMapPage() {
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(PROVINCES[0]);

    const totals = useMemo(() => ({
        institutions: PROVINCES.reduce((s, p) => s + p.institutions, 0),
        agents: PROVINCES.reduce((s, p) => s + p.agents, 0),
        avgCoverage: Math.round(PROVINCES.reduce((s, p) => s + p.coverage, 0) / PROVINCES.length),
        avgPerformance: Math.round(PROVINCES.reduce((s, p) => s + p.performance, 0) / PROVINCES.length),
    }), []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Globe className="h-7 w-7 text-emerald-600" />
                        Carte des Institutions
                    </h1>
                    <p className="text-muted-foreground">
                        {PROVINCES.length} provinces · {totals.institutions} institutions · {totals.agents} agents
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-emerald-600">{PROVINCES.length}</p>
                        <p className="text-[10px] text-muted-foreground">Provinces</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{totals.institutions}</p>
                        <p className="text-[10px] text-muted-foreground">Institutions</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-amber-600">{totals.avgCoverage}%</p>
                        <p className="text-[10px] text-muted-foreground">Couverture moy.</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-purple-600">{totals.avgPerformance}%</p>
                        <p className="text-[10px] text-muted-foreground">Performance moy.</p>
                    </CardContent></Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Province List (Map replacement) */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                Provinces
                            </CardTitle>
                            <CardDescription>Sélectionnez une province</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 p-3">
                            {PROVINCES.map(prov => {
                                const isSelected = selectedProvince?.id === prov.id;
                                return (
                                    <button
                                        key={prov.id}
                                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-muted/50 ${isSelected ? 'bg-primary/10 border border-primary/30' : ''}`}
                                        onClick={() => setSelectedProvince(prov)}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${prov.color} shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold">{prov.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{prov.capital} · {prov.institutions} inst.</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Coverage bar */}
                                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${prov.coverage >= 70 ? 'bg-green-500' : prov.coverage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} style={{ width: `${prov.coverage}%` }} />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground w-7 text-right">{prov.coverage}%</span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Province Detail */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-emerald-600" />
                                {selectedProvince ? selectedProvince.name : 'Sélectionnez une province'}
                            </CardTitle>
                            {selectedProvince && (
                                <CardDescription>
                                    Capitale : {selectedProvince.capital} · {selectedProvince.institutions} institutions · {selectedProvince.agents} agents
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {selectedProvince ? (
                                <div className="space-y-4">
                                    {/* Province Metrics */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                                            <Building2 className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                                            <p className="text-lg font-bold">{selectedProvince.institutions}</p>
                                            <p className="text-[9px] text-muted-foreground">Institutions</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                                            <Users className="h-4 w-4 mx-auto text-green-600 mb-1" />
                                            <p className="text-lg font-bold">{selectedProvince.agents}</p>
                                            <p className="text-[9px] text-muted-foreground">Agents</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                                            <BarChart3 className="h-4 w-4 mx-auto text-amber-600 mb-1" />
                                            <p className="text-lg font-bold">{selectedProvince.coverage}%</p>
                                            <p className="text-[9px] text-muted-foreground">Couverture</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                                            <TrendingUp className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                                            <p className="text-lg font-bold">{selectedProvince.performance}%</p>
                                            <p className="text-[9px] text-muted-foreground">Performance</p>
                                        </div>
                                    </div>

                                    {/* Coverage & Performance Bars */}
                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                                <span>Couverture numérique</span>
                                                <span className="font-semibold">{selectedProvince.coverage}%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${selectedProvince.coverage >= 70 ? 'bg-green-500' : selectedProvince.coverage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} style={{ width: `${selectedProvince.coverage}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                                <span>Performance reporting</span>
                                                <span className="font-semibold">{selectedProvince.performance}%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${selectedProvince.performance >= 70 ? 'bg-blue-500' : selectedProvince.performance >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} style={{ width: `${selectedProvince.performance}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Institutions List */}
                                    <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground mb-2">
                                            INSTITUTIONS ({selectedProvince.details.length})
                                        </p>
                                        <div className="space-y-1.5">
                                            {selectedProvince.details.map((inst, i) => {
                                                const statusConf = STATUS_CONFIG[inst.status];
                                                return (
                                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/30 transition-colors">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProvince.color}/20`}>
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold truncate">{inst.name}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                                <Badge variant="outline" className="text-[9px] h-4">{inst.type}</Badge>
                                                                <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{inst.agents} agents</span>
                                                            </div>
                                                        </div>
                                                        <Badge className={`text-[9px] h-4 ${statusConf.color}`}>{statusConf.label}</Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Alerts */}
                                    {selectedProvince.coverage < 60 && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                                Couverture numérique inférieure à 60%. Renforcement prioritaire recommandé.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-xs">Sélectionnez une province pour voir ses détails</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
