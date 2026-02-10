/**
 * SGG Digital — Mode "Qu'est-ce que c'est ?" (Help Mode)
 *
 * Bouton flottant en bas à droite qui active un mode d'aide :
 * - Change le curseur pour signaler le mode
 * - Active les descriptions détaillées au survol
 * - Panneau d'aide contextuel
 *
 * + Notifications contextuelles basées sur le rôle (rappels proactifs)
 */

import { useState, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    HelpCircle,
    X,
    BookOpen,
    RotateCcw,
    Lightbulb,
    MessageCircle,
    PlayCircle,
    GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resetTutorial } from "./InteractiveTutorial";

// ── Help Mode Context ───────────────────────────────────────────────────────

interface HelpModeContextValue {
    helpModeActive: boolean;
    toggleHelpMode: () => void;
}

const HelpModeContext = createContext<HelpModeContextValue>({
    helpModeActive: false,
    toggleHelpMode: () => { },
});

export function useHelpMode() {
    return useContext(HelpModeContext);
}

export function HelpModeProvider({ children }: { children: React.ReactNode }) {
    const [helpModeActive, setHelpModeActive] = useState(false);

    const toggleHelpMode = useCallback(() => {
        setHelpModeActive((v) => !v);
    }, []);

    return (
        <HelpModeContext.Provider value={{ helpModeActive, toggleHelpMode }}>
            {helpModeActive && (
                <style>{`
          body { cursor: help !important; }
          [data-help]:hover {
            outline: 2px dashed hsl(217 98% 60%) !important;
            outline-offset: 4px !important;
          }
        `}</style>
            )}
            {children}
        </HelpModeContext.Provider>
    );
}

// ── Floating Help Button ────────────────────────────────────────────────────

interface ContextualNotification {
    id: string;
    icon: React.ElementType;
    title: string;
    message: string;
    type: "reminder" | "tip" | "alert";
}

interface FloatingHelpButtonProps {
    roleId?: string;
}

export function FloatingHelpButton({ roleId }: FloatingHelpButtonProps) {
    const { helpModeActive, toggleHelpMode } = useHelpMode();
    const [panelOpen, setPanelOpen] = useState(false);
    const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);

    // Role-based contextual notifications
    const notifications: ContextualNotification[] = getContextualNotifications(roleId);
    const activeNotifs = notifications.filter((n) => !dismissedNotifs.includes(n.id));

    return createPortal(
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                {/* Help panel */}
                {panelOpen && (
                    <div className="w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
                        {/* Panel header */}
                        <div className="bg-government-navy text-white p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm font-sans flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Centre d'aide
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                                    onClick={() => setPanelOpen(false)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <p className="text-xs text-white/60 mt-1">
                                Outils pour mieux comprendre la plateforme
                            </p>
                        </div>

                        {/* Panel content */}
                        <div className="p-3 space-y-2">
                            {/* Active notifications */}
                            {activeNotifs.length > 0 && (
                                <div className="space-y-1.5 mb-3">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold px-1">
                                        Rappels pour vous
                                    </p>
                                    {activeNotifs.map((notif) => {
                                        const NIcon = notif.icon;
                                        return (
                                            <div
                                                key={notif.id}
                                                className={cn(
                                                    "flex items-start gap-2.5 p-2.5 rounded-lg border text-xs",
                                                    notif.type === "reminder" && "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
                                                    notif.type === "tip" && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
                                                    notif.type === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                                                )}
                                            >
                                                <NIcon className={cn(
                                                    "h-4 w-4 shrink-0 mt-0.5",
                                                    notif.type === "reminder" && "text-amber-500",
                                                    notif.type === "tip" && "text-blue-500",
                                                    notif.type === "alert" && "text-red-500"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground">{notif.title}</p>
                                                    <p className="text-muted-foreground leading-relaxed mt-0.5">{notif.message}</p>
                                                </div>
                                                <button
                                                    className="shrink-0 text-muted-foreground/40 hover:text-foreground"
                                                    onClick={() => setDismissedNotifs([...dismissedNotifs, notif.id])}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Help actions */}
                            <button
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => {
                                    toggleHelpMode();
                                    setPanelOpen(false);
                                }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                                    <HelpCircle className="h-4 w-4 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">
                                        {helpModeActive ? "Désactiver le mode aide" : "Activer le mode aide"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Survolez les éléments pour voir des explications
                                    </p>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => {
                                    setPanelOpen(false);
                                    resetTutorial();
                                }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                                    <RotateCcw className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">Refaire le tutoriel</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Relancer le guide pas-à-pas
                                    </p>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => {
                                    setPanelOpen(false);
                                    window.open("/aide", "_self");
                                }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">Glossaire des termes</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {">"}35 termes techniques expliqués simplement
                                    </p>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => {
                                    setPanelOpen(false);
                                    window.open("/formation", "_self");
                                }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                                    <PlayCircle className="h-4 w-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">Vidéos de formation</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Apprenez avec des démonstrations courtes
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* FAB Button */}
                <div className="relative">
                    {activeNotifs.length > 0 && !panelOpen && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-status-danger z-10">
                            {activeNotifs.length}
                        </Badge>
                    )}
                    <Button
                        size="icon"
                        className={cn(
                            "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
                            helpModeActive
                                ? "bg-purple-500 hover:bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-900"
                                : panelOpen
                                    ? "bg-government-navy text-white"
                                    : "bg-government-navy hover:bg-government-navy/90 text-white hover:shadow-xl hover:scale-105"
                        )}
                        onClick={() => setPanelOpen(!panelOpen)}
                    >
                        {panelOpen ? (
                            <X className="h-5 w-5" />
                        ) : helpModeActive ? (
                            <HelpCircle className="h-5 w-5 animate-pulse" />
                        ) : (
                            <MessageCircle className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </>,
        document.body
    );
}

// ── Contextual Notifications by Role ────────────────────────────────────────

function getContextualNotifications(roleId?: string): ContextualNotification[] {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const notifications: ContextualNotification[] = [];

    // Common tips
    notifications.push({
        id: "tip-search",
        icon: Lightbulb,
        title: "Raccourci pratique",
        message: "Appuyez sur Ctrl+K (ou ⌘+K) pour ouvrir la recherche rapide à tout moment.",
        type: "tip",
    });

    // Role-specific
    switch (roleId) {
        case "sg-ministere":
        case "sg-ministere-fp":
            if (dayOfMonth >= 20) {
                notifications.unshift({
                    id: "reminder-deadline",
                    icon: Lightbulb,
                    title: `⏰ Échéance proche`,
                    message: `Il vous reste ${28 - dayOfMonth} jours pour soumettre le rapport m ensuel. Accédez à Saisie Mensuelle.`,
                    type: "reminder",
                });
            }
            notifications.push({
                id: "tip-consolidation",
                icon: Lightbulb,
                title: "N'oubliez pas",
                message: "Vérifiez que toutes vos directions ont bien rempli leur PTM avant de consolider.",
                type: "tip",
            });
            break;

        case "sgg-directeur":
            notifications.unshift({
                id: "reminder-validation",
                icon: Lightbulb,
                title: "Rapports à valider",
                message: "Des ministères ont soumis des rapports qui attendent votre validation.",
                type: "reminder",
            });
            break;

        case "dgjo":
            notifications.unshift({
                id: "reminder-publish",
                icon: Lightbulb,
                title: "Textes en attente",
                message: "Des textes signés attendent d'être publiés au Journal Officiel sous 48h.",
                type: "alert",
            });
            break;

        case "ministre":
            notifications.push({
                id: "tip-nominations",
                icon: Lightbulb,
                title: "Nominations",
                message: "Vous pouvez proposer des nominations pour les postes vacants de votre département.",
                type: "tip",
            });
            break;

        case "sgg-admin":
            notifications.push({
                id: "tip-security",
                icon: Lightbulb,
                title: "Sécurité",
                message: "Pensez à vérifier le journal d'audit régulièrement pour détecter les accès inhabituels.",
                type: "tip",
            });
            break;
    }

    return notifications;
}
