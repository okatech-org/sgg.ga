/**
 * SGG Digital — Page Formation & Guides
 * Centre de formation avec guides existants + vidéos interactives par rôle.
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Video,
    FileText,
    HelpCircle,
    Download,
    ExternalLink,
    GraduationCap,
    Clock,
    Users,
    CheckCircle2,
    PlayCircle,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { VideoGuidesPanel } from "@/components/onboarding/VideoGuidesAndMore";

interface GuideItem {
    title: string;
    description: string;
    duration: string;
    level: "Débutant" | "Intermédiaire" | "Avancé";
    type: "guide" | "video" | "pdf";
    module: string;
}

const guides: GuideItem[] = [
    {
        title: "Premiers pas sur SGG Digital",
        description: "Découvrez l'interface, la navigation et les fonctionnalités de base de la plateforme.",
        duration: "15 min",
        level: "Débutant",
        type: "guide",
        module: "Général",
    },
    {
        title: "Saisie des rapports GAR mensuels",
        description: "Apprenez à remplir et soumettre vos rapports de Gestion Axée sur les Résultats.",
        duration: "20 min",
        level: "Intermédiaire",
        type: "video",
        module: "GAR",
    },
    {
        title: "Workflow de validation",
        description: "Comprendre le processus de validation en 3 étapes : Ministère → SGG → SGPR.",
        duration: "10 min",
        level: "Intermédiaire",
        type: "guide",
        module: "Reporting",
    },
    {
        title: "Guide du Journal Officiel",
        description: "Publication, recherche et consultation des textes officiels de la République.",
        duration: "12 min",
        level: "Débutant",
        type: "pdf",
        module: "Journal Officiel",
    },
    {
        title: "Gestion des nominations",
        description: "Circuit complet d'une nomination : soumission, instruction, signature.",
        duration: "25 min",
        level: "Avancé",
        type: "video",
        module: "Nominations",
    },
    {
        title: "Administration des utilisateurs",
        description: "Gestion des comptes, rôles et permissions pour les administrateurs SGG.",
        duration: "18 min",
        level: "Avancé",
        type: "guide",
        module: "Admin",
    },
];

const levelColors: Record<string, string> = {
    "Débutant": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Intermédiaire": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    "Avancé": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const typeIcons: Record<string, React.ElementType> = {
    guide: BookOpen,
    video: Video,
    pdf: FileText,
};

export default function Formation() {
    const { demoUser } = useDemoUser();
    const roleId = demoUser?.id;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-government-navy/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-government-navy" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Formation & Guides</h1>
                        <p className="text-sm text-muted-foreground">
                            Ressources de formation pour maîtriser la plateforme SGG Digital
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{guides.length}</p>
                            <p className="text-xs text-muted-foreground">Guides écrits</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <PlayCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">9</p>
                            <p className="text-xs text-muted-foreground">Vidéos de démonstration</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">4</p>
                            <p className="text-xs text-muted-foreground">Modules couverts</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">3</p>
                            <p className="text-xs text-muted-foreground">Niveaux de difficulté</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Vidéos de Démonstration (par rôle) ───────────────────────── */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <VideoGuidesPanel roleId={roleId} />
                </CardContent>
            </Card>

            {/* ─── Guides écrits ────────────────────────────────────────────── */}
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Guides écrits & PDF
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {guides.map((guide, index) => {
                    const TypeIcon = typeIcons[guide.type] || BookOpen;

                    return (
                        <Card key={index} className="hover:shadow-md transition-shadow duration-200 group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-government-navy/10 flex items-center justify-center group-hover:bg-government-navy/20 transition-colors">
                                        <TypeIcon className="h-5 w-5 text-government-navy" />
                                    </div>
                                    <Badge className={levelColors[guide.level]} variant="secondary">
                                        {guide.level}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base mt-3">{guide.title}</CardTitle>
                                <CardDescription className="text-sm">{guide.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {guide.duration}
                                        </span>
                                        <Badge variant="outline" className="text-[10px]">
                                            {guide.module}
                                        </Badge>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-government-navy">
                                        {guide.type === "pdf" ? (
                                            <Download className="h-4 w-4" />
                                        ) : (
                                            <ExternalLink className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Section aide supplémentaire */}
            <Card className="border-dashed">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-government-gold/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-6 w-6 text-government-gold" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h3 className="font-semibold">Besoin d'aide supplémentaire ?</h3>
                        <p className="text-sm text-muted-foreground">
                            Contactez l'équipe support SGG pour une assistance personnalisée ou une session de formation dédiée.
                        </p>
                    </div>
                    <Button variant="outline" className="border-government-gold text-government-gold hover:bg-government-gold/10">
                        Contacter le support
                    </Button>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
