/**
 * SGG Digital — Glossaire Intégré
 *
 * Composant <GlossaryTerm> : entoure un terme technique d'un
 * underline pointillé + popover avec définition en français simple.
 *
 * Utilisable partout dans l'app :
 *   <GlossaryTerm term="GAR">Suivi GAR</GlossaryTerm>
 *
 * Le glossaire couvre ~40 termes techniques du SGG.
 */

import { ReactNode } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Glossaire ───────────────────────────────────────────────────────────────

export const GLOSSARY: Record<
    string,
    { definition: string; example?: string }
> = {
    GAR: {
        definition:
            "Gestion Axée sur les Résultats. C'est une méthode pour mesurer si les actions du gouvernement atteignent leurs objectifs.",
        example: "Ex: Le programme 'Accès à l'eau potable' vise 80% de couverture → le GAR suit le % actuel.",
    },
    PTM: {
        definition:
            "Programme de Travail Ministériel. C'est le plan d'action d'un ministère pour un trimestre : quoi faire, quand, avec quel budget.",
        example: "Chaque direction remplit son PTM → le SG du ministère consolide → transmet au SGG.",
    },
    PAG: {
        definition:
            "Plan d'Action Gouvernemental. C'est le programme global du gouvernement (2026) avec tous les projets prioritaires.",
    },
    SGG: {
        definition:
            "Secrétariat Général du Gouvernement. C'est l'organe qui coordonne le travail entre les ministères et la présidence.",
    },
    SGPR: {
        definition:
            "Secrétariat Général de la Présidence de la République. Il transmet les dossiers au Président et coordonne avec le SGG.",
    },
    "Matrice de Reporting": {
        definition:
            "Tableau que chaque ministère remplit chaque mois pour indiquer l'avancement de ses projets. Les colonnes sont les indicateurs, les lignes sont les programmes.",
    },
    Consolidation: {
        definition:
            "Action de rassembler les données de plusieurs sources en un seul document. Par exemple, consolider les PTM = rassembler les plans de toutes les directions.",
    },
    "Cycle Législatif": {
        definition:
            "Le parcours d'un texte de loi : rédaction → examen en conseil → vote à l'Assemblée → vote au Sénat → promulgation → publication au Journal Officiel.",
    },
    "Journal Officiel": {
        definition:
            "Le document où sont publiés tous les textes officiels (lois, décrets, arrêtés). Une fois publié au JO, un texte devient applicable.",
        example: "Abréviation : JO. Géré par la DGJO.",
    },
    DGJO: {
        definition:
            "Direction Générale du Journal Officiel. Service rattaché au SGG qui publie et archive les textes officiels.",
    },
    Nominations: {
        definition:
            "Propositions de personnes pour occuper des postes officiels (directeurs, ambassadeurs…). Proposées par les ministres, validées par le Président.",
    },
    Décret: {
        definition:
            "Décision prise par le Président ou le Premier Ministre. Moins contraignant qu'une loi, mais a force réglementaire.",
    },
    Arrêté: {
        definition:
            "Décision prise par un ministre dans son domaine. Portée plus limitée qu'un décret.",
    },
    Ordonnance: {
        definition:
            "Texte pris par le gouvernement dans un domaine normalement réservé aux lois, avec l'autorisation du Parlement.",
    },
    ODD: {
        definition:
            "Objectifs de Développement Durable. Les 17 objectifs fixés par l'ONU (faim zéro, éducation, santé…) que chaque pays doit atteindre.",
    },
    SLA: {
        definition:
            "Service Level Agreement — Accord sur le niveau de service. Mesure si un service répond dans les temps promis.",
        example: "Ex: 'Répondre à une requête citoyenne en moins de 48h'.",
    },
    OKR: {
        definition:
            "Objectives and Key Results. Méthode de management : on définit un objectif (O) et on mesure le progrès par des résultats-clés (KR).",
    },
    KPI: {
        definition:
            "Key Performance Indicator — Indicateur-clé de performance. Un chiffre qui montre si on atteint un objectif.",
        example: "Ex: 'Taux de scolarisation = 92%' est un KPI du programme Éducation.",
    },
    "Balanced Scorecard": {
        definition:
            "Tableau de bord équilibré. Outil de pilotage qui regarde la performance sous 4 angles : financier, clients, processus internes, apprentissage.",
    },
    "Veille Stratégique": {
        definition:
            "Surveillance continue de l'environnement (économie, politique, sécurité) pour anticiper les risques et opportunités.",
    },
    API: {
        definition:
            "Application Programming Interface. C'est un pont technique qui permet à deux logiciels de communiquer entre eux.",
        example: "L'API du SGG permet aux ministères d'envoyer leurs données automatiquement.",
    },
    Kanban: {
        definition:
            'Méthode d\'organisation visuelle du travail en colonnes : "À faire", "En cours", "Terminé". Chaque tâche est une carte qu\'on déplace.',
    },
    Workflow: {
        definition:
            "Flux de travail automatisé. Définit les étapes d'un processus et qui doit intervenir à chaque étape.",
        example: "Ex: Dossier → Secrétariat → Validation Chef → Signature → Envoi.",
    },
    "État Civil": {
        definition:
            "Registre officiel des événements de vie des citoyens : naissances, mariages, décès.",
    },
    Cadastre: {
        definition:
            "Registre qui recense toutes les propriétés foncières (terrains et bâtiments) avec leurs propriétaires et limites géographiques.",
    },
    CNAMGS: {
        definition:
            "Caisse Nationale d'Assurance Maladie et de Garantie Sociale. Organisme gabonais d'assurance maladie.",
    },
    CSU: {
        definition:
            "Couverture Santé Universelle. Objectif que chaque citoyen ait accès à des soins de santé, quelle que soit sa situation financière.",
    },
    "e-GOP": {
        definition:
            "e-Gouvernement Opérationnel. Plateforme numérique de gestion des processus gouvernementaux.",
    },
    Dashboard: {
        definition:
            'Tableau de bord. Page qui affiche les chiffres importants d\'un coup d\'œil, comme un "cockpit" pour piloter une activité.',
    },
    Benchmark: {
        definition:
            "Comparaison des performances entre ministères ou entre pays. Permet de voir qui fait mieux et de s'inspirer des bonnes pratiques.",
    },
    "Audit de Conformité": {
        definition:
            "Vérification que les processus respectent les règles et normes en vigueur. Comme un contrôle technique pour l'administration.",
    },
    "Conseil des Ministres": {
        definition:
            "Réunion officielle de tous les ministres sous la présidence du Président de la République, pour prendre des décisions importantes.",
    },
    Promulgation: {
        definition:
            "Acte par lequel le Président valide officiellement une loi votée par le Parlement. La loi devient ensuite applicable après publication au JO.",
    },
    "Marchés Publics": {
        definition:
            "Contrats passés par l'État pour acheter des biens ou services (construction de routes, fournitures de bureau…). Soumis à des règles de transparence.",
    },
    "Dette Publique": {
        definition:
            "L'ensemble des emprunts que l'État a contractés et qu'il doit rembourser. Suivie pour assurer la santé financière du pays.",
    },
};

// ── Component ───────────────────────────────────────────────────────────────

interface GlossaryTermProps {
    /** Key in the GLOSSARY object */
    term: string;
    /** Content to display (defaults to term name) */
    children?: ReactNode;
    /** Style variant */
    variant?: "inline" | "badge";
}

export function GlossaryTerm({ term, children, variant = "inline" }: GlossaryTermProps) {
    const entry = GLOSSARY[term];
    if (!entry) {
        return <span>{children || term}</span>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={cn(
                        "cursor-help transition-colors",
                        variant === "inline"
                            ? "border-b border-dashed border-muted-foreground/40 hover:border-government-gold hover:text-government-navy dark:hover:text-government-gold"
                            : "inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 text-xs font-medium hover:bg-government-gold/10"
                    )}
                >
                    {variant === "badge" && <BookOpen className="h-3 w-3 text-muted-foreground" />}
                    {children || term}
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs p-3" sideOffset={6}>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-government-gold shrink-0" />
                        <span className="font-semibold text-xs text-foreground">{term}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {entry.definition}
                    </p>
                    {entry.example && (
                        <p className="text-[10px] text-muted-foreground/70 italic leading-relaxed">
                            {entry.example}
                        </p>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

// ── Full Glossary Page Component ────────────────────────────────────────────

export function GlossaryPanel() {
    const terms = Object.entries(GLOSSARY).sort(([a], [b]) => a.localeCompare(b, "fr"));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-government-gold" />
                <h2 className="text-lg font-bold font-sans">Glossaire</h2>
                <span className="text-xs text-muted-foreground">
                    {terms.length} termes expliqués
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                Survolez un terme <span className="border-b border-dashed border-muted-foreground/40">souligné en pointillé</span> n'importe où dans l'application pour voir sa définition.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {terms.map(([key, entry]) => (
                    <div
                        key={key}
                        className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                    >
                        <h3 className="font-semibold text-sm text-foreground mb-1 font-sans">{key}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {entry.definition}
                        </p>
                        {entry.example && (
                            <p className="text-[10px] text-muted-foreground/60 italic mt-1">
                                {entry.example}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
