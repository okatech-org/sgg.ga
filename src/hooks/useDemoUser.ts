import { useState, useEffect } from "react";

export interface DemoUser {
  id: string;
  title: string;
  role: string;
  institution: string;
  access: string[];
}

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
        console.error("Failed to parse demo user", e);
      }
    }
  }, []);

  const clearDemoUser = () => {
    sessionStorage.removeItem("demoUser");
    setDemoUser(null);
  };

  const hasAccess = (module: string): boolean => {
    if (!demoUser) return true; // No demo user = full access
    return demoUser.access.some((a) => 
      a.toLowerCase().includes(module.toLowerCase()) || 
      module.toLowerCase().includes(a.toLowerCase())
    );
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
      };
    }

    const { id } = demoUser;
    
    // Define access per role type
    const accessMap: Record<string, Record<string, boolean>> = {
      // Full access roles
      "president": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, adminUsers: false },
      "vice-president": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, adminUsers: false },
      "sgpr": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, adminUsers: false },
      "sgg-admin": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: true, parametres: true, adminUsers: true },
      
      // Coordination roles
      "premier-ministre": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, adminUsers: false },
      "sgg-directeur": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: true, parametres: false, adminUsers: false },
      
      // Ministry roles
      "ministre": { dashboard: true, gar: true, nominations: true, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, adminUsers: false },
      "sg-ministere": { dashboard: true, gar: true, nominations: true, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false, adminUsers: false },
      
      // Legislative roles
      "assemblee": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, adminUsers: false },
      "senat": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, adminUsers: false },
      
      // Juridictionnel
      "conseil-etat": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, adminUsers: false },
      "cour-constitutionnelle": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, adminUsers: false },
      
      // DGJO
      "dgjo": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false, adminUsers: false },
      
      // Public
      "citoyen": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: false, rapports: false, formation: false, parametres: false, adminUsers: false },
      "professionnel-droit": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: false, rapports: false, formation: false, parametres: false, adminUsers: false },
    };

    return accessMap[id] || accessMap["citoyen"];
  };

  return { demoUser, clearDemoUser, hasAccess, getModuleAccess };
}
