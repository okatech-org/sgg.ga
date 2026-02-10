/**
 * SGG Digital — Tutoriel Interactif Pas-à-Pas
 *
 * Overlay guidé au premier accès : spotlight sur les zones clés
 * avec bulles d'explication en français simple.
 * Persiste en localStorage pour ne s'afficher qu'une fois.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
    X,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    Search,
    LayoutDashboard,
    Menu,
    Bell,
    User,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Tutorial Steps ──────────────────────────────────────────────────────────

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    /** CSS selector to highlight, or null for center overlay */
    targetSelector: string | null;
    position: "top" | "bottom" | "left" | "right" | "center";
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: "welcome",
        title: "Bienvenue sur SGG Digital ! 🎉",
        description:
            "Ce petit guide va vous montrer les zones principales de l'interface. Cela ne prendra qu'une minute.",
        icon: Sparkles,
        targetSelector: null,
        position: "center",
    },
    {
        id: "sidebar",
        title: "Le menu de navigation",
        description:
            'À gauche, vous trouverez le menu principal. Il est organisé par thèmes (Pilotage, Processus, Données…). Cliquez sur un titre pour ouvrir ou fermer une section.',
        icon: Menu,
        targetSelector: '[data-tutorial="sidebar"]',
        position: "right",
    },
    {
        id: "search",
        title: "La barre de recherche",
        description:
            "Tapez n'importe quel mot pour trouver rapidement un module. Raccourci clavier : Ctrl + K (ou ⌘ + K sur Mac).",
        icon: Search,
        targetSelector: '[data-tutorial="search"]',
        position: "bottom",
    },
    {
        id: "notifications",
        title: "Les notifications",
        description:
            "La cloche vous alerte quand quelque chose nécessite votre attention : un rapport à valider, un dossier reçu, etc.",
        icon: Bell,
        targetSelector: '[data-tutorial="notifications"]',
        position: "bottom",
    },
    {
        id: "profile",
        title: "Votre profil",
        description:
            "Cliquez sur votre nom en haut à droite pour accéder à votre profil, vos paramètres et changer de thème (clair/sombre).",
        icon: User,
        targetSelector: '[data-tutorial="profile"]',
        position: "bottom",
    },
    {
        id: "dashboard",
        title: "Le tableau de bord",
        description:
            "C'est votre page d'accueil. Elle montre les actions prioritaires et les chiffres importants, adaptés à votre rôle.",
        icon: LayoutDashboard,
        targetSelector: '[data-tutorial="welcome-guide"]',
        position: "bottom",
    },
    {
        id: "help",
        title: "Besoin d'aide ?",
        description:
            'Le bouton "?" en bas à droite de l\'écran ouvre un mode d\'aide : survolez n\'importe quel élément pour comprendre ce qu\'il fait. Vous pouvez aussi refaire ce tutoriel depuis le menu Aide.',
        icon: HelpCircle,
        targetSelector: null,
        position: "center",
    },
];

const STORAGE_KEY = "sgg-tutorial-completed";

// ── Component ───────────────────────────────────────────────────────────────

export function InteractiveTutorial() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlight, setSpotlight] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only show once per user
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const updateSpotlight = useCallback(() => {
        const step = TUTORIAL_STEPS[currentStep];
        if (step.targetSelector) {
            const el = document.querySelector(step.targetSelector);
            if (el) {
                const rect = el.getBoundingClientRect();
                setSpotlight(rect);
                return;
            }
        }
        setSpotlight(null);
    }, [currentStep]);

    useEffect(() => {
        if (!isOpen) return;
        updateSpotlight();
        window.addEventListener("resize", updateSpotlight);
        return () => window.removeEventListener("resize", updateSpotlight);
    }, [isOpen, currentStep, updateSpotlight]);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep((s) => s - 1);
    };

    const handleComplete = () => {
        setIsOpen(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    const handleSkip = () => {
        setIsOpen(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    if (!isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const Icon = step.icon;
    const isLast = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirst = currentStep === 0;
    const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    // Calculate tooltip position
    const getTooltipStyle = (): React.CSSProperties => {
        if (!spotlight || step.position === "center") {
            return {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            };
        }

        const padding = 16;
        const tooltipWidth = 380;

        switch (step.position) {
            case "right":
                return {
                    top: Math.max(padding, spotlight.top),
                    left: spotlight.right + padding,
                    maxWidth: tooltipWidth,
                };
            case "bottom":
                return {
                    top: spotlight.bottom + padding,
                    left: Math.max(padding, Math.min(spotlight.left, window.innerWidth - tooltipWidth - padding)),
                    maxWidth: tooltipWidth,
                };
            case "left":
                return {
                    top: Math.max(padding, spotlight.top),
                    right: window.innerWidth - spotlight.left + padding,
                    maxWidth: tooltipWidth,
                };
            case "top":
                return {
                    bottom: window.innerHeight - spotlight.top + padding,
                    left: Math.max(padding, spotlight.left),
                    maxWidth: tooltipWidth,
                };
            default:
                return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop with spotlight cutout */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                <defs>
                    <mask id="tutorial-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {spotlight && (
                            <rect
                                x={spotlight.left - 8}
                                y={spotlight.top - 8}
                                width={spotlight.width + 16}
                                height={spotlight.height + 16}
                                rx={12}
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.6)"
                    mask="url(#tutorial-mask)"
                    style={{ pointerEvents: "all" }}
                    onClick={handleSkip}
                />
            </svg>

            {/* Spotlight border ring */}
            {spotlight && (
                <div
                    className="absolute border-2 border-government-gold rounded-xl pointer-events-none animate-pulse"
                    style={{
                        left: spotlight.left - 8,
                        top: spotlight.top - 8,
                        width: spotlight.width + 16,
                        height: spotlight.height + 16,
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="absolute z-10 animate-scale-in"
                style={getTooltipStyle()}
            >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border p-5 min-w-[300px] max-w-[400px]">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-government-gold/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-government-gold" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground font-sans">
                                    {step.title}
                                </h3>
                                <p className="text-[10px] text-muted-foreground">
                                    Étape {currentStep + 1} sur {TUTORIAL_STEPS.length}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 -mt-1 -mr-1"
                            onClick={handleSkip}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-sans">
                        {step.description}
                    </p>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-full bg-government-gold rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground"
                            onClick={handleSkip}
                        >
                            Passer le guide
                        </Button>
                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <Button variant="outline" size="sm" onClick={handlePrev}>
                                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                                    Précédent
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="bg-government-navy hover:bg-government-navy/90 text-white"
                                onClick={handleNext}
                            >
                                {isLast ? (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        Terminé !
                                    </>
                                ) : (
                                    <>
                                        Suivant
                                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

/** Re-trigger the tutorial (e.g. from Help menu) */
export function resetTutorial() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
}
