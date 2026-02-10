/**
 * SGG Digital — Guide d'Accueil Contextuel
 *
 * Composant d'onboarding pour utilisateurs novices.
 * Affiche un message de bienvenue personnalisé et 3 à 5 actions
 * guidées selon le rôle de l'utilisateur, avec :
 *   - Titre humain ("Bonjour, M. le Ministre")
 *   - Description du rôle en une phrase simple
 *   - Actions prioritaires sous forme de cartes larges avec descriptions
 *   - Progression "premiers pas" optionnelle
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LucideIcon,
    ArrowRight,
    X,
    Sparkles,
    CheckCircle2,
    BarChart3,
    Users,
    FileText,
    FileEdit,
    Scale,
    BookOpen,
    Crown,
    Shield,
    Upload,
    ClipboardCheck,
    Settings,
    GraduationCap,
    Globe,
    CalendarClock,
    Wallet,
    Target,
    ShieldCheck,
    Activity,
    Gavel,
    FolderOpen,
    Building2,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoCategory } from "@/hooks/useDemoUser";

// ── Types ────────────────────────────────────────────────────────────────────

interface GuidedAction {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string;
    priority: "primary" | "secondary";
}

interface RoleGuide {
    greeting: string;
    roleExplanation: string;
    whatYouCanDo: string;
    actions: GuidedAction[];
    tips: string[];
}

// ── Role-specific configurations ────────────────────────────────────────────

const roleGuides: Record<string, RoleGuide> = {
    president: {
        greeting: "Excellence, bienvenue",
        roleExplanation: "Vous êtes le destinataire final de tous les dossiers du gouvernement. Cette plateforme vous permet de suivre l'avancement des politiques publiques en temps réel.",
        whatYouCanDo: "Depuis ce tableau de bord, vous pouvez :",
        actions: [
            { title: "Voir l'exécution du PAG", description: "Suivez l'avancement de chaque programme du Plan d'Action Gouvernemental 2026", icon: BarChart3, href: "/gar/app", color: "bg-blue-500", priority: "primary" },
            { title: "Nominations à valider", description: "5 propositions de nominations sont en attente de votre approbation", icon: Users, href: "/nominations/app", color: "bg-amber-500", priority: "primary" },
            { title: "Décisions récentes", description: "Consultez l'historique des décisions prises en Conseil des ministres", icon: Crown, href: "/decisions", color: "bg-violet-500", priority: "secondary" },
            { title: "Vue consolidée", description: "Un résumé de tous les indicateurs nationaux sur une seule page", icon: Target, href: "/consolidated", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: [
            "💡 Utilisez la barre de recherche (Ctrl+K) pour accéder rapidement à n'importe quel module",
            "📊 Les données sont actualisées quotidiennement par les ministères",
        ],
    },

    "vice-president": {
        greeting: "Excellence, bienvenue",
        roleExplanation: "En tant que Vice-Président, vous suivez les mêmes indicateurs que le Président et pouvez présider le Conseil des ministres.",
        whatYouCanDo: "Vos actions principales :",
        actions: [
            { title: "Suivi du PAG 2026", description: "Performance globale des programmes gouvernementaux", icon: BarChart3, href: "/gar/app", color: "bg-blue-500", priority: "primary" },
            { title: "Prochains Conseils", description: "Agenda et ordre du jour des Conseils des ministres à venir", icon: CalendarClock, href: "/reunions", color: "bg-amber-500", priority: "primary" },
            { title: "Nominations", description: "Propositions de nominations en attente de validation", icon: Users, href: "/nominations/app", color: "bg-violet-500", priority: "secondary" },
        ],
        tips: ["💡 Cliquez sur les sections du menu à gauche pour les ouvrir ou les fermer"],
    },

    "premier-ministre": {
        greeting: "Monsieur le Vice-Président du Gouvernement, bienvenue",
        roleExplanation: "Vous coordonnez l'action de tous les ministères. Ici, vous suivez l'exécution du PAG, préparez les Conseils des ministres et arbitrez entre les départements.",
        whatYouCanDo: "Vos missions sur la plateforme :",
        actions: [
            { title: "Coordination interministérielle", description: "Suivez les indicateurs de chaque ministère et identifiez les retards", icon: BarChart3, href: "/gar/app", color: "bg-blue-500", priority: "primary" },
            { title: "Préparer un Conseil", description: "Consultez l'ordre du jour et les dossiers du prochain Conseil des ministres", icon: CalendarClock, href: "/reunions", color: "bg-amber-500", priority: "primary" },
            { title: "Budget national", description: "État d'exécution du budget par ministère", icon: Wallet, href: "/budget", color: "bg-emerald-500", priority: "secondary" },
            { title: "Nominations", description: "Valider les propositions de nominations ministérielles", icon: Users, href: "/nominations/app", color: "bg-violet-500", priority: "secondary" },
        ],
        tips: [
            "💡 Le menu 'Pilotage' contient tous les indicateurs de performance gouvernementale",
            "📋 Le menu 'Reporting' permet de voir quels ministères ont soumis leurs rapports",
        ],
    },

    ministre: {
        greeting: "Monsieur le Ministre, bienvenue",
        roleExplanation: "Cette plateforme vous permet de soumettre vos propositions de textes et nominations, et de suivre les résultats de votre département ministériel.",
        whatYouCanDo: "Ce que vous pouvez faire ici :",
        actions: [
            { title: "Proposer un texte de loi", description: "Rédigez et soumettez un projet de loi, décret ou arrêté pour examen", icon: FileText, href: "/cycle-legislatif/app", color: "bg-blue-500", priority: "primary" },
            { title: "Proposer une nomination", description: "Suggérez un candidat pour un poste dans votre département", icon: Users, href: "/nominations/app", color: "bg-amber-500", priority: "primary" },
            { title: "Voir les rapports GAR", description: "Consultez les résultats de votre ministère dans le Plan d'Action Gouvernemental", icon: BarChart3, href: "/gar/app", color: "bg-emerald-500", priority: "secondary" },
            { title: "Matrice de reporting", description: "Tableau de suivi des indicateurs de votre département", icon: ClipboardCheck, href: "/matrice-reporting", color: "bg-violet-500", priority: "secondary" },
        ],
        tips: [
            "💡 Votre Secrétaire Général saisit les rapports mensuels pour vous",
            "📧 Vous serez notifié quand un dossier nécessite votre attention",
        ],
    },

    "sg-ministere": {
        greeting: "Bienvenue",
        roleExplanation: "En tant que Secrétaire Général, vous êtes l'interface opérationnelle du ministère. Vous saisissez les rapports mensuels, consolidez les données de vos directions et transmettez au SGG.",
        whatYouCanDo: "Vos tâches principales ce mois-ci :",
        actions: [
            { title: "📝 Saisir le rapport mensuel", description: "Remplissez les indicateurs GAR de votre ministère pour ce mois — c'est votre action principale", icon: FileEdit, href: "/matrice-reporting/saisie", color: "bg-blue-500", priority: "primary" },
            { title: "Consolider les PTM", description: "Rassemblez les programmes de travail de vos directions et transmettez au SGG", icon: ClipboardCheck, href: "/ptm/consolidation", color: "bg-amber-500", priority: "primary" },
            { title: "Suivre les nominations", description: "Voir le statut des nominations proposées par votre ministère", icon: Users, href: "/nominations/app", color: "bg-emerald-500", priority: "secondary" },
            { title: "Documents officiels", description: "Accédez aux textes et documents partagés avec votre ministère", icon: FolderOpen, href: "/documents/app", color: "bg-violet-500", priority: "secondary" },
        ],
        tips: [
            "⏰ Les rapports doivent être soumis avant le 28 de chaque mois",
            "✅ Une fois soumis, votre rapport sera validé par le SGG puis le SGPR",
            "💡 Utilisez 'Suivi de complétude' pour voir si votre ministère a bien tout soumis",
        ],
    },

    sgpr: {
        greeting: "Bienvenue, Secrétaire Général",
        roleExplanation: "En tant que SGPR, vous coordonnez la transmission des dossiers à la Présidence. Vous validez les matrices de reporting au plus haut niveau.",
        whatYouCanDo: "Vos actions prioritaires :",
        actions: [
            { title: "Valider les rapports", description: "Les matrices de reporting validées par le SGG sont prêtes pour votre approbation", icon: ShieldCheck, href: "/matrice-reporting/validation-sgpr", color: "bg-blue-500", priority: "primary" },
            { title: "Dossiers pour le Président", description: "Préparez et transmettez les dossiers au cabinet présidentiel", icon: Crown, href: "/consolidated", color: "bg-amber-500", priority: "primary" },
            { title: "Arbitrages en cours", description: "Dossiers nécessitant un arbitrage présidentiel", icon: Scale, href: "/decisions", color: "bg-violet-500", priority: "secondary" },
            { title: "Tableau SGPR", description: "Vue d'ensemble de l'activité de votre secrétariat", icon: Shield, href: "/dashboard-sgpr", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: [
            "💡 Les rapports viennent du SGG après une première validation",
            "📊 Le 'Tableau SGPR' donne une vue synthétique de toute l'activité",
        ],
    },

    "sgg-admin": {
        greeting: "Administrateur, bienvenue",
        roleExplanation: "Vous avez accès à tous les modules de la plateforme. Vous gérez les utilisateurs, les permissions et la configuration technique du système.",
        whatYouCanDo: "Tableau de contrôle :",
        actions: [
            { title: "Gérer les utilisateurs", description: "Créer des comptes, attribuer des rôles, activer/désactiver des accès", icon: Users, href: "/admin/users", color: "bg-blue-500", priority: "primary" },
            { title: "Monitoring système", description: "Santé de la plateforme, performances, alertes de sécurité", icon: Activity, href: "/admin", color: "bg-amber-500", priority: "primary" },
            { title: "Journal d'audit", description: "Qui a fait quoi et quand — traçabilité complète des actions", icon: Shield, href: "/audit-log", color: "bg-emerald-500", priority: "secondary" },
            { title: "Permissions", description: "Configurer qui peut voir et modifier quoi", icon: Settings, href: "/admin/permissions", color: "bg-violet-500", priority: "secondary" },
        ],
        tips: [
            "🔒 Toute action des utilisateurs est tracée dans le journal d'audit",
            "💡 Le menu 'Administration' en bas du sidebar contient tous vos outils",
        ],
    },

    "sgg-directeur": {
        greeting: "Bienvenue, Directeur",
        roleExplanation: "Vous validez les rapports soumis par les ministères et consolidez les PTM au niveau du SGG. Vous avez une vue d'ensemble de l'activité gouvernementale.",
        whatYouCanDo: "Actions prioritaires :",
        actions: [
            { title: "Valider les rapports SGG", description: "Les ministères ont soumis leurs rapports — vérifiez et validez-les", icon: CheckCircle2, href: "/matrice-reporting/validation", color: "bg-blue-500", priority: "primary" },
            { title: "Consolidation PTM", description: "Rassemblez les PTM de tous les ministères", icon: ClipboardCheck, href: "/ptm/consolidation", color: "bg-amber-500", priority: "primary" },
            { title: "Suivi GAR", description: "Tableau de bord de l'exécution du PAG 2026", icon: BarChart3, href: "/gar/app", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: [
            "💡 'Suivi de complétude' montre quels ministères n'ont pas encore soumis",
        ],
    },

    assemblee: {
        greeting: "Bienvenue, Honorable Député",
        roleExplanation: "Depuis cette interface, vous suivez les projets de loi transmis par le gouvernement et leur progression dans le cycle législatif.",
        whatYouCanDo: "Vous pouvez :",
        actions: [
            { title: "Projets de loi en cours", description: "Voir les textes transmis par le SGG et leur état d'avancement", icon: Scale, href: "/cycle-legislatif/app", color: "bg-blue-500", priority: "primary" },
            { title: "Journal Officiel", description: "Consulter les lois déjà promulguées et publiées", icon: BookOpen, href: "/journal-officiel/app", color: "bg-amber-500", priority: "secondary" },
        ],
        tips: ["💡 Les textes apparaissent ici quand ils sont transmis par le SGG"],
    },

    senat: {
        greeting: "Bienvenue, Sénateur",
        roleExplanation: "Le Sénat examine les textes en seconde lecture. Vous pouvez suivre les projets de loi et consulter le Journal Officiel.",
        whatYouCanDo: "Vous pouvez :",
        actions: [
            { title: "Textes en seconde lecture", description: "Projets de loi adoptés par l'Assemblée et transmis au Sénat", icon: Scale, href: "/cycle-legislatif/app", color: "bg-blue-500", priority: "primary" },
            { title: "Journal Officiel", description: "Textes officiels publiés", icon: BookOpen, href: "/journal-officiel/app", color: "bg-amber-500", priority: "secondary" },
        ],
        tips: [],
    },

    "conseil-etat": {
        greeting: "Bienvenue, Conseiller d'État",
        roleExplanation: "Le Conseil d'État émet des avis consultatifs sur les projets de textes. Vous pouvez consulter les textes soumis pour avis.",
        whatYouCanDo: "Vos actions :",
        actions: [
            { title: "Textes soumis pour avis", description: "Le gouvernement a transmis des projets nécessitant votre avis juridique", icon: Gavel, href: "/cycle-legislatif/app", color: "bg-blue-500", priority: "primary" },
            { title: "Journal Officiel", description: "Textes promulgués et publiés", icon: BookOpen, href: "/journal-officiel/app", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: ["💡 Votre avis est consultatif mais il est enregistré dans l'historique du texte"],
    },

    "cour-constitutionnelle": {
        greeting: "Bienvenue, Juge Constitutionnel",
        roleExplanation: "La Cour Constitutionnelle contrôle la constitutionnalité des lois. Vous consultez les textes soumis à votre contrôle.",
        whatYouCanDo: "Vous pouvez :",
        actions: [
            { title: "Contrôle de constitutionnalité", description: "Textes soumis pour vérification de conformité à la Constitution", icon: ShieldCheck, href: "/cycle-legislatif/app", color: "bg-blue-500", priority: "primary" },
            { title: "Journal Officiel", description: "Textes officiels publiés", icon: BookOpen, href: "/journal-officiel/app", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: [],
    },

    dgjo: {
        greeting: "Bienvenue, Directeur",
        roleExplanation: "En tant que Directeur du Journal Officiel, vous publiez les textes signés par le Président. Vous êtes le dernier maillon de la chaîne normative.",
        whatYouCanDo: "Vos tâches :",
        actions: [
            { title: "📰 Publier un texte", description: "Des textes signés sont en attente de publication au Journal Officiel", icon: Upload, href: "/journal-officiel/app", color: "bg-blue-500", priority: "primary" },
            { title: "Préparer une édition", description: "Créer une nouvelle édition du Journal Officiel", icon: BookOpen, href: "/journal-officiel/app", color: "bg-amber-500", priority: "primary" },
            { title: "Archives", description: "Consulter les éditions précédentes et textes consolidés", icon: FolderOpen, href: "/archives", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: [
            "⏰ Les textes signés doivent être publiés dans un délai de 48h",
            "💡 Le statut 'À publier' indique les textes en attente",
        ],
    },

    citoyen: {
        greeting: "Bienvenue, citoyen",
        roleExplanation: "Le Journal Officiel est le document où sont publiées toutes les lois et décisions du gouvernement. Vous pouvez le consulter librement.",
        whatYouCanDo: "Ce que vous pouvez consulter :",
        actions: [
            { title: "📖 Lire le Journal Officiel", description: "Consultez les lois, décrets et arrêtés de la République Gabonaise", icon: BookOpen, href: "/journal-officiel/app", color: "bg-blue-500", priority: "primary" },
            { title: "Rechercher un texte", description: "Trouvez un texte de loi par mot-clé, date ou numéro", icon: Globe, href: "/journal-officiel/app", color: "bg-emerald-500", priority: "secondary" },
        ],
        tips: [
            "💡 Tous les textes publiés sont en accès libre et gratuit",
            "🔍 Utilisez la barre de recherche pour trouver un texte précis",
        ],
    },

    "professionnel-droit": {
        greeting: "Bienvenue, Maître",
        roleExplanation: "En tant que professionnel du droit (avocat, notaire, juriste), vous avez accès à une recherche avancée dans les textes officiels et aux documents publics.",
        whatYouCanDo: "Vos outils :",
        actions: [
            { title: "Recherche avancée", description: "Cherchez dans tous les textes publiés avec filtres par type, date, domaine", icon: BookOpen, href: "/journal-officiel/app", color: "bg-blue-500", priority: "primary" },
            { title: "Documents publics", description: "Accédez aux documents accessibles au public", icon: FileText, href: "/documents/app", color: "bg-amber-500", priority: "secondary" },
        ],
        tips: [
            "💡 La recherche full-text fonctionne dans le contenu de chaque texte",
        ],
    },
};

// Fallback for unknown roles
const defaultGuide: RoleGuide = {
    greeting: "Bienvenue",
    roleExplanation: "Vous avez accès à la plateforme SGG Digital. Explorez les modules disponibles dans le menu à gauche.",
    whatYouCanDo: "Actions disponibles :",
    actions: [
        { title: "Explorer le tableau de bord", description: "Vue d'ensemble de l'activité gouvernementale", icon: BarChart3, href: "/dashboard", color: "bg-blue-500", priority: "primary" },
        { title: "Centre de formation", description: "Apprenez à utiliser la plateforme avec nos guides", icon: GraduationCap, href: "/formation", color: "bg-amber-500", priority: "secondary" },
        { title: "Aide", description: "Questions fréquentes et assistance", icon: HelpCircle, href: "/aide", color: "bg-emerald-500", priority: "secondary" },
    ],
    tips: ["💡 Utilisez Ctrl+K pour rechercher n'importe quel module rapidement"],
};

// ── Component ────────────────────────────────────────────────────────────────

interface WelcomeGuideProps {
    roleId?: string;
    category?: DemoCategory | null;
    userName?: string;
    institution?: string;
}

export function WelcomeGuide({
    roleId,
    category,
    userName,
    institution,
}: WelcomeGuideProps) {
    const navigate = useNavigate();
    const [dismissed, setDismissed] = useState(false);

    // Check sessionStorage for permanent dismissal
    const guide = roleId ? (roleGuides[roleId] || defaultGuide) : defaultGuide;

    if (dismissed) return null;

    const primaryActions = guide.actions.filter((a) => a.priority === "primary");
    const secondaryActions = guide.actions.filter((a) => a.priority === "secondary");

    return (
        <div className="mb-6 space-y-4">
            {/* Welcome Card */}
            <Card className="border-l-4 border-l-government-gold bg-gradient-to-r from-amber-50/80 to-background dark:from-amber-950/10 dark:to-background shadow-lg overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-government-gold" />
                                <h2 className="text-lg font-bold text-foreground">
                                    {guide.greeting}
                                    {userName ? `, ${userName}` : ""}
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                {guide.roleExplanation}
                            </p>
                            {institution && (
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    <span className="text-xs text-muted-foreground/70">{institution}</span>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 -mt-1 -mr-1 text-muted-foreground/40 hover:text-muted-foreground"
                            onClick={() => setDismissed(true)}
                            title="Masquer le guide"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action Cards */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-government-gold" />
                    {guide.whatYouCanDo}
                </h3>

                {/* Primary Actions — large, prominent */}
                <div className={cn(
                    "grid gap-3 mb-3",
                    primaryActions.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 sm:grid-cols-2"
                )}>
                    {primaryActions.map((action) => (
                        <ActionCard
                            key={action.href + action.title}
                            action={action}
                            variant="primary"
                            onClick={() => navigate(action.href)}
                        />
                    ))}
                </div>

                {/* Secondary Actions — smaller */}
                {secondaryActions.length > 0 && (
                    <div className={cn(
                        "grid gap-2",
                        secondaryActions.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
                    )}>
                        {secondaryActions.map((action) => (
                            <ActionCard
                                key={action.href + action.title}
                                action={action}
                                variant="secondary"
                                onClick={() => navigate(action.href)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Tips */}
            {guide.tips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {guide.tips.map((tip, i) => (
                        <Badge
                            key={i}
                            variant="outline"
                            className="text-xs py-1.5 px-3 font-normal text-muted-foreground bg-muted/30"
                        >
                            {tip}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Action Card ──────────────────────────────────────────────────────────────

function ActionCard({
    action,
    variant,
    onClick,
}: {
    action: GuidedAction;
    variant: "primary" | "secondary";
    onClick: () => void;
}) {
    const Icon = action.icon;

    if (variant === "primary") {
        return (
            <Card
                className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-2 hover:border-government-gold/40"
                onClick={onClick}
            >
                <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn(
                        "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md",
                        action.color,
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-government-navy transition-colors">
                            {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                            {action.description}
                        </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-government-gold group-hover:translate-x-1 transition-all shrink-0" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className="group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-muted-foreground/20"
            onClick={onClick}
        >
            <CardContent className="p-3 flex items-center gap-3">
                <div className={cn(
                    "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm",
                    action.color,
                )}>
                    <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs text-foreground truncate">
                        {action.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                        {action.description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
