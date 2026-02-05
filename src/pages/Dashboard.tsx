/**
 * SGG Digital - Dashboard Principal
 * Routage intelligent selon la catégorie de rôle de l'utilisateur
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDemoUser, type DemoCategory } from "@/hooks/useDemoUser";
import { useAuth } from "@/contexts/AuthContext";
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
  const lastUpdate = "05 février 2026, 14:30";

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
