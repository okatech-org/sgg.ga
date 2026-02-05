
import { Zap, GraduationCap, HeartPulse, Home, Globe, Factory, Wheat, Shield } from "lucide-react";

// ============================================
// PAG 2026 - DONNÉES STRUCTURÉES
// Source: PAG 2026 - Lien PNCD | Matrice de Reporting V°1
// Base légale: Loi de Finances Initiale 2026 (LOI N°041/2025)
// Dernière mise à jour: 28 décembre 2025
// ============================================

export const pag2026Config = {
    lastUpdate: "28 décembre 2025",
    source: "Loi de Finances Initiale 2026 (LOI N°041/2025)",
    version: "1.0"
};

// Indicateurs Macroéconomiques Clés
export const macroIndicators = [
    { label: "PIB Total", value: "+6,5%", description: "Point d'inflexion stratégique", trend: "up" },
    { label: "Croissance Hors Pétrole", value: "+7,6%", description: "Moteur principal de croissance", trend: "up" },
    { label: "Secteur Pétrolier", value: "-3,0%", description: "Déclin structurel compensé", trend: "down" },
    { label: "Budget d'État (LFI 2026)", value: "4 441 Mds", description: "Budget Général en FCFA", trend: "neutral" },
    { label: "Investissement (Titre 5)", value: "2 173 Mds", description: "49% du Budget - Record historique (+258%)", trend: "up" },
    { label: "Recettes Nettes", value: "3 630 Mds", description: "Budget Général en FCFA", trend: "neutral" },
];

// Moteurs Sectoriels - Top Performers
export const sectorDrivers = [
    { sector: "BTP & Infrastructures", growth: "+21%", driver: "Grands chantiers structurants (PNCD)" },
    { sector: "Élevage", growth: "+11,2%", driver: "Préparation arrêt importations 2027" },
    { sector: "Gaz", growth: "+9,9%", driver: "Montée en puissance production" },
    { sector: "Industries Diverses", growth: "+8,4%", driver: "Diversification industrielle" },
    { sector: "Eau/Électricité", growth: "+7,5%", driver: "Investissements FNEE" },
    { sector: "Pêche", growth: "+6,1%", driver: "Industrialisation du secteur" },
    { sector: "Agriculture", growth: "+5,6%", driver: "Souveraineté alimentaire" },
];

// Les 7 Priorités de l'Action Publique
export const priorities = [
    {
        id: 1,
        title: "Énergie & Eau",
        subtitle: "Accès Universel",
        icon: Zap,
        color: "blue",
        ministry: "Min. Accès Universel Eau/Énergie",
        coPilots: ["Pétrole & Gaz", "Travaux Publics", "Environnement"],
        fund: "FNEE - 82 Mds FCFA",
        odds: [6, 7, 9, 13],
        actions: [
            "Programme \"Dernier Kilomètre\" (50 000 foyers)",
            "Sécurisation adductions d'eau urbaines",
            "Fiabilisation réseaux SEEG",
        ],
        target: "50 000 raccordements + 4 stations/ouvrages livrés",
        kpiValue: "50 000",
        kpiLabel: "Raccordements cibles"
    },
    {
        id: 2,
        title: "Éducation & Formation",
        subtitle: "Capital Humain",
        icon: GraduationCap,
        color: "amber",
        ministry: "Min. Éducation Nat. & Formation Prof.",
        coPilots: ["Enseignement Sup.", "Travail/Emploi", "Jeunesse"],
        fund: null,
        odds: [4, 8, 10],
        actions: [
            "Réhabilitation 200 salles de classe",
            "Renforcement discipline et filières techniques",
            "Programmes d'alternance ciblés",
        ],
        target: "200 salles de classe réhabilitées",
        kpiValue: "200",
        kpiLabel: "Salles réhabilitées"
    },
    {
        id: 3,
        title: "Santé & Affaires Sociales",
        subtitle: "Protection Sociale",
        icon: HeartPulse,
        color: "red",
        ministry: "Min. Santé",
        coPilots: ["Affaires Sociales", "Femme/Famille", "CNAMGS"],
        fund: null,
        odds: [3, 1, 5, 10],
        actions: [
            "Modernisation plateaux techniques CHU",
            "Extension couverture CNAMGS indigents",
            "Disponibilité médicaments essentiels",
        ],
        target: "Amélioration accès aux soins",
        kpiValue: "100%",
        kpiLabel: "Couverture CNAMGS étendue"
    },
    {
        id: 4,
        title: "Habitat & Logement",
        subtitle: "Cadre de Vie",
        icon: Home,
        color: "green",
        ministry: "Min. Habitat, Urbanisme & Foncier",
        coPilots: ["Travaux Publics", "Intérieur", "Éco. Numérique"],
        fund: "FGHL - 12 Mds FCFA + 28 Mds complémentaires",
        odds: [11, 9],
        actions: [
            "Relance chantiers logements sociaux",
            "Sécurisation titres et parcelles (\"Un Gabonais - Un Titre\")",
            "Aménagement quartiers sous-intégrés",
        ],
        target: "Accès facilité au logement social",
        kpiValue: "10 000",
        kpiLabel: "Titres fonciers sécurisés"
    },
    {
        id: 5,
        title: "Infrastructures & Numérique",
        subtitle: "Modernisation",
        icon: Globe,
        color: "purple",
        ministry: "Min. Travaux Publics",
        coPilots: ["Économie Numérique", "Transports", "Planification"],
        fund: "FNI - 18 Mds FCFA",
        odds: [9, 11, 17],
        actions: [
            "Priorité routes économiques et voiries",
            "Dématérialisation procédures administratives",
            "Extension fibre optique nationale",
        ],
        target: "Désenclavement territorial",
        kpiValue: "2 137",
        kpiLabel: "Mds FCFA investis"
    },
    {
        id: 6,
        title: "Industrie & Entrepreneuriat",
        subtitle: "Made in Gabon",
        icon: Factory,
        color: "indigo",
        ministry: "Min. Industrie & Transformation",
        coPilots: ["Commerce/PME", "Économie & Finances"],
        fund: "Centrale d'Achat (CAG) - 195 Mds FCFA",
        odds: [8, 9, 12],
        actions: [
            "Soutien usines locales (Bois, Mines)",
            "Opérationnalisation Centrale d'Achat (CAG) - baisse prix -15% à -30%",
            "Incitations fiscales embauche locale",
        ],
        target: "Baisse prix panier -10% à -15%",
        kpiValue: "-15%",
        kpiLabel: "Baisse prix cible"
    },
    {
        id: 7,
        title: "Agriculture & Souveraineté Alimentaire",
        subtitle: "Nourrir le Gabon",
        icon: Wheat,
        color: "emerald",
        ministry: "Min. Agriculture & Élevage",
        coPilots: ["Pêche & Éco. Bleue", "Environnement", "Forêts"],
        fund: "FSA - 15,5 Mds FCFA",
        odds: [2, 12, 14, 15],
        actions: [
            "400 fermes avicoles, 120k tonnes/an",
            "Interdiction import poulet 01/01/2027",
            "Développement unités transformation (Manioc, Banane)",
        ],
        target: "150 fermes opérationnelles, 2 000 éleveurs formés",
        kpiValue: "400",
        kpiLabel: "Fermes avicoles cibles"
    },
];

// Les 5 Fonds Stratégiques (FGIS)
export const strategicFunds = [
    { code: "FNEE", name: "Eau & Électricité", amount: 82.0, percentage: 61, milestone: "CA/DG nommés" },
    { code: "FNI", name: "Infrastructures", amount: 18.0, percentage: 13, milestone: "Procédures" },
    { code: "FSA", name: "Agriculture", amount: 15.5, percentage: 11, milestone: "Projets pilotes" },
    { code: "FGHL", name: "Habitat & Logement", amount: 12.0, percentage: 9, milestone: "Études" },
    { code: "FDFH", name: "Développement Halieutique", amount: 7.5, percentage: 6, milestone: "Structuration" },
];

// Structure Budgétaire (LFI 2026)
export const budgetStructure = [
    { title: "Titre 5 : Investissement", amount: 2173.07, percentage: 47.1, highlight: true, observation: "Priorité absolue (+258%)" },
    { title: "Titre 2 : Personnel", amount: 959.71, percentage: 20.8, highlight: false, observation: "Salaires, primes, indemnités" },
    { title: "Titre 4 : Transferts", amount: 557.65, percentage: 12.1, highlight: false, observation: "Subventions, bourses, social" },
    { title: "Titre 3 : Biens & Services", amount: 429.76, percentage: 9.3, highlight: false, observation: "Fonctionnement courant" },
    { title: "Titre 1 : Charges de la Dette", amount: 419.84, percentage: 9.1, highlight: false, observation: "Intérêts et charges" },
    { title: "Titre 6 : Autres Dépenses", amount: 78.92, percentage: 1.7, highlight: false, observation: "Dépenses communes" },
];

// Top 10 Missions d'Investissement
export const topInvestmentMissions = [
    { rank: 1, mission: "Logements & Équipements", amount: 450.46, share: 20.73 },
    { rank: 2, mission: "Défense Nationale", amount: 200.00, share: 9.20 },
    { rank: 3, mission: "Ressources Hyd./Énerg.", amount: 171.00, share: 7.87 },
    { rank: 4, mission: "Transversales", amount: 166.01, share: 7.64 },
    { rank: 5, mission: "Planification Dév.", amount: 158.94, share: 7.31 },
    { rank: 6, mission: "Ens. Supérieur", amount: 123.20, share: 5.67 },
    { rank: 7, mission: "Santé", amount: 101.50, share: 4.67 },
    { rank: 8, mission: "Éducation Nat.", amount: 91.58, share: 4.21 },
    { rank: 9, mission: "Gestion Fin. Pub.", amount: 88.25, share: 4.06 },
    { rank: 10, mission: "Sécurité", amount: 83.51, share: 3.84 },
];

// KPIs GAR 2026
export const garKPIs = [
    { indicator: "Exécution Budget Investissement (T5)", target: "≥ 85%", scope: "Taux d'engagement" },
    { indicator: "Cible Liquidation", target: "≥ 70%", scope: "Décaissements effectifs" },
    { indicator: "Taux de Recouvrement Recettes", target: "≥ 95%", scope: "Conformité prévisions" },
    { indicator: "Couverture Territoire CAG", target: "≥ 60%", scope: "Couverture nationale" },
    { indicator: "Baisse Prix Panier CAG", target: "-10% à -15%", scope: "Produits 1ère nécessité" },
    { indicator: "Fermes Avicoles Opérationnelles", target: "150", scope: "Sur 400 cibles" },
    { indicator: "Éleveurs Formés", target: "2 000", scope: "Certification avicole" },
    { indicator: "Raccordements \"Dernier Km\"", target: "50 000", scope: "Énergie & Eau" },
    { indicator: "Délai de Paiement", target: "≤ 30 jours", scope: "Trésorerie" },
    { indicator: "Reporting Mensuel", target: "100%", scope: "Ministères sous GAR" },
];

// Impacts ODD
export const oddImpacts = [
    { domain: "Énergie & Eau / Accès Universel", impact: "50k nouveaux raccordements, -15% pertes réseau", odds: [6, 7, 13] },
    { domain: "Souveraineté Avicole & Vie Chère", impact: "120k T production locale, 4 000 emplois directs", odds: [2, 8, 12] },
    { domain: "Infrastructures & Désenclavement", impact: "2 137 Mds investis, 100% transformation Mn", odds: [9, 11] },
    { domain: "Gouvernance & Institutions Fortes", impact: "100% reporting mensuel, notation cible AA", odds: [16, 17] },
];

// FAQ
export const faqItems = [
    {
        question: "Qu'est-ce que le PAG 2026 ?",
        answer: "Le Plan d'Action Gouvernemental 2026 est la feuille de route opérationnelle du gouvernement gabonais pour l'année 2026. Il traduit la vision présidentielle en 7 priorités concrètes, avec un budget d'investissement record de 2 173 milliards FCFA."
    },
    {
        question: "Comment puis-je suivre l'avancement du PAG ?",
        answer: "Des tableaux de bord publics sont mis à jour mensuellement sur le site du SGG, avec des indicateurs clés par priorité. Le module GAR (Gestion Axée sur les Résultats) permet un suivi en temps réel de l'exécution."
    },
    {
        question: "Comment bénéficier du programme \"Dernier Kilomètre\" ?",
        answer: "Le programme \"Dernier Kilomètre\" vise à raccorder 50 000 foyers à l'électricité et à l'eau. Contactez les services du Ministère de l'Accès Universel à l'Eau et à l'Énergie ou votre préfecture pour vous inscrire."
    },
    {
        question: "Qu'est-ce que la Centrale d'Achat du Gabon (CAG) ?",
        answer: "La CAG est une structure dotée de 195 Mds FCFA pour lutter contre la vie chère. Elle permet des importations massives et un soutien à la production locale, avec une cible de baisse des prix de 15% à 30% sur les produits de première nécessité."
    },
    {
        question: "Comment devenir éleveur dans le cadre du pôle avicole ?",
        answer: "Le programme prévoit la formation de 2 000 éleveurs et la création de 400 fermes. Rapprochez-vous du Ministère de l'Agriculture et de l'Élevage pour connaître les modalités d'inscription et les critères d'éligibilité."
    },
];

// Citizen Benefits
export const citizenBenefits = {
    families: {
        title: "Pour les Familles",
        description: "Amélioration du quotidien",
        image: "/images/pag-family.png",
        benefits: [
            { icon: "🏠", text: "Accès facilité au logement social" },
            { icon: "⚡", text: "Raccordement électrique \"Dernier Kilomètre\"" },
            { icon: "💧", text: "Eau potable accessible" },
            { icon: "🛒", text: "Baisse prix alimentaires (-15% à -30% via CAG)" },
            { icon: "🏥", text: "Amélioration services santé (CNAMGS élargie)" },
        ]
    },
    youth: {
        title: "Pour les Jeunes",
        description: "Formation et opportunités",
        image: "/images/pag-youth.png",
        benefits: [
            { icon: "📚", text: "Salles de classe réhabilitées" },
            { icon: "💼", text: "Programmes d'alternance et emploi" },
            { icon: "🌐", text: "Connectivité internet améliorée" },
            { icon: "🏭", text: "Opportunités secteur avicole et agro-industrie" },
        ]
    },
    entrepreneurs: {
        title: "Pour les Entrepreneurs",
        description: "Croissance et soutien",
        image: "/images/pag-entrepreneur.png",
        benefits: [
            { icon: "🏭", text: "Soutien production locale" },
            { icon: "📊", text: "Centrale d'Achat - débouchés garantis" },
            { icon: "💰", text: "Incitations fiscales embauche" },
            { icon: "🌾", text: "Accès foncier agricole sécurisé" },
        ]
    },
};
