/**
 * SGG Digital — Service Notifications Reporting
 * Templates et gestion des notifications mock
 */

import type { NotificationType, NotificationReporting } from '@/types/reporting';

interface NotificationTemplate {
  type: NotificationType;
  titre: string;
  message: (params: Record<string, string>) => string;
}

const TEMPLATES: NotificationTemplate[] = [
  {
    type: 'ouverture_periode',
    titre: 'Période de saisie ouverte',
    message: (p) =>
      `La période de saisie pour ${p.mois} ${p.annee} est ouverte. Vous avez jusqu'au ${p.deadline} pour soumettre votre rapport.`,
  },
  {
    type: 'rappel_mi_periode',
    titre: 'Rappel mi-période',
    message: (p) =>
      `Rappel: la date limite de saisie pour ${p.mois} ${p.annee} approche. ${p.joursRestants} jours restants.`,
  },
  {
    type: 'deadline_approche',
    titre: 'Deadline imminente',
    message: (p) =>
      `Attention: il ne reste que ${p.joursRestants} jour(s) pour soumettre le rapport ${p.programme}.`,
  },
  {
    type: 'deadline_depassee',
    titre: 'Deadline dépassée',
    message: (p) =>
      `Le rapport ${p.programme} n'a pas été soumis dans les délais. Retard de ${p.joursRetard} jour(s).`,
  },
  {
    type: 'rapport_soumis',
    titre: 'Rapport soumis',
    message: (p) =>
      `Le rapport ${p.programme} a été soumis par ${p.soumetteur} pour validation.`,
  },
  {
    type: 'rapport_valide_sgg',
    titre: 'Rapport validé SGG',
    message: (p) =>
      `Le rapport ${p.programme} a été validé par le SGG. En attente de validation SGPR.`,
  },
  {
    type: 'rapport_valide_sgpr',
    titre: 'Rapport publié',
    message: (p) =>
      `Le rapport ${p.programme} a été validé par le SGPR et est désormais publié.`,
  },
  {
    type: 'rapport_rejete',
    titre: 'Rapport rejeté',
    message: (p) =>
      `Le rapport ${p.programme} a été rejeté. Motif: ${p.motif}. Veuillez corriger et resoumettre.`,
  },
  {
    type: 'anomalie_detectee',
    titre: 'Anomalie détectée',
    message: (p) =>
      `Anomalie sur le rapport ${p.programme}: ${p.description}`,
  },
  {
    type: 'gel_credits',
    titre: 'Gel de crédits',
    message: (p) =>
      `Alerte: gel de crédits potentiel pour le programme ${p.programme}. Décaissement supérieur à l'engagement.`,
  },
];

export function generateNotification(
  type: NotificationType,
  destinataireId: string,
  destinataireNom: string,
  params: Record<string, string>
): NotificationReporting {
  const template = TEMPLATES.find((t) => t.type === type);
  if (!template) throw new Error(`Template inconnu: ${type}`);

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    titre: template.titre,
    message: template.message(params),
    destinataireId,
    destinataireNom,
    lue: false,
    dateCreation: new Date().toISOString(),
    lienAction: params.lien,
    rapportId: params.rapportId,
    programmeId: params.programmeId,
    ministereId: params.ministereId,
  };
}

export function getUnreadCount(notifications: NotificationReporting[]): number {
  return notifications.filter((n) => !n.lue).length;
}

export function markAsRead(
  notifications: NotificationReporting[],
  notifId: string
): NotificationReporting[] {
  return notifications.map((n) =>
    n.id === notifId ? { ...n, lue: true } : n
  );
}

export function markAllAsRead(
  notifications: NotificationReporting[]
): NotificationReporting[] {
  return notifications.map((n) => ({ ...n, lue: true }));
}
