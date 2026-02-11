/**
 * SGG Digital — Formation & Guides Institutionnels
 * Version interactive, visuelle et intuitive.
 * Navigation par modules, schémas de processus, progression pas-à-pas.
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDemoUser } from "@/hooks/useDemoUser";
import {
    BookOpen, HelpCircle, GraduationCap, Clock, Users, CheckCircle2,
    ChevronLeft, ChevronRight, Target, Shield, AlertTriangle,
    Building2, Scale, Newspaper, BarChart3, Briefcase, ListChecks,
    Landmark, Eye, Send, Search, ArrowRight, Info, Lightbulb,
    ChevronDown, Star, Crown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProcessStep {
    numero: number;
    titre: string;
    acteur: string;
    description: string;
    delai?: string;
    icon: string;
}

interface GuideModule {
    id: string;
    titre: string;
    sousTitre: string;
    icon: React.ElementType;
    couleur: string;
    bgCouleur: string;
    borderCouleur: string;
    accentGradient: string;
    niveau: "Débutant" | "Intermédiaire" | "Avancé";
    duree: string;
    resume: string;
    objectif: string;
    pourquoi: string;
    baseLegale?: string;
    acteursPrincipaux: { nom: string; role: string }[];
    etapes: ProcessStep[];
    aRetenir: string[];
    bonnesPratiques: string[];
}

// ─── Mapping rôle utilisateur → mots-clés acteurs dans les guides ────────────

const ROLE_ACTOR_KEYWORDS: Record<string, string[]> = {
    // ─── Présidence ───
    president: ["Président", "Chef de l'État", "Présidence", "Cabinet du Président"],
    "vice-president": ["VP République", "Vice-Président", "VP", "Présidence"],
    // ─── Gouvernement ───
    "premier-ministre": ["Premier Ministre", "VPG", "Gouvernement", "PM"],
    ministre: ["Ministère", "Ministre"],
    // ─── SGG ───
    "sgg-admin": ["SGG", "Admin SGG", "Secrétaire Général", "Admin SGG Digital"],
    "sgg-directeur": ["SGG", "Dir.", "Direction"],
    // ─── Institutions ───
    sgpr: ["SGPR", "Cabinet présidentiel"],
    dgjo: ["DGJO", "Diffusion", "Composition", "Journal Officiel"],
    "conseil-etat": ["Conseil d'État"],
    "cour-constitutionnelle": ["Cour Constitutionnelle"],
    assemblee: ["Assemblée", "Parlement"],
    senat: ["Sénat", "Parlement"],
    // ─── Ministères ───
    "sg-ministere": ["SG Ministère", "SG du Ministère", "SG de chaque ministère", "Point focal", "Points focaux", "Ministère"],
    "sg-ministere-fp": ["SG Ministère", "SG du Ministère", "SG de chaque ministère", "Point focal", "Points focaux", "Ministère"],
    // ─── Public ───
    citoyen: ["Citoyen", "Public", "Grand public"],
    "professionnel-droit": ["Citoyen", "Public", "Juriste", "Professionnel"],
};

function isStepForUser(acteur: string, userId: string): boolean {
    const keywords = ROLE_ACTOR_KEYWORDS[userId];
    if (!keywords) return false;
    return keywords.some(kw => acteur.toLowerCase().includes(kw.toLowerCase()));
}

function getUserRoleInGuide(guide: GuideModule, userId: string): string | null {
    const actor = guide.acteursPrincipaux.find(a =>
        isStepForUser(a.nom, userId) || isStepForUser(a.role, userId)
    );
    return actor ? `${actor.nom} — ${actor.role}` : null;
}

// ─── Données ─────────────────────────────────────────────────────────────────

const modules: GuideModule[] = [
    {
        id: "nominations",
        titre: "Nominations",
        sousTitre: "Hautes fonctions de l'État",
        icon: Briefcase,
        couleur: "text-blue-600 dark:text-blue-400",
        bgCouleur: "bg-blue-50 dark:bg-blue-950/30",
        borderCouleur: "border-blue-200 dark:border-blue-800",
        accentGradient: "from-blue-500 to-blue-700",
        niveau: "Avancé",
        duree: "30 min",
        resume: "Comment une personne est nommée à un poste important dans l'État ? Ce guide vous explique tout le parcours, du dépôt de candidature jusqu'à la publication officielle.",
        objectif: "Comprendre chaque étape du circuit de nomination : qui fait quoi, dans quel ordre, et en combien de temps.",
        pourquoi: "Nommer quelqu'un à un poste de l'État est un acte officiel du Président de la République. Le SGG vérifie que chaque dossier est complet et conforme avant de le présenter. Un dossier bien préparé = un processus rapide.",
        baseLegale: "Constitution, Art. 20 — Décret portant attributions du SGG",
        acteursPrincipaux: [
            { nom: "Ministère proposant", role: "Prépare et propose le candidat" },
            { nom: "Direction des Nominations (SGG)", role: "Vérifie et instruit le dossier" },
            { nom: "Secrétaire Général du Gouv.", role: "Donne son avis sur le dossier" },
            { nom: "SGPR", role: "Inscrit à l'ordre du jour du Conseil" },
            { nom: "Président de la République", role: "Signe le décret de nomination" },
            { nom: "Vice-Président", role: "Peut suppléer le Président au Conseil" },
            { nom: "Premier Ministre", role: "Contresigne le décret de nomination" },
        ],
        etapes: [
            { numero: 1, titre: "Proposition", acteur: "Ministère", description: "Le ministère prépare le dossier du candidat (CV, diplômes, casier judiciaire) et l'envoie au SGG.", delai: "Variable", icon: "📋" },
            { numero: 2, titre: "Enregistrement", acteur: "Courrier SGG", description: "Le dossier reçoit un numéro de suivi. Un accusé de réception est envoyé au ministère.", delai: "24h", icon: "📥" },
            { numero: 3, titre: "Vérification", acteur: "Dir. Nominations", description: "Le dossier est-il complet ? Le candidat remplit-il les conditions ? Si non, retour au ministère.", delai: "3 jours", icon: "🔍" },
            { numero: 4, titre: "Analyse", acteur: "Conseiller juridique", description: "Examen approfondi : le profil correspond-il au poste ? Y a-t-il des incompatibilités ?", delai: "5 jours", icon: "⚖️" },
            { numero: 5, titre: "Avis du SGG", acteur: "Secrétaire Général", description: "Le SGG donne son avis : favorable, avec réserves, ou défavorable. Si OK, le dossier passe au SGPR.", delai: "2 jours", icon: "✅" },
            { numero: 6, titre: "Transmission SGPR", acteur: "Présidence", description: "Le SGPR reçoit le dossier et l'inscrit à l'ordre du jour du prochain Conseil des Ministres.", delai: "Variable", icon: "🏛️" },
            { numero: 7, titre: "Conseil des Ministres", acteur: "Président", description: "Le Président signe le décret de nomination. Il est contresigné par le Premier Ministre.", delai: "Jour du CM", icon: "🖊️" },
            { numero: 8, titre: "Publication JO", acteur: "DGJO", description: "Le décret est publié au Journal Officiel. La nomination prend effet officiellement.", delai: "7 jours", icon: "📰" },
        ],
        aRetenir: [
            "Un dossier complet dès le départ évite les allers-retours et accélère le processus.",
            "Certains postes nécessitent un avis supplémentaire (Conseil d'État, CNE).",
            "Les nominations d'urgence peuvent suivre un circuit accéléré.",
            "Tous les dossiers sont archivés numériquement pendant 10 ans.",
        ],
        bonnesPratiques: [
            "Vérifiez la complétude du dossier AVANT l'envoi au SGG.",
            "Soumettez le dossier au moins 3 semaines avant le Conseil des Ministres visé.",
            "Suivez l'avancement en temps réel dans le module Nominations de SGG Digital.",
        ],
    },
    {
        id: "gar",
        titre: "Suivi GAR / PAT",
        sousTitre: "Performance gouvernementale",
        icon: BarChart3,
        couleur: "text-emerald-600 dark:text-emerald-400",
        bgCouleur: "bg-emerald-50 dark:bg-emerald-950/30",
        borderCouleur: "border-emerald-200 dark:border-emerald-800",
        accentGradient: "from-emerald-500 to-emerald-700",
        niveau: "Intermédiaire",
        duree: "25 min",
        resume: "Comment l'État mesure-t-il si chaque ministère fait bien son travail ? La GAR (Gestion Axée sur les Résultats) est l'outil de suivi. Ce guide vous apprend à l'utiliser.",
        objectif: "Savoir saisir les rapports mensuels de performance et comprendre comment les données sont utilisées.",
        pourquoi: "Sans données fiables, le Président et le Premier Ministre ne peuvent pas savoir quels ministères avancent et lesquels ont besoin d'aide. La GAR permet un pilotage objectif.",
        baseLegale: "Lettre de cadrage présidentielle — Circulaire PM sur le reporting mensuel",
        acteursPrincipaux: [
            { nom: "Point focal GAR", role: "Collecte et saisit les données du ministère" },
            { nom: "SG du Ministère", role: "Valide les données avant envoi" },
            { nom: "Direction Suivi GAR (SGG)", role: "Consolide les rapports nationaux" },
            { nom: "SGG", role: "Transmet le rapport au SGPR" },
            { nom: "SGPR / Présidence", role: "Utilise les données pour les décisions" },
            { nom: "Premier Ministre", role: "Supervise l'exécution du PAG" },
        ],
        etapes: [
            { numero: 1, titre: "Planification", acteur: "Ministère", description: "En janvier, chaque ministère définit ses objectifs annuels et les indicateurs pour les mesurer.", delai: "Janvier", icon: "📊" },
            { numero: 2, titre: "Collecte mensuelle", acteur: "Point focal", description: "Chaque mois, le point focal collecte les chiffres : projets livrés, budgets utilisés, avancement.", delai: "25-28 du mois", icon: "📝" },
            { numero: 3, titre: "Saisie numérique", acteur: "Point focal", description: "Les données sont entrées dans SGG Digital. Le système calcule automatiquement les scores.", delai: "28-30 du mois", icon: "💻" },
            { numero: 4, titre: "Validation", acteur: "SG Ministère", description: "Le Secrétaire Général vérifie les chiffres et ajoute des commentaires sur les écarts.", delai: "1er-3 du mois+1", icon: "✅" },
            { numero: 5, titre: "Consolidation", acteur: "SGG", description: "Le SGG réunit tous les rapports en un seul tableau de bord national avec un score global.", delai: "3-5 du mois+1", icon: "📈" },
            { numero: 6, titre: "Rapport présidentiel", acteur: "SGG → SGPR", description: "Le rapport final est envoyé au Président avec les recommandations du SGG.", delai: "5-7 du mois+1", icon: "🏛️" },
        ],
        aRetenir: [
            "Le score global PAT = moyenne des performances de tous les ministères.",
            "Un ministère sous 50% reçoit un accompagnement renforcé.",
            "Les indicateurs ODD sont intégrés au reporting GAR.",
            "Un rapport trimestriel est présenté en Conseil des Ministres.",
        ],
        bonnesPratiques: [
            "Ne pas attendre la fin du mois : saisir les données au fil de l'eau.",
            "Documenter systématiquement les écarts avec des plans d'action.",
            "Désigner un point focal GAR formé et dédié à cette tâche.",
        ],
    },
    {
        id: "journal-officiel",
        titre: "Journal Officiel",
        sousTitre: "Publication des textes de loi",
        icon: Newspaper,
        couleur: "text-amber-600 dark:text-amber-400",
        bgCouleur: "bg-amber-50 dark:bg-amber-950/30",
        borderCouleur: "border-amber-200 dark:border-amber-800",
        accentGradient: "from-amber-500 to-amber-700",
        niveau: "Débutant",
        duree: "15 min",
        resume: "Le Journal Officiel publie toutes les lois et décrets du pays. Sans publication au JO, un texte n'a pas de valeur juridique. Découvrez comment ça fonctionne.",
        objectif: "Comprendre la chaîne de publication et savoir rechercher un texte dans les archives.",
        pourquoi: "Aucune loi ne s'applique tant qu'elle n'est pas publiée au JO. C'est la garantie que chaque citoyen peut connaître les règles qui s'appliquent à lui.",
        baseLegale: "Loi organique sur le Journal Officiel — Constitution (promulgation des lois)",
        acteursPrincipaux: [
            { nom: "Présidence", role: "Signe les décrets et lois avant publication" },
            { nom: "DGJO", role: "Gère la publication du Journal Officiel" },
            { nom: "Service Composition", role: "Met en forme les textes officiels" },
            { nom: "Service Diffusion", role: "Imprime et publie en ligne" },
            { nom: "SGG", role: "Transmet les textes signés à publier" },
            { nom: "Citoyens / Public", role: "Consultent les textes publiés" },
        ],
        etapes: [
            { numero: 1, titre: "Signature", acteur: "Présidence", description: "Le Président signe le décret ou promulgue la loi. Le texte signé est transmis au SGG pour publication au JO.", delai: "Variable", icon: "🖊️" },
            { numero: 2, titre: "Réception", acteur: "DGJO", description: "Les textes signés arrivent du SGG. Chaque texte reçoit un numéro JO unique.", delai: "À réception", icon: "📥" },
            { numero: 3, titre: "Mise en forme", acteur: "Composition", description: "Le texte est mis en page selon les normes du JO : en-tête officiel, numérotation, classement par rubrique.", delai: "2 jours", icon: "📐" },
            { numero: 4, titre: "Relecture", acteur: "Directeur DGJO", description: "Vérification finale : le texte publié est-il identique au texte signé ? Seules les corrections de typo sont permises.", delai: "1 jour", icon: "🔍" },
            { numero: 5, titre: "Publication", acteur: "Diffusion", description: "L'édition est imprimée et mise en ligne sur SGG Digital. Elle porte un numéro et une date.", delai: "Selon calendrier", icon: "📰" },
            { numero: 6, titre: "Archivage", acteur: "Archives", description: "Archivage physique et numérique. Indexation par type, date, ministère, mot-clé pour faciliter la recherche.", delai: "Continu", icon: "🗄️" },
        ],
        aRetenir: [
            "Un texte prend effet à sa date de publication au JO (sauf mention contraire).",
            "La version numérique a la même valeur que la version papier.",
            "Des éditions spéciales existent pour les textes urgents.",
        ],
        bonnesPratiques: [
            "Utilisez la recherche avancée pour croiser type + période + ministère.",
            "Vérifiez la date de publication pour connaître la date d'entrée en vigueur.",
            "En cas de doute, l'édition du JO fait foi (version authentique).",
        ],
    },
    {
        id: "cycle-legislatif",
        titre: "Cycle Législatif",
        sousTitre: "Parcours d'un projet de loi",
        icon: Scale,
        couleur: "text-purple-600 dark:text-purple-400",
        bgCouleur: "bg-purple-50 dark:bg-purple-950/30",
        borderCouleur: "border-purple-200 dark:border-purple-800",
        accentGradient: "from-purple-500 to-purple-700",
        niveau: "Avancé",
        duree: "35 min",
        resume: "Comment naît une loi au Gabon ? De l'idée initiale à la promulgation par le Président, découvrez chaque étape du parcours législatif et le rôle clé du SGG.",
        objectif: "Suivre le parcours complet d'un projet de loi et comprendre le rôle de coordination du SGG.",
        pourquoi: "Le SGG coordonne la préparation des lois et garantit leur conformité juridique. Un bon suivi législatif permet au Président de connaître l'avancement du programme gouvernemental.",
        baseLegale: "Constitution, Titre III — Règlements de l'Assemblée et du Sénat",
        acteursPrincipaux: [
            { nom: "Ministère d'origine", role: "Rédige le projet de loi" },
            { nom: "SGG", role: "Coordonne l'examen interministériel" },
            { nom: "Conseil d'État", role: "Donne un avis juridique consultatif" },
            { nom: "Conseil des Ministres", role: "Adopte le projet de loi" },
            { nom: "Parlement", role: "Examine, amende et vote la loi" },
            { nom: "Président", role: "Promulgue la loi" },
            { nom: "Cour Constitutionnelle", role: "Contrôle la constitutionnalité si saisie" },
            { nom: "VP République", role: "Suit l'avancement des projets de loi" },
            { nom: "PM / VPG", role: "Coordonne l'examen interministériel en amont" },
        ],
        etapes: [
            { numero: 1, titre: "Rédaction", acteur: "Ministère", description: "Le ministère rédige le texte avec un exposé des motifs expliquant pourquoi cette loi est nécessaire.", delai: "Variable", icon: "✍️" },
            { numero: 2, titre: "Examen SGG", acteur: "SGG", description: "Le SGG réunit les ministères concernés, harmonise le texte juridiquement et vérifie la cohérence.", delai: "2-4 semaines", icon: "🔎" },
            { numero: 3, titre: "Conseil d'État", acteur: "Conseil d'État", description: "Le Conseil vérifie la conformité à la Constitution et la cohérence avec les lois existantes.", delai: "15-30 jours", icon: "⚖️" },
            { numero: 4, titre: "Conseil des Ministres", acteur: "Gouvernement", description: "Le projet est présenté en CM. Le Président autorise son dépôt devant le Parlement.", delai: "Séance CM", icon: "🏛️" },
            { numero: 5, titre: "Vote au Parlement", acteur: "Assemblée/Sénat", description: "Commission, débats, amendements, vote en séance plénière. Le texte doit être adopté par les deux chambres.", delai: "Variable", icon: "🗳️" },
            { numero: 6, titre: "Promulgation", acteur: "Président", description: "Le Président signe la loi et la fait publier au Journal Officiel. Elle entre alors en vigueur.", delai: "15 jours max", icon: "🖊️" },
        ],
        aRetenir: [
            "Le Président peut demander une seconde délibération avant de promulguer.",
            "Les lois de finances suivent une procédure spéciale avec des délais encadrés.",
            "Le SGG représente le Gouvernement dans les commissions parlementaires.",
        ],
        bonnesPratiques: [
            "Intégrer les standards juridiques dès la rédaction pour anticiper l'avis du Conseil d'État.",
            "Suivre les amendements en temps réel via SGG Digital.",
            "Préparer les éléments de langage pour le ministre rapporteur.",
        ],
    },
    {
        id: "egop",
        titre: "e-GOP",
        sousTitre: "Conseil des Ministres & décisions",
        icon: Landmark,
        couleur: "text-rose-600 dark:text-rose-400",
        bgCouleur: "bg-rose-50 dark:bg-rose-950/30",
        borderCouleur: "border-rose-200 dark:border-rose-800",
        accentGradient: "from-rose-500 to-rose-700",
        niveau: "Intermédiaire",
        duree: "20 min",
        resume: "Comment se prépare un Conseil des Ministres ? Qui décide des sujets à l'ordre du jour ? Que se passe-t-il après ? Ce guide vous révèle les coulisses.",
        objectif: "Comprendre la préparation du Conseil des Ministres et le suivi des décisions prises.",
        pourquoi: "Le Conseil des Ministres est l'instance suprême de décision du Gouvernement. Le SGG en assure la préparation et le suivi. Une bonne préparation = des décisions efficaces.",
        acteursPrincipaux: [
            { nom: "Cabinet du SGG", role: "Collecte et prépare les dossiers" },
            { nom: "Directions SGG", role: "Analysent chaque dossier" },
            { nom: "Ministères", role: "Soumettent les dossiers à l'ordre du jour" },
            { nom: "SGPR", role: "Coordonne avec la Présidence" },
            { nom: "Président de la République", role: "Préside le Conseil des Ministres" },
            { nom: "Vice-Président", role: "Peut suppléer le Président au CM" },
            { nom: "PM / Gouvernement", role: "Présente les dossiers au CM" },
        ],
        etapes: [
            { numero: 1, titre: "Collecte des dossiers", acteur: "SGG", description: "Les ministères envoient les dossiers à inscrire à l'ordre du jour avec une fiche de présentation.", delai: "J-10", icon: "📂" },
            { numero: 2, titre: "Examen technique", acteur: "Directions SGG", description: "Chaque dossier est vérifié : conformité juridique, impact budgétaire, cohérence gouvernementale.", delai: "J-7 à J-5", icon: "🔎" },
            { numero: 3, titre: "Ordre du jour", acteur: "SGG + SGPR", description: "Le SGG propose un projet d'ordre du jour. Après arbitrage avec le SGPR, il est arrêté et communiqué.", delai: "J-3", icon: "📋" },
            { numero: 4, titre: "Conseil des Ministres", acteur: "Gouvernement", description: "Le Conseil se tient sous la présidence du Chef de l'État. Le SGG assure le secrétariat de séance.", delai: "Jour J", icon: "🏛️" },
            { numero: 5, titre: "Suivi des décisions", acteur: "SGG", description: "Le SGG rédige le communiqué et ventile les décisions aux ministères avec des délais de mise en œuvre.", delai: "J+1 à J+3", icon: "📊" },
        ],
        aRetenir: [
            "Le CM se tient à date fixe, sauf convocation extraordinaire.",
            "Les communications ministérielles informent sans décision formelle.",
            "Seul le communiqué officiel est public, pas le relevé de décisions.",
        ],
        bonnesPratiques: [
            "Soumettre les dossiers complets et dans les délais.",
            "Fiche de présentation : 2 pages max avec les enjeux clés.",
            "Suivre la mise en œuvre via le tableau de bord e-GOP.",
        ],
    },
    {
        id: "institutions",
        titre: "Institutions",
        sousTitre: "Annuaire & organigrammes",
        icon: Building2,
        couleur: "text-indigo-600 dark:text-indigo-400",
        bgCouleur: "bg-indigo-50 dark:bg-indigo-950/30",
        borderCouleur: "border-indigo-200 dark:border-indigo-800",
        accentGradient: "from-indigo-500 to-indigo-700",
        niveau: "Débutant",
        duree: "12 min",
        resume: "Tous les ministères, directions et organismes de l'État sont référencés dans SGG Digital. Ce guide explique comment fonctionne cet annuaire officiel.",
        objectif: "Comprendre le référentiel institutionnel et comment il alimente tous les autres modules.",
        pourquoi: "Le référentiel est la base de tout. Si un ministère est mal référencé, les courriers, nominations et rapports ne fonctionneront pas correctement.",
        acteursPrincipaux: [
            { nom: "Présidence", role: "Nomme les ministres et dirigeants d'institutions" },
            { nom: "Admin SGG", role: "Met à jour le référentiel" },
            { nom: "SG de chaque ministère", role: "Signale les changements" },
            { nom: "Admin SGG Digital", role: "Maintient les données techniques" },
        ],
        etapes: [
            { numero: 1, titre: "Mise à jour", acteur: "Admin SGG", description: "Après un remaniement, l'administrateur met à jour les noms, sigles, adresses et contacts.", delai: "48h", icon: "✏️" },
            { numero: 2, titre: "Organigramme", acteur: "Admin SGG", description: "Les directions et services sont rattachés à leur ministère. L'arbre hiérarchique est mis à jour.", delai: "1 semaine", icon: "🏗️" },
            { numero: 3, titre: "Responsables", acteur: "Dir. Nominations", description: "Les ministres, SG et directeurs sont associés à leurs institutions dans le système.", delai: "Continu", icon: "👤" },
            { numero: 4, titre: "Publication", acteur: "SGG", description: "Le référentiel validé est publié. Les modifications se propagent dans tous les modules.", delai: "J+1", icon: "✅" },
        ],
        aRetenir: [
            "42 institutions sont actuellement référencées.",
            "Le référentiel est la source unique de vérité pour les données de l'État.",
            "Chaque institution a une fiche complète : attributions, textes fondateurs, effectifs.",
        ],
        bonnesPratiques: [
            "Signaler tout changement immédiatement à l'admin SGG.",
            "Utiliser les sigles officiels dans toutes les correspondances.",
            "Vérifier les rattachements après chaque remaniement.",
        ],
    },
    {
        id: "reporting",
        titre: "Matrice Reporting",
        sousTitre: "Rapports & tableaux de bord",
        icon: ListChecks,
        couleur: "text-teal-600 dark:text-teal-400",
        bgCouleur: "bg-teal-50 dark:bg-teal-950/30",
        borderCouleur: "border-teal-200 dark:border-teal-800",
        accentGradient: "from-teal-500 to-teal-700",
        niveau: "Intermédiaire",
        duree: "18 min",
        resume: "La matrice de reporting agrège les données de tous les modules en un rapport unique pour le Président. Découvrez comment les rapports sont produits.",
        objectif: "Savoir produire, valider et lire les rapports de performance consolidés.",
        pourquoi: "Ce rapport synthétique permet au Président et au PM d'avoir une vision d'ensemble de l'action gouvernementale en un coup d'œil.",
        acteursPrincipaux: [
            { nom: "Points focaux", role: "Saisissent les données sectorielles" },
            { nom: "SG Ministère", role: "Valident les données" },
            { nom: "Direction Reporting SGG", role: "Consolident le rapport national" },
            { nom: "SGPR", role: "Valide le rapport avant transmission" },
            { nom: "Présidence (Président / VP)", role: "Destinataire final du rapport consolidé" },
            { nom: "PM / Gouvernement", role: "Reçoit le rapport pour pilotage opérationnel" },
        ],
        etapes: [
            { numero: 1, titre: "Saisie", acteur: "Points focaux", description: "Chaque ministère entre ses indicateurs : budgets, projets, ressources, indicateurs spécifiques.", delai: "Fin de mois", icon: "📝" },
            { numero: 2, titre: "Validation", acteur: "SG Ministère", description: "Le SG vérifie la cohérence et l'exactitude des données avant transmission.", delai: "J+2", icon: "✅" },
            { numero: 3, titre: "Consolidation", acteur: "SGG", description: "Toutes les données sont agrégées : score PAT global, taux budgétaire, indice de réforme.", delai: "J+5", icon: "📊" },
            { numero: 4, titre: "Analyse", acteur: "Conseillers SGG", description: "Les analystes identifient les tendances, alertes, et rédigent les recommandations.", delai: "J+7", icon: "🔎" },
            { numero: 5, titre: "Diffusion", acteur: "SGG", description: "Le rapport consolidé est transmis au SGPR. Les ministères en difficulté reçoivent un accompagnement ciblé.", delai: "J+10", icon: "📤" },
            { numero: 6, titre: "Réception présidentielle", acteur: "Présidence", description: "Le Président reçoit le rapport consolidé. Il en prend connaissance et peut demander des éclaircissements ou arbitrer.", delai: "J+12", icon: "👁️" },
        ],
        aRetenir: [
            "La matrice couvre 42 institutions et 180+ indicateurs.",
            "Un rapport spécial est produit avant chaque Conseil des Ministres.",
            "Les rapports sont en lecture seule pour les acteurs autorisés.",
        ],
        bonnesPratiques: [
            "La qualité des données à la source détermine la fiabilité du rapport.",
            "Utiliser les alertes automatiques pour ne pas manquer les échéances.",
            "Comparer avec les périodes précédentes pour voir les tendances.",
        ],
    },
    {
        id: "vue-consolidee",
        titre: "Vue Consolidée",
        sousTitre: "Vision globale du Président",
        icon: Eye,
        couleur: "text-orange-600 dark:text-orange-400",
        bgCouleur: "bg-orange-50 dark:bg-orange-950/30",
        borderCouleur: "border-orange-200 dark:border-orange-800",
        accentGradient: "from-orange-500 to-orange-700",
        niveau: "Avancé",
        duree: "20 min",
        resume: "Comment le Président voit-il en un seul écran si le pays avance ? La vue consolidée regroupe tous les indicateurs clés : GAR, budget, nominations, lois, ODD.",
        objectif: "Comprendre comment lire le tableau de bord présidentiel et interpréter les indicateurs agrégés.",
        pourquoi: "Le Président n'a pas le temps de consulter 10 modules différents. La vue consolidée lui donne une photo instantanée de l'état du pays, avec des alertes sur les points critiques.",
        baseLegale: "Lettre de cadrage présidentielle — Circulaire PM sur le tableau de bord stratégique",
        acteursPrincipaux: [
            { nom: "Président / VP République", role: "Destinataire — consulte le tableau de bord" },
            { nom: "SGPR", role: "Supervise la pertinence des indicateurs" },
            { nom: "SGG", role: "Alimente le tableau avec les données consolidées" },
            { nom: "Dir. GAR / Reporting", role: "Fournit les scores de performance" },
            { nom: "PM / Gouvernement", role: "Suit l'exécution opérationnelle du PAG" },
        ],
        etapes: [
            { numero: 1, titre: "Collecte automatique", acteur: "Système", description: "SGG Digital agrège automatiquement les données de tous les modules : GAR, budget, nominations, lois, ODD.", delai: "Temps réel", icon: "🔄" },
            { numero: 2, titre: "Calcul des scores", acteur: "Système", description: "Les algorithmes calculent les scores composites : taux d'avancement PAG, taux d'exécution budgétaire, score ODD.", delai: "Automatique", icon: "📊" },
            { numero: 3, titre: "Alertes intelligentes", acteur: "Système", description: "Si un indicateur passe sous le seuil critique (ex: avancement < 50%), une alerte est générée pour le Président.", delai: "Immédiat", icon: "🚨" },
            { numero: 4, titre: "Consultation présidentielle", acteur: "Président", description: "Le Président consulte le tableau de bord et peut cliquer sur chaque indicateur pour voir le détail par ministère.", delai: "À la demande", icon: "👁️" },
            { numero: 5, titre: "Prise de décision", acteur: "Président", description: "Sur la base des données, le Président peut demander un arbitrage, une réunion ou une instruction au PM.", delai: "Variable", icon: "🎯" },
        ],
        aRetenir: [
            "La vue consolidée se met à jour en temps réel à chaque nouvelle donnée saisie.",
            "Les indicateurs rouges signalent un retard critique nécessitant une attention immédiate.",
            "Le Président peut comparer la performance actuelle avec les trimestres précédents.",
            "Un export PDF automatique est envoyé chaque lundi matin au cabinet présidentiel.",
        ],
        bonnesPratiques: [
            "Consulter la vue consolidée au moins 1 fois par semaine.",
            "Croiser les indicateurs GAR et budgétaires pour une vision complète.",
            "Utiliser les filtres par province pour détecter les disparités territoriales.",
        ],
    },
    {
        id: "synthese-executive",
        titre: "Synthèse Exécutive",
        sousTitre: "Briefs décisionnels",
        icon: Target,
        couleur: "text-violet-600 dark:text-violet-400",
        bgCouleur: "bg-violet-50 dark:bg-violet-950/30",
        borderCouleur: "border-violet-200 dark:border-violet-800",
        accentGradient: "from-violet-500 to-violet-700",
        niveau: "Intermédiaire",
        duree: "15 min",
        resume: "Comment sont produits les documents de synthèse pour les décideurs ? Ce guide explique la chaîne de production des briefs qui arrivent sur le bureau du Président.",
        objectif: "Comprendre le processus de production d'une synthèse exécutive, de la collecte des données au brief final.",
        pourquoi: "Un bon brief permet au Président de prendre des décisions éclairées en 5 minutes. Un mauvais brief peut conduire à des erreurs stratégiques.",
        acteursPrincipaux: [
            { nom: "Analystes SGG", role: "Rédigent les synthèses à partir des données" },
            { nom: "Dir. Études SGG", role: "Valide la pertinence et l'exactitude" },
            { nom: "SGPR", role: "Transmet au cabinet présidentiel" },
            { nom: "Président / VP", role: "Destinataire final — prend les décisions" },
            { nom: "PM / Gouvernement", role: "Reçoit les synthèses pour coordination" },
        ],
        etapes: [
            { numero: 1, titre: "Extraction des données", acteur: "Analystes SGG", description: "Les données sont extraites des modules GAR, budget, nominations, cycle législatif, e-GOP.", delai: "J-3", icon: "📥" },
            { numero: 2, titre: "Analyse et rédaction", acteur: "Analystes SGG", description: "Les analystes identifient les faits saillants et rédigent un document de 2-3 pages maximum.", delai: "J-2", icon: "✍️" },
            { numero: 3, titre: "Validation interne", acteur: "Dir. Études", description: "Le directeur vérifie : les chiffres sont-ils corrects ? Les recommandations sont-elles pertinentes ?", delai: "J-1", icon: "✅" },
            { numero: 4, titre: "Transmission", acteur: "SGPR", description: "Le document validé est transmis au SGPR qui le met dans la chemise du Président.", delai: "Jour J", icon: "📤" },
            { numero: 5, titre: "Lecture et décision", acteur: "Président", description: "Le Président lit la synthèse. Il peut annoter, demander des précisions, ou donner des instructions.", delai: "Variable", icon: "🎯" },
        ],
        aRetenir: [
            "Une synthèse ne dépasse jamais 3 pages — l'essentiel en un coup d'œil.",
            "Les recommandations sont toujours formulées sous forme d'options : A, B, ou C.",
            "Les synthèses hebdomadaires couvrent 5 thèmes : politique, économie, social, sécurité, international.",
            "Le Président peut demander à tout moment une synthèse d'urgence sur un sujet spécifique.",
        ],
        bonnesPratiques: [
            "Toujours inclure un tableau comparatif avec la période précédente.",
            "Mettre les chiffres clés en évidence dès la première page.",
            "Joindre les graphiques issus de SGG Digital plutôt que des tableaux bruts.",
        ],
    },
    {
        id: "donnees-sectorielles",
        titre: "Données Sectorielles",
        sousTitre: "Tableau de bord par secteur",
        icon: Shield,
        couleur: "text-cyan-600 dark:text-cyan-400",
        bgCouleur: "bg-cyan-50 dark:bg-cyan-950/30",
        borderCouleur: "border-cyan-200 dark:border-cyan-800",
        accentGradient: "from-cyan-500 to-cyan-700",
        niveau: "Débutant",
        duree: "15 min",
        resume: "SGG Digital contient des tableaux de bord pour chaque secteur : santé, éducation, énergie, mines, transport… Comment les lire et les comprendre ?",
        objectif: "Savoir naviguer dans les tableaux de bord sectoriels et comprendre les indicateurs clés de chaque domaine.",
        pourquoi: "L'État gère des dizaines de secteurs. Sans données centralisées, impossible de savoir si la politique de santé, d'éducation ou d'énergie produit des résultats.",
        acteursPrincipaux: [
            { nom: "Ministères sectoriels", role: "Fournissent les données de leur secteur" },
            { nom: "SGG / Dir. Statistiques", role: "Consolide et vérifie la cohérence" },
            { nom: "SGPR", role: "Accède aux données pour le pilotage présidentiel" },
            { nom: "Président / VP / PM", role: "Consultent les dashboards pour les décisions" },
        ],
        etapes: [
            { numero: 1, titre: "Publication des données", acteur: "Ministères", description: "Chaque ministère publie régulièrement les données de son secteur : indicateurs, projets, budgets.", delai: "Mensuel", icon: "📊" },
            { numero: 2, titre: "Vérification", acteur: "SGG", description: "Le SGG vérifie la cohérence des données entre secteurs (ex: budget alloué vs dépenses déclarées).", delai: "Continu", icon: "🔍" },
            { numero: 3, titre: "Mise en tableau de bord", acteur: "Système", description: "SGG Digital transforme les données en graphiques et cartes interactives, accessibles par tous les utilisateurs autorisés.", delai: "Automatique", icon: "📈" },
            { numero: 4, titre: "Consultation", acteur: "Tous utilisateurs", description: "Chacun consulte les secteurs qui le concernent. Le Président voit tous les secteurs simultanément.", delai: "À la demande", icon: "👁️" },
        ],
        aRetenir: [
            "5 grandes familles de secteurs : Économie, Social, Territoire, Souveraineté, Société.",
            "Chaque secteur a un tableau de bord dédié avec ses propres indicateurs.",
            "Les données peuvent être filtrées par province pour voir les disparités régionales.",
            "Les indicateurs ODD sont intégrés dans chaque tableau sectoriel.",
        ],
        bonnesPratiques: [
            "Comparer les données entre provinces pour identifier les inégalités.",
            "Utiliser la vue carte pour géolocaliser les projets et infrastructures.",
            "Consulter les tendances sur 12 mois plutôt que les chiffres ponctuels.",
        ],
    },
];

const niveauConfig: Record<string, { color: string; bg: string }> = {
    "Débutant": { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    "Intermédiaire": { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
    "Avancé": { color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/40" },
};

// ─── Composant : Schéma de Processus Visuel ──────────────────────────────────

function ProcessFlowDiagram({ etapes, currentStep, onStepClick, userId }: { etapes: ProcessStep[]; currentStep: number; onStepClick: (n: number) => void; userId?: string }) {
    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-center gap-1 min-w-max px-2">
                {etapes.map((etape, i) => {
                    const isUserStep = userId ? isStepForUser(etape.acteur, userId) : false;
                    return (
                        <div key={i} className="flex items-center">
                            <button
                                onClick={() => onStepClick(etape.numero)}
                                className={`relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[80px]
                    ${currentStep === etape.numero
                                        ? "bg-government-navy text-white shadow-lg scale-105"
                                        : isUserStep
                                            ? "bg-government-gold/15 ring-2 ring-government-gold/50 hover:bg-government-gold/25 text-foreground hover:scale-105"
                                            : "bg-muted/50 hover:bg-muted text-foreground hover:scale-105"
                                    }`}
                            >
                                {isUserStep && (
                                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-government-gold flex items-center justify-center shadow-sm">
                                        <Star className="h-2.5 w-2.5 text-white fill-white" />
                                    </span>
                                )}
                                <span className="text-xl leading-none">{etape.icon}</span>
                                <span className="text-[10px] font-semibold leading-tight text-center whitespace-nowrap">
                                    {etape.titre}
                                </span>
                                <span className={`text-[9px] ${currentStep === etape.numero ? "text-white/70" : "text-muted-foreground"}`}>
                                    Étape {etape.numero}
                                </span>
                            </button>
                            {i < etapes.length - 1 && (
                                <ArrowRight className={`h-4 w-4 flex-shrink-0 mx-0.5 ${currentStep > etape.numero ? "text-government-navy" : "text-muted-foreground/40"}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Composant : Détail d'une Étape ─────────────────────────────────────────

function StepDetail({ etape, total, onPrev, onNext, isUserStep }: { etape: ProcessStep; total: number; onPrev: () => void; onNext: () => void; isUserStep?: boolean }) {
    return (
        <div className={`rounded-xl p-5 border transition-all duration-300 ${isUserStep
            ? "bg-gradient-to-br from-government-gold/10 to-government-gold/20 dark:from-government-gold/15 dark:to-government-gold/25 border-government-gold/30 ring-1 ring-government-gold/20"
            : "bg-gradient-to-br from-government-navy/5 to-government-navy/10 dark:from-government-navy/10 dark:to-government-navy/20 border-government-navy/10"
            }`}>
            {isUserStep && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-government-gold/20">
                    <Crown className="h-4 w-4 text-government-gold" />
                    <span className="text-xs font-bold text-government-gold uppercase tracking-wider">C'est vous qui intervenez à cette étape</span>
                </div>
            )}
            <div className="flex items-start gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md ${isUserStep ? "bg-government-gold text-white" : "bg-government-navy text-white"
                    }`}>
                    {etape.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-government-navy/60 uppercase tracking-wider">
                            Étape {etape.numero} sur {total}
                        </span>
                        {etape.delai && (
                            <Badge variant="secondary" className="text-[10px]">
                                <Clock className="h-2.5 w-2.5 mr-1" />{etape.delai}
                            </Badge>
                        )}
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-1">{etape.titre}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                        <Users className="h-3 w-3" /> Responsable : <strong>{etape.acteur}</strong>
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{etape.description}</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-government-navy/10">
                <Button size="sm" variant="ghost" onClick={onPrev} disabled={etape.numero === 1} className="gap-1">
                    <ChevronLeft className="h-4 w-4" /> Précédent
                </Button>
                {/* Progress dots */}
                <div className="flex gap-1.5">
                    {Array.from({ length: total }, (_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 === etape.numero ? "w-6 bg-government-navy" : "w-2 bg-government-navy/20"}`} />
                    ))}
                </div>
                <Button size="sm" variant="ghost" onClick={onNext} disabled={etape.numero === total} className="gap-1">
                    Suivant <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ─── Composant : Vue Détaillée d'un Module ──────────────────────────────────

function ModuleDetailView({ guide, onBack }: { guide: GuideModule; onBack: () => void }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState<"processus" | "acteurs" | "pratiques">("processus");
    const { demoUser } = useDemoUser();
    const userId = demoUser?.id || "";
    const userRoleInGuide = getUserRoleInGuide(guide, userId);
    const userStepCount = guide.etapes.filter(e => isStepForUser(e.acteur, userId)).length;
    const Icon = guide.icon;
    const etape = guide.etapes.find(e => e.numero === currentStep)!;

    const tabs = [
        { id: "processus" as const, label: "Processus", icon: ArrowRight },
        { id: "acteurs" as const, label: "Acteurs & contexte", icon: Users },
        { id: "pratiques" as const, label: "À retenir", icon: Lightbulb },
    ];

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="mt-1 gap-1 flex-shrink-0">
                    <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${guide.accentGradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{guide.titre}</h2>
                            <p className="text-sm text-muted-foreground">{guide.sousTitre}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap mt-2">
                        <Badge className={`${niveauConfig[guide.niveau].bg} ${niveauConfig[guide.niveau].color}`}>{guide.niveau}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{guide.duree}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><ListChecks className="h-3 w-3" />{guide.etapes.length} étapes</span>
                    </div>
                </div>
            </div>

            {/* Description simple */}
            <Card className={`${guide.bgCouleur} border ${guide.borderCouleur}`}>
                <CardContent className="p-4">
                    <p className="text-sm leading-relaxed flex gap-2">
                        <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${guide.couleur}`} />
                        <span>{guide.resume}</span>
                    </p>
                </CardContent>
            </Card>

            {/* Bandeau rôle utilisateur */}
            {userRoleInGuide && (
                <Card className="border-government-gold/30 bg-gradient-to-r from-government-gold/5 to-government-gold/15 dark:from-government-gold/10 dark:to-government-gold/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-government-gold/20 flex items-center justify-center flex-shrink-0">
                                <Crown className="h-5 w-5 text-government-gold" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-government-gold uppercase tracking-wider mb-0.5">Votre rôle dans ce processus</p>
                                <p className="text-sm font-semibold text-foreground">{userRoleInGuide}</p>
                            </div>
                            <Badge className="bg-government-gold/20 text-government-gold border-government-gold/30 text-xs">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                {userStepCount} étape{userStepCount > 1 ? "s" : ""}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
                {tabs.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                                    ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <TabIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab: Processus */}
            {activeTab === "processus" && (
                <div className="space-y-4">
                    <ProcessFlowDiagram etapes={guide.etapes} currentStep={currentStep} onStepClick={setCurrentStep} userId={userId} />
                    <StepDetail
                        etape={etape}
                        total={guide.etapes.length}
                        onPrev={() => setCurrentStep(s => Math.max(1, s - 1))}
                        onNext={() => setCurrentStep(s => Math.min(guide.etapes.length, s + 1))}
                        isUserStep={isStepForUser(etape.acteur, userId)}
                    />
                </div>
            )}

            {/* Tab: Acteurs & Contexte */}
            {activeTab === "acteurs" && (
                <div className="space-y-4">
                    {/* Objectif */}
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4" /> Objectif
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300/80">{guide.objectif}</p>
                        </CardContent>
                    </Card>
                    {/* Pourquoi */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4" /> Pourquoi c'est important
                            </h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300/80">{guide.pourquoi}</p>
                        </CardContent>
                    </Card>
                    {/* Base légale */}
                    {guide.baseLegale && (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardContent className="p-4">
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Scale className="h-4 w-4 text-slate-500" /> Base légale
                                </h4>
                                <p className="text-sm text-muted-foreground italic">{guide.baseLegale}</p>
                            </CardContent>
                        </Card>
                    )}
                    {/* Acteurs */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-government-navy" /> Qui intervient ?
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {guide.acteursPrincipaux.map((a, i) => {
                                const isCurrentUser = isStepForUser(a.nom, userId) || isStepForUser(a.role, userId);
                                return (
                                    <Card key={i} className={`transition-shadow ${isCurrentUser
                                        ? "ring-2 ring-government-gold/50 border-government-gold/30 shadow-md"
                                        : "hover:shadow-sm"
                                        }`}>
                                        <CardContent className="p-3 flex items-start gap-3">
                                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold ${isCurrentUser
                                                ? "bg-government-gold/20 text-government-gold"
                                                : `${guide.bgCouleur} ${guide.couleur}`
                                                }`}>
                                                {isCurrentUser ? <Crown className="h-4 w-4" /> : i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-sm">{a.nom}</p>
                                                    {isCurrentUser && (
                                                        <Badge className="bg-government-gold/20 text-government-gold border-government-gold/30 text-[9px] px-1.5 py-0">
                                                            Vous
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{a.role}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: À retenir */}
            {activeTab === "pratiques" && (
                <div className="space-y-4">
                    {/* À retenir */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Eye className="h-4 w-4 text-government-navy" /> Points essentiels à retenir
                            </h4>
                            <ul className="space-y-3">
                                {guide.aRetenir.map((info, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{info}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    {/* Bonnes pratiques */}
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
                                <Shield className="h-4 w-4" /> Bonnes pratiques
                            </h4>
                            <ul className="space-y-3">
                                {guide.bonnesPratiques.map((bp, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-emerald-700 dark:text-emerald-300/80">
                                        <Lightbulb className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span>{bp}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ─── Page Principale ─────────────────────────────────────────────────────────

export default function Formation() {
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterNiveau, setFilterNiveau] = useState<string>("all");
    const { demoUser } = useDemoUser();
    const userId = demoUser?.id || "";

    const filtered = useMemo(() => {
        return modules.filter(m => {
            const matchSearch = !search ||
                m.titre.toLowerCase().includes(search.toLowerCase()) ||
                m.sousTitre.toLowerCase().includes(search.toLowerCase()) ||
                m.resume.toLowerCase().includes(search.toLowerCase());
            const matchNiveau = filterNiveau === "all" || m.niveau === filterNiveau;
            return matchSearch && matchNiveau;
        });
    }, [search, filterNiveau]);

    const activeModule = modules.find(m => m.id === selectedModule);

    // Si un module est sélectionné, afficher la vue détaillée
    if (activeModule) {
        return (
            <DashboardLayout>
                <ModuleDetailView guide={activeModule} onBack={() => setSelectedModule(null)} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-government-navy/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-government-navy" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Formation & Guides</h1>
                        <p className="text-sm text-muted-foreground">
                            Cliquez sur un module pour apprendre comment il fonctionne, étape par étape
                        </p>
                    </div>
                </div>
            </div>

            {/* Barre de recherche + filtres */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher un guide..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                    {["all", "Débutant", "Intermédiaire", "Avancé"].map(f => (
                        <Button key={f} size="sm" variant={filterNiveau === f ? "default" : "outline"} onClick={() => setFilterNiveau(f)}
                            className={filterNiveau === f ? "bg-government-navy hover:bg-government-navy/90" : ""}>
                            {f === "all" ? "Tous" : f}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grille de modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {filtered.map(guide => {
                    const Icon = guide.icon;
                    const userRole = getUserRoleInGuide(guide, userId);
                    return (
                        <Card
                            key={guide.id}
                            className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border ${guide.borderCouleur} overflow-hidden ${userRole ? "ring-1 ring-government-gold/30" : ""
                                }`}
                            onClick={() => setSelectedModule(guide.id)}
                        >
                            {/* Bandeau gradient */}
                            <div className={`h-1.5 bg-gradient-to-r ${guide.accentGradient}`} />
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${guide.accentGradient} flex items-center justify-center shadow group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base group-hover:text-government-navy transition-colors">{guide.titre}</h3>
                                        <p className="text-xs text-muted-foreground">{guide.sousTitre}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-government-navy group-hover:translate-x-1 transition-all" />
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{guide.resume}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge className={`${niveauConfig[guide.niveau].bg} ${niveauConfig[guide.niveau].color} text-[10px]`}>{guide.niveau}</Badge>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />{guide.duree}
                                        </span>
                                        {userRole && (
                                            <Badge className="bg-government-gold/15 text-government-gold border-government-gold/30 text-[10px]">
                                                <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> Vous intervenez
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <ListChecks className="h-3 w-3" />{guide.etapes.length} étapes
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">Aucun guide trouvé</p>
                    <p className="text-sm">Essayez un autre terme de recherche ou filtrez par niveau.</p>
                </div>
            )}

            {/* Aide */}
            <Card className="border-dashed">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-government-gold/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-6 w-6 text-government-gold" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h3 className="font-semibold">Besoin d'aide ?</h3>
                        <p className="text-sm text-muted-foreground">
                            Contactez la Direction de la Formation du SGG pour une session personnalisée.
                        </p>
                    </div>
                    <Button variant="outline" className="border-government-gold text-government-gold hover:bg-government-gold/10">
                        <Send className="h-4 w-4 mr-2" /> Contacter
                    </Button>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
