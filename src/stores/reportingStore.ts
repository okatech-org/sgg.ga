/**
 * SGG Digital — Store Central Reporting (Zustand)
 * Gère tout le cycle de vie des rapports mensuels :
 * Création → Brouillon → Soumission → Validation SGG → Validation SGPR → Publication
 * + Notifications, Historique, Suivi Remplissage dynamique
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    RapportMensuel,
    NotificationReporting,
    HistoriqueModification,
    SuiviMinistere,
    StatutValidation,
    StatutProgramme,
} from '@/types/reporting';
import {
    RAPPORTS_MENSUELS,
    NOTIFICATIONS_MOCK,
    HISTORIQUE_MOCK,
    PROGRAMMES,
    GOUVERNANCES,
    MINISTERES,
} from '@/data/reportingData';
import { generateNotification } from '@/services/notificationReporting';

// =============================================================================
// TYPES DU STORE
// =============================================================================

interface FormDataRapport {
    dateDebut: string;
    dateFin: string;
    activitesRealisees: string;
    budgetMdFcfa: number;
    engageMdFcfa: number;
    decaisseMdFcfa: number;
    pctExecutionFinanciere: number;
    encadrementJuridique: string;
    indicateursKpi: string;
    pctAvancementPhysique: number;
    statutProgramme: StatutProgramme;
    observationsContraintes: string;
}

interface ReportingState {
    // Données principales
    rapports: RapportMensuel[];
    notifications: NotificationReporting[];
    historique: HistoriqueModification[];

    // Actions — Cycle de vie du rapport
    createOrUpdateRapport: (
        programmeId: string,
        ministereId: string,
        mois: number,
        annee: number,
        formData: FormDataRapport,
    ) => RapportMensuel;

    submitRapport: (
        rapportId: string,
        soumisParId: string,
        soumisParNom: string,
    ) => void;

    saveDraft: (
        programmeId: string,
        ministereId: string,
        mois: number,
        annee: number,
        formData: FormDataRapport,
    ) => RapportMensuel;

    // Actions — Validations
    validateSGG: (
        rapportId: string,
        valideParId: string,
        valideParNom: string,
        commentaire?: string,
    ) => void;

    rejectSGG: (
        rapportId: string,
        rejeteParId: string,
        rejeteParNom: string,
        motif: string,
    ) => void;

    validateSGPR: (
        rapportId: string,
        valideParId: string,
        valideParNom: string,
        commentaire?: string,
    ) => void;

    rejectSGPR: (
        rapportId: string,
        rejeteParId: string,
        rejeteParNom: string,
        motif: string,
    ) => void;

    batchValidateSGG: (
        rapportIds: string[],
        valideParId: string,
        valideParNom: string,
    ) => void;

    batchValidateSGPR: (
        rapportIds: string[],
        valideParId: string,
        valideParNom: string,
    ) => void;

    // Actions — Notifications
    markNotificationRead: (notifId: string) => void;
    markAllNotificationsRead: () => void;

    // Helpers
    getRapport: (programmeId: string, mois: number, annee: number) => RapportMensuel | undefined;
    getRapportById: (rapportId: string) => RapportMensuel | undefined;
    getRapportsByStatut: (statut: StatutValidation) => RapportMensuel[];
    getUnreadNotificationsCount: () => number;

    // Suivi Remplissage dynamique
    computeSuiviRemplissage: (mois: number, annee: number) => SuiviMinistere[];
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
    rapportId: string,
    champ: string,
    ancienne: string,
    nouvelle: string,
    parId: string,
    parNom: string,
): HistoriqueModification {
    return {
        id: `hist-${generateId()}`,
        rapportId,
        champModifie: champ,
        ancienneValeur: ancienne,
        nouvelleValeur: nouvelle,
        modifieParId: parId,
        modifieParNom: parNom,
        modifieLe: nowISO(),
    };
}

// =============================================================================
// STORE
// =============================================================================

export const useReportingStore = create<ReportingState>()(
    persist(
        (set, get) => ({
            // Initialisation depuis les données mock
            rapports: [...RAPPORTS_MENSUELS],
            notifications: [...NOTIFICATIONS_MOCK],
            historique: [...HISTORIQUE_MOCK],

            // -----------------------------------------------------------------
            // CREATE OR UPDATE RAPPORT (brouillon)
            // -----------------------------------------------------------------
            createOrUpdateRapport: (programmeId, ministereId, mois, annee, formData) => {
                const state = get();
                const existing = state.rapports.find(
                    (r) => r.programmeId === programmeId && r.periodeMois === mois && r.periodeAnnee === annee,
                );

                if (existing) {
                    // Update existing rapport
                    const updated: RapportMensuel = {
                        ...existing,
                        ...formData,
                        modifieLe: nowISO(),
                    };
                    set({
                        rapports: state.rapports.map((r) => (r.id === existing.id ? updated : r)),
                    });
                    return updated;
                } else {
                    // Create new rapport
                    const newRapport: RapportMensuel = {
                        id: `rap-${generateId()}`,
                        programmeId,
                        ministereId,
                        periodeMois: mois,
                        periodeAnnee: annee,
                        soumisParId: null,
                        soumisParNom: null,
                        dateDebut: formData.dateDebut || null,
                        dateFin: formData.dateFin || null,
                        activitesRealisees: formData.activitesRealisees,
                        budgetMdFcfa: formData.budgetMdFcfa,
                        engageMdFcfa: formData.engageMdFcfa,
                        decaisseMdFcfa: formData.decaisseMdFcfa,
                        pctExecutionFinanciere: formData.pctExecutionFinanciere,
                        encadrementJuridique: formData.encadrementJuridique,
                        indicateursKpi: formData.indicateursKpi,
                        pctAvancementPhysique: formData.pctAvancementPhysique,
                        statutProgramme: formData.statutProgramme,
                        observationsContraintes: formData.observationsContraintes,
                        statutValidation: 'brouillon',
                        valideSGGParId: null,
                        valideSGGParNom: null,
                        dateValidationSGG: null,
                        valideSGPRParId: null,
                        valideSGPRParNom: null,
                        dateValidationSGPR: null,
                        commentaireValidation: null,
                        motifRejet: null,
                        creeLe: nowISO(),
                        modifieLe: nowISO(),
                    };
                    set({ rapports: [...state.rapports, newRapport] });
                    return newRapport;
                }
            },

            // -----------------------------------------------------------------
            // SAVE DRAFT (alias de createOrUpdate avec toast-friendly return)
            // -----------------------------------------------------------------
            saveDraft: (programmeId, ministereId, mois, annee, formData) => {
                return get().createOrUpdateRapport(programmeId, ministereId, mois, annee, formData);
            },

            // -----------------------------------------------------------------
            // SUBMIT RAPPORT (brouillon/rejeté → soumis)
            // -----------------------------------------------------------------
            submitRapport: (rapportId, soumisParId, soumisParNom) => {
                const state = get();
                const rapport = state.rapports.find((r) => r.id === rapportId);
                if (!rapport) return;

                const programme = PROGRAMMES.find((p) => p.id === rapport.programmeId);

                const updatedRapport: RapportMensuel = {
                    ...rapport,
                    statutValidation: 'soumis',
                    soumisParId,
                    soumisParNom,
                    motifRejet: null,
                    modifieLe: nowISO(),
                };

                const hist = addHistorique(
                    rapportId,
                    'statutValidation',
                    rapport.statutValidation,
                    'soumis',
                    soumisParId,
                    soumisParNom,
                );

                const notif = generateNotification(
                    'rapport_soumis',
                    'sgg-admin',
                    'Admin SGG',
                    {
                        programme: programme?.libelleProgramme || rapport.programmeId,
                        soumetteur: soumisParNom,
                        lien: '/matrice-reporting/validation',
                        rapportId,
                        programmeId: rapport.programmeId,
                        ministereId: rapport.ministereId,
                    },
                );

                set({
                    rapports: state.rapports.map((r) => (r.id === rapportId ? updatedRapport : r)),
                    historique: [...state.historique, hist],
                    notifications: [notif, ...state.notifications],
                });
            },

            // -----------------------------------------------------------------
            // VALIDATE SGG (soumis → valide_sgg)
            // -----------------------------------------------------------------
            validateSGG: (rapportId, valideParId, valideParNom, commentaire) => {
                const state = get();
                const rapport = state.rapports.find((r) => r.id === rapportId);
                if (!rapport) return;

                const programme = PROGRAMMES.find((p) => p.id === rapport.programmeId);

                const updated: RapportMensuel = {
                    ...rapport,
                    statutValidation: 'valide_sgg',
                    valideSGGParId: valideParId,
                    valideSGGParNom: valideParNom,
                    dateValidationSGG: nowISO(),
                    commentaireValidation: commentaire || rapport.commentaireValidation,
                    modifieLe: nowISO(),
                };

                const hist = addHistorique(
                    rapportId,
                    'statutValidation',
                    'soumis',
                    'valide_sgg',
                    valideParId,
                    valideParNom,
                );

                const notifMinistere = generateNotification(
                    'rapport_valide_sgg',
                    rapport.ministereId,
                    `SG ${rapport.ministereId}`,
                    {
                        programme: programme?.libelleProgramme || rapport.programmeId,
                        lien: '/matrice-reporting',
                        rapportId,
                        programmeId: rapport.programmeId,
                        ministereId: rapport.ministereId,
                    },
                );

                set({
                    rapports: state.rapports.map((r) => (r.id === rapportId ? updated : r)),
                    historique: [...state.historique, hist],
                    notifications: [notifMinistere, ...state.notifications],
                });
            },

            // -----------------------------------------------------------------
            // REJECT SGG (soumis → rejete)
            // -----------------------------------------------------------------
            rejectSGG: (rapportId, rejeteParId, rejeteParNom, motif) => {
                const state = get();
                const rapport = state.rapports.find((r) => r.id === rapportId);
                if (!rapport) return;

                const programme = PROGRAMMES.find((p) => p.id === rapport.programmeId);

                const updated: RapportMensuel = {
                    ...rapport,
                    statutValidation: 'rejete',
                    motifRejet: motif,
                    modifieLe: nowISO(),
                };

                const hist = addHistorique(
                    rapportId,
                    'statutValidation',
                    'soumis',
                    'rejete',
                    rejeteParId,
                    rejeteParNom,
                );

                const notif = generateNotification(
                    'rapport_rejete',
                    rapport.soumisParId || rapport.ministereId,
                    rapport.soumisParNom || rapport.ministereId,
                    {
                        programme: programme?.libelleProgramme || rapport.programmeId,
                        motif,
                        lien: '/matrice-reporting/saisie',
                        rapportId,
                        programmeId: rapport.programmeId,
                        ministereId: rapport.ministereId,
                    },
                );

                set({
                    rapports: state.rapports.map((r) => (r.id === rapportId ? updated : r)),
                    historique: [...state.historique, hist],
                    notifications: [notif, ...state.notifications],
                });
            },

            // -----------------------------------------------------------------
            // VALIDATE SGPR (valide_sgg → valide_sgpr)
            // -----------------------------------------------------------------
            validateSGPR: (rapportId, valideParId, valideParNom, commentaire) => {
                const state = get();
                const rapport = state.rapports.find((r) => r.id === rapportId);
                if (!rapport) return;

                const programme = PROGRAMMES.find((p) => p.id === rapport.programmeId);

                const updated: RapportMensuel = {
                    ...rapport,
                    statutValidation: 'valide_sgpr',
                    valideSGPRParId: valideParId,
                    valideSGPRParNom: valideParNom,
                    dateValidationSGPR: nowISO(),
                    commentaireValidation: commentaire || rapport.commentaireValidation,
                    modifieLe: nowISO(),
                };

                const hist = addHistorique(
                    rapportId,
                    'statutValidation',
                    'valide_sgg',
                    'valide_sgpr',
                    valideParId,
                    valideParNom,
                );

                const notif = generateNotification(
                    'rapport_valide_sgpr',
                    rapport.ministereId,
                    `SG ${rapport.ministereId}`,
                    {
                        programme: programme?.libelleProgramme || rapport.programmeId,
                        lien: '/matrice-reporting',
                        rapportId,
                        programmeId: rapport.programmeId,
                        ministereId: rapport.ministereId,
                    },
                );

                set({
                    rapports: state.rapports.map((r) => (r.id === rapportId ? updated : r)),
                    historique: [...state.historique, hist],
                    notifications: [notif, ...state.notifications],
                });
            },

            // -----------------------------------------------------------------
            // REJECT SGPR (valide_sgg → rejete, retour au SGG)
            // -----------------------------------------------------------------
            rejectSGPR: (rapportId, rejeteParId, rejeteParNom, motif) => {
                const state = get();
                const rapport = state.rapports.find((r) => r.id === rapportId);
                if (!rapport) return;

                const programme = PROGRAMMES.find((p) => p.id === rapport.programmeId);

                const updated: RapportMensuel = {
                    ...rapport,
                    statutValidation: 'rejete',
                    motifRejet: motif,
                    valideSGGParId: null,
                    valideSGGParNom: null,
                    dateValidationSGG: null,
                    modifieLe: nowISO(),
                };

                const hist = addHistorique(
                    rapportId,
                    'statutValidation',
                    'valide_sgg',
                    'rejete',
                    rejeteParId,
                    rejeteParNom,
                );

                const notif = generateNotification(
                    'rapport_rejete',
                    rapport.soumisParId || rapport.ministereId,
                    rapport.soumisParNom || rapport.ministereId,
                    {
                        programme: programme?.libelleProgramme || rapport.programmeId,
                        motif,
                        lien: '/matrice-reporting/saisie',
                        rapportId,
                        programmeId: rapport.programmeId,
                        ministereId: rapport.ministereId,
                    },
                );

                set({
                    rapports: state.rapports.map((r) => (r.id === rapportId ? updated : r)),
                    historique: [...state.historique, hist],
                    notifications: [notif, ...state.notifications],
                });
            },

            // -----------------------------------------------------------------
            // BATCH VALIDATIONS
            // -----------------------------------------------------------------
            batchValidateSGG: (rapportIds, valideParId, valideParNom) => {
                rapportIds.forEach((id) => {
                    get().validateSGG(id, valideParId, valideParNom);
                });
            },

            batchValidateSGPR: (rapportIds, valideParId, valideParNom) => {
                rapportIds.forEach((id) => {
                    get().validateSGPR(id, valideParId, valideParNom);
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
            // GETTERS / HELPERS
            // -----------------------------------------------------------------
            getRapport: (programmeId, mois, annee) => {
                return get().rapports.find(
                    (r) => r.programmeId === programmeId && r.periodeMois === mois && r.periodeAnnee === annee,
                );
            },

            getRapportById: (rapportId) => {
                return get().rapports.find((r) => r.id === rapportId);
            },

            getRapportsByStatut: (statut) => {
                return get().rapports.filter((r) => r.statutValidation === statut);
            },

            getUnreadNotificationsCount: () => {
                return get().notifications.filter((n) => !n.lue).length;
            },

            // -----------------------------------------------------------------
            // SUIVI REMPLISSAGE DYNAMIQUE
            // -----------------------------------------------------------------
            computeSuiviRemplissage: (mois, annee) => {
                const rapports = get().rapports;

                // Pour chaque ministère pilote, calculer le statut de remplissage
                const ministeresPilotes = new Map<string, { id: string; nom: string; sigle: string }>();
                GOUVERNANCES.forEach((g) => {
                    if (!ministeresPilotes.has(g.ministerePiloteId)) {
                        const info = MINISTERES.find((m) => m.id === g.ministerePiloteId);
                        if (info) {
                            ministeresPilotes.set(g.ministerePiloteId, info);
                        }
                    }
                });

                const result: SuiviMinistere[] = [];
                const deadline = new Date(annee, mois, 5); // deadline le 5 du mois suivant

                ministeresPilotes.forEach((info, ministereId) => {
                    const programmesMinistere = GOUVERNANCES.filter(
                        (g) => g.ministerePiloteId === ministereId,
                    );
                    const rapportsMinistere = programmesMinistere
                        .map((g) =>
                            rapports.find(
                                (r) =>
                                    r.programmeId === g.programmeId &&
                                    r.periodeMois === mois &&
                                    r.periodeAnnee === annee,
                            ),
                        )
                        .filter(Boolean) as RapportMensuel[];

                    let statut: SuiviMinistere['statut'] = 'non_saisi';
                    let dateRemplissage: string | null = null;
                    let tauxCompletude = 0;

                    if (rapportsMinistere.length === 0) {
                        statut = 'non_saisi';
                    } else if (
                        rapportsMinistere.every(
                            (r) => r.statutValidation === 'valide_sgpr',
                        )
                    ) {
                        statut = 'valide';
                        dateRemplissage = rapportsMinistere[0]?.modifieLe || null;
                        tauxCompletude = 100;
                    } else if (
                        rapportsMinistere.some(
                            (r) =>
                                r.statutValidation === 'soumis' ||
                                r.statutValidation === 'valide_sgg' ||
                                r.statutValidation === 'valide_sgpr',
                        )
                    ) {
                        statut = 'soumis';
                        dateRemplissage = rapportsMinistere[0]?.modifieLe || null;
                        tauxCompletude = Math.round(
                            (rapportsMinistere.filter(
                                (r) =>
                                    r.statutValidation === 'soumis' ||
                                    r.statutValidation === 'valide_sgg' ||
                                    r.statutValidation === 'valide_sgpr',
                            ).length /
                                programmesMinistere.length) *
                            100,
                        );
                    } else {
                        statut = 'brouillon';
                        dateRemplissage = rapportsMinistere[0]?.modifieLe || null;
                        tauxCompletude = Math.round(
                            (rapportsMinistere.length / programmesMinistere.length) * 100,
                        );
                    }

                    const now = new Date();
                    const joursRetard =
                        statut === 'non_saisi' && now > deadline
                            ? Math.floor((now.getTime() - deadline.getTime()) / 86400000)
                            : 0;

                    result.push({
                        ministereId,
                        ministereNom: info.nom,
                        ministereSigle: info.sigle,
                        mois,
                        annee,
                        statut,
                        dateRemplissage,
                        joursRetard,
                        tauxCompletude,
                    });
                });

                return result;
            },
        }),
        {
            name: 'sgg-reporting-store',
            // Only persist rapports & historique, not notifications (regenerated)
            partialize: (state) => ({
                rapports: state.rapports,
                historique: state.historique,
                notifications: state.notifications,
            }),
        },
    ),
);
