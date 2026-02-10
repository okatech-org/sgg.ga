/**
 * SGG Digital — Carte de Workflow Visuelle
 *
 * Schéma interactif montrant le circuit d'un texte ou d'un rapport
 * dans le processus gouvernemental. Chaque étape est cliquable
 * et montre l'état actuel (à faire, en cours, terminé).
 *
 * 2 workflows : Processus Normatif (texte de loi) et Reporting GAR
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Circle,
    FileText,
    BarChart3,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────

type StepStatus = "done" | "current" | "upcoming";

interface WorkflowStep {
    id: string;
    label: string;
    actor: string;
    description: string;
    status: StepStatus;
}

interface WorkflowDef {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
    steps: WorkflowStep[];
}

// ── Workflow Definitions ────────────────────────────────────────────────────

const WORKFLOWS: WorkflowDef[] = [
    {
        id: "normative",
        title: "Circuit d'un texte de loi",
        icon: FileText,
        description: "De la rédaction à la publication au Journal Officiel",
        steps: [
            {
                id: "redaction",
                label: "Rédaction du projet",
                actor: "Ministère concerné",
                description: "Le ministre ou son cabinet rédige le projet de texte (loi, décret, ou arrêté)",
                status: "done",
            },
            {
                id: "transmission-sgg",
                label: "Transmission au SGG",
                actor: "SG du Ministère",
                description: "Le Secrétaire Général du ministère transmet le texte au SGG pour examen",
                status: "done",
            },
            {
                id: "examen-sgg",
                label: "Examen juridique",
                actor: "SGG",
                description: "Le SGG vérifie la conformité juridique et la cohérence avec les textes existants",
                status: "current",
            },
            {
                id: "conseil-etat",
                label: "Avis du Conseil d'État",
                actor: "Conseil d'État",
                description: "Pour les projets de loi, le Conseil d'État donne son avis consultatif",
                status: "upcoming",
            },
            {
                id: "conseil-ministres",
                label: "Conseil des Ministres",
                actor: "Président de la République",
                description: "Le texte est présenté en Conseil des Ministres pour adoption",
                status: "upcoming",
            },
            {
                id: "assemblee",
                label: "Vote à l'Assemblée",
                actor: "Assemblée Nationale",
                description: "Les députés examinent et votent le projet de loi",
                status: "upcoming",
            },
            {
                id: "senat",
                label: "Vote au Sénat",
                actor: "Sénat",
                description: "Les sénateurs examinent en seconde lecture",
                status: "upcoming",
            },
            {
                id: "promulgation",
                label: "Promulgation",
                actor: "Président de la République",
                description: "Le Président signe et valide officiellement la loi",
                status: "upcoming",
            },
            {
                id: "publication",
                label: "Publication au JO",
                actor: "DGJO",
                description: "Le texte est publié au Journal Officiel — il devient applicable",
                status: "upcoming",
            },
        ],
    },
    {
        id: "reporting",
        title: "Circuit du reporting mensuel",
        icon: BarChart3,
        description: "De la saisie par les directions à la validation SGPR",
        steps: [
            {
                id: "saisie-direction",
                label: "Saisie par les directions",
                actor: "Directeurs",
                description: "Chaque direction remplit sa partie de la matrice PTM avec ses indicateurs",
                status: "done",
            },
            {
                id: "consolidation-sg",
                label: "Consolidation par le SG",
                actor: "SG du Ministère",
                description: "Le Secrétaire Général rassemble les données de toutes ses directions",
                status: "done",
            },
            {
                id: "transmission-sgg",
                label: "Transmission au SGG",
                actor: "SG du Ministère",
                description: "Le rapport consolidé est envoyé au SGG avant le 28 du mois",
                status: "current",
            },
            {
                id: "validation-sgg",
                label: "Validation SGG",
                actor: "Directeur SGG",
                description: "Le SGG vérifie la cohérence et valide les données",
                status: "upcoming",
            },
            {
                id: "validation-sgpr",
                label: "Validation SGPR",
                actor: "SGPR",
                description: "Le SGPR approuve les matrices validées par le SGG",
                status: "upcoming",
            },
            {
                id: "rapport-president",
                label: "Rapport au Président",
                actor: "SGPR",
                description: "Le SGPR transmet la synthèse au cabinet présidentiel",
                status: "upcoming",
            },
        ],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export function WorkflowMap() {
    const [openWorkflow, setOpenWorkflow] = useState<string>("normative");
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {/* Workflow selector */}
            <div className="flex items-center gap-2">
                {WORKFLOWS.map((wf) => {
                    const Icon = wf.icon;
                    return (
                        <Button
                            key={wf.id}
                            variant={openWorkflow === wf.id ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                openWorkflow === wf.id && "bg-government-navy hover:bg-government-navy/90 text-white"
                            )}
                            onClick={() => setOpenWorkflow(wf.id)}
                        >
                            <Icon className="h-4 w-4 mr-1.5" />
                            {wf.title}
                        </Button>
                    );
                })}
            </div>

            {/* Active Workflow */}
            {WORKFLOWS.filter((w) => w.id === openWorkflow).map((workflow) => {
                const doneCount = workflow.steps.filter((s) => s.status === "done").length;
                const currentIdx = workflow.steps.findIndex((s) => s.status === "current");

                return (
                    <Card key={workflow.id} className="shadow-gov overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base font-sans">
                                    <workflow.icon className="h-5 w-5 text-government-gold" />
                                    {workflow.title}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    Étape {currentIdx + 1} / {workflow.steps.length}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{workflow.description}</p>

                            {/* Progress bar */}
                            <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-government-green rounded-full transition-all duration-500"
                                    style={{
                                        width: `${((doneCount + 0.5) / workflow.steps.length) * 100}%`,
                                    }}
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />

                                {/* Steps */}
                                <div className="space-y-0.5">
                                    {workflow.steps.map((step, idx) => {
                                        const isExpanded = expandedStep === step.id;
                                        const statusConfig = {
                                            done: {
                                                icon: CheckCircle2,
                                                color: "text-green-500",
                                                bg: "bg-green-50 dark:bg-green-950/20",
                                                label: "Terminé",
                                            },
                                            current: {
                                                icon: Clock,
                                                color: "text-blue-500",
                                                bg: "bg-blue-50 dark:bg-blue-950/20",
                                                label: "En cours",
                                            },
                                            upcoming: {
                                                icon: Circle,
                                                color: "text-muted-foreground/30",
                                                bg: "",
                                                label: "À venir",
                                            },
                                        }[step.status];

                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <div key={step.id}>
                                                <div
                                                    className={cn(
                                                        "relative flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors",
                                                        statusConfig.bg,
                                                        step.status === "upcoming" && "opacity-60 hover:opacity-80",
                                                        step.status !== "upcoming" && "hover:bg-muted/50"
                                                    )}
                                                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                                >
                                                    {/* Status icon */}
                                                    <div className={cn("relative z-10 shrink-0 mt-0.5", statusConfig.color)}>
                                                        <StatusIcon className={cn(
                                                            "h-[18px] w-[18px]",
                                                            step.status === "current" && "animate-pulse"
                                                        )} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={cn(
                                                                "text-sm font-medium font-sans",
                                                                step.status === "done" && "text-green-700 dark:text-green-400",
                                                                step.status === "current" && "text-blue-700 dark:text-blue-400"
                                                            )}>
                                                                {step.label}
                                                            </h4>
                                                            {step.status === "current" && (
                                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] dark:bg-blue-900/40 dark:text-blue-300">
                                                                    En cours
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {step.actor}
                                                        </p>
                                                    </div>

                                                    {/* Expand toggler */}
                                                    <div className="shrink-0 mt-0.5">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded description */}
                                                {isExpanded && (
                                                    <div className="ml-10 mt-1 mb-2 p-3 rounded-lg bg-muted/30 border-l-2 border-l-government-gold">
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Arrow connector */}
                                                {idx < workflow.steps.length - 1 && (
                                                    <div className="flex justify-center -my-0.5">
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground/20 rotate-90" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
