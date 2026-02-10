/**
 * SGG Digital — Synthèse Exécutive
 *
 * Vue de haut niveau pour le Secrétaire Général :
 *   - Indicateurs macro
 *   - État des processus en cours
 *   - Points d'attention
 *   - Décisions en attente
 *   - Prochaines échéances
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Crown, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, Clock, FileText, Users,
    Building2, Calendar, ArrowRight, Flag,
    Shield, Zap, Target,
} from 'lucide-react';

// ── Component ───────────────────────────────────────────────────────────────

export default function ExecutiveSummaryPage() {
    const [dateRange] = useState('Février 2026');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Crown className="h-7 w-7 text-amber-500" />
                            Synthèse Exécutive
                        </h1>
                        <p className="text-muted-foreground">
                            Période : {dateRange} · Dernière mise à jour : 10 fév, 12:00
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" /> Accès Secrétaire Général
                    </Badge>
                </div>

                {/* Top-Level KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">72%</p>
                                    <p className="text-[10px] text-muted-foreground">Score National</p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <p className="text-[9px] text-green-600 mt-1">+4% vs mois précédent</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">35/42</p>
                                    <p className="text-[10px] text-muted-foreground">Ministères conformes</p>
                                </div>
                                <Building2 className="h-5 w-5 text-blue-500" />
                            </div>
                            <p className="text-[9px] text-blue-600 mt-1">83% de conformité</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-amber-600">7</p>
                                    <p className="text-[10px] text-muted-foreground">Alertes actives</p>
                                </div>
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            </div>
                            <p className="text-[9px] text-red-600 mt-1">2 critiques</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-violet-600">18/50</p>
                                    <p className="text-[10px] text-muted-foreground">Projets PAG achevés</p>
                                </div>
                                <Target className="h-5 w-5 text-violet-500" />
                            </div>
                            <p className="text-[9px] text-violet-600 mt-1">36% — objectif Déc 2026</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Points d'Attention */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Points d'Attention Prioritaires
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { text: 'MINTRANS — Rapport GAR T4 non soumis', severity: 'critical', detail: '15 jours de retard, escalade niveau 2' },
                                { text: 'MINSANTE — Incohérences budgétaires détectées', severity: 'critical', detail: 'Écart 12% entre totaux et détail' },
                                { text: 'Nomination DG ANPI — Délai > 30 jours', severity: 'warning', detail: '35 jours d\'attente, relance DAJ requise' },
                                { text: '3 ministères inactifs > 14 jours', severity: 'warning', detail: 'MINCOM, MINJUSTICE, MINEDD' },
                                { text: 'Couverture provinces : 7/9 (78%)', severity: 'info', detail: 'Nyanga et Ogooué-Ivindo non connectées' },
                            ].map((item, i) => (
                                <div key={i} className={`p-2.5 rounded-lg border flex items-start gap-2 ${item.severity === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' :
                                        item.severity === 'warning' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800' :
                                            'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.severity === 'critical' ? 'bg-red-500' : item.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <p className="text-xs font-semibold">{item.text}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Décisions en Attente */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                Décisions en Attente de Validation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { text: 'Validation rapport GAR consolidé T4 2025', type: 'GAR', age: '2 jours', priority: 'haute' },
                                { text: 'Approbation décret réorganisation MINSANTE', type: 'Juridique', age: '5 jours', priority: 'haute' },
                                { text: 'Nomination DG ANPI — avis final', type: 'Nominations', age: '3 jours', priority: 'moyenne' },
                                { text: 'Budget prévisionnel formation T2', type: 'Budget', age: '1 jour', priority: 'moyenne' },
                                { text: 'Validation cahier des charges sécurité v3', type: 'Sécurité', age: '4 jours', priority: 'basse' },
                            ].map((item, i) => (
                                <div key={i} className="p-2.5 rounded-lg border flex items-center gap-2 hover:bg-muted/30 transition-colors">
                                    <div className={`w-1.5 h-6 rounded-full shrink-0 ${item.priority === 'haute' ? 'bg-red-500' : item.priority === 'moyenne' ? 'bg-amber-500' : 'bg-gray-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold">{item.text}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[8px] h-3">{item.type}</Badge>
                                            <span className="text-[9px] text-muted-foreground">En attente depuis {item.age}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] gap-0.5 shrink-0">
                                        Valider <ArrowRight className="h-2.5 w-2.5" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Processus en Cours */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Zap className="h-4 w-4 text-teal-500" />
                                Processus Actifs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: 'Nominations en cours', count: 12, done: 7, color: 'bg-purple-500' },
                                { name: 'Rapports GAR période', count: 42, done: 35, color: 'bg-blue-500' },
                                { name: 'Projets de décrets', count: 5, done: 2, color: 'bg-amber-500' },
                                { name: 'Audits performance', count: 8, done: 5, color: 'bg-green-500' },
                            ].map((proc, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium">{proc.name}</span>
                                        <span className="font-bold">{proc.done}/{proc.count}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${proc.color}`} style={{ width: `${(proc.done / proc.count) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Prochaines Échéances */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                Prochaines Échéances
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { date: '12 fév', text: 'Deadline rapports GAR retardataires', type: 'urgent' },
                                { date: '15 fév', text: 'Conseil interministériel', type: 'important' },
                                { date: '20 fév', text: 'Publication résultats Benchmark T4', type: 'normal' },
                                { date: '28 fév', text: 'Clôture période budgétaire T1', type: 'important' },
                                { date: '01 mar', text: 'Ouverture reporting GAR T1 2026', type: 'normal' },
                            ].map((event, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className={`w-12 text-[10px] font-bold shrink-0 ${event.type === 'urgent' ? 'text-red-600' : event.type === 'important' ? 'text-amber-600' : 'text-muted-foreground'
                                        }`}>{event.date}</span>
                                    <div className={`w-1 h-1 rounded-full shrink-0 ${event.type === 'urgent' ? 'bg-red-500' : event.type === 'important' ? 'bg-amber-500' : 'bg-gray-400'
                                        }`} />
                                    <span>{event.text}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Top/Bottom Performers */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Flag className="h-4 w-4 text-violet-500" />
                                Performance Ministères
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-[10px] font-semibold text-green-600 mb-1">🏆 TOP 3</p>
                                {[
                                    { name: 'MINER', score: 85 },
                                    { name: 'MAECICPG', score: 82 },
                                    { name: 'MENETP', score: 78 },
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs mb-1">
                                        <span className="w-4 text-[10px] font-bold text-muted-foreground">{i + 1}.</span>
                                        <span className="flex-1 font-medium">{m.name}</span>
                                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${m.score}%` }} />
                                        </div>
                                        <span className="text-green-600 font-bold w-7 text-right">{m.score}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-2">
                                <p className="text-[10px] font-semibold text-red-600 mb-1">⚠️ BOTTOM 3</p>
                                {[
                                    { name: 'MINTRANS', score: 52 },
                                    { name: 'MINJUSTICE', score: 58 },
                                    { name: 'MINSANTE', score: 68 },
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs mb-1">
                                        <span className="w-4 text-[10px] font-bold text-muted-foreground">{6 + i}.</span>
                                        <span className="flex-1 font-medium">{m.name}</span>
                                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${m.score < 60 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${m.score}%` }} />
                                        </div>
                                        <span className={`font-bold w-7 text-right ${m.score < 60 ? 'text-red-600' : 'text-amber-600'}`}>{m.score}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Actions Rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {[
                            { label: 'Voir rapport GAR', icon: FileText, href: '/rapports-gar' },
                            { label: 'Gérer alertes', icon: AlertTriangle, href: '/alertes' },
                            { label: 'OKR stratégiques', icon: Target, href: '/okr' },
                            { label: 'Benchmark', icon: TrendingUp, href: '/benchmark' },
                            { label: 'Calendrier', icon: Calendar, href: '/calendar' },
                            { label: 'KPI Builder', icon: Target, href: '/kpi-builder' },
                        ].map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <Button key={i} variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.location.href = action.href}>
                                    <Icon className="h-3 w-3" /> {action.label}
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
