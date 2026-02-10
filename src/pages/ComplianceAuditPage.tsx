/**
 * SGG Digital — Audit de Conformité
 *
 * Suivi de la conformité réglementaire des ministères :
 *   - Checklist par domaine réglementaire
 *   - Score de conformité par ministère
 *   - Échéances et actions correctives
 *   - Historique des audits
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ClipboardCheck, CheckCircle2, XCircle, AlertTriangle,
    Clock, ChevronDown, ChevronRight, Shield,
    FileText, Users, Calendar, TrendingUp,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'not-evaluated';
type ComplianceDomain = 'Reporting GAR' | 'Protection Données' | 'Procédures Internes' | 'Sécurité IT' | 'Budget' | 'RH & Formation';

interface ComplianceItem {
    id: string;
    requirement: string;
    domain: ComplianceDomain;
    status: ComplianceStatus;
    score: number;
    deadline?: string;
    lastAudit: string;
    corrective?: string;
}

interface MinistryCompliance {
    ministry: string;
    abbrev: string;
    globalScore: number;
    items: ComplianceItem[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ComplianceStatus, { label: string; color: string; badge: string; icon: typeof CheckCircle2 }> = {
    compliant: { label: 'Conforme', color: 'text-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    partial: { label: 'Partiel', color: 'text-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
    'non-compliant': { label: 'Non conforme', color: 'text-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    'not-evaluated': { label: 'Non évalué', color: 'text-gray-400', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Clock },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

function generateItems(profile: number[]): ComplianceItem[] {
    const requirements: { req: string; domain: ComplianceDomain }[] = [
        { req: 'Soumission rapport GAR dans les délais', domain: 'Reporting GAR' },
        { req: 'Format standard de rapport respecté', domain: 'Reporting GAR' },
        { req: 'Registre traitement données personnelles', domain: 'Protection Données' },
        { req: 'Politique de confidentialité publiée', domain: 'Protection Données' },
        { req: 'Circuit de validation documenté', domain: 'Procédures Internes' },
        { req: 'PV de réunions archivés', domain: 'Procédures Internes' },
        { req: 'MFA activé pour tous les comptes', domain: 'Sécurité IT' },
        { req: 'Mots de passe renouvelés trimestriellement', domain: 'Sécurité IT' },
        { req: 'Exécution budgétaire > 50% à mi-année', domain: 'Budget' },
        { req: 'Rapport budgétaire mensuel soumis', domain: 'Budget' },
        { req: 'Point focal formé à la plateforme', domain: 'RH & Formation' },
        { req: 'Plan de formation annuel validé', domain: 'RH & Formation' },
    ];

    const statuses: ComplianceStatus[] = ['compliant', 'partial', 'non-compliant', 'not-evaluated'];
    return requirements.map((r, i) => ({
        id: `ci-${i}`,
        requirement: r.req,
        domain: r.domain,
        status: statuses[profile[i]] as ComplianceStatus,
        score: profile[i] === 0 ? 100 : profile[i] === 1 ? 60 : profile[i] === 2 ? 20 : 0,
        deadline: profile[i] === 2 ? 'Mar 2026' : undefined,
        lastAudit: 'Jan 2026',
        corrective: profile[i] === 2 ? 'Action corrective requise sous 30 jours' : undefined,
    }));
}

const MINISTRIES: MinistryCompliance[] = [
    { ministry: 'Secrétariat Général', abbrev: 'SGG', globalScore: 92, items: generateItems([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]) },
    { ministry: 'Ministère des Finances', abbrev: 'MINEFI', globalScore: 78, items: generateItems([0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1]) },
    { ministry: 'Ministère de l\'Éducation', abbrev: 'MENETP', globalScore: 65, items: generateItems([0, 1, 1, 2, 0, 1, 0, 1, 1, 0, 0, 2]) },
    { ministry: 'Ministère de la Santé', abbrev: 'MINSANTE', globalScore: 52, items: generateItems([2, 1, 2, 2, 1, 1, 0, 2, 1, 2, 1, 2]) },
    { ministry: 'Ministère des Transports', abbrev: 'MINTRANS', globalScore: 70, items: generateItems([0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1]) },
    { ministry: 'Ministère Économie Numérique', abbrev: 'MTNHDN', globalScore: 88, items: generateItems([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]) },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ComplianceAuditPage() {
    const [expandedId, setExpandedId] = useState<string | null>('SGG');
    const [domainFilter, setDomainFilter] = useState('all');

    const globalAvg = Math.round(MINISTRIES.reduce((s, m) => s + m.globalScore, 0) / MINISTRIES.length);
    const compliantCount = MINISTRIES.filter(m => m.globalScore >= 80).length;
    const domains: ComplianceDomain[] = ['Reporting GAR', 'Protection Données', 'Procédures Internes', 'Sécurité IT', 'Budget', 'RH & Formation'];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <ClipboardCheck className="h-7 w-7 text-emerald-600" />
                            Audit de Conformité
                        </h1>
                        <p className="text-muted-foreground">
                            {MINISTRIES.length} ministères · 12 exigences · Score moyen : {globalAvg}%
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Dernier audit : Janvier 2026</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-blue-600">{globalAvg}%</p>
                            <p className="text-[10px] text-muted-foreground">Score moyen conformité</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{compliantCount}</p><p className="text-[10px] text-muted-foreground">Ministères conformes (≥80%)</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{MINISTRIES.filter(m => m.globalScore < 60).length}</p><p className="text-[10px] text-muted-foreground">En défaut critique</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">12</p><p className="text-[10px] text-muted-foreground">Exigences évaluées</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Domain Filter */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={domainFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setDomainFilter('all')}>Tous</Button>
                    {domains.map(d => (
                        <Button key={d} variant={domainFilter === d ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setDomainFilter(d)}>{d}</Button>
                    ))}
                </div>

                {/* Ministry List */}
                <div className="space-y-2">
                    {MINISTRIES.map(ministry => {
                        const isExpanded = expandedId === ministry.abbrev;
                        const filteredItems = domainFilter === 'all' ? ministry.items : ministry.items.filter(i => i.domain === domainFilter);

                        return (
                            <Card key={ministry.abbrev} className={ministry.globalScore < 60 ? 'border-red-300 dark:border-red-800' : ''}>
                                <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : ministry.abbrev)}>
                                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{ministry.ministry}</p>
                                        <p className="text-[10px] text-muted-foreground">{ministry.abbrev}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${ministry.globalScore >= 80 ? 'bg-green-500' : ministry.globalScore >= 60 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${ministry.globalScore}%` }} />
                                        </div>
                                        <span className={`text-sm font-bold ${ministry.globalScore >= 80 ? 'text-green-600' : ministry.globalScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{ministry.globalScore}%</span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <div className="space-y-1.5 mt-3">
                                            {filteredItems.map(item => {
                                                const cfg = STATUS_CFG[item.status];
                                                const Icon = cfg.icon;
                                                return (
                                                    <div key={item.id} className="flex items-center gap-2 text-xs p-2 rounded hover:bg-muted/30">
                                                        <Icon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
                                                        <span className="flex-1">{item.requirement}</span>
                                                        <Badge variant="outline" className="text-[7px] h-3">{item.domain}</Badge>
                                                        <Badge className={`text-[7px] h-3.5 ${cfg.badge}`}>{cfg.label}</Badge>
                                                        {item.deadline && (
                                                            <span className="text-[9px] text-red-500 flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{item.deadline}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {ministry.items.some(i => i.corrective) && (
                                            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                                <p className="text-[10px] font-bold text-red-700 dark:text-red-400">⚠ Actions correctives requises :</p>
                                                {ministry.items.filter(i => i.corrective).map((item, i) => (
                                                    <p key={i} className="text-[9px] text-red-600 dark:text-red-400 mt-0.5">→ {item.requirement} : {item.corrective}</p>
                                                ))}
                                            </div>
                                        )}
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
