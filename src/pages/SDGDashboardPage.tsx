/**
 * SGG Digital — Indicateurs ODD (Objectifs de Développement Durable)
 *
 * Suivi des engagements du Gabon vis-à-vis des 17 ODD de l'ONU :
 *   - Score par objectif
 *   - Réalisations clés
 *   - Tendance
 *   - Alignement avec les politiques nationales
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Globe2, TrendingUp, TrendingDown, Minus,
    Target, CheckCircle2, ChevronRight,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface SDGoal {
    id: number;
    name: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    color: string;
    keyAction: string;
    gabonPolicy: string;
}

const SDG_GOALS: SDGoal[] = [
    { id: 1, name: 'Pas de pauvreté', score: 45, trend: 'up', color: '#E5243B', keyAction: 'Transferts sociaux directs via CNAMGS', gabonPolicy: 'SNAT 2025' },
    { id: 2, name: 'Faim « zéro »', score: 52, trend: 'stable', color: '#DDA63A', keyAction: 'Programme GRAINE phase 2 (agriculture)', gabonPolicy: 'PSGE Pilier Vert' },
    { id: 3, name: 'Bonne santé', score: 58, trend: 'up', color: '#4C9F38', keyAction: 'Couverture maladie universelle 68%', gabonPolicy: 'Plan Santé 2026' },
    { id: 4, name: 'Éducation de qualité', score: 62, trend: 'up', color: '#C5192D', keyAction: 'Taux de scolarisation primaire 94%', gabonPolicy: 'Réforme Éducation' },
    { id: 5, name: 'Égalité des sexes', score: 55, trend: 'up', color: '#FF3A21', keyAction: '33% de femmes dans le gouvernement', gabonPolicy: 'Loi Parité 2023' },
    { id: 6, name: 'Eau propre', score: 48, trend: 'down', color: '#26BDE2', keyAction: 'Accès eau potable 72% (urbain 89%)', gabonPolicy: 'SEEG Réforme' },
    { id: 7, name: 'Énergie propre', score: 70, trend: 'up', color: '#FCC30B', keyAction: 'Barrage Grand Poubara (160 MW)', gabonPolicy: 'Plan Énergie 2026' },
    { id: 8, name: 'Travail décent', score: 42, trend: 'down', color: '#A21942', keyAction: 'Taux chômage jeunes : 35%', gabonPolicy: 'ONE + ANPI' },
    { id: 9, name: 'Industrie & Innovation', score: 60, trend: 'up', color: '#FD6925', keyAction: 'ZES Nkok : 150 entreprises installées', gabonPolicy: 'PSGE Pilier Industriel' },
    { id: 10, name: 'Inégalités réduites', score: 38, trend: 'stable', color: '#DD1367', keyAction: 'Indice de Gini : 0.42', gabonPolicy: 'Politique Sociale' },
    { id: 11, name: 'Villes durables', score: 50, trend: 'up', color: '#FD9D24', keyAction: 'Plan urbanisme Libreville 2030', gabonPolicy: 'SNAT Urbain' },
    { id: 12, name: 'Consommation responsable', score: 44, trend: 'stable', color: '#BF8B2E', keyAction: 'Certification FLEGT bois tropical', gabonPolicy: 'Code Forestier' },
    { id: 13, name: 'Action climatique', score: 72, trend: 'up', color: '#3F7E44', keyAction: 'Forêt absorbe 140M tonnes CO₂/an', gabonPolicy: 'CDN + REDD+' },
    { id: 14, name: 'Vie aquatique', score: 65, trend: 'stable', color: '#0A97D9', keyAction: '26% des eaux marines protégées', gabonPolicy: 'Gabon Bleu' },
    { id: 15, name: 'Vie terrestre', score: 78, trend: 'up', color: '#56C02B', keyAction: '13 parcs nationaux (11% du territoire)', gabonPolicy: 'Gabon Vert' },
    { id: 16, name: 'Paix et justice', score: 55, trend: 'up', color: '#00689D', keyAction: 'Réforme constitutionnelle 2024', gabonPolicy: 'Transition CTRI' },
    { id: 17, name: 'Partenariats', score: 60, trend: 'up', color: '#19486A', keyAction: 'Coopération UA, CEMAC, OIF renforcée', gabonPolicy: 'Diplomatie multilatérale' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function SDGDashboardPage() {
    const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

    const globalAvg = Math.round(SDG_GOALS.reduce((s, g) => s + g.score, 0) / SDG_GOALS.length);
    const onTrack = SDG_GOALS.filter(g => g.score >= 60).length;
    const improving = SDG_GOALS.filter(g => g.trend === 'up').length;
    const detail = selectedGoal ? SDG_GOALS.find(g => g.id === selectedGoal) : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Globe2 className="h-7 w-7 text-blue-600" />
                            Objectifs de Développement Durable
                        </h1>
                        <p className="text-muted-foreground">
                            17 ODD · Score moyen national : {globalAvg}% · Agenda 2030
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">🇬🇦 Rapport Gabon · Fév 2026</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-blue-600">{globalAvg}%</p>
                            <p className="text-[10px] text-muted-foreground">Score moyen ODD</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{onTrack}/17</p><p className="text-[10px] text-muted-foreground">En bonne voie (≥60%)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <div><p className="text-lg font-bold text-emerald-600">{improving}</p><p className="text-[10px] text-muted-foreground">En progression</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{SDG_GOALS.filter(g => g.trend === 'down').length}</p><p className="text-[10px] text-muted-foreground">En régression</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* ODD Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {SDG_GOALS.map(goal => (
                        <Card key={goal.id} className={`cursor-pointer transition-all hover:scale-105 hover:shadow-md ${selectedGoal === goal.id ? 'ring-2 ring-primary shadow-md' : ''}`} onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}>
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: goal.color }}>
                                        {goal.id}
                                    </div>
                                    {goal.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                                        goal.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                                            <Minus className="h-3 w-3 text-gray-400" />}
                                </div>
                                <p className="text-[10px] font-bold leading-tight mb-1.5">{goal.name}</p>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${goal.score}%`, backgroundColor: goal.color }} />
                                </div>
                                <p className="text-[10px] font-bold mt-1" style={{ color: goal.color }}>{goal.score}%</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Detail Panel */}
                {detail && (
                    <Card className="border-2" style={{ borderColor: detail.color + '40' }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: detail.color }}>{detail.id}</div>
                                ODD {detail.id} — {detail.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                <div className="p-2.5 bg-muted/50 rounded text-center">
                                    <p className="text-lg font-bold" style={{ color: detail.color }}>{detail.score}%</p>
                                    <p className="text-[9px] text-muted-foreground">Score national</p>
                                </div>
                                <div className="p-2.5 bg-muted/50 rounded text-center">
                                    <div className="flex justify-center mb-0.5">
                                        {detail.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> :
                                            detail.trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
                                                <Minus className="h-4 w-4 text-gray-400" />}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">{detail.trend === 'up' ? 'En progression' : detail.trend === 'down' ? 'En régression' : 'Stable'}</p>
                                </div>
                                <div className="p-2.5 bg-muted/50 rounded text-center">
                                    <p className="text-xs font-bold">{detail.gabonPolicy}</p>
                                    <p className="text-[9px] text-muted-foreground">Politique alignée</p>
                                </div>
                            </div>
                            <div className="p-2.5 rounded border" style={{ borderColor: detail.color + '30', backgroundColor: detail.color + '08' }}>
                                <p className="text-[10px] font-bold" style={{ color: detail.color }}>Réalisation clé</p>
                                <p className="text-xs mt-0.5">{detail.keyAction}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Summary */}
                <Card>
                    <CardContent className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        Les indicateurs ODD sont alignés avec le rapport volontaire national (RVN) du Gabon présenté au Forum Politique de Haut Niveau des Nations Unies.
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
