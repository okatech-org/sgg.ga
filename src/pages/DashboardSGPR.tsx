/**
 * SGG Digital — Tableau de Bord SGPR Personnalisé
 *
 * Dashboard dédié au Secrétariat Général de la Présidence de la République.
 * Affiche les dossiers pour signature présidentielle, les arbitrages
 * interministériels, le suivi des transmissions, et les alertes.
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/i18n";
import {
    FileText,
    AlertTriangle,
    Clock,
    ArrowRight,
    Building2,
    Send,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Inbox,
    Scale,
    Shield,
    Calendar,
    PieChart,
    TrendingUp,
    Bell,
    RefreshCw,
    Eye,
    Download,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface DossierSignature {
    id: string;
    titre: string;
    type: "ordonnance" | "decret" | "nomination" | "accord";
    emetteur: string;
    dateReception: string;
    priorite: "urgente" | "haute" | "normale";
    statut: "en_attente" | "examine" | "signe" | "renvoye";
    observations?: string;
}

interface Arbitrage {
    id: string;
    sujet: string;
    ministeres: string[];
    dateDepot: string;
    deadline: string;
    statut: "nouveau" | "en_instruction" | "audience" | "tranche";
    rapporteur: string;
}

interface Transmission {
    date: string;
    entrant: number;
    sortant: number;
    urgent: number;
}

interface AlerteSGPR {
    id: string;
    type: "deadline" | "retard" | "urgent" | "info";
    message: string;
    timestamp: string;
    lu: boolean;
}

interface StatsMinistere {
    nom: string;
    rapportsSoumis: number;
    rapportsValides: number;
    rapportsEnRetard: number;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const mockDossiersSignature: DossierSignature[] = [
    {
        id: "DS-001",
        titre: "Ordonnance portant réforme du Code du Travail",
        type: "ordonnance",
        emetteur: "Ministère du Travail",
        dateReception: "2026-02-08",
        priorite: "urgente",
        statut: "en_attente",
        observations: "Avis favorable du Conseil d'État",
    },
    {
        id: "DS-002",
        titre: "Décret d'application de la loi sur les marchés publics",
        type: "decret",
        emetteur: "Ministère de l'Économie",
        dateReception: "2026-02-07",
        priorite: "haute",
        statut: "examine",
    },
    {
        id: "DS-003",
        titre: "Nomination du Directeur Général du Budget",
        type: "nomination",
        emetteur: "Premier Ministre",
        dateReception: "2026-02-09",
        priorite: "haute",
        statut: "en_attente",
    },
    {
        id: "DS-004",
        titre: "Accord-cadre de coopération avec l'UE",
        type: "accord",
        emetteur: "Ministère des Affaires Étrangères",
        dateReception: "2026-02-05",
        priorite: "normale",
        statut: "examine",
    },
    {
        id: "DS-005",
        titre: "Décret relatif au plan d'urgence sanitaire",
        type: "decret",
        emetteur: "Ministère de la Santé",
        dateReception: "2026-02-10",
        priorite: "urgente",
        statut: "en_attente",
    },
];

const mockArbitrages: Arbitrage[] = [
    {
        id: "ARB-001",
        sujet: "Répartition budgétaire Éducation / Recherche",
        ministeres: ["Éducation Nationale", "Recherche Scientifique"],
        dateDepot: "2026-01-28",
        deadline: "2026-02-15",
        statut: "en_instruction",
        rapporteur: "M. NDONG Albert",
    },
    {
        id: "ARB-002",
        sujet: "Compétences territoriales — Zones économiques",
        ministeres: ["Aménagement du Territoire", "Économie", "Environnement"],
        dateDepot: "2026-02-01",
        deadline: "2026-02-20",
        statut: "audience",
        rapporteur: "Mme. MOUSSAVOU Claire",
    },
    {
        id: "ARB-003",
        sujet: "Fusion des agences numériques",
        ministeres: ["Numérique", "Fonction Publique"],
        dateDepot: "2026-02-05",
        deadline: "2026-02-28",
        statut: "nouveau",
        rapporteur: "M. BIYOGHE Pierre",
    },
];

const mockTransmissions: Transmission[] = [
    { date: "2026-02-10", entrant: 12, sortant: 8, urgent: 3 },
    { date: "2026-02-09", entrant: 15, sortant: 11, urgent: 2 },
    { date: "2026-02-08", entrant: 9, sortant: 13, urgent: 1 },
    { date: "2026-02-07", entrant: 18, sortant: 7, urgent: 4 },
    { date: "2026-02-06", entrant: 11, sortant: 14, urgent: 2 },
    { date: "2026-02-05", entrant: 8, sortant: 10, urgent: 0 },
    { date: "2026-02-04", entrant: 14, sortant: 9, urgent: 3 },
];

const mockAlertes: AlerteSGPR[] = [
    {
        id: "A-001",
        type: "deadline",
        message: "Arbitrage ARB-001 : deadline dans 5 jours",
        timestamp: "2026-02-10T08:00:00Z",
        lu: false,
    },
    {
        id: "A-002",
        type: "urgent",
        message: "Dossier DS-005 (décret sanitaire) — traitement prioritaire demandé",
        timestamp: "2026-02-10T07:30:00Z",
        lu: false,
    },
    {
        id: "A-003",
        type: "retard",
        message: "3 ministères n'ont pas soumis leur rapport mensuel (Janvier 2026)",
        timestamp: "2026-02-09T16:00:00Z",
        lu: true,
    },
    {
        id: "A-004",
        type: "info",
        message: "Conseil des ministres prévu le 14 février — 8 dossiers à l'ordre du jour",
        timestamp: "2026-02-09T10:00:00Z",
        lu: true,
    },
];

const mockStatsMinisteres: StatsMinistere[] = [
    { nom: "Économie", rapportsSoumis: 12, rapportsValides: 10, rapportsEnRetard: 0 },
    { nom: "Éducation Nationale", rapportsSoumis: 11, rapportsValides: 9, rapportsEnRetard: 1 },
    { nom: "Santé", rapportsSoumis: 10, rapportsValides: 8, rapportsEnRetard: 1 },
    { nom: "Travail", rapportsSoumis: 8, rapportsValides: 7, rapportsEnRetard: 2 },
    { nom: "Défense", rapportsSoumis: 12, rapportsValides: 12, rapportsEnRetard: 0 },
    { nom: "Affaires Étrangères", rapportsSoumis: 9, rapportsValides: 8, rapportsEnRetard: 1 },
    { nom: "Justice", rapportsSoumis: 10, rapportsValides: 10, rapportsEnRetard: 0 },
    { nom: "Intérieur", rapportsSoumis: 11, rapportsValides: 9, rapportsEnRetard: 2 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const prioriteColors: Record<string, string> = {
    urgente: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
    haute: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    normale: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
};

const statutDossierColors: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
    examine: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    signe: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
    renvoye: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
};

const statutArbitrageColors: Record<string, string> = {
    nouveau: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
    en_instruction: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    audience: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    tranche: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
};

const alerteIcons: Record<string, typeof AlertTriangle> = {
    deadline: Clock,
    retard: AlertTriangle,
    urgent: Bell,
    info: FileText,
};

const alerteColors: Record<string, string> = {
    deadline: "text-orange-500",
    retard: "text-red-500",
    urgent: "text-red-600",
    info: "text-blue-500",
};

// ── Component ───────────────────────────────────────────────────────────────

export default function DashboardSGPR() {
    const { t } = useTranslation();
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [activeTab, setActiveTab] = useState("dossiers");
    const [filterPriorite, setFilterPriorite] = useState<string>("all");

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setLastRefresh(new Date());
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = useCallback(() => {
        setLastRefresh(new Date());
    }, []);

    // Filtered dossiers
    const filteredDossiers = filterPriorite === "all"
        ? mockDossiersSignature
        : mockDossiersSignature.filter(d => d.priorite === filterPriorite);

    // Stats computations
    const totalEntrant = mockTransmissions.reduce((s, t) => s + t.entrant, 0);
    const totalSortant = mockTransmissions.reduce((s, t) => s + t.sortant, 0);
    const totalUrgent = mockTransmissions.reduce((s, t) => s + t.urgent, 0);
    const unreadAlertes = mockAlertes.filter(a => !a.lu).length;
    const totalReportsValid = mockStatsMinisteres.reduce((s, m) => s + m.rapportsValides, 0);
    const totalReports = mockStatsMinisteres.reduce((s, m) => s + m.rapportsSoumis, 0);
    const completionRate = Math.round((totalReportsValid / totalReports) * 100);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-6 w-6 text-government-gold" />
                        <h1 className="text-2xl font-bold text-government-navy dark:text-white">
                            Tableau de Bord SGPR
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Secrétariat Général de la Présidence de la République — Vue stratégique
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Dernière MAJ : {lastRefresh.toLocaleTimeString("fr-FR")}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-6">
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {mockDossiersSignature.filter(d => d.statut === "en_attente").length}
                                </p>
                                <p className="text-xs text-muted-foreground">Dossiers en attente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <Scale className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mockArbitrages.length}</p>
                                <p className="text-xs text-muted-foreground">Arbitrages pendants</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Send className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalEntrant + totalSortant}</p>
                                <p className="text-xs text-muted-foreground">Transmissions (7j)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{unreadAlertes}</p>
                                <p className="text-xs text-muted-foreground">Alertes non lues</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{completionRate}%</p>
                                <p className="text-xs text-muted-foreground">Taux validation</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full lg:w-auto lg:inline-grid">
                    <TabsTrigger value="dossiers" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Dossiers</span>
                    </TabsTrigger>
                    <TabsTrigger value="arbitrages" className="flex items-center gap-1">
                        <Scale className="h-4 w-4" />
                        <span className="hidden sm:inline">Arbitrages</span>
                    </TabsTrigger>
                    <TabsTrigger value="transmissions" className="flex items-center gap-1">
                        <Inbox className="h-4 w-4" />
                        <span className="hidden sm:inline">Transmissions</span>
                    </TabsTrigger>
                    <TabsTrigger value="suivi" className="flex items-center gap-1">
                        <PieChart className="h-4 w-4" />
                        <span className="hidden sm:inline">Suivi</span>
                    </TabsTrigger>
                </TabsList>

                {/* ── Dossiers pour Signature ────────────────────────────────────── */}
                <TabsContent value="dossiers">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-government-gold" />
                                    Dossiers pour Signature Présidentielle
                                </h2>
                                <div className="flex gap-1">
                                    {["all", "urgente", "haute", "normale"].map(p => (
                                        <Button
                                            key={p}
                                            variant={filterPriorite === p ? "default" : "outline"}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setFilterPriorite(p)}
                                        >
                                            {p === "all" ? "Tous" : p.charAt(0).toUpperCase() + p.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {filteredDossiers.map(dossier => (
                                <Card key={dossier.id} className={cn(
                                    "shadow-sm transition-colors hover:shadow-md",
                                    dossier.priorite === "urgente" && "border-l-4 border-l-red-500"
                                )}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <Badge variant="outline" className={prioriteColors[dossier.priorite]}>
                                                        {dossier.priorite}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs capitalize">
                                                        {dossier.type}
                                                    </Badge>
                                                    <Badge variant="outline" className={statutDossierColors[dossier.statut]}>
                                                        {dossier.statut.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-medium mb-1">{dossier.titre}</h3>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>📨 {dossier.emetteur}</span>
                                                    <span>📅 {new Date(dossier.dateReception).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                                {dossier.observations && (
                                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                                        💬 {dossier.observations}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" title="Consulter">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    Examiner
                                                    <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Alertes sidebar */}
                        <div className="space-y-4">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-orange-500" />
                                        Alertes
                                        {unreadAlertes > 0 && (
                                            <Badge className="bg-red-500 text-white text-xs">{unreadAlertes}</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {mockAlertes.map(alerte => {
                                            const IconComponent = alerteIcons[alerte.type];
                                            return (
                                                <div
                                                    key={alerte.id}
                                                    className={cn(
                                                        "p-3 rounded-lg border text-sm transition-colors",
                                                        !alerte.lu && "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <IconComponent className={cn("h-4 w-4 mt-0.5 shrink-0", alerteColors[alerte.type])} />
                                                        <div>
                                                            <p className={cn(!alerte.lu && "font-medium")}>{alerte.message}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {new Date(alerte.timestamp).toLocaleString("fr-FR", {
                                                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Actions Rapides</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start text-sm">
                                            <Send className="h-4 w-4 mr-2" />
                                            Transmettre un dossier
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-sm">
                                            <Scale className="h-4 w-4 mr-2" />
                                            Créer un arbitrage
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-sm">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Agenda présidentiel
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Exporter la synthèse
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ── Arbitrages ────────────────────────────────────────────────── */}
                <TabsContent value="arbitrages">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Scale className="h-5 w-5 text-government-navy" />
                            Arbitrages Interministériels
                        </h2>

                        {mockArbitrages.map(arb => (
                            <Card key={arb.id} className="shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className={statutArbitrageColors[arb.statut]}>
                                                    {arb.statut.replace("_", " ")}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{arb.id}</span>
                                            </div>
                                            <h3 className="font-medium text-lg mb-2">{arb.sujet}</h3>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {arb.ministeres.map(m => (
                                                    <Badge key={m} variant="secondary" className="text-xs">
                                                        {m}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                                                <div>
                                                    <span className="font-medium">Rapporteur:</span>
                                                    <p>{arb.rapporteur}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Déposé le:</span>
                                                    <p>{new Date(arb.dateDepot).toLocaleDateString("fr-FR")}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-red-600 dark:text-red-400">Deadline:</span>
                                                    <p className="text-red-600 dark:text-red-400">
                                                        {new Date(arb.deadline).toLocaleDateString("fr-FR")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            Examiner
                                            <ArrowRight className="h-3 w-3 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Transmissions ─────────────────────────────────────────────── */}
                <TabsContent value="transmissions">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Inbox className="h-5 w-5 text-government-navy" />
                                    Flux de Transmission (7 derniers jours)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {mockTransmissions.map((jour, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <span className="text-sm font-medium">
                                                {new Date(jour.date).toLocaleDateString("fr-FR", {
                                                    weekday: "short", day: "numeric", month: "short"
                                                })}
                                            </span>
                                            <div className="flex items-center gap-6">
                                                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                                    <ArrowDownLeft className="h-3 w-3" />
                                                    {jour.entrant}
                                                </span>
                                                <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    {jour.sortant}
                                                </span>
                                                {jour.urgent > 0 && (
                                                    <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {jour.urgent}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalEntrant}</p>
                                        <p className="text-xs text-muted-foreground">Entrants</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSortant}</p>
                                        <p className="text-xs text-muted-foreground">Sortants</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalUrgent}</p>
                                        <p className="text-xs text-muted-foreground">Urgents</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-government-gold" />
                                    Prochaines Échéances
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">Arbitrage ARB-001</span>
                                            <Badge className="bg-red-500 text-white text-xs">5 jours</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Répartition budgétaire Éducation/Recherche</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Conseil des Ministres</span>
                                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">4 jours</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">8 dossiers à l'ordre du jour</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Arbitrage ARB-002</span>
                                            <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600">10 jours</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Compétences territoriales — Zones économiques</p>
                                    </div>
                                    <div className="p-3 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Rapports mensuels</span>
                                            <Badge variant="outline" className="text-xs">18 jours</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Deadline saisie Février 2026</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── Suivi des Ministères ──────────────────────────────────────── */}
                <TabsContent value="suivi">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-government-navy" />
                                Suivi des Ministères — Rapports Mensuels
                            </h2>
                            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                {completionRate}% validés
                            </Badge>
                        </div>

                        <div className="grid gap-3">
                            {mockStatsMinisteres
                                .sort((a, b) => b.rapportsEnRetard - a.rapportsEnRetard)
                                .map(ministere => {
                                    const progress = Math.round((ministere.rapportsValides / ministere.rapportsSoumis) * 100);
                                    return (
                                        <Card key={ministere.nom} className="shadow-sm">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-medium truncate">{ministere.nom}</h3>
                                                            {ministere.rapportsEnRetard > 0 && (
                                                                <Badge className="bg-red-500 text-white text-xs shrink-0">
                                                                    {ministere.rapportsEnRetard} retard
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {ministere.rapportsSoumis} soumis
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                {ministere.rapportsValides} validés
                                                            </span>
                                                            {ministere.rapportsEnRetard > 0 && (
                                                                <span className="flex items-center gap-1 text-red-500">
                                                                    <XCircle className="h-3 w-3" />
                                                                    {ministere.rapportsEnRetard} en retard
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="w-24 text-right">
                                                        <span className={cn(
                                                            "text-lg font-bold",
                                                            progress === 100 ? "text-green-600 dark:text-green-400" :
                                                                progress >= 80 ? "text-blue-600 dark:text-blue-400" :
                                                                    "text-orange-600 dark:text-orange-400"
                                                        )}>
                                                            {progress}%
                                                        </span>
                                                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                                            <div
                                                                className={cn(
                                                                    "h-1.5 rounded-full transition-all",
                                                                    progress === 100 ? "bg-green-500" :
                                                                        progress >= 80 ? "bg-blue-500" :
                                                                            "bg-orange-500"
                                                                )}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
