/**
 * SGG Digital - En-tête de Dashboard
 * Composant d'en-tête commun avec titre contextuel selon le rôle
 */

import { Calendar, Crown, Building2, Scale, Shield, Globe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type DemoCategory } from "@/hooks/useDemoUser";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  category?: DemoCategory | null;
  roleTitle?: string;
  institution?: string;
  lastUpdate?: string;
}

// Configuration des catégories
const categoryConfig: Record<DemoCategory, {
  icon: React.ElementType;
  badge: string;
  badgeClass: string;
}> = {
  executif: {
    icon: Crown,
    badge: "Exécutif",
    badgeClass: "bg-government-navy text-white",
  },
  presidence: {
    icon: Building2,
    badge: "Présidence",
    badgeClass: "bg-government-gold text-government-navy",
  },
  legislatif: {
    icon: Scale,
    badge: "Législatif",
    badgeClass: "bg-status-info text-white",
  },
  juridictionnel: {
    icon: Scale,
    badge: "Juridictionnel",
    badgeClass: "bg-government-green text-white",
  },
  administratif: {
    icon: Shield,
    badge: "Administratif",
    badgeClass: "bg-primary text-primary-foreground",
  },
  public: {
    icon: Globe,
    badge: "Accès Public",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

export function DashboardHeader({
  title,
  subtitle,
  category,
  roleTitle,
  institution,
  lastUpdate,
}: DashboardHeaderProps) {
  const config = category ? categoryConfig[category] : null;
  const Icon = config?.icon || Users;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {config && (
              <Badge className={config.badgeClass}>
                <Icon className="h-3 w-3 mr-1" />
                {config.badge}
              </Badge>
            )}
            {roleTitle && (
              <span className="text-sm text-muted-foreground">
                {roleTitle}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
          {institution && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {institution}
            </p>
          )}
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Dernière mise à jour : {lastUpdate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Fonction utilitaire pour obtenir le titre selon la catégorie
export function getDashboardTitle(
  category: DemoCategory | null,
  roleId?: string
): string {
  if (!category) return "Tableau de Bord";

  const titles: Record<DemoCategory, string> = {
    executif: "Tableau de Bord Exécutif",
    presidence: "Coordination Stratégique",
    legislatif: "Suivi Législatif",
    juridictionnel: "Consultation Juridique",
    administratif: "Administration SGG",
    public: "Portail Public",
  };

  // Titres spécifiques par rôle
  if (roleId) {
    const roleTitles: Record<string, string> = {
      president: "Tableau de Bord Présidentiel",
      "vice-president": "Tableau de Bord Vice-Présidentiel",
      "premier-ministre": "Coordination Gouvernementale",
      ministre: "Tableau de Bord Ministériel",
      "sg-ministere": "Interface Opérationnelle",
      sgpr: "Secrétariat Général de la Présidence",
      assemblee: "Assemblée Nationale",
      senat: "Sénat",
      "conseil-etat": "Conseil d'État",
      "cour-constitutionnelle": "Cour Constitutionnelle",
      "sgg-admin": "Administration Système",
      "sgg-directeur": "Direction SGG",
      dgjo: "Journal Officiel",
      citoyen: "Portail Citoyen",
      "professionnel-droit": "Espace Professionnel",
    };

    if (roleTitles[roleId]) {
      return roleTitles[roleId];
    }
  }

  return titles[category];
}

// Fonction utilitaire pour obtenir le sous-titre
export function getDashboardSubtitle(
  category: DemoCategory | null,
  roleId?: string
): string {
  if (!category) return "Vue d'ensemble de l'activité gouvernementale";

  const subtitles: Record<DemoCategory, string> = {
    executif: "Suivi de l'exécution du Plan d'Action Gouvernemental 2026",
    presidence: "Transmission des dossiers et arbitrages présidentiels",
    legislatif: "Suivi des projets de loi et du cycle législatif",
    juridictionnel: "Consultations juridiques et contrôle de constitutionnalité",
    administratif: "Gestion du système et des publications",
    public: "Accès aux textes officiels de la République Gabonaise",
  };

  // Sous-titres spécifiques
  if (roleId) {
    const roleSubtitles: Record<string, string> = {
      president: "Autorité suprême - Décisions et validations",
      "premier-ministre": "Coordination de l'action gouvernementale",
      ministre: "Propositions de textes et reporting GAR",
      "sg-ministere": "Saisie des rapports et suivi des dossiers",
      sgpr: "Coordination stratégique et transmission présidentielle",
      assemblee: "Réception et examen des projets de loi",
      senat: "Chambre haute du Parlement",
      "conseil-etat": "Avis juridiques sur les projets de textes",
      "cour-constitutionnelle": "Contrôle de constitutionnalité des lois",
      dgjo: "Publication et consolidation des textes officiels",
      "professionnel-droit": "Recherche avancée et accès API",
    };

    if (roleSubtitles[roleId]) {
      return roleSubtitles[roleId];
    }
  }

  return subtitles[category];
}
