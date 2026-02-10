/**
 * SGG Digital — Barre de Progression "Premiers Pas"
 *
 * Checklist visible dans le dashboard montrant les étapes
 * d'onboarding à accomplir. Persiste dans localStorage.
 *
 * Adapté au rôle : un ministre a des étapes différentes d'un SG.
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Circle,
    Trophy,
    ArrowRight,
    X,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Step Definitions ────────────────────────────────────────────────────────

interface OnboardingStep {
    id: string;
    label: string;
    description: string;
    href?: string;
    /** Auto-complete when user visits this route */
    autoCompleteRoute?: string;
}

const commonSteps: OnboardingStep[] = [
    {
        id: "visit-dashboard",
        label: "Consulter votre tableau de bord",
        description: "Découvrez les chiffres et informations adaptés à votre rôle",
        href: "/dashboard",
        autoCompleteRoute: "/dashboard",
    },
    {
        id: "explore-profile",
        label: "Visiter votre profil",
        description: "Personnalisez vos préférences et paramètres",
        href: "/profil",
        autoCompleteRoute: "/profil",
    },
];

const roleSteps: Record<string, OnboardingStep[]> = {
    default: [
        {
            id: "use-search",
            label: "Utiliser la recherche",
            description: "Tapez Ctrl+K pour chercher un module rapidement",
        },
        {
            id: "explore-module",
            label: "Ouvrir un module",
            description: "Cliquez sur un élément du menu pour explorer une page",
        },
    ],
    ministre: [
        {
            id: "view-gar",
            label: "Consulter le suivi GAR",
            description: "Voyez les résultats de votre ministère",
            href: "/gar/app",
            autoCompleteRoute: "/gar",
        },
        {
            id: "view-nominations",
            label: "Voir les nominations",
            description: "Découvrez les postes en attente de nomination",
            href: "/nominations/app",
            autoCompleteRoute: "/nominations",
        },
    ],
    "sg-ministere": [
        {
            id: "try-saisie",
            label: "Accéder à la saisie mensuelle",
            description: "C'est là que vous remplissez le rapport chaque mois",
            href: "/matrice-reporting/saisie",
            autoCompleteRoute: "/matrice-reporting/saisie",
        },
        {
            id: "view-ptm",
            label: "Voir la matrice PTM",
            description: "Consultez le programme de travail de vos directions",
            href: "/ptm/matrice",
            autoCompleteRoute: "/ptm",
        },
    ],
    "sgg-admin": [
        {
            id: "view-users",
            label: "Gérer les utilisateurs",
            description: "Ajoutez ou modifiez les comptes de la plateforme",
            href: "/admin/users",
            autoCompleteRoute: "/admin",
        },
        {
            id: "view-audit",
            label: "Consulter le journal d'audit",
            description: "Voyez qui a fait quoi sur la plateforme",
            href: "/audit-log",
            autoCompleteRoute: "/audit-log",
        },
    ],
    "sgg-directeur": [
        {
            id: "view-validation",
            label: "Valider des rapports",
            description: "Les ministères ont soumis — vérifiez leurs données",
            href: "/matrice-reporting/validation",
            autoCompleteRoute: "/matrice-reporting/validation",
        },
        {
            id: "view-gar",
            label: "Consulter le suivi GAR",
            description: "Tableau de bord de l'exécution du PAG",
            href: "/gar/app",
            autoCompleteRoute: "/gar",
        },
    ],
    dgjo: [
        {
            id: "view-jo",
            label: "Voir le Journal Officiel",
            description: "Consultez les textes en attente de publication",
            href: "/journal-officiel/app",
            autoCompleteRoute: "/journal-officiel",
        },
    ],
    president: [
        {
            id: "view-consolidated",
            label: "Vue consolidée",
            description: "Tous les indicateurs nationaux sur une seule page",
            href: "/consolidated",
            autoCompleteRoute: "/consolidated",
        },
    ],
    sgpr: [
        {
            id: "view-sgpr",
            label: "Tableau SGPR",
            description: "Vue d'ensemble de l'activité de la Présidence",
            href: "/dashboard-sgpr",
            autoCompleteRoute: "/dashboard-sgpr",
        },
    ],
};

const STORAGE_KEY = "sgg-onboarding-progress";

// ── Component ───────────────────────────────────────────────────────────────

interface OnboardingProgressProps {
    roleId?: string;
}

export function OnboardingProgress({ roleId }: OnboardingProgressProps) {
    const navigate = useNavigate();
    const [dismissed, setDismissed] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    const steps = useMemo(() => {
        const specific = roleSteps[roleId || "default"] || roleSteps.default;
        return [...commonSteps, ...specific];
    }, [roleId]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCompletedSteps(parsed.completed || []);
                setDismissed(parsed.dismissed || false);
            } catch { }
        }
    }, []);

    // Auto-complete on route visit
    useEffect(() => {
        const path = window.location.pathname;
        const newCompleted = [...completedSteps];
        let changed = false;

        for (const step of steps) {
            if (step.autoCompleteRoute && path.startsWith(step.autoCompleteRoute) && !newCompleted.includes(step.id)) {
                newCompleted.push(step.id);
                changed = true;
            }
        }

        if (changed) {
            setCompletedSteps(newCompleted);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: newCompleted, dismissed }));
        }
    }, [steps]);

    const toggleStep = (stepId: string) => {
        const newCompleted = completedSteps.includes(stepId)
            ? completedSteps.filter((s) => s !== stepId)
            : [...completedSteps, stepId];
        setCompletedSteps(newCompleted);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: newCompleted, dismissed }));
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: completedSteps, dismissed: true }));
    };

    const completedCount = steps.filter((s) => completedSteps.includes(s.id)).length;
    const allDone = completedCount === steps.length;
    const progress = (completedCount / steps.length) * 100;

    if (dismissed || allDone) return null;

    return (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-background dark:from-blue-950/10 dark:to-background mb-4">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold text-sm text-foreground font-sans">
                            Premiers pas — {completedCount}/{steps.length} étapes
                        </h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground/40"
                        onClick={handleDismiss}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full mb-3 overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Steps */}
                <div className="space-y-1.5">
                    {steps.map((step) => {
                        const done = completedSteps.includes(step.id);
                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group",
                                    done ? "bg-muted/30" : "hover:bg-muted/50"
                                )}
                                onClick={() => {
                                    if (!done) toggleStep(step.id);
                                    if (step.href) navigate(step.href);
                                }}
                            >
                                <button
                                    className="shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStep(step.id);
                                    }}
                                >
                                    {done ? (
                                        <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />
                                    ) : (
                                        <Circle className="h-4.5 w-4.5 text-muted-foreground/30 group-hover:text-blue-400 transition-colors" />
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-xs font-medium",
                                        done && "line-through text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {step.description}
                                    </p>
                                </div>
                                {step.href && !done && (
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-blue-400 transition-colors shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
