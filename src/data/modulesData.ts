
import { BarChart3, Users, Gavel, LayoutDashboard, Building2, FileText, Database, Shield, MonitorCheck } from "lucide-react";

export const modulesData = {
    gar: {
        id: "gar",
        title: "Gestion Axée sur les Résultats (GAR)",
        shortDescription: "Pilotage stratégique de l'action publique et suivi du Plan National de Développement.",
        fullDescription: "La Gestion Axée sur les Résultats (GAR) marque le passage d'une administration de moyens à une culture de la performance. Ce module offre une vue panoramique et temps réel sur l'avancement des projets prioritaires de l'État, assurant que chaque ressource investie se traduit par un impact concret et mesurable pour les populations gabonaises.",
        sggRole: "Véritable tour de contrôle de l'action gouvernementale, le SGG utilise cet outil pour certifier les indicateurs de performance et alerter le Premier Ministre sur les points de blocage. Nous garantissons l'alignement strict de l'exécution administrative sur la vision stratégique définie par le Chef de l'État.",
        features: [
            "Tableaux de bord stratégiques et décisionnels",
            "Suivi en temps réel des indicateurs du PAG",
            "Cartographie de l'investissement public",
            "Évaluation d'impact des politiques publiques"
        ],
        icon: Database,
        color: "blue",
        appLink: "/gar/app",
        image: "/images/gar.png"
    },
    nominations: {
        id: "nominations",
        title: "Portail des Nominations",
        shortDescription: "Gestion intelligente, sécurisée et méritocratique des hauts emplois de l'État.",
        fullDescription: "Un vivier de compétences nationales au service de la République. Ce portail dématérialise intégralement le processus de nomination, de la proposition ministérielle à la signature du décret, garantissant une traçabilité absolue et la confidentialité des délibérations.",
        sggRole: "Gardien de la légalité administrative, le SGG vérifie via cette plateforme la conformité de chaque proposition aux textes en vigueur (conditions d'âge, de diplôme, d'expérience). Nous assurons la fiabilité et la régularité juridique des actes de nomination qui structurent l'administration gabonaise.",
        features: [
            "Contrôle automatisé des critères d'éligibilité",
            "Vivier numérique des compétences nationales",
            "Traçabilité complète du circuit de validation",
            "Génération automatique des projets de décrets"
        ],
        icon: Users,
        color: "green",
        appLink: "/nominations/app",
        image: "/images/nominations.png"
    },
    cycleLegislatif: {
        id: "cycleLegislatif",
        title: "La Fabrique de la Loi",
        shortDescription: "Digitalisation du processus normatif : de l'avant-projet à la promulgation.",
        fullDescription: "Une plateforme collaborative qui modernise radicalement la production normative. Elle permet aux ministères, au SGG et au Conseil d'État de co-construire les textes juridiques dans un environnement sécurisé, réduisant drastiquement les délais d'adoption et éliminant les erreurs matérielles.",
        sggRole: "Le SGG est le législateur du Gouvernement. Nous orchestrons les réunions interministérielles via cet outil, veillons à la qualité légistique des textes et assurons leur transmission fluide jusqu'au Conseil des Ministres. Nous sommes les garants de la sécurité juridique de l'État.",
        features: [
            "Édition collaborative sécurisée des textes",
            "Gestion des versions et amendements",
            "Planification des Conseils Interministériels",
            "Liaison numérique avec le Conseil d'État"
        ],
        icon: Gavel,
        color: "amber",
        appLink: "/cycle-legislatif/app",
        image: "/images/legislatif.png"
    },
    egop: {
        id: "egop",
        title: "e-GOP (Conseil des Ministres)",
        shortDescription: "L'excellence opérationnelle au sommet de l'Exécutif.",
        fullDescription: "Le cœur numérique du travail gouvernemental. e-GOP (Gestion de l'Ordre du Jour Programmatique) sécurise la préparation des Conseils des Ministres, gère la distribution des dossiers confidentiels et assure le suivi rigoureux de l'application des décisions présidentielles.",
        sggRole: "Secrétaire du Conseil, le SGG utilise cet outil pour élaborer l'Ordre du Jour soumis à l'arbitrage du Président de la République. Nous nous assurons que chaque dossier programmé est complet, mature et validé, permettant ainsi des décisions éclairées au plus haut sommet de l'État.",
        features: [
            "Sécurisation militaire des dossiers confidentiels",
            "Gestion dynamique de l'Ordre du Jour",
            "Diffusion instantanée des relevés de décisions",
            "Tableau de bord de suivi présidentiel"
        ],
        icon: LayoutDashboard,
        color: "purple",
        appLink: "/egop/app",
        image: "/images/egop.png"
    },
    institutions: {
        id: "institutions",
        title: "Annuaire des Institutions",
        shortDescription: "L'ADN de l'État : Cartographie dynamique et temps réel des entités publiques.",
        fullDescription: "Bien plus qu'un annuaire, c'est le référentiel unique de l'organisation administrative du pays. Il offre une vision claire et à jour des missions, des organigrammes et des responsables publics, facilitant la collaboration inter-administrative et l'information du citoyen.",
        sggRole: "Ingénieur de l'organisation administrative, le SGG tient à jour ce fichier maître. Chaque création, fusion ou réorganisation d'entité décrétée est immédiatement reflétée ici, servant de base de vérité pour le budget, la fonction publique et le protocole d'État.",
        features: [
            "Organigrammes interactifs et dynamiques",
            "Fiches d'identité des entités publiques",
            "Annuaire unifié des décideurs publics",
            "Visualisation des tutelles administratives"
        ],
        icon: Building2,
        color: "red",
        appLink: "/institutions/app",
        image: "/images/institutions.png"
    },
    journalOfficiel: {
        id: "journalOfficiel",
        title: "Journal Officiel (Open Data)",
        shortDescription: "L'accès au Droit : Portail républicain de diffusion légale et réglementaire.",
        fullDescription: "La transparence par défaut. Le Journal Officiel est la mémoire législative de la Nation. Ce portail numérique rend le droit gabonais accessible à tous, gratuitement et instantanément, renforçant ainsi la sécurité juridique des citoyens et l'attractivité économique pour les investisseurs.",
        sggRole: "Éditeur officiel de la République, le SGG authentifie et publie les lois et règlements. Notre transition vers le tout-numérique garantit l'adage 'Nul n'est censé ignorer la loi', en mettant enfin l'information juridique officielle à portée de clic de chaque Gabonais.",
        features: [
            "Authentification numérique des parutions",
            "Moteur de recherche juridique puissant",
            "Accès gratuit et illimité aux textes",
            "Consolidation des textes modifiés"
        ],
        icon: FileText,
        color: "green",
        appLink: "/journal-officiel",
        image: "/images/jo.png"
    }
};
