/**
 * SGG Digital — Centre de Veille Stratégique
 *
 * Intelligence gouvernementale et veille sur l'environnement politique,
 * économique, social, technologique, légal et environnemental (PESTLE) :
 *   - Signaux faibles
 *   - Risques émergents
 *   - Opportunités stratégiques
 *   - Sources nationales et internationales
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Eye, AlertTriangle, TrendingUp, Globe,
    Shield, Landmark, Cpu, Leaf,
    Users, DollarSign, Scale, Clock,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type WatchCategory = 'Politique' | 'Économique' | 'Social' | 'Technologique' | 'Légal' | 'Environnemental';
type SignalLevel = 'critical' | 'warning' | 'opportunity' | 'info';

interface WatchItem {
    id: string;
    title: string;
    summary: string;
    category: WatchCategory;
    signal: SignalLevel;
    source: string;
    date: string;
    impact: string;
    recommendation: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const CATEGORY_CFG: Record<WatchCategory, { icon: typeof Globe; color: string }> = {
    Politique: { icon: Landmark, color: '#3b82f6' },
    Économique: { icon: DollarSign, color: '#f59e0b' },
    Social: { icon: Users, color: '#8b5cf6' },
    Technologique: { icon: Cpu, color: '#06b6d4' },
    Légal: { icon: Scale, color: '#64748b' },
    Environnemental: { icon: Leaf, color: '#22c55e' },
};

const SIGNAL_CFG: Record<SignalLevel, { label: string; badge: string }> = {
    critical: { label: '🔴 Critique', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    warning: { label: '🟡 Vigilance', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    opportunity: { label: '🟢 Opportunité', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    info: { label: '🔵 Information', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const WATCH_ITEMS: WatchItem[] = [
    { id: 'w1', title: 'Chute du pétrole brut sous les 60$/baril', summary: 'Le Brent passe sous 60$ pour la première fois depuis 2021. Impact direct sur les recettes budgétaires gabonaises (40% du PIB).', category: 'Économique', signal: 'critical', source: 'Reuters / Bloomberg', date: '9 fév 2026', impact: 'Réduction recettes pétrolières de 15-20%', recommendation: 'Activer le plan de diversification accélérée. Convoquer réunion interministérielle MINEFI.' },
    { id: 'w2', title: 'Referendum constitutionnel : sondages favorables', summary: 'Les derniers sondages montrent 74% d\'intentions de vote favorable au projet de nouvelle constitution.', category: 'Politique', signal: 'opportunity', source: 'CNDH / Enquête GPO', date: '8 fév 2026', impact: 'Renforcement de la légitimité institutionnelle', recommendation: 'Intensifier la communication pédagogique sur les réformes.' },
    { id: 'w3', title: 'Cyberattaque ciblant des institutions CEMAC', summary: 'Le centre de cybersécurité CEMAC rapporte une vague d\'attaques par ransomware ciblant les systèmes gouvernementaux de la sous-région.', category: 'Technologique', signal: 'critical', source: 'CERT CEMAC / ANINF', date: '7 fév 2026', impact: 'Risque de compromission des systèmes IT de l\'État', recommendation: 'Audit de sécurité immédiat tous les systèmes. Activation du plan de réponse cyber.' },
    { id: 'w4', title: 'UE : nouvelle directive sur le bois tropical', summary: 'L\'UE prépare un renforcement de la traçabilité du bois importé. Impact potentiel sur les exportations forestières gabonaises.', category: 'Légal', signal: 'warning', source: 'Journal Officiel UE', date: '6 fév 2026', impact: 'Accès au marché européen conditionné', recommendation: 'Renforcer le programme FLEGT. Anticiper les nouvelles normes de traçabilité.' },
    { id: 'w5', title: 'Grève des enseignants : préavis déposé', summary: 'Le SENA (Syndicat des Enseignants) dépose un préavis de grève illimitée à partir du 20 février. Motif : retard de paiement des primes.', category: 'Social', signal: 'warning', source: 'Gabonreview / SENA', date: '5 fév 2026', impact: 'Perturbation du calendrier scolaire', recommendation: 'Ouvrir le dialogue social immédiat. Débloquer les crédits de primes en urgence.' },
    { id: 'w6', title: 'FMI : approbation d\'un programme Extended Credit', summary: 'Le FMI approuve un programme de 400 M$ sur 3 ans pour le Gabon, conditionné aux réformes structurelles en cours.', category: 'Économique', signal: 'opportunity', source: 'FMI Communiqué', date: '4 fév 2026', impact: 'Renforcement de la crédibilité financière', recommendation: 'Accélérer les réformes fiscales et de gouvernance prévues dans le programme.' },
    { id: 'w7', title: 'Inondations Ogooué : alerte météo renforcée', summary: 'Le service météo national émet une alerte rouge pour les bassins de l\'Ogooué. Niveau de crue prévu exceptionnel.', category: 'Environnemental', signal: 'critical', source: 'DGMN / Météo Gabon', date: '3 fév 2026', impact: 'Populations riveraines à risque. Infrastructure routière vulnérable.', recommendation: 'Activation du plan ORSEC. Pré-positionnement des secours dans les provinces affectées.' },
    { id: 'w8', title: 'SpaceX Starlink : couverture étendue à l\'Afrique Centrale', summary: 'Starlink annonce une extension de sa couverture satellite à l\'Afrique Centrale d\'ici Q3 2026, potentiel de connectivité rurale.', category: 'Technologique', signal: 'opportunity', source: 'TechCrunch', date: '2 fév 2026', impact: 'Alternative à la fibre pour les zones rurales', recommendation: 'Engager des discussions avec SpaceX pour un partenariat gouvernemental. Évaluer l\'impact sur la stratégie fibre nationale.' },
    { id: 'w9', title: 'Réforme de l\'UA : création d\'une force de sécurité continentale', summary: 'Le sommet de l\'UA approuve la création d\'une force de sécurité continentale. Contribution attendue des États membres.', category: 'Politique', signal: 'info', source: 'Union Africaine', date: '1 fév 2026', impact: 'Engagement militaire et financier à prévoir', recommendation: 'Préparer la position gabonaise en consultation avec le MINDEF.' },
    { id: 'w10', title: 'PPTE CEMAC : harmonisation des taxes numériques', summary: 'La CEMAC finalise le projet de taxe harmonisée sur les services numériques (3% CA). Application prévue janvier 2027.', category: 'Légal', signal: 'info', source: 'CEMAC Secrétariat', date: '31 jan 2026', impact: 'Recettes fiscales supplémentaires de 5-8 Mds FCFA', recommendation: 'Adapter le cadre fiscal national. Préparer les opérateurs télecoms.' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function StrategicWatchPage() {
    const [catFilter, setCatFilter] = useState<WatchCategory | 'all'>('all');
    const [signalFilter, setSignalFilter] = useState<SignalLevel | 'all'>('all');

    const filtered = useMemo(() => {
        return WATCH_ITEMS.filter(w => {
            if (catFilter !== 'all' && w.category !== catFilter) return false;
            if (signalFilter !== 'all' && w.signal !== signalFilter) return false;
            return true;
        });
    }, [catFilter, signalFilter]);

    const counts = {
        critical: WATCH_ITEMS.filter(w => w.signal === 'critical').length,
        warning: WATCH_ITEMS.filter(w => w.signal === 'warning').length,
        opportunity: WATCH_ITEMS.filter(w => w.signal === 'opportunity').length,
        info: WATCH_ITEMS.filter(w => w.signal === 'info').length,
    };

    const categories = Object.keys(CATEGORY_CFG) as WatchCategory[];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Eye className="h-7 w-7 text-cyan-600" />
                            Veille Stratégique
                        </h1>
                        <p className="text-muted-foreground">
                            {WATCH_ITEMS.length} signaux · Analyse PESTLE · Intelligence gouvernementale
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Bulletin du 10 Fév 2026</Badge>
                </div>

                {/* Signal counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                        { key: 'critical', label: 'Critiques', color: 'border-l-red-500', textColor: 'text-red-600', icon: AlertTriangle },
                        { key: 'warning', label: 'Vigilance', color: 'border-l-amber-500', textColor: 'text-amber-600', icon: Shield },
                        { key: 'opportunity', label: 'Opportunités', color: 'border-l-green-500', textColor: 'text-green-600', icon: TrendingUp },
                        { key: 'info', label: 'Informations', color: 'border-l-blue-500', textColor: 'text-blue-600', icon: Globe },
                    ] as const).map(s => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.key} className={`border-l-4 ${s.color} cursor-pointer ${signalFilter === s.key ? 'ring-2 ring-primary' : ''}`} onClick={() => setSignalFilter(signalFilter === s.key ? 'all' : s.key)}>
                                <CardContent className="pt-3 pb-2 flex items-center gap-2">
                                    <Icon className={`h-5 w-5 ${s.textColor}`} />
                                    <div><p className={`text-lg font-bold ${s.textColor}`}>{counts[s.key]}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Category filter */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Tous</Button>
                    {categories.map(c => {
                        const cfg = CATEGORY_CFG[c];
                        const Icon = cfg.icon;
                        return (
                            <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-7 gap-1" onClick={() => setCatFilter(c)}>
                                <Icon className="h-3 w-3" />{c}
                            </Button>
                        );
                    })}
                </div>

                {/* Items */}
                <div className="space-y-3">
                    {filtered.map(item => {
                        const ccfg = CATEGORY_CFG[item.category];
                        const scfg = SIGNAL_CFG[item.signal];
                        const CatIcon = ccfg.icon;

                        return (
                            <Card key={item.id} className={item.signal === 'critical' ? 'border-red-200 dark:border-red-800' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ccfg.color + '15' }}>
                                            <CatIcon className="h-4 w-4" style={{ color: ccfg.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge className={`text-[7px] h-3.5 ${scfg.badge}`}>{scfg.label}</Badge>
                                                <Badge variant="outline" className="text-[7px] h-3">{item.category}</Badge>
                                                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{item.date}</span>
                                            </div>
                                            <p className="text-xs font-bold mb-0.5">{item.title}</p>
                                            <p className="text-[10px] text-muted-foreground mb-2">{item.summary}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div className="p-1.5 rounded bg-muted/40 text-[9px]">
                                                    <p className="font-bold text-muted-foreground mb-0.5">Source</p>
                                                    <p>{item.source}</p>
                                                </div>
                                                <div className="p-1.5 rounded bg-red-50 dark:bg-red-900/10 text-[9px]">
                                                    <p className="font-bold text-red-600 dark:text-red-400 mb-0.5">Impact</p>
                                                    <p>{item.impact}</p>
                                                </div>
                                                <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/10 text-[9px]">
                                                    <p className="font-bold text-blue-600 dark:text-blue-400 mb-0.5">Recommandation</p>
                                                    <p>{item.recommendation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun signal trouvé</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
