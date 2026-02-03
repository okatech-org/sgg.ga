import { useState, useEffect } from "react";

export interface DemoUser {
  id: string;
  title: string;
  role: string;
  institution: string;
  access: string[];
}

export function useDemoUser() {
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

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
      };
    }

    const { id } = demoUser;
    
    // Define access per role type
    const accessMap: Record<string, Record<string, boolean>> = {
      // Full access roles
      "president": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false },
      "vice-president": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false },
      "sgpr": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false },
      "sgg-admin": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: true, parametres: true },
      
      // Coordination roles
      "premier-ministre": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false },
      "sgg-directeur": { dashboard: true, gar: true, nominations: true, egop: true, journalOfficiel: true, documents: true, rapports: true, formation: true, parametres: false },
      
      // Ministry roles
      "ministre": { dashboard: true, gar: true, nominations: true, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false },
      "sg-ministere": { dashboard: true, gar: true, nominations: true, egop: false, journalOfficiel: true, documents: true, rapports: true, formation: false, parametres: false },
      
      // Legislative roles
      "assemblee": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false },
      "senat": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false },
      
      // Juridictionnel
      "conseil-etat": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false },
      "cour-constitutionnelle": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false },
      
      // DGJO
      "dgjo": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: true, rapports: false, formation: false, parametres: false },
      
      // Public
      "citoyen": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: false, rapports: false, formation: false, parametres: false },
      "professionnel-droit": { dashboard: false, gar: false, nominations: false, egop: false, journalOfficiel: true, documents: false, rapports: false, formation: false, parametres: false },
    };

    return accessMap[id] || accessMap["citoyen"];
  };

  return { demoUser, clearDemoUser, hasAccess, getModuleAccess };
}
