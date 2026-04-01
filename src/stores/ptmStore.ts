/**
 * SGG Digital — Store Central PTM (Zustand)
 * Gere tout le cycle de vie des initiatives PTM :
 * Creation → Brouillon → Soumission SG → Consolidation → SGG → PM → SGPR
 * + Notifications, Historique, CRUD complet
 *
 * Modele : reportingStore.ts (meme patterns)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InitiativePTM,
  RubriquePTM,
  StatutPTM,
  CadrageStrategique,
  HistoriqueModificationPTM,
  NotificationPTM,
  NotificationTypePTM,
} from '@/types/ptm';
import { INITIATIVES_PTM, MINISTERES_PTM } from '@/data/ptmData';
import { PROGRAMMES } from '@/data/reportingData';

// =============================================================================
// TYPES DU STORE
// =============================================================================

export interface FormDataPTM {
  rubrique: RubriquePTM;
  intitule: string;
  cadrage: CadrageStrategique;
  cadrageDetail: string;
  programmePAGId: string | null;
  incidenceFinanciere: boolean;
  loiFinance: boolean;
  servicesPorteurs: string[];
  dateTransmissionSGG: string;
  observations: string;
}

interface PTMState {
  // Donnees principales
  initiatives: InitiativePTM[];
  historique: HistoriqueModificationPTM[];
  notifications: NotificationPTM[];

  // Actions CRUD
  createOrUpdateInitiative: (
    initiativeId: string | null,
    ministereId: string,
    directionId: string,
    formData: FormDataPTM,
  ) => InitiativePTM;

  saveDraft: (
    initiativeId: string | null,
    ministereId: string,
    directionId: string,
    formData: FormDataPTM,
  ) => InitiativePTM;

  deleteInitiative: (initiativeId: string) => boolean;

  // Actions Workflow
  submitToSG: (
    initiativeId: string,
    soumisParId: string,
    soumisParNom: string,
  ) => void;

  rejectSG: (
    initiativeId: string,
    rejeteParId: string,
    rejeteParNom: string,
    motif: string,
  ) => void;

  consolidateSG: (initiativeId: string) => void;

  submitToSGG: (
    initiativeId: string,
    soumisParId: string,
    soumisParNom: string,
  ) => void;

  rejectSGG: (
    initiativeId: string,
    rejeteParId: string,
    rejeteParNom: string,
    motif: string,
  ) => void;

  consolidateSGG: (initiativeId: string) => void;

  submitToPM: (initiativeId: string, soumisParId: string, soumisParNom: string) => void;
  submitToSGPR: (initiativeId: string, soumisParId: string, soumisParNom: string) => void;

  // Batch
  batchSubmitToSG: (
    initiativeIds: string[],
    soumisParId: string,
    soumisParNom: string,
  ) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  // Getters
  getInitiative: (id: string) => InitiativePTM | undefined;
  getInitiativesByMinistere: (ministereId: string) => InitiativePTM[];
  getInitiativesByStatut: (statut: StatutPTM) => InitiativePTM[];
  getNextNumero: (rubrique: RubriquePTM) => number;
  getUnreadNotificationsCount: () => number;
}

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function addHistorique(
  initiativeId: string,
  champ: string,
  ancienne: string,
  nouvelle: string,
  parId: string,
  parNom: string,
): HistoriqueModificationPTM {
  return {
    id: `hist-ptm-${generateId()}`,
    initiativeId,
    champModifie: champ,
    ancienneValeur: ancienne,
    nouvelleValeur: nouvelle,
    modifieParId: parId,
    modifieParNom: parNom,
    modifieLe: nowISO(),
  };
}

// Notification templates PTM
const PTM_NOTIF_TEMPLATES: Record<NotificationTypePTM, { titre: string; message: (p: Record<string, string>) => string }> = {
  initiative_soumise: {
    titre: 'Initiative transmise',
    message: (p) => `L'initiative "${p.intitule}" a ete transmise par ${p.soumetteur} pour consolidation.`,
  },
  initiative_validee_sgg: {
    titre: 'Initiative validee SGG',
    message: (p) => `L'initiative "${p.intitule}" a ete validee par le SGG.`,
  },
  initiative_inscrite_ptg: {
    titre: 'Initiative inscrite au PTG',
    message: (p) => `L'initiative "${p.intitule}" est inscrite au Programme de Travail du Gouvernement.`,
  },
  initiative_rejetee: {
    titre: 'Initiative rejetee',
    message: (p) => `L'initiative "${p.intitule}" a ete rejetee. Motif: ${p.motif}`,
  },
  demande_clarification: {
    titre: 'Demande de clarification',
    message: (p) => `Clarification demandee pour l'initiative "${p.intitule}": ${p.motif}`,
  },
  deadline_approche: {
    titre: 'Deadline approche',
    message: (p) => `La deadline de transmission PTM approche. ${p.joursRestants} jours restants.`,
  },
  deadline_depassee: {
    titre: 'Deadline depassee',
    message: (p) => `La deadline de transmission PTM est depassee de ${p.joursRetard} jour(s).`,
  },
  rapport_incomplet: {
    titre: 'Initiative incomplete',
    message: (p) => `L'initiative "${p.intitule}" est incomplete et ne peut pas etre transmise.`,
  },
};

function generatePTMNotification(
  type: NotificationTypePTM,
  destinataireId: string,
  destinataireNom: string,
  params: Record<string, string>,
): NotificationPTM {
  const template = PTM_NOTIF_TEMPLATES[type];
  return {
    id: `notif-ptm-${generateId()}`,
    type,
    titre: template.titre,
    message: template.message(params),
    destinataireId,
    destinataireNom,
    lue: false,
    dateCreation: nowISO(),
    lienAction: params.lien,
    initiativeId: params.initiativeId,
    ministereId: params.ministereId,
  };
}

/** Resolve ministry display info from ID */
function resolveMinistereInfo(ministereId: string): { nom: string; sigle: string } {
  const min = MINISTERES_PTM.find((m) => m.id === ministereId);
  return min ? { nom: min.nom, sigle: min.sigle } : { nom: ministereId, sigle: ministereId };
}

/** Resolve services porteurs display names from IDs */
function resolveServicesPorteursNoms(ids: string[]): string[] {
  return ids.map((id) => {
    const min = MINISTERES_PTM.find((m) => m.id === id);
    return min ? min.sigle : id;
  });
}

// =============================================================================
// STORE
// =============================================================================

export const usePTMStore = create<PTMState>()(
  persist(
    (set, get) => ({
      // Initialisation depuis les donnees mock
      initiatives: [...INITIATIVES_PTM],
      historique: [],
      notifications: [],

      // -----------------------------------------------------------------
      // CREATE OR UPDATE INITIATIVE
      // -----------------------------------------------------------------
      createOrUpdateInitiative: (initiativeId, ministereId, directionId, formData) => {
        const state = get();

        // Resolve display info
        const minInfo = resolveMinistereInfo(ministereId);
        const progPAG = formData.programmePAGId
          ? PROGRAMMES.find((p) => p.id === formData.programmePAGId)
          : null;
        const servicesNoms = resolveServicesPorteursNoms(formData.servicesPorteurs);

        if (initiativeId) {
          // --- UPDATE existing ---
          const existing = state.initiatives.find((i) => i.id === initiativeId);
          if (existing) {
            const updated: InitiativePTM = {
              ...existing,
              rubrique: formData.rubrique,
              intitule: formData.intitule,
              cadrage: formData.cadrage,
              cadrageDetail: formData.cadrageDetail,
              programmePAGId: formData.programmePAGId,
              programmePAGNom: progPAG ? `${progPAG.codeProgramme} — ${progPAG.libelleProgramme}` : null,
              incidenceFinanciere: formData.incidenceFinanciere,
              loiFinance: formData.loiFinance,
              servicesPorteurs: formData.servicesPorteurs,
              servicesPorteursNoms: servicesNoms,
              dateTransmissionSGG: formData.dateTransmissionSGG || null,
              observations: formData.observations,
              modifieLe: nowISO(),
            };
            set({
              initiatives: state.initiatives.map((i) =>
                i.id === initiativeId ? updated : i,
              ),
            });
            return updated;
          }
        }

        // --- CREATE new ---
        const numero = get().getNextNumero(formData.rubrique);
        // Find direction name from existing data
        const dirNom = state.initiatives.find((i) => i.directionId === directionId)?.directionNom || directionId;

        const newInitiative: InitiativePTM = {
          id: `ptm-${generateId()}`,
          ministereId,
          ministereNom: minInfo.nom,
          ministereSigle: minInfo.sigle,
          directionId,
          directionNom: dirNom,
          rubrique: formData.rubrique,
          numero,
          intitule: formData.intitule,
          cadrage: formData.cadrage,
          cadrageDetail: formData.cadrageDetail,
          programmePAGId: formData.programmePAGId,
          programmePAGNom: progPAG ? `${progPAG.codeProgramme} — ${progPAG.libelleProgramme}` : null,
          incidenceFinanciere: formData.incidenceFinanciere,
          loiFinance: formData.loiFinance,
          servicesPorteurs: formData.servicesPorteurs,
          servicesPorteursNoms: servicesNoms,
          dateTransmissionSGG: formData.dateTransmissionSGG || null,
          observations: formData.observations,
          statut: 'brouillon',
          soumisParId: null,
          soumisParNom: null,
          dateSoumission: null,
          valideSGGParId: null,
          valideSGGParNom: null,
          dateValidationSGG: null,
          commentaireSGG: null,
          inscritPTGParId: null,
          inscritPTGParNom: null,
          dateInscriptionPTG: null,
          motifRejet: null,
          rapportMensuelId: null,
          annee: new Date().getFullYear(),
          creeLe: nowISO(),
          modifieLe: nowISO(),
        };

        set({ initiatives: [...state.initiatives, newInitiative] });
        return newInitiative;
      },

      // -----------------------------------------------------------------
      // SAVE DRAFT (alias)
      // -----------------------------------------------------------------
      saveDraft: (initiativeId, ministereId, directionId, formData) => {
        return get().createOrUpdateInitiative(initiativeId, ministereId, directionId, formData);
      },

      // -----------------------------------------------------------------
      // DELETE (brouillon only)
      // -----------------------------------------------------------------
      deleteInitiative: (initiativeId) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'brouillon') return false;
        set({
          initiatives: state.initiatives.filter((i) => i.id !== initiativeId),
        });
        return true;
      },

      // -----------------------------------------------------------------
      // SUBMIT TO SG (brouillon/rejete_sg → soumis_sg)
      // -----------------------------------------------------------------
      submitToSG: (initiativeId, soumisParId, soumisParNom) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative) return;
        if (!['brouillon', 'rejete_sg', 'rejete'].includes(initiative.statut)) return;

        const updated: InitiativePTM = {
          ...initiative,
          statut: 'soumis_sg',
          soumisParId,
          soumisParNom,
          dateSoumission: nowISO(),
          motifRejet: null,
          modifieLe: nowISO(),
        };

        const hist = addHistorique(
          initiativeId, 'statut', initiative.statut, 'soumis_sg', soumisParId, soumisParNom,
        );

        // Notification vers le SG du ministere
        const notif = generatePTMNotification(
          'initiative_soumise',
          `sg-${initiative.ministereId}`,
          `SG ${initiative.ministereSigle}`,
          {
            intitule: initiative.intitule.substring(0, 60),
            soumetteur: soumisParNom,
            lien: '/ptm/consolidation',
            initiativeId,
            ministereId: initiative.ministereId,
          },
        );

        set({
          initiatives: state.initiatives.map((i) => (i.id === initiativeId ? updated : i)),
          historique: [...state.historique, hist],
          notifications: [notif, ...state.notifications],
        });
      },

      // -----------------------------------------------------------------
      // REJECT SG (soumis_sg → rejete_sg)
      // -----------------------------------------------------------------
      rejectSG: (initiativeId, rejeteParId, rejeteParNom, motif) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'soumis_sg') return;

        const updated: InitiativePTM = {
          ...initiative,
          statut: 'rejete_sg',
          motifRejet: motif,
          modifieLe: nowISO(),
        };

        const hist = addHistorique(
          initiativeId, 'statut', 'soumis_sg', 'rejete_sg', rejeteParId, rejeteParNom,
        );

        const notif = generatePTMNotification(
          'initiative_rejetee',
          initiative.soumisParId || initiative.directionId,
          initiative.soumisParNom || initiative.directionNom,
          {
            intitule: initiative.intitule.substring(0, 60),
            motif,
            lien: '/ptm/saisie',
            initiativeId,
            ministereId: initiative.ministereId,
          },
        );

        set({
          initiatives: state.initiatives.map((i) => (i.id === initiativeId ? updated : i)),
          historique: [...state.historique, hist],
          notifications: [notif, ...state.notifications],
        });
      },

      // -----------------------------------------------------------------
      // CONSOLIDATE SG (soumis_sg → consolide_sg)
      // -----------------------------------------------------------------
      consolidateSG: (initiativeId) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'soumis_sg') return;

        set({
          initiatives: state.initiatives.map((i) =>
            i.id === initiativeId
              ? { ...i, statut: 'consolide_sg' as StatutPTM, modifieLe: nowISO() }
              : i,
          ),
        });
      },

      // -----------------------------------------------------------------
      // SUBMIT TO SGG (consolide_sg → soumis_sgg)
      // -----------------------------------------------------------------
      submitToSGG: (initiativeId, soumisParId, soumisParNom) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative) return;
        if (!['consolide_sg', 'rejete_sgg'].includes(initiative.statut)) return;

        const updated: InitiativePTM = {
          ...initiative,
          statut: 'soumis_sgg',
          soumisParId,
          soumisParNom,
          dateSoumission: nowISO(),
          motifRejet: null,
          modifieLe: nowISO(),
        };

        const hist = addHistorique(
          initiativeId, 'statut', initiative.statut, 'soumis_sgg', soumisParId, soumisParNom,
        );

        const notif = generatePTMNotification(
          'initiative_soumise',
          'sgg-admin',
          'Admin SGG',
          {
            intitule: initiative.intitule.substring(0, 60),
            soumetteur: soumisParNom,
            lien: '/ptm/consolidation',
            initiativeId,
            ministereId: initiative.ministereId,
          },
        );

        set({
          initiatives: state.initiatives.map((i) => (i.id === initiativeId ? updated : i)),
          historique: [...state.historique, hist],
          notifications: [notif, ...state.notifications],
        });
      },

      // -----------------------------------------------------------------
      // REJECT SGG (soumis_sgg → rejete_sgg)
      // -----------------------------------------------------------------
      rejectSGG: (initiativeId, rejeteParId, rejeteParNom, motif) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'soumis_sgg') return;

        const updated: InitiativePTM = {
          ...initiative,
          statut: 'rejete_sgg',
          motifRejet: motif,
          modifieLe: nowISO(),
        };

        const hist = addHistorique(
          initiativeId, 'statut', 'soumis_sgg', 'rejete_sgg', rejeteParId, rejeteParNom,
        );

        const notif = generatePTMNotification(
          'initiative_rejetee',
          `sg-${initiative.ministereId}`,
          `SG ${initiative.ministereSigle}`,
          {
            intitule: initiative.intitule.substring(0, 60),
            motif,
            lien: '/ptm/consolidation',
            initiativeId,
            ministereId: initiative.ministereId,
          },
        );

        set({
          initiatives: state.initiatives.map((i) => (i.id === initiativeId ? updated : i)),
          historique: [...state.historique, hist],
          notifications: [notif, ...state.notifications],
        });
      },

      // -----------------------------------------------------------------
      // CONSOLIDATE SGG (soumis_sgg → consolide_sgg)
      // -----------------------------------------------------------------
      consolidateSGG: (initiativeId) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'soumis_sgg') return;

        set({
          initiatives: state.initiatives.map((i) =>
            i.id === initiativeId
              ? { ...i, statut: 'consolide_sgg' as StatutPTM, modifieLe: nowISO() }
              : i,
          ),
        });
      },

      // -----------------------------------------------------------------
      // SUBMIT TO PM (consolide_sgg → soumis_pm)
      // -----------------------------------------------------------------
      submitToPM: (initiativeId, soumisParId, soumisParNom) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'consolide_sgg') return;

        const updated: InitiativePTM = {
          ...initiative,
          statut: 'soumis_pm',
          modifieLe: nowISO(),
        };

        const hist = addHistorique(
          initiativeId, 'statut', 'consolide_sgg', 'soumis_pm', soumisParId, soumisParNom,
        );

        set({
          initiatives: state.initiatives.map((i) => (i.id === initiativeId ? updated : i)),
          historique: [...state.historique, hist],
        });
      },

      // -----------------------------------------------------------------
      // SUBMIT TO SGPR (soumis_pm → soumis_sgpr) — FINAL
      // -----------------------------------------------------------------
      submitToSGPR: (initiativeId, soumisParId, soumisParNom) => {
        const state = get();
        const initiative = state.initiatives.find((i) => i.id === initiativeId);
        if (!initiative || initiative.statut !== 'soumis_pm') return;

        const updated: InitiativePTM = {
          ...initiative,
          statut: 'soumis_sgpr',
          modifieLe: nowISO(),
        };

        const hist = addHistorique(
          initiativeId, 'statut', 'soumis_pm', 'soumis_sgpr', soumisParId, soumisParNom,
        );

        const notif = generatePTMNotification(
          'initiative_inscrite_ptg',
          initiative.ministereId,
          initiative.ministereSigle,
          {
            intitule: initiative.intitule.substring(0, 60),
            lien: '/ptm/matrice',
            initiativeId,
            ministereId: initiative.ministereId,
          },
        );

        set({
          initiatives: state.initiatives.map((i) => (i.id === initiativeId ? updated : i)),
          historique: [...state.historique, hist],
          notifications: [notif, ...state.notifications],
        });
      },

      // -----------------------------------------------------------------
      // BATCH SUBMIT TO SG
      // -----------------------------------------------------------------
      batchSubmitToSG: (initiativeIds, soumisParId, soumisParNom) => {
        initiativeIds.forEach((id) => {
          get().submitToSG(id, soumisParId, soumisParNom);
        });
      },

      // -----------------------------------------------------------------
      // NOTIFICATIONS
      // -----------------------------------------------------------------
      markNotificationRead: (notifId) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === notifId ? { ...n, lue: true } : n,
          ),
        });
      },

      markAllNotificationsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, lue: true })),
        });
      },

      // -----------------------------------------------------------------
      // GETTERS
      // -----------------------------------------------------------------
      getInitiative: (id) => {
        return get().initiatives.find((i) => i.id === id);
      },

      getInitiativesByMinistere: (ministereId) => {
        return get().initiatives.filter((i) => i.ministereId === ministereId);
      },

      getInitiativesByStatut: (statut) => {
        return get().initiatives.filter((i) => i.statut === statut);
      },

      getNextNumero: (rubrique) => {
        const initiatives = get().initiatives.filter((i) => i.rubrique === rubrique);
        if (initiatives.length === 0) return 1;
        return Math.max(...initiatives.map((i) => i.numero)) + 1;
      },

      getUnreadNotificationsCount: () => {
        return get().notifications.filter((n) => !n.lue).length;
      },
    }),
    {
      name: 'sgg-ptm-store',
      partialize: (state) => ({
        initiatives: state.initiatives,
        historique: state.historique,
        notifications: state.notifications,
      }),
    },
  ),
);
