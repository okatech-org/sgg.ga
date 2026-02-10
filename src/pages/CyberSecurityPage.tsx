/**
 * SGG Digital — Cybersécurité Nationale
 *
 * Centre de suivi de la sécurité numérique :
 *   - Menaces et incidents
 *   - Infrastructure critique protégée
 *   - Capacité de réponse (CERT)
 *   - Conformité et formation
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ShieldCheck, AlertTriangle, Bug, Lock,
    Server, Wifi, Eye, Activity,
    Users, Clock, Globe, Zap,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ThreatLevel = 'critical' | 'high' | 'medium' | 'low';
type IncidentType = 'Phishing' | 'Ransomware' | 'DDoS' | 'Intrusion' | 'Fuite données' | 'Malware';

interface Incident {
    id: string;
    title: string;
    type: IncidentType;
    level: ThreatLevel;
    target: string;
    date: string;
    status: 'resolved' | 'active' | 'investigating';
    impact: string;
}

interface CriticalInfra {
    name: string;
    sector: string;
    protectionLevel: number; // %
    lastAudit: string;
    incidents: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const LEVEL_CFG: Record<ThreatLevel, { label: string; badge: string }> = {
    critical: { label: 'Critique', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    high: { label: 'Élevé', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    medium: { label: 'Moyen', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    low: { label: 'Faible', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const STATUS_CFG = {
    resolved: { label: 'Résolu', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    active: { label: 'Actif', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    investigating: { label: 'Investigation', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const INCIDENTS: Incident[] = [
    { id: 'i1', title: 'Campagne de phishing ciblant les ministères', type: 'Phishing', level: 'high', target: 'Ministères (emails)', date: '9 fév 2026', status: 'active', impact: '1 200 emails bloqués, 3 comptes compromis' },
    { id: 'i2', title: 'Tentative de ransomware — DGI (Impôts)', type: 'Ransomware', level: 'critical', target: 'DGI', date: '6 fév 2026', status: 'resolved', impact: 'Bloqué par EDR, aucune donnée chiffrée' },
    { id: 'i3', title: 'DDoS sur le portail citoyen gov.ga', type: 'DDoS', level: 'medium', target: 'gov.ga', date: '4 fév 2026', status: 'resolved', impact: '2h indisponibilité, mitigation CDN' },
    { id: 'i4', title: 'Intrusion détectée — réseau SEEG', type: 'Intrusion', level: 'critical', target: 'SEEG (SCADA)', date: '1 fév 2026', status: 'investigating', impact: 'Accès latéral détecté, segment isolé' },
    { id: 'i5', title: 'Fuite de données — base RH ministerielle', type: 'Fuite données', level: 'high', target: 'Fonction publique', date: '28 jan 2026', status: 'resolved', impact: '850 dossiers exposés, patch appliqué' },
    { id: 'i6', title: 'Malware USB propagé — Haut-Ogooué', type: 'Malware', level: 'medium', target: 'Gouvernorat HO', date: '25 jan 2026', status: 'resolved', impact: '15 postes nettoyés' },
    { id: 'i7', title: 'Phishing WhatsApp usurpant le PM', type: 'Phishing', level: 'medium', target: 'Grand public', date: '20 jan 2026', status: 'resolved', impact: 'Communiqué d\'alerte diffusé' },
    { id: 'i8', title: 'Scan massif de ports — Data Center Nkok', type: 'Intrusion', level: 'low', target: 'DC Nkok', date: '15 jan 2026', status: 'resolved', impact: 'Origine IP Chine, règles FW mises à jour' },
];

const CRITICAL_INFRA: CriticalInfra[] = [
    { name: 'Réseau gouvernemental (RING)', sector: 'Gouvernement', protectionLevel: 85, lastAudit: 'Jan 2026', incidents: 5 },
    { name: 'Système bancaire (BEAC/BGFI)', sector: 'Finance', protectionLevel: 92, lastAudit: 'Déc 2025', incidents: 2 },
    { name: 'SEEG (Eau/Électricité SCADA)', sector: 'Énergie', protectionLevel: 68, lastAudit: 'Oct 2025', incidents: 3 },
    { name: 'Gabon Télécom / Airtel', sector: 'Télécoms', protectionLevel: 78, lastAudit: 'Nov 2025', incidents: 4 },
    { name: 'Aéroport LBV (sûreté)', sector: 'Transport', protectionLevel: 75, lastAudit: 'Sep 2025', incidents: 1 },
    { name: 'Data Center National Nkok', sector: 'IT', protectionLevel: 88, lastAudit: 'Fév 2026', incidents: 2 },
];

const GLOBAL = {
    totalIncidents: 342,
    blockedThreats: 125_000,
    resolvedPct: 94,
    avgResponseTime: 28, // minutes
    certAgents: 35,
    trainedPersonnel: 1_200,
    protectedSystems: 4_500,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function CyberSecurityPage() {
    const [view, setView] = useState<'incidents' | 'infrastructure'>('incidents');
    const [levelFilter, setLevelFilter] = useState<ThreatLevel | 'all'>('all');

    const filtered = useMemo(() => {
        if (levelFilter === 'all') return INCIDENTS;
        return INCIDENTS.filter(i => i.level === levelFilter);
    }, [levelFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <ShieldCheck className="h-7 w-7 text-sky-600" />
                            Cybersécurité Nationale
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalIncidents} incidents 2026 · {GLOBAL.blockedThreats.toLocaleString()} menaces bloquées · CERT-GA
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-sky-200 text-sky-600">🛡️ ANINF · CERT Gabon</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-sky-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-sky-500" />
                            <div><p className="text-lg font-bold text-sky-600">{(GLOBAL.blockedThreats / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Menaces bloquées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.resolvedPct}%</p><p className="text-[10px] text-muted-foreground">Résolution</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.avgResponseTime}min</p><p className="text-[10px] text-muted-foreground">Temps réponse</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Server className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{GLOBAL.protectedSystems.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Systèmes protégés</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'incidents' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('incidents')}>Incidents</Button>
                    <Button variant={view === 'infrastructure' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('infrastructure')}>Infrastructures critiques</Button>
                </div>

                {view === 'incidents' && (
                    <>
                        <div className="flex gap-1 flex-wrap">
                            <Button variant={levelFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-6" onClick={() => setLevelFilter('all')}>Tous</Button>
                            {(['critical', 'high', 'medium', 'low'] as ThreatLevel[]).map(l => (
                                <Button key={l} variant={levelFilter === l ? 'default' : 'outline'} size="sm" className="text-xs h-6" onClick={() => setLevelFilter(l)}>{LEVEL_CFG[l].label}</Button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {filtered.map(inc => {
                                const lcfg = LEVEL_CFG[inc.level];
                                const scfg = STATUS_CFG[inc.status];
                                return (
                                    <Card key={inc.id}>
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                                <Bug className="h-4 w-4 text-sky-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                    <Badge className={`text-[7px] h-3.5 ${lcfg.badge}`}>{lcfg.label}</Badge>
                                                    <Badge variant="outline" className="text-[7px] h-3">{inc.type}</Badge>
                                                    <Badge className={`text-[7px] h-3 ${scfg.badge}`}>{scfg.label}</Badge>
                                                </div>
                                                <p className="text-xs font-bold">{inc.title}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-0.5"><Server className="h-2.5 w-2.5" />{inc.target}</span>
                                                    <span>{inc.date}</span>
                                                </div>
                                                <p className="text-[9px] mt-0.5 text-sky-600 dark:text-sky-400">💡 {inc.impact}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}

                {view === 'infrastructure' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Infrastructure</th>
                                    <th className="text-center py-2 px-2">Secteur</th>
                                    <th className="text-center py-2 px-2">Protection</th>
                                    <th className="text-center py-2 px-2">Dernier audit</th>
                                    <th className="text-center py-2 px-2">Incidents</th>
                                </tr></thead>
                                <tbody>{CRITICAL_INFRA.map((inf, i) => (
                                    <tr key={i} className={`border-b hover:bg-muted/20 ${inf.protectionLevel < 75 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                        <td className="py-2 px-3 font-bold flex items-center gap-1"><Lock className="h-2.5 w-2.5" />{inf.name}</td>
                                        <td className="text-center py-2 px-2"><Badge variant="outline" className="text-[7px] h-3">{inf.sector}</Badge></td>
                                        <td className="text-center py-2 px-2">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${inf.protectionLevel >= 80 ? 'bg-green-500' : inf.protectionLevel >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${inf.protectionLevel}%` }} />
                                                </div>
                                                <span className={`text-[9px] font-bold ${inf.protectionLevel < 75 ? 'text-red-600' : ''}`}>{inf.protectionLevel}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center py-2 px-2 text-[9px]">{inf.lastAudit}</td>
                                        <td className="text-center py-2 px-2 font-bold">{inf.incidents}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
