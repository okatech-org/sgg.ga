/**
 * SGG Digital — Breadcrumbs Navigation
 *
 * Fil d'Ariane dynamique basé sur la route actuelle.
 * Supporté dans toute l'application via DashboardLayout.
 */

import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

// ── Route → Label Mapping ───────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, { label: string; semantic?: string }> = {
    '/dashboard': { label: 'Tableau de Bord', semantic: 'Votre page d\'accueil avec les données principales' },
    '/gar/app': { label: 'Suivi GAR', semantic: 'Résultats du Plan d\'Action Gouvernemental' },
    '/nominations/app': { label: 'Nominations', semantic: 'Propositions de nominations aux postes officiels' },
    '/journal-officiel': { label: 'Journal Officiel', semantic: 'Textes de loi et décrets publiés' },
    '/journal-officiel/app': { label: 'Journal Officiel', semantic: 'Textes de loi et décrets publiés' },
    '/institutions/app': { label: 'Institutions', semantic: 'Annuaire des organes de l\'État' },
    '/egop/app': { label: 'e-GOP', semantic: 'Gestion des processus gouvernementaux' },
    '/cycle-legislatif/app': { label: 'Cycle Législatif', semantic: 'Circuit d\'un texte de loi' },
    '/matrice-reporting': { label: 'Reporting', semantic: 'Rapports mensuels des ministères' },
    '/matrice-reporting/saisie': { label: 'Remplir le rapport mensuel', semantic: 'Formulaire de saisie des indicateurs' },
    '/matrice-reporting/exports': { label: 'Télécharger les rapports', semantic: 'Exporter en PDF ou Excel' },
    '/matrice-reporting/validation': { label: 'Valider les rapports', semantic: 'Approuver ou demander des corrections' },
    '/matrice-reporting/suivi': { label: 'Progression du reporting', semantic: 'Qui a rempli, qui n\'a pas encore rempli' },
    '/ptm/matrice': { label: 'Plans de travail', semantic: 'Programmes de travail ministériels' },
    '/ptm/saisie': { label: 'Rédiger un programme', semantic: 'Saisir les actions de votre direction' },
    '/ptm/suivi': { label: 'Suivi des programmes', semantic: 'Avancement de chaque ministère' },
    '/ptm/validation': { label: 'Valider les programmes', semantic: 'Approuver les PTM soumis' },
    '/ptm/coherence': { label: 'Vérifier la cohérence', semantic: 'Détecter les incohérences entre indicateurs' },
    '/ptm/consolidation': { label: 'Rassembler les données', semantic: 'Consolider les PTM de toutes les directions' },
    '/pag-2026': { label: 'Plan d\'Action 2026', semantic: 'Projets prioritaires du gouvernement' },
    '/documents/app': { label: 'Documents', semantic: 'Bibliothèque de fichiers partagés' },
    '/rapports/app': { label: 'Rapports', semantic: 'Rapports générés automatiquement' },
    '/profil': { label: 'Mon Profil', semantic: 'Vos informations personnelles' },
    '/profil/editer': { label: 'Modifier mon profil' },
    '/profil/securite': { label: 'Sécurité du compte' },
    '/profil/notifications': { label: 'Préférences de notifications' },
    '/profil/historique': { label: 'Mes connexions récentes' },
    '/profil/activite': { label: 'Mon activité récente' },
    '/profil/acces': { label: 'Mes droits d\'accès' },
    '/profil/preferences': { label: 'Préférences' },
    '/profil/export': { label: 'Exporter mes données' },
    '/profil/aide': { label: 'Aide' },
    '/formation': { label: 'Formation', semantic: 'Guides et vidéos pour apprendre' },
    '/parametres': { label: 'Paramètres' },
    '/admin': { label: 'Administration', semantic: 'Gestion du système' },
    '/admin/users': { label: 'Comptes utilisateurs', semantic: 'Créer, modifier ou désactiver des comptes' },
    '/admin/permissions': { label: 'Droits d\'accès', semantic: 'Qui peut faire quoi' },
    '/monitoring': { label: 'Supervision technique' },
    '/workflows': { label: 'Automatisations', semantic: 'Configurer les étapes automatiques' },
    '/data-exchange': { label: 'Import / Export de données' },
    '/analytics': { label: 'Analyses', semantic: 'Graphiques et tendances' },
    '/notifications': { label: 'Centre de notifications' },
    '/audit-log': { label: 'Historique des actions', semantic: 'Qui a fait quoi et quand' },
    '/system-stats': { label: 'État du système' },
    '/aide': { label: 'Centre d\'Aide', semantic: 'Glossaire, tutoriels et guides' },
    '/consolidated': { label: 'Vue d\'ensemble nationale', semantic: 'Tous les indicateurs sur une page' },
    '/calendar': { label: 'Calendrier' },
    '/contacts': { label: 'Annuaire' },
    '/admin/advanced': { label: 'Administration Avancée' },
    '/benchmark': { label: 'Comparaison entre ministères' },
    '/auto-reports': { label: 'Rapports Automatisés' },
    '/live-activity': { label: 'Activité en direct' },
    '/kanban': { label: 'Tableau des tâches', semantic: 'Organiser le travail visuellement' },
    '/archives': { label: 'Archives' },
    '/api-docs': { label: 'Documentation technique' },
    '/organigramme': { label: 'Organigramme' },
    '/messagerie': { label: 'Messagerie' },
    '/changelog': { label: 'Historique des mises à jour' },
    '/carte': { label: 'Carte du Gabon' },
    '/sondages': { label: 'Sondages' },
    '/mon-dashboard': { label: 'Mon Tableau de Bord' },
    '/kpi-builder': { label: 'Créer des indicateurs' },
    '/documents': { label: 'Gestion de fichiers' },
    '/comparatif': { label: 'Comparatif' },
    '/okr': { label: 'Objectifs & Résultats', semantic: 'Suivre vos objectifs stratégiques' },
    '/alertes': { label: 'Alertes', semantic: 'Notifications importantes à traiter' },
    '/ministere': { label: 'Mon Ministère' },
    '/annuaire-institutions': { label: 'Institutions du pays' },
    '/synthese': { label: 'Synthèse' },
    '/risques': { label: 'Risques identifiés' },
    '/provinces': { label: 'Provinces du Gabon' },
    '/rapports': { label: 'Rapports' },
    '/planning': { label: 'Planification' },
    '/scorecard': { label: 'Tableau de performance', semantic: 'Performance sous 4 angles : finance, processus, apprentissage, résultats' },
    '/decisions': { label: 'Journal des Décisions' },
    '/formations': { label: 'Formations disponibles' },
    '/portail-citoyen': { label: 'Portail Citoyen', semantic: 'Services pour les citoyens' },
    '/live': { label: 'En direct' },
    '/competences': { label: 'Compétences', semantic: 'Cartographie des compétences des agents' },
    '/sla': { label: 'Niveaux de service' },
    '/conformite': { label: 'Conformité', semantic: 'Vérification du respect des règles' },
    '/odd': { label: 'Objectifs Mondiaux (ODD)', semantic: 'Les 17 objectifs de développement durable de l\'ONU' },
    '/reunions': { label: 'Réunions' },
    '/budget': { label: 'Budget' },
    '/reclamations': { label: 'Réclamations de citoyens' },
    '/effectifs': { label: 'Agents de l\'État' },
    '/energie': { label: 'Énergie' },
    '/marches-publics': { label: 'Appels d\'offres', semantic: 'Marchés publics et contrats de l\'État' },
    '/veille': { label: 'Veille stratégique' },
    '/sante': { label: 'Santé' },
    '/foncier': { label: 'Terrains & Propriétés' },
    '/cooperation': { label: 'Coopération internationale' },
    '/education': { label: 'Éducation' },
    '/communication': { label: 'Communication' },
    '/transports': { label: 'Transports' },
    '/elections': { label: 'Élections' },
    '/gestion-risques': { label: 'Risques' },
    '/agriculture': { label: 'Agriculture' },
    '/entreprises': { label: 'Entreprises' },
    '/juridique': { label: 'Droit & Jurisprudence' },
    '/tourisme': { label: 'Tourisme & Culture' },
    '/cybersecurite': { label: 'Cybersécurité' },
    '/demographie': { label: 'Population & Recensement' },
    '/emploi': { label: 'Emploi & Formation' },
    '/etat-civil': { label: 'État Civil', semantic: 'Naissances, mariages, décès' },
    '/meteo': { label: 'Météo' },
    '/medias': { label: 'Médias' },
    '/eaux-forets': { label: 'Eaux & Forêts' },
    '/mines': { label: 'Mines' },
    '/diplomes': { label: 'Diplômes' },
    '/patrimoine': { label: 'Patrimoine de l\'État' },
    '/peche': { label: 'Pêche' },
    '/propriete-intellectuelle': { label: 'Propriété intellectuelle' },
    '/catastrophes': { label: 'Catastrophes naturelles' },
    '/associations': { label: 'Associations & ONG' },
    '/dette-publique': { label: 'Dette publique' },
    '/telecom': { label: 'Télécoms & Numérique' },
    '/cultes': { label: 'Cultes' },
    '/migrations': { label: 'Migrations' },
    '/habitat': { label: 'Habitat & Urbanisme' },
    '/sports': { label: 'Sports & Jeunesse' },
    '/protection-sociale': { label: 'Protection Sociale' },
    '/dashboard-sgpr': { label: 'Tableau SGPR' },
};

// ── Component ───────────────────────────────────────────────────────────────

export function Breadcrumbs() {
    const location = useLocation();

    const crumbs = useMemo(() => {
        const path = location.pathname;

        // Check for exact match first
        const exactMatch = ROUTE_LABELS[path];
        if (exactMatch) {
            return [{ label: exactMatch.label, semantic: exactMatch.semantic, href: path }];
        }

        // Build progressive path segments
        const segments = path.split('/').filter(Boolean);
        const result: { label: string; semantic?: string; href: string }[] = [];

        let accumulated = '';
        for (const seg of segments) {
            accumulated += `/${seg}`;

            // Check common paths
            const entry = ROUTE_LABELS[accumulated];
            if (entry) {
                result.push({ label: entry.label, semantic: entry.semantic, href: accumulated });
            } else {
                // Fallback: capitalize segment
                const fallbackLabel = seg
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());
                result.push({ label: fallbackLabel, href: accumulated });
            }
        }

        return result;
    }, [location.pathname]);

    if (crumbs.length === 0 || location.pathname === '/dashboard') return null;

    return (
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-muted-foreground mb-4 overflow-x-auto">
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Accueil</span>
            </Link>
            {crumbs.map((crumb, i) => (
                <div key={crumb.href} className="flex items-center gap-1 shrink-0">
                    <ChevronRight className="h-3 w-3" />
                    {i === crumbs.length - 1 ? (
                        <span className="font-medium text-foreground" title={crumb.semantic}>
                            {crumb.label}
                            {crumb.semantic && (
                                <span className="hidden md:inline text-[10px] text-muted-foreground font-normal ml-1.5">
                                    — {crumb.semantic}
                                </span>
                            )}
                        </span>
                    ) : (
                        <Link to={crumb.href} className="hover:text-foreground transition-colors" title={crumb.semantic}>
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}

