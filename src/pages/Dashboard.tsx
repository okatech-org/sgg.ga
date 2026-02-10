/**
 * SGG Digital - Dashboard Principal
 * Routage intelligent selon la catégorie de rôle de l'utilisateur
 *
 * Ergonomie novice :
 *   1. WelcomeGuide : message d'accueil + actions guidées (avant les données)
 *   2. OnboardingProgress : checklist "Premiers pas" par rôle
 *   3. DashboardHeader : contexte rôle + badge + dernière màj
 *   4. Section métier : données spécifiques au rôle
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDemoUser, type DemoCategory } from "@/hooks/useDemoUser";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeGuide } from "@/components/dashboard/WelcomeGuide";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import {
  DashboardHeader,
  getDashboardTitle,
  getDashboardSubtitle,
  ExecutiveDashboardSection,
  SGPRDashboardSection,
  LegislativeDashboardSection,
  JudicialDashboardSection,
  AdminDashboardSection,
  PublicPortalSection,
} from "@/components/dashboard/sections";

export default function Dashboard() {
  const { demoUser, getRoleCategory } = useDemoUser();
  const { user, role } = useAuth();

  // Déterminer la catégorie du rôle
  const category = getRoleCategory();
  const roleId = demoUser?.id;

  // Obtenir les informations d'affichage
  const title = getDashboardTitle(category, roleId);
  const subtitle = getDashboardSubtitle(category, roleId);
  const lastUpdate = "10 février 2026, 17:30";

  // Fonction de rendu du contenu selon la catégorie
  const renderDashboardContent = () => {
    // Si pas d'utilisateur démo, afficher le dashboard par défaut (Exécutif)
    if (!category) {
      return <ExecutiveDashboardSection />;
    }

    switch (category) {
      case "executif":
        return <ExecutiveDashboardSection roleId={roleId} />;

      case "presidence":
        return <SGPRDashboardSection />;

      case "legislatif":
        return <LegislativeDashboardSection roleId={roleId} />;

      case "juridictionnel":
        return <JudicialDashboardSection roleId={roleId} />;

      case "administratif":
        return <AdminDashboardSection roleId={roleId} />;

      case "public":
        return <PublicPortalSection roleId={roleId} />;

      default:
        // Fallback vers le dashboard exécutif
        return <ExecutiveDashboardSection />;
    }
  };

  return (
    <DashboardLayout>
      {/* Guide d'accueil contextuel — aide les novices à comprendre leur rôle */}
      <div data-tutorial="welcome-guide">
        <WelcomeGuide
          roleId={roleId}
          category={category}
          userName={demoUser?.title}
          institution={demoUser?.institution}
        />
      </div>

      {/* Checklist "Premiers pas" — progression gamifiée */}
      <OnboardingProgress roleId={roleId} />

      {/* En-tête contextuel */}
      <DashboardHeader
        title={title}
        subtitle={subtitle}
        category={category}
        roleTitle={demoUser?.role}
        institution={demoUser?.institution}
        lastUpdate={lastUpdate}
      />

      {/* Contenu du dashboard selon le rôle */}
      {renderDashboardContent()}
    </DashboardLayout>
  );
}
