/**
 * SGG Digital — Consolidation PTM
 * Page de consolidation hiérarchique des matrices PTM
 * SG Ministère consolide les directions → SGG consolide les ministères
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Layers,
    CheckCircle2,
    Send,
    XCircle,
    Calendar,
    Building2,
    ArrowRight,
    AlertTriangle,
    FileSpreadsheet,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { usePTMPermissions } from "@/hooks/usePTMPermissions";
import { DEADLINES_PTM } from "@/hooks/usePTMWorkflow";
import { InfoButton } from "@/components/reporting/InfoButton";
import { INITIATIVES_PTM, DIRECTIONS_PTM, MINISTERES_PTM } from "@/data/ptmData";
import {
    STATUT_PTM_LABELS,
    STATUT_PTM_COLORS,
    RUBRIQUE_SHORT_LABELS,
} from "@/types/ptm";
import type { StatutPTM } from "@/types/ptm";
import { toast } from "sonner";

// Niveau de consolidation et configurations
interface ConsolidationConfig {
    titre: string;
    sousTitre: string;
    statutRecu: StatutPTM[];
    statutConsolide: StatutPTM;
    statutTransmis: StatutPTM;
    statutRejete: StatutPTM;
    boutonConsolider: string;
    boutonTransmettre: string;
    destinataire: string;
    groupBy: "direction" | "ministere";
}

const CONSOLIDATION_SG: ConsolidationConfig = {
    titre: "Consolidation SG Ministère",
    sousTitre: "Consolidez les matrices reçues de vos directions et transmettez au SGG",
    statutRecu: ["soumis_sg"],
    statutConsolide: "consolide_sg",
    statutTransmis: "soumis_sgg",
    statutRejete: "rejete_sg",
    boutonConsolider: "Consolider les directions",
    boutonTransmettre: "Transmettre au SGG",
    destinataire: "Secrétaire Général du Gouvernement",
    groupBy: "direction",
};

const CONSOLIDATION_SGG: ConsolidationConfig = {
    titre: "Consolidation SGG",
    sousTitre: "Consolidez les matrices reçues des ministères et transmettez au PM",
    statutRecu: ["soumis_sgg"],
    statutConsolide: "consolide_sgg",
    statutTransmis: "soumis_pm",
    statutRejete: "rejete_sgg",
    boutonConsolider: "Consolider les ministères",
    boutonTransmettre: "Transmettre au PM",
    destinataire: "Chef du Gouvernement",
    groupBy: "ministere",
};

export default function PTMConsolidation() {
    const { demoUser } = useDemoUser();
    const permissions = usePTMPermissions();
    const [activeTab, setActiveTab] = useState<"reception" | "consolidation" | "transmis">("reception");

    // Determine user's consolidation level
    const config: ConsolidationConfig = useMemo(() => {
        if (permissions.niveau === "sgg") return CONSOLIDATION_SGG;
        return CONSOLIDATION_SG;
    }, [permissions.niveau]);

    // Deadline alert
    const deadlineDay = DEADLINES_PTM[permissions.niveau];
    const currentDay = new Date().getDate();
    const joursRestants = deadlineDay - currentDay;
    const showDeadlineAlert = joursRestants > 0 && joursRestants <= 7;
    const deadlinePassed = currentDay > deadlineDay;

    // Filter initiatives by status for this consolidation level
    const initiativesRecues = useMemo(
        () => INITIATIVES_PTM.filter((i) => config.statutRecu.includes(i.statut as StatutPTM)),
        [config]
    );

    const initiativesConsolidees = useMemo(
        () => INITIATIVES_PTM.filter((i) => i.statut === config.statutConsolide),
        [config]
    );

    const initiativesTransmises = useMemo(
        () => INITIATIVES_PTM.filter((i) => i.statut === config.statutTransmis),
        [config]
    );

    const initiativesRejetees = useMemo(
        () =>
            INITIATIVES_PTM.filter(
                (i) => i.statut === config.statutRejete
            ),
        [config]
    );

    // Group initiatives by direction or ministère
    const groupedRecues = useMemo(() => {
        const groups: Record<string, typeof initiativesRecues> = {};
        for (const init of initiativesRecues) {
            const key = config.groupBy === "direction"
                ? init.directionNom || "Sans direction"
                : init.ministereNom;
            if (!groups[key]) groups[key] = [];
            groups[key].push(init);
        }
        return groups;
    }, [initiativesRecues, config]);

    const handleConsolider = () => {
        toast.success(
            `${initiativesRecues.length} initiatives consolidées`,
            { description: `Les matrices ont été consolidées à votre niveau.` }
        );
    };

    const handleTransmettre = () => {
        toast.success(
            `Matrice consolidée transmise au ${config.destinataire}`,
            { description: `${initiativesConsolidees.length + initiativesRecues.length} initiatives transmises.` }
        );
    };

    const handleRejeter = (id: string, intitule: string) => {
        toast.error(
            `Initiative "${intitule.substring(0, 40)}..." renvoyée pour correction`,
            { description: `L'initiative a été rejetée et renvoyée au niveau inférieur.` }
        );
    };

    const totalInitiatives = INITIATIVES_PTM.length;
    const tauxReception = totalInitiatives > 0 ? Math.round((initiativesRecues.length / totalInitiatives) * 100) : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Deadline alert banner */}
                {(showDeadlineAlert || deadlinePassed) && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${deadlinePassed
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                            : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                        }`}>
                        <Calendar className={`h-5 w-5 flex-shrink-0 ${deadlinePassed ? 'text-red-600' : 'text-amber-600'
                            }`} />
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${deadlinePassed ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'
                                }`}>
                                {deadlinePassed
                                    ? `⚠️ Deadline dépassée — La consolidation devait être faite avant le ${deadlineDay} du mois`
                                    : `📅 Il vous reste ${joursRestants} jour${joursRestants > 1 ? 's' : ''} pour consolider et transmettre`
                                }
                            </p>
                            <p className={`text-xs mt-0.5 ${deadlinePassed ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                Vous devez consolider et transmettre avant le {deadlineDay} de chaque mois
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Layers className="h-6 w-6 text-government-gold" />
                            {config.titre}
                            <InfoButton pageId="ptm-consolidation" />
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {config.sousTitre}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {initiativesRecues.length > 0 && permissions.canConsolider() && (
                            <Button
                                onClick={handleConsolider}
                                variant="default"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Layers className="h-4 w-4 mr-2" />
                                {config.boutonConsolider}
                            </Button>
                        )}
                        {(initiativesConsolidees.length > 0 || initiativesRecues.length > 0) && permissions.canTransmettre() && (
                            <Button
                                onClick={handleTransmettre}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {config.boutonTransmettre}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Reçues</p>
                                    <p className="text-2xl font-bold">{initiativesRecues.length}</p>
                                    <p className="text-xs text-muted-foreground">À consolider</p>
                                </div>
                                <FileSpreadsheet className="h-8 w-8 text-blue-500 opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Consolidées</p>
                                    <p className="text-2xl font-bold">{initiativesConsolidees.length}</p>
                                    <p className="text-xs text-muted-foreground">Prêtes à transmettre</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Transmises</p>
                                    <p className="text-2xl font-bold">{initiativesTransmises.length}</p>
                                    <p className="text-xs text-muted-foreground">Envoyées au niveau supérieur</p>
                                </div>
                                <Send className="h-8 w-8 text-indigo-500 opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rejetées</p>
                                    <p className="text-2xl font-bold text-red-600">{initiativesRejetees.length}</p>
                                    <p className="text-xs text-muted-foreground">À corriger</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500 opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="reception">
                            📥 Reçues ({initiativesRecues.length})
                        </TabsTrigger>
                        <TabsTrigger value="consolidation">
                            📋 Consolidées ({initiativesConsolidees.length})
                        </TabsTrigger>
                        <TabsTrigger value="transmis">
                            📤 Transmises ({initiativesTransmises.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Initiatives reçues, groupées par direction/ministère */}
                    <TabsContent value="reception" className="space-y-6">
                        {Object.keys(groupedRecues).length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">Aucune initiative en attente</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Toutes les initiatives ont été consolidées ou il n'y a pas encore de transmission.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            Object.entries(groupedRecues).map(([groupName, initiatives]) => (
                                <Card key={groupName}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-5 w-5 text-government-gold" />
                                                <CardTitle className="text-lg">{groupName}</CardTitle>
                                                <Badge variant="secondary" className="text-xs">
                                                    {initiatives.length} initiative{initiatives.length > 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="divide-y">
                                            {initiatives.map((init) => (
                                                <div key={init.id} className="py-3 flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-[10px] flex-shrink-0">
                                                                {RUBRIQUE_SHORT_LABELS[init.rubrique] || init.rubrique}
                                                            </Badge>
                                                            <span className="text-sm font-medium truncate">{init.intitule}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {init.observations?.substring(0, 80) || "Pas d'observations"}
                                                            {init.observations && init.observations.length > 80 ? "..." : ""}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Badge className={`text-[10px] ${STATUT_PTM_COLORS[init.statut as StatutPTM] || ''}`}>
                                                            {STATUT_PTM_LABELS[init.statut as StatutPTM] || init.statut}
                                                        </Badge>
                                                        {permissions.canRejeter() && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRejeter(init.id, init.intitule)}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Tab 2: Initiatives consolidées */}
                    <TabsContent value="consolidation" className="space-y-4">
                        {initiativesConsolidees.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">Aucune initiative consolidée</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Consolidez les initiatives reçues en cliquant sur "{config.boutonConsolider}".
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Initiatives consolidées — Prêtes à transmettre
                                        </CardTitle>
                                        <Button
                                            onClick={handleTransmettre}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {config.boutonTransmettre}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y">
                                        {initiativesConsolidees.map((init) => (
                                            <div key={init.id} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {RUBRIQUE_SHORT_LABELS[init.rubrique] || init.rubrique}
                                                        </Badge>
                                                        <span className="text-sm font-medium truncate">{init.intitule}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {init.ministereNom} {init.directionNom ? `• ${init.directionNom}` : ""}
                                                    </p>
                                                </div>
                                                <Badge className={`text-[10px] ${STATUT_PTM_COLORS[init.statut as StatutPTM] || ''}`}>
                                                    {STATUT_PTM_LABELS[init.statut as StatutPTM] || init.statut}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab 3: Initiatives transmises */}
                    <TabsContent value="transmis" className="space-y-4">
                        {initiativesTransmises.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">Aucune transmission effectuée</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Les initiatives consolidées apparaîtront ici après transmission.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Send className="h-5 w-5 text-indigo-500" />
                                        Transmises au {config.destinataire}
                                    </CardTitle>
                                    <CardDescription>
                                        {initiativesTransmises.length} initiative{initiativesTransmises.length > 1 ? "s" : ""} transmise{initiativesTransmises.length > 1 ? "s" : ""}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y">
                                        {initiativesTransmises.map((init) => (
                                            <div key={init.id} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {RUBRIQUE_SHORT_LABELS[init.rubrique] || init.rubrique}
                                                        </Badge>
                                                        <span className="text-sm font-medium truncate">{init.intitule}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {init.ministereNom} {init.directionNom ? `• ${init.directionNom}` : ""}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`text-[10px] ${STATUT_PTM_COLORS[init.statut as StatutPTM] || ''}`}>
                                                        {STATUT_PTM_LABELS[init.statut as StatutPTM] || init.statut}
                                                    </Badge>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
