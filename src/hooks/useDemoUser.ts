import { useState, useEffect } from "react";
import { logger } from '@/services/logger';

// Types pour les catégories de rôles
export type DemoCategory =
  | "executif"
  | "presidence"
  | "legislatif"
  | "juridictionnel"
  | "administratif"
  | "public";

export interface DemoUser {
  id: string;
  title: string;
  role: string;
  institution: string;
  email?: string;
  access: string[];
  category?: DemoCategory;
  /** ID du ministère rattaché (pour sg-ministere et ministre) */
  ministereId?: string;
}

// Configuration des capacités par rôle
export interface RoleCapabilities {
  canValidateNominations: boolean;
  canSignDecrees: boolean;
  canSubmitGAR: boolean;
  canPublishJO: boolean;
  canManageUsers: boolean;
  canViewArbitrages: boolean;
  canSubmitBills: boolean;
  canRenderAvis: boolean;
  canControlConstitutionality: boolean;
  dashboardType: DemoCategory;
}

// Mapping des rôles vers leurs catégories
const roleCategoryMap: Record<string, DemoCategory> = {
  // Exécutif
  "president": "executif",
  "vice-president": "executif",
  "premier-ministre": "executif",
  "ministre": "executif",
  "sg-ministere": "executif",
  // Présidence
  "sgpr": "presidence",
  // Législatif
  "assemblee": "legislatif",
  "senat": "legislatif",
  // Juridictionnel
  "conseil-etat": "juridictionnel",
  "cour-constitutionnelle": "juridictionnel",
  // Administratif
  "sgg-admin": "administratif",
  "sgg-directeur": "administratif",
  "dgjo": "administratif",
  // Directions sous tutelle
  "directeur-cgi": "administratif",
  "directeur-dgpn": "administratif",
  // Public
  "citoyen": "public",
  "professionnel-droit": "public",
};

// Configuration des capacités par rôle
const roleCapabilitiesMap: Record<string, RoleCapabilities> = {
  "president": {
    canValidateNominations: true,
    canSignDecrees: true,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: true,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "executif",
  },
  "vice-president": {
    canValidateNominations: true,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: true,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "executif",
  },
  "premier-ministre": {
    canValidateNominations: true,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: true,
    canSubmitBills: true,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "executif",
  },
  "ministre": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: true,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: true,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "executif",
  },
  "sg-ministere": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: true,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "executif",
  },
  "directeur-cgi": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: true,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "administratif",
  },
  "directeur-dgpn": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: true,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "administratif",
  },
  "sgpr": {
    canValidateNominations: true,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: true,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "presidence",
  },
  "assemblee": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "legislatif",
  },
  "senat": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "legislatif",
  },
  "conseil-etat": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: true,
    canControlConstitutionality: false,
    dashboardType: "juridictionnel",
  },
  "cour-constitutionnelle": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: true,
    dashboardType: "juridictionnel",
  },
  "sgg-admin": {
    canValidateNominations: true,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: true,
    canManageUsers: true,
    canViewArbitrages: true,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "administratif",
  },
  "sgg-directeur": {
    canValidateNominations: true,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: true,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "administratif",
  },
  "dgjo": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: true,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "administratif",
  },
  "citoyen": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "public",
  },
  "professionnel-droit": {
    canValidateNominations: false,
    canSignDecrees: false,
    canSubmitGAR: false,
    canPublishJO: false,
    canManageUsers: false,
    canViewArbitrages: false,
    canSubmitBills: false,
    canRenderAvis: false,
    canControlConstitutionality: false,
    dashboardType: "public",
  },
};

// Capacités par défaut
const defaultCapabilities: RoleCapabilities = {
  canValidateNominations: false,
  canSignDecrees: false,
  canSubmitGAR: false,
  canPublishJO: false,
  canManageUsers: false,
  canViewArbitrages: false,
  canSubmitBills: false,
  canRenderAvis: false,
  canControlConstitutionality: false,
  dashboardType: "public",
};

export function useDemoUser() {
  // Initialize state from sessionStorage synchronously to avoid flash
  const [demoUser, setDemoUser] = useState<DemoUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("demoUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("demoUser");
    if (stored) {
      try {
        setDemoUser(JSON.parse(stored));
      } catch (e) {
        logger.error('Failed to parse demo user', { error: String(e) });
      }
    }
  }, []);

  const clearDemoUser = () => {
    sessionStorage.removeItem("demoUser");
    setDemoUser(null);
  };

  const hasAccess = (module: string): boolean => {
    // SECURITY: No demo user means no demo access — real auth should take over
    if (!demoUser) return false;
    return demoUser.access.some((a) =>
      a.toLowerCase().includes(module.toLowerCase()) ||
      module.toLowerCase().includes(a.toLowerCase())
    );
  };

  // Obtenir la catégorie du rôle actuel
  const getRoleCategory = (): DemoCategory | null => {
    if (!demoUser) return null;
    return roleCategoryMap[demoUser.id] || null;
  };

  // Obtenir les capacités du rôle actuel
  const getRoleCapabilities = (): RoleCapabilities => {
    if (!demoUser) return defaultCapabilities;
    return roleCapabilitiesMap[demoUser.id] || defaultCapabilities;
  };

  // Vérifier si le rôle est un rôle exécutif de haut niveau
  const isHighLevelExecutive = (): boolean => {
    if (!demoUser) return false;
    return ["president", "vice-president", "premier-ministre", "sgpr"].includes(demoUser.id);
  };

  // Vérifier si le rôle a accès au dashboard
  const hasDashboardAccess = (): boolean => {
    const moduleAccess = getModuleAccess();
    return moduleAccess.dashboard;
  };

  // Role-based access configuration
  const getModuleAccess = () => {
    if (!demoUser) {
      return {
        dashboard: true,
        gar: true,
        nominations: true,
        egop: true,
        journalOfficiel: true,
        documents: true,
        rapports: true,
        formation: true,
        parametres: true,
        institutions: true,
        cycleLegislatif: true,
        adminUsers: true,
        matriceReporting: true,
        ptmptg: true,
      };
    }

    const { id } = demoUser;

    // Define access per role type
    const accessMap: Record<string, Record<string, boolean>> = {
      // Full access roles - Exécutif
      "president": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: true, cycleLegislatif: true, adminUsers: false, matriceReporting: true, ptmptg: true },
      "vice-president": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: true, cycleLegislatif: true, adminUsers: false, matriceReporting: true, ptmptg: true },
      "premier-ministre": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: true, cycleLegislatif: true, adminUsers: false, matriceReporting: true, ptmptg: true },

      // Présidence
      "sgpr": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: true, cycleLegislatif: true, adminUsers: false, matriceReporting: true, ptmptg: true },

      // Administratif SGG
      "sgg-admin": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: true, parametres: true, institutions: true, cycleLegislatif: true, adminUsers: true, matriceReporting: true, ptmptg: true },
      "sgg-directeur": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: true, parametres: false, institutions: true, cycleLegislatif: true, adminUsers: false, matriceReporting: true, ptmptg: true },

      // Ministry roles
      "ministre": { dashboard: true, gar: true, nominations: true, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: true, ptmptg: true },
      "sg-ministere": { dashboard: true, gar: true, nominations: true, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: true, ptmptg: true },

      // Directions sous tutelle
      "directeur-cgi": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: false, ptmptg: true },
      "directeur-dgpn": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: false, ptmptg: true },

      // Legislative roles
      "assemblee": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: true, adminUsers: false, matriceReporting: false, ptmptg: false },
      "senat": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: true, adminUsers: false, matriceReporting: false, ptmptg: false },

      // Juridictionnel
      "conseil-etat": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: true, adminUsers: false, matriceReporting: false, ptmptg: false },
      "cour-constitutionnelle": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: true, adminUsers: false, matriceReporting: false, ptmptg: false },

      // DGJO
      "dgjo": { dashboard: true, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: false, ptmptg: false },

      // Public
      "citoyen": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: false, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: false, ptmptg: false },
      "professionnel-droit": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, institutions: false, cycleLegislatif: false, adminUsers: false, matriceReporting: false, ptmptg: false },
    };

    return accessMap[id] || accessMap["citoyen"];
  };

  return {
    demoUser,
    clearDemoUser,
    hasAccess,
    getModuleAccess,
    getRoleCategory,
    getRoleCapabilities,
    isHighLevelExecutive,
    hasDashboardAccess,
  };
}
