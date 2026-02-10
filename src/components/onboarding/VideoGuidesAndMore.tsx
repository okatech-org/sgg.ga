/**
 * SGG Digital — Vidéos de Démonstration
 *
 * Composant de guides vidéo par rôle.
 * Simule des vidéos de formation intégrées.
 * En production, les URLs pointent vers des vidéos hébergées.
 *
 * + Support multilingue étendu (termes-clés en langues gabonaises)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    PlayCircle,
    Clock,
    ChevronRight,
    Monitor,
    FileText,
    BarChart3,
    Users,
    BookOpen,
    Shield,
    Upload,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface VideoGuide {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: React.ElementType;
    color: string;
    category: string;
    forRoles: string[];
}

// ── Video Library ───────────────────────────────────────────────────────────

const VIDEO_GUIDES: VideoGuide[] = [
    {
        id: "intro-platform",
        title: "Découvrir SGG Digital",
        description: "Tour complet de la plateforme en 2 minutes : navigation, recherche, profil.",
        duration: "2:00",
        icon: Monitor,
        color: "bg-blue-500",
        category: "Premiers pas",
        forRoles: ["all"],
    },
    {
        id: "saisie-gar",
        title: "Comment saisir un rapport mensuel",
        description: "Pas à pas : ouvrir la matrice, remplir les indicateurs, valider et soumettre.",
        duration: "3:30",
        icon: FileText,
        color: "bg-emerald-500",
        category: "Reporting",
        forRoles: ["sg-ministere", "sg-ministere-fp", "sgg-directeur", "sgg-admin"],
    },
    {
        id: "consolider-ptm",
        title: "Consolider les PTM des directions",
        description: "Rassembler les programmes de travail de vos directions en un seul document.",
        duration: "2:45",
        icon: BarChart3,
        color: "bg-amber-500",
        category: "Reporting",
        forRoles: ["sg-ministere", "sg-ministere-fp", "sgg-directeur"],
    },
    {
        id: "proposer-texte",
        title: "Proposer un texte de loi",
        description: "Du brouillon à la soumission : rédiger, joindre les annexes, et envoyer au SGG.",
        duration: "4:00",
        icon: FileText,
        color: "bg-violet-500",
        category: "Processus",
        forRoles: ["ministre", "sg-ministere"],
    },
    {
        id: "nominations",
        title: "Gérer les nominations",
        description: "Proposer un candidat, suivre le statut, valider ou rejeter une nomination.",
        duration: "2:15",
        icon: Users,
        color: "bg-orange-500",
        category: "Processus",
        forRoles: ["ministre", "president", "vice-president", "premier-ministre"],
    },
    {
        id: "journal-officiel",
        title: "Publier au Journal Officiel",
        description: "Ajouter un texte signé, préparer une édition, et publier officiellement.",
        duration: "3:00",
        icon: BookOpen,
        color: "bg-indigo-500",
        category: "DGJO",
        forRoles: ["dgjo"],
    },
    {
        id: "validation-rapports",
        title: "Valider les rapports des ministères",
        description: "Vérifier la cohérence des données soumises et approuver ou demander des corrections.",
        duration: "2:30",
        icon: Shield,
        color: "bg-green-500",
        category: "Validation",
        forRoles: ["sgg-directeur", "sgpr"],
    },
    {
        id: "admin-users",
        title: "Gérer les utilisateurs",
        description: "Créer un compte, attribuer un rôle, activer/désactiver un accès.",
        duration: "3:15",
        icon: Users,
        color: "bg-red-500",
        category: "Administration",
        forRoles: ["sgg-admin"],
    },
    {
        id: "recherche-jo",
        title: "Rechercher un texte officiel",
        description: "Utiliser la recherche avancée pour trouver une loi, un décret ou un arrêté.",
        duration: "1:30",
        icon: BookOpen,
        color: "bg-teal-500",
        category: "Public",
        forRoles: ["citoyen", "professionnel-droit", "all"],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

interface VideoGuidesPanelProps {
    roleId?: string;
}

export function VideoGuidesPanel({ roleId }: VideoGuidesPanelProps) {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    // Filter videos relevant to the current role
    const relevantVideos = VIDEO_GUIDES.filter(
        (v) => v.forRoles.includes("all") || v.forRoles.includes(roleId || "")
    );

    const categories = [...new Set(relevantVideos.map((v) => v.category))];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-government-gold" />
                <h2 className="text-lg font-bold font-sans">Guides vidéo</h2>
                <Badge variant="outline" className="text-xs">
                    {relevantVideos.length} vidéos pour votre rôle
                </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
                Courtes démonstrations pour apprendre à utiliser chaque fonctionnalité.
            </p>

            {/* Video player modal */}
            {selectedVideo && (
                <Card className="border-2 border-government-gold overflow-hidden">
                    <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                        {/* Simulated video player */}
                        <div className="text-center text-white space-y-3">
                            <PlayCircle className="h-16 w-16 mx-auto text-white/60" />
                            <p className="text-sm font-medium">
                                {VIDEO_GUIDES.find((v) => v.id === selectedVideo)?.title}
                            </p>
                            <p className="text-xs text-white/40">
                                Vidéo de démonstration — En cours de production
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-white/60 hover:text-white"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Video list by category */}
            {categories.map((cat) => (
                <div key={cat}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {cat}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {relevantVideos
                            .filter((v) => v.category === cat)
                            .map((video) => {
                                const Icon = video.icon;
                                return (
                                    <Card
                                        key={video.id}
                                        className="group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                                        onClick={() => setSelectedVideo(video.id)}
                                    >
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className={cn(
                                                "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white",
                                                video.color,
                                            )}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-semibold text-foreground truncate font-sans">
                                                    {video.title}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground line-clamp-1">
                                                    {video.description}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
                                                    <span className="text-[9px] text-muted-foreground/50">{video.duration}</span>
                                                </div>
                                            </div>
                                            <PlayCircle className="h-5 w-5 text-muted-foreground/20 group-hover:text-government-gold transition-colors shrink-0" />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
}


// ── Multilingual Key Terms ──────────────────────────────────────────────────
/**
 * Termes-clés en langues gabonaises pour améliorer la compréhension.
 * Ces traductions sont indicatives et servant de pont culturel.
 */

export const MULTILINGUAL_TERMS: Record<string, {
    fr: string;
    fang: string;
    punu: string;
    myene: string;
}> = {
    bienvenue: {
        fr: "Bienvenue",
        fang: "Mbolo",
        punu: "Mbote",
        myene: "Mbolo",
    },
    gouvernement: {
        fr: "Gouvernement",
        fang: "Nnam",
        punu: "Biyala",
        myene: "Enanga",
    },
    loi: {
        fr: "Loi",
        fang: "Nsem",
        punu: "Mwiri",
        myene: "Omyene",
    },
    citoyen: {
        fr: "Citoyen",
        fang: "Mot a ening",
        punu: "Muntu wa ditsina",
        myene: "Ombwiri",
    },
    rapport: {
        fr: "Rapport",
        fang: "Nkobe",
        punu: "Ntsongi",
        myene: "Etanda",
    },
    decision: {
        fr: "Décision",
        fang: "Abe'e",
        punu: "Busambu",
        myene: "Orangu",
    },
};


// ── Co-Navigation Indicator ─────────────────────────────────────────────────
/**
 * Indicateur de co-navigation : montre quand un administrateur
 * est en train de guider un utilisateur à distance.
 * Ceci est le composant côté utilisateur.
 */

interface CoNavIndicatorProps {
    isActive: boolean;
    adminName?: string;
    onDisconnect?: () => void;
}

export function CoNavIndicator({ isActive, adminName = "Admin SGG", onDisconnect }: CoNavIndicatorProps) {
    if (!isActive) return null;

    return (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
            <div className="flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium">
                    {adminName} vous guide en direct
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
                    onClick={onDisconnect}
                >
                    Terminer
                </Button>
            </div>
        </div>
    );
}
