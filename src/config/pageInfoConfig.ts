export interface WorkflowStep {
  etape: string;
  description: string;
}

export interface DroitAcces {
  role: string;
  niveau: "Lecture" | "Écriture" | "Validation" | "Admin";
}

export interface LogiqueMetier {
  titre: string;
  contenu: string;
}

export interface SupportInfo {
  description: string;
  contact?: string;
  documentation?: string;
}

export interface PageInfoConfig {
  titre: string;
  sousTitre: string;
  objectif: string;
  workflow?: WorkflowStep[];
  droitsAcces?: DroitAcces[];
  logique?: LogiqueMetier[];
  support?: SupportInfo;
}

export const PAGE_INFO_CONFIG: Record<string, PageInfoConfig> = {
  "matrice-reporting": {
    titre: "Matrice GAR / PAG 2026",
    sousTitre: "Vue consolidée du suivi-évaluation",
    objectif: "Cette page présente la vue consolidée des 21 colonnes de la Matrice de Reporting du Plan d'Action Gouvernemental 2026. Elle permet de visualiser en un coup d'œil l'état d'avancement de tous les programmes selon le cadre de la Gestion Axée sur les Résultats (GAR). Les données sont organisées en 6 blocs : Cadrage Stratégique, Gouvernance, Suivi Opérationnel, Suivi Financier, Cadre Juridique et Performance.",
    workflow: [
      { etape: "Sélection de la période", description: "Choisissez le mois et l'année pour afficher les données correspondantes." },
      { etape: "Application des filtres", description: "Filtrez par pilier présidentiel, statut, ministère ou recherche textuelle." },
      { etape: "Consultation des données", description: "Les colonnes éditables apparaissent en jaune pâle selon votre rôle." },
      { etape: "Export", description: "Exportez en Excel, PDF ou CSV via le bouton Exporter." },
    ],
    droitsAcces: [
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Directeur SGG", niveau: "Validation" },
      { role: "SGPR", niveau: "Validation" },
      { role: "Vice-Président du Gouvernement", niveau: "Lecture" },
      { role: "SG Ministère", niveau: "Écriture" },
      { role: "Ministre", niveau: "Lecture" },
      { role: "Citoyen", niveau: "Lecture" },
    ],
    logique: [
      { titre: "Les 8 piliers présidentiels", contenu: "Les programmes sont rattachés aux 8 priorités présidentielles : Énergie & Eau, Éducation & Formation, Santé, Habitat & Cadre de Vie, Infrastructures & Numérique, Agriculture & Souveraineté Alimentaire, Gouvernance & Administration, Justice & Sécurité." },
      { titre: "Codes couleur des statuts", contenu: "EN COURS (vert) : programme en exécution normale. EN PRÉPARATION (bleu) : programme pas encore lancé. RETARD (rouge) : programme accusant un retard significatif. TERMINÉ (vert foncé) : programme achevé. BLOQUÉ (noir) : programme arrêté suite à un obstacle." },
      { titre: "Calcul du % exécution financière", contenu: "Le pourcentage d'exécution financière est calculé automatiquement : (Montant Décaissé / Budget Initial) × 100. Une jauge verte (>70%), orange (30-70%) ou rouge (<30%) accompagne ce pourcentage." },
      { titre: "Lien avec la Matrice PTM/PTG", contenu: "Les programmes affichés ici proviennent du Plan d'Action Gouvernemental et sont alimentés en amont par le Programme de Travail Ministériel (PTM). Le cadrage stratégique (colonnes 1-6) est pré-rempli par l'administration SGG." },
    ],
    support: {
      description: "Pour toute question sur la Matrice de Reporting, contactez l'équipe CTCO du SGG.",
      contact: "admin.systeme@sgg.ga",
      documentation: "/documentation/matrice-reporting",
    },
  },

  "saisie-reporting": {
    titre: "Saisie Mensuelle",
    sousTitre: "Formulaire de reporting des ministères",
    objectif: "Cette page permet aux Secrétaires Généraux de Ministères de remplir leur rapport mensuel pour chaque programme dont leur ministère est pilote ou co-responsable. La saisie couvre les colonnes opérationnelles (10-12), financières (13-16) et de performance (18-21) de la Matrice de Reporting.",
    workflow: [
      { etape: "Sélection du mois", description: "Choisissez la période de reporting (mois/année)." },
      { etape: "Choix du programme", description: "Cliquez sur le programme à renseigner parmi ceux assignés à votre ministère." },
      { etape: "Saisie par étapes", description: "Remplissez les 3 sections : Suivi Opérationnel, Suivi Financier, Performance. La sauvegarde automatique est active." },
      { etape: "Vérification", description: "Consultez le récapitulatif et vérifiez la cohérence des données (alerte si écart >30 points entre % financier et % physique)." },
      { etape: "Soumission", description: "Soumettez le rapport pour validation. Le statut passe de 'Brouillon' à 'Soumis'." },
    ],
    droitsAcces: [
      { role: "SG Ministère", niveau: "Écriture" },
      { role: "Administrateur SGG", niveau: "Admin" },
    ],
    logique: [
      { titre: "Champs obligatoires", contenu: "Les champs marqués d'un astérisque rouge sont obligatoires. Le minimum requis est : activités réalisées (min 100 caractères), au moins une donnée financière, le pourcentage d'avancement physique et le statut du programme." },
      { titre: "Calcul de la complétude", contenu: "La barre de complétude se base sur 6 critères : activités réalisées, montant engagé, montant décaissé, indicateurs KPI, avancement physique et observations. Chaque critère rempli ajoute environ 17% à la barre." },
      { titre: "Sauvegarde et reprise", contenu: "Les données sont sauvegardées automatiquement toutes les 30 secondes en mode brouillon. En cas de déconnexion, vous retrouverez votre saisie en cours à la prochaine connexion." },
      { titre: "Deadlines et sanctions", contenu: "Le reporting est obligatoire et mensuel. Les ministères n'ayant pas soumis leur rapport dans les délais font l'objet de relances automatiques (J+5, J+10, J+15) et peuvent être sanctionnés (gel de crédits après 2 mois sans rapport)." },
    ],
    support: {
      description: "En cas de difficulté avec la saisie, consultez le guide de saisie ou contactez l'assistance technique SGG.",
      contact: "admin.systeme@sgg.ga",
      documentation: "/documentation/guide-saisie",
    },
  },

  "validation-sgg": {
    titre: "Validation SGG (CTCO)",
    sousTitre: "Contrôle technique des rapports soumis",
    objectif: "Cette page est l'espace de travail de la Cellule Technique de Coordination Opérationnelle (CTCO) du SGG. Elle affiche tous les rapports soumis par les ministères en attente de validation technique. Le SGG vérifie la cohérence, la complétude et la qualité des données avant de transmettre au SGPR pour validation stratégique.",
    workflow: [
      { etape: "Réception des rapports", description: "Les rapports soumis par les SG Ministères apparaissent automatiquement dans la liste d'attente." },
      { etape: "Vérification des anomalies", description: "Le système détecte automatiquement les anomalies : décaissé > engagé, écart financier/physique > 30 points, activités insuffisantes." },
      { etape: "Examen individuel", description: "Consultez chaque rapport en détail et comparez avec le mois précédent." },
      { etape: "Décision", description: "Trois actions possibles : Valider (avec commentaire optionnel), Rejeter (avec motif obligatoire), Demander correction (préciser les champs)." },
      { etape: "Transmission au SGPR", description: "Les rapports validés passent automatiquement dans la file d'attente du SGPR." },
    ],
    droitsAcces: [
      { role: "Administrateur SGG", niveau: "Validation" },
      { role: "Directeur SGG", niveau: "Validation" },
    ],
    logique: [
      { titre: "Critères de validation", contenu: "Le SGG vérifie : la complétude des données obligatoires, la cohérence entre les montants financiers (décaissé <= engagé <= budget), la concordance entre avancement physique et exécution financière, la qualité descriptive des activités réalisées (minimum 100 caractères)." },
      { titre: "Détection d'anomalies", contenu: "Le système signale automatiquement 3 types d'anomalies par des badges rouges : Décaissé > Engagé (erreur de saisie probable), Écart Fin/Phys > 30 points (incohérence exécution), Activités insuffisantes (description trop courte)." },
      { titre: "Validation en lot", contenu: "Vous pouvez sélectionner plusieurs rapports à la fois et les valider en un seul clic. Cette fonctionnalité est utile en fin de période quand de nombreux rapports arrivent simultanément." },
      { titre: "Circuit de rejet", contenu: "Un rapport rejeté est renvoyé au SG Ministère avec le motif de rejet. Le ministère doit corriger et resoumettre. L'historique complet des validations/rejets est conservé." },
    ],
    support: {
      description: "Pour les questions liées aux critères de validation ou aux anomalies détectées, contactez la direction SGG.",
      contact: "jp.nzoghe@sgg.ga",
      documentation: "/documentation/validation-sgg",
    },
  },

  "validation-sgpr": {
    titre: "Validation SGPR",
    sousTitre: "Validation stratégique et publication",
    objectif: "Cette page est dédiée au Secrétariat Général de la Présidence de la République. Elle permet de valider stratégiquement les rapports déjà approuvés par le SGG et de les publier pour rendre les données accessibles aux citoyens et aux autres acteurs institutionnels. C'est la dernière étape du circuit de validation.",
    workflow: [
      { etape: "Réception des rapports validés SGG", description: "Seuls les rapports ayant passé la validation technique SGG apparaissent ici." },
      { etape: "Revue consolidée", description: "Les rapports sont présentés avec une vue synthétique par pilier pour faciliter l'analyse stratégique." },
      { etape: "Validation et publication", description: "La validation SGPR publie automatiquement les données. Les rapports publiés deviennent accessibles en lecture seule pour tous les acteurs autorisés, y compris les citoyens." },
      { etape: "Rejet vers SGG", description: "En cas de désaccord stratégique, le rapport peut être renvoyé au SGG avec observations." },
    ],
    droitsAcces: [
      { role: "SGPR", niveau: "Validation" },
    ],
    logique: [
      { titre: "Publication et accès citoyen", contenu: "Une fois validé SGPR, le rapport passe au statut 'Publié'. Les données deviennent visibles pour le profil citoyen dans une version synthétique. Cela garantit la transparence de l'action gouvernementale conformément au PAG 2026." },
      { titre: "Validation en lot", contenu: "Le SGPR peut sélectionner et valider plusieurs rapports simultanément, ce qui est particulièrement utile lors des sessions de validation mensuelles." },
      { titre: "Impact de la publication", contenu: "La publication déclenche : la mise à jour des statistiques du tableau de bord public, la notification au SG auteur du ministère, l'archivage de la version validée, et la mise à jour des indicateurs PAG." },
    ],
    support: {
      description: "Pour toute question relative à la validation stratégique, contactez le cabinet SGPR.",
      contact: "sgpr@presidence.ga",
      documentation: "/documentation/validation-sgpr",
    },
  },

  "suivi-remplissage": {
    titre: "Suivi du Remplissage",
    sousTitre: "Tableau de bord de pilotage GAR",
    objectif: "Ce dashboard temps réel permet au SGG et au SGPR de monitorer le taux de remplissage de la matrice de reporting par l'ensemble des 35+ ministères. Il identifie les retardataires, permet de déclencher des relances et affiche les tendances d'exécution du PAG 2026. C'est l'outil central de pilotage du reporting mensuel obligatoire.",
    workflow: [
      { etape: "Consultation des KPI", description: "Les 4 indicateurs clés en haut de page donnent une vision instantanée : taux de remplissage global, rapports validés, ministères en retard, exécution financière moyenne." },
      { etape: "Analyse par la Heatmap", description: "La grille colorée (ministères x mois) identifie visuellement les lacunes : vert = validé, jaune = soumis, orange = brouillon, rouge = non saisi." },
      { etape: "Comparaison par pilier", description: "Le graphique horizontal compare la progression financière et physique des 8 piliers présidentiels." },
      { etape: "Gestion des retardataires", description: "Le tableau des ministères en retard permet d'envoyer des relances ciblées en un clic." },
      { etape: "Suivi des tendances", description: "Le graphique de tendance montre l'évolution du taux de remplissage sur les 6 derniers mois." },
    ],
    droitsAcces: [
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Directeur SGG", niveau: "Lecture" },
      { role: "SGPR", niveau: "Lecture" },
    ],
    logique: [
      { titre: "Calcul du taux de remplissage", contenu: "Le taux de remplissage global = (nombre de rapports soumis ou validés pour le mois en cours) / (nombre total de programmes dans la matrice PAG) × 100. L'objectif cible est 100% chaque mois." },
      { titre: "Heatmap : codes couleur", contenu: "Vert : rapport validé (SGPR). Jaune : rapport soumis (en attente de validation). Orange : rapport en brouillon (saisie commencée). Rouge : non saisi (aucun rapport pour ce mois). Gris : non applicable (programme pas encore actif)." },
      { titre: "Système de relance automatique", contenu: "Les relances suivent un calendrier progressif d'escalade : J+5 après deadline = relance au SG. J+10 = copie au Ministre. J+15 = alerte au SGG pour sanction potentielle. J+30 = notification de gel des crédits conformément aux directives PAG 2026." },
      { titre: "Export Conseil des Ministres", contenu: "Le dashboard peut être exporté en PDF pour présentation lors du Conseil des Ministres. Le PDF inclut les KPI, la heatmap et la liste des retardataires." },
    ],
    support: {
      description: "Pour les questions relatives au suivi du remplissage et aux relances, contactez la CTCO du SGG.",
      contact: "admin.systeme@sgg.ga",
      documentation: "/documentation/suivi-remplissage",
    },
  },

  "ptm-matrice": {
    titre: "Matrice PTM",
    sousTitre: "Vue consolidée des Programmes de Travail Ministériels",
    objectif: "Cette page affiche l'ensemble des initiatives inscrites aux Programmes de Travail Ministériels (PTM) pour l'année 2026. Elle permet de consulter, filtrer et exporter les données selon les 10 colonnes officielles de la matrice PTM : rubrique, intitulé, cadrage stratégique, incidence financière, loi de finance, services porteurs, date de transmission au SGG, et observations.",
    workflow: [
      { etape: "Consultation", description: "Parcourir les initiatives de tous les ministères" },
      { etape: "Filtrage", description: "Affiner par rubrique (textes législatifs, politique générale, missions), par statut, par cadrage ou par ministère" },
      { etape: "Analyse", description: "Consulter les statistiques d'inscription au PTG et les taux de soumission" },
      { etape: "Export", description: "Télécharger les données en Excel, PDF ou CSV" }
    ],
    droitsAcces: [
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Directeur SGG", niveau: "Lecture" },
      { role: "SGPR", niveau: "Lecture" },
      { role: "Ministre / SG Ministère", niveau: "Lecture" },
      { role: "Président / VPG", niveau: "Lecture" }
    ],
    logique: [
      { titre: "3 Rubriques", contenu: "Projets de textes législatifs et réglementaires — Politique Générale — Missions, Conférences et Séminaires. Chaque initiative est classée dans une rubrique unique." },
      { titre: "Cycle de vie", contenu: "Brouillon → Soumis au SGG → Validé SGG → Inscrit au PTG. Le rejet renvoie l'initiative au ministère pour correction." },
      { titre: "Lien PAG", contenu: "Chaque initiative peut être rattachée à un programme du Plan d'Action Gouvernemental (PAG 2026) pour assurer la traçabilité planification → exécution." }
    ],
    support: {
      description: "Pour toute question sur la matrice PTM, contactez la Direction de la Programmation du SGG.",
      contact: "programmation@sgg.ga"
    }
  },

  "ptm-saisie": {
    titre: "Saisie PTM",
    sousTitre: "Formulaire de saisie des initiatives ministérielles",
    objectif: "Cette page permet aux Secrétaires Généraux de Ministère de saisir les initiatives de leur Programme de Travail Ministériel (PTM). Le formulaire en 2 étapes guide la saisie des 10 colonnes obligatoires.",
    workflow: [
      { etape: "Étape 1 — Cadrage", description: "Saisir la rubrique, l'intitulé, le cadrage stratégique et le programme PAG de rattachement" },
      { etape: "Étape 2 — Détails", description: "Indiquer l'incidence financière, la loi de finance, les services porteurs et la date prévue de transmission" },
      { etape: "Enregistrement", description: "Sauvegarder en brouillon (auto-sauvegarde activée) ou soumettre au SGG si complétude ≥ 60%" },
      { etape: "Correction", description: "En cas de rejet par le SGG, corriger selon le motif indiqué et resoumettre" }
    ],
    droitsAcces: [
      { role: "SG Ministère", niveau: "Écriture" },
      { role: "Ministre", niveau: "Écriture" },
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Autres rôles", niveau: "Lecture" }
    ],
    logique: [
      { titre: "Complétude", contenu: "8 champs sont suivis : rubrique, intitulé (≥20 caractères), cadrage, détail cadrage, programme PAG, services porteurs, date transmission, observations. La soumission nécessite ≥60% de complétude." },
      { titre: "Auto-sauvegarde", contenu: "Le formulaire sauvegarde automatiquement vos données dans le navigateur. Vous pouvez quitter et revenir sans perdre votre travail." }
    ],
    support: {
      description: "Guide de saisie PTM disponible. Pour assistance technique, contactez l'équipe support.",
      contact: "support.ptm@sgg.ga",
      documentation: "Guide de saisie PTM v1.0"
    }
  },

  "ptm-validation": {
    titre: "Validation PTM — SGG",
    sousTitre: "Validation technique et inscription au PTG",
    objectif: "Cette page permet au SGG de valider techniquement les initiatives soumises par les ministères, et au SGPR d'inscrire les initiatives validées au Programme de Travail Gouvernemental (PTG).",
    workflow: [
      { etape: "Réception", description: "Les initiatives soumises par les ministères apparaissent dans l'onglet 'Soumises au SGG'" },
      { etape: "Vérification", description: "Le SGG vérifie la conformité : intitulé complet, cadrage stratégique cohérent, programme PAG lié" },
      { etape: "Décision", description: "Valider (→ validé SGG) ou Rejeter avec motif (→ retour au ministère)" },
      { etape: "Inscription PTG", description: "Le SGPR inscrit les initiatives validées au Programme de Travail Gouvernemental" }
    ],
    droitsAcces: [
      { role: "Directeur SGG", niveau: "Validation" },
      { role: "SGPR", niveau: "Validation" },
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Autres rôles", niveau: "Lecture" }
    ],
    logique: [
      { titre: "Détection d'anomalies", contenu: "Le système détecte automatiquement : intitulé trop court (<20 car.), absence de lien programme PAG, détail de cadrage insuffisant, observations manquantes." },
      { titre: "Validation par lot", contenu: "Sélectionnez plusieurs initiatives via les cases à cocher pour valider ou inscrire en une seule action." },
      { titre: "Circuit de rejet", contenu: "Un rejet nécessite obligatoirement un motif écrit. L'initiative retourne au ministère avec le motif pour correction." }
    ],
    support: {
      description: "Pour les questions de validation, contactez la Direction du SGG.",
      contact: "validation@sgg.ga"
    }
  },

  "ptm-suivi": {
    titre: "Suivi de la Programmation",
    sousTitre: "Dashboard de pilotage PTM → PTG",
    objectif: "Tableau de bord stratégique pour suivre l'avancement de la programmation ministérielle : taux d'inscription au PTG, répartition par rubrique, et identification des ministères en retard.",
    workflow: [
      { etape: "Vue d'ensemble", description: "Consulter les KPI globaux : taux inscription PTG, initiatives soumises, rejetées" },
      { etape: "Analyse par rubrique", description: "Visualiser la progression par type d'initiative (textes législatifs, politique générale, missions)" },
      { etape: "Suivi ministériel", description: "Identifier les ministères en retard via la heatmap et le tableau de suivi" },
      { etape: "Relance", description: "Envoyer des relances aux ministères n'ayant pas soumis leurs initiatives" }
    ],
    droitsAcces: [
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Directeur SGG", niveau: "Lecture" },
      { role: "SGPR / Président / VPG", niveau: "Lecture" },
      { role: "Ministre / SG Ministère", niveau: "Lecture" }
    ],
    logique: [
      { titre: "Heatmap", contenu: "La heatmap croise ministères × statuts. Chaque cellule est colorée selon le nombre d'initiatives dans chaque statut : gris (brouillon), bleu (soumis), orange (validé SGG), vert (inscrit PTG), rouge (rejeté)." },
      { titre: "Taux de soumission", contenu: "Calculé comme : (initiatives soumises + validées + inscrites) / total initiatives × 100. Un taux < 50% déclenche une alerte." }
    ],
    support: {
      description: "Pour configurer les alertes et relances automatiques, contactez l'administrateur.",
      contact: "admin.systeme@sgg.ga"
    }
  },

  "ptm-coherence": {
    titre: "Cohérence PTM ↔ Reporting PAG",
    sousTitre: "Pont de données Planification → Exécution",
    objectif: "Ce dashboard unifié compare les initiatives planifiées au PTM/PTG avec les programmes en cours d'exécution dans la Matrice de Reporting PAG 2026. Il identifie les écarts entre planification et exécution pour un pilotage stratégique optimal.",
    workflow: [
      { etape: "Couverture PAG", description: "Vérifier que chaque programme du PAG est couvert par au moins une initiative PTM" },
      { etape: "Pont de données", description: "Visualiser les liens actifs entre initiatives PTM inscrites et rapports mensuels" },
      { etape: "Analyse d'écarts", description: "Identifier les programmes PAG sans couverture PTM et les initiatives PTM sans exécution" },
      { etape: "Arbitrage", description: "Utiliser les données pour prioriser les actions correctives" }
    ],
    droitsAcces: [
      { role: "Président / VPG / SGPR", niveau: "Lecture" },
      { role: "Administrateur SGG", niveau: "Admin" },
      { role: "Directeur SGG", niveau: "Lecture" },
      { role: "Autres rôles exécutifs", niveau: "Lecture" }
    ],
    logique: [
      { titre: "Taux de couverture", contenu: "Pourcentage des programmes PAG ayant au moins une initiative PTM inscrite au PTG. Un taux de 100% signifie que toute l'action gouvernementale est planifiée." },
      { titre: "Pont de données actif", contenu: "Quand une initiative PTM est inscrite au PTG et liée à un programme PAG, le système peut automatiquement créer une entrée dans la matrice de reporting mensuel." },
      { titre: "Programmes non couverts", contenu: "Les programmes PAG sans initiative PTM liée représentent des actions en exécution sans planification amont — un risque de pilotage." }
    ],
    support: {
      description: "Ce dashboard est un outil d'aide à la décision stratégique. Pour personnaliser les vues, contactez l'équipe technique.",
      contact: "admin.systeme@sgg.ga"
    }
  }
};
