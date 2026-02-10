/**
 * SGG Digital — Tests du Reporting Store (Zustand)
 * Vérifie les opérations CRUD, les transitions de statut et les notifications
 * 
 * Note: localStorage mock is provided globally by test/setup.ts
 */

import { describe, it, expect } from 'vitest';
import { useReportingStore } from '@/stores/reportingStore';

describe('Reporting Store', () => {
    describe('getRapport', () => {
        it('should provide a getRapport function', () => {
            const { getRapport } = useReportingStore.getState();
            expect(typeof getRapport).toBe('function');
        });

        it('should return undefined for non-existent rapport', () => {
            const { getRapport } = useReportingStore.getState();
            const result = getRapport('non-existent', 99, 9999);
            expect(result).toBeUndefined();
        });
    });

    describe('getRapportsByStatut', () => {
        it('should filter rapports by status', () => {
            const { getRapportsByStatut } = useReportingStore.getState();
            const brouillons = getRapportsByStatut('brouillon');
            expect(Array.isArray(brouillons)).toBe(true);
            brouillons.forEach((r) => {
                expect(r.statutValidation).toBe('brouillon');
            });
        });

        it('should return empty array for invalid status', () => {
            const { getRapportsByStatut } = useReportingStore.getState();
            const results = getRapportsByStatut('non_existent_status' as any);
            expect(results).toEqual([]);
        });
    });

    describe('Notifications', () => {
        it('should count unread notifications', () => {
            const { getUnreadNotificationsCount, notifications } = useReportingStore.getState();
            const count = getUnreadNotificationsCount();
            const expected = notifications.filter((n) => !n.lue).length;
            expect(count).toBe(expected);
        });

        it('should mark a notification as read', () => {
            const state = useReportingStore.getState();
            const unreadNotif = state.notifications.find((n) => !n.lue);
            if (unreadNotif) {
                const countBefore = state.getUnreadNotificationsCount();
                state.markNotificationRead(unreadNotif.id);
                const countAfter = useReportingStore.getState().getUnreadNotificationsCount();
                expect(countAfter).toBe(countBefore - 1);
            }
        });

        it('should mark all notifications as read', () => {
            useReportingStore.getState().markAllNotificationsRead();
            const countAfter = useReportingStore.getState().getUnreadNotificationsCount();
            expect(countAfter).toBe(0);
        });
    });

    describe('createOrUpdateRapport', () => {
        it('should create a new rapport as brouillon', () => {
            const { createOrUpdateRapport } = useReportingStore.getState();

            const created = createOrUpdateRapport('test-prog-new', 'test-min', 12, 2025, {
                dateDebut: '2025-12-01',
                dateFin: '2025-12-31',
                activitesRealisees: 'Test activités',
                budgetMdFcfa: 100,
                engageMdFcfa: 80,
                decaisseMdFcfa: 60,
                pctExecutionFinanciere: 75,
                encadrementJuridique: 'Décret test',
                indicateursKpi: 'KPI test',
                pctAvancementPhysique: 50,
                statutProgramme: 'en_cours',
                observationsContraintes: 'Aucune',
            });

            expect(created).toBeDefined();
            expect(created.programmeId).toBe('test-prog-new');
            expect(created.statutValidation).toBe('brouillon');
            expect(created.budgetMdFcfa).toBe(100);

            // Verify the rapport is retrievable from state
            const stored = useReportingStore.getState().getRapport('test-prog-new', 12, 2025);
            expect(stored).toBeDefined();
            expect(stored?.id).toBe(created.id);
        });
    });

    describe('computeSuiviRemplissage', () => {
        it('should return an array of suivi entries', () => {
            const { computeSuiviRemplissage } = useReportingStore.getState();
            const suivi = computeSuiviRemplissage(1, 2026);
            expect(Array.isArray(suivi)).toBe(true);
        });

        it('should have ministere info in each entry', () => {
            const { computeSuiviRemplissage } = useReportingStore.getState();
            const suivi = computeSuiviRemplissage(1, 2026);
            suivi.forEach((entry) => {
                expect(entry.ministereId).toBeTruthy();
                expect(entry.ministereNom).toBeTruthy();
                expect(entry.ministereSigle).toBeTruthy();
                expect(typeof entry.tauxCompletude).toBe('number');
            });
        });
    });

    describe('getRapportById', () => {
        it('should return a rapport by its ID', () => {
            const state = useReportingStore.getState();
            if (state.rapports.length > 0) {
                const firstRapport = state.rapports[0];
                const found = state.getRapportById(firstRapport.id);
                expect(found).toBeDefined();
                expect(found?.id).toBe(firstRapport.id);
            }
        });

        it('should return undefined for non-existent ID', () => {
            const { getRapportById } = useReportingStore.getState();
            expect(getRapportById('non-existent-id')).toBeUndefined();
        });
    });
});
