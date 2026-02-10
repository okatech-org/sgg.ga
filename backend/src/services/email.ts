/**
 * SGG Digital — Service d'Alertes Email (SendGrid)
 *
 * Envoie des notifications critiques par email aux acteurs concernés.
 * Utilise SendGrid comme provider transactionnel.
 *
 * Fonctionnalités :
 *   - Templates prédéfinis (rapport soumis, validé, rejeté, alerte système)
 *   - Personnalisation dynamique (variables Handlebars)
 *   - File d'attente avec retry (max 3 tentatives)
 *   - Rate limiting (100 emails/min)
 *   - Mode dry-run pour les tests
 *
 * Configuration requise (env) :
 *   SENDGRID_API_KEY=SG.xxxx
 *   SENDGRID_FROM_EMAIL=no-reply@sgg.ga
 *   SENDGRID_FROM_NAME=SGG Digital
 */

import sgMail from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';

// ── Configuration ───────────────────────────────────────────────────────────

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@sgg.ga';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'SGG Digital';
const DRY_RUN = process.env.NODE_ENV === 'test' || !SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface EmailRecipient {
    email: string;
    name?: string;
}

export type EmailTemplateId =
    | 'rapport_soumis'
    | 'rapport_valide_sgg'
    | 'rapport_valide_sgpr'
    | 'rapport_rejete'
    | 'alerte_systeme'
    | 'bienvenue'
    | 'rappel_saisie';

export interface EmailPayload {
    to: EmailRecipient | EmailRecipient[];
    template: EmailTemplateId;
    variables: Record<string, string | number | boolean>;
    cc?: EmailRecipient[];
    priority?: 'high' | 'normal' | 'low';
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    dryRun: boolean;
}

// ── Template System ─────────────────────────────────────────────────────────

interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

function getTemplate(templateId: EmailTemplateId, vars: Record<string, string | number | boolean>): EmailTemplate {
    const interpolate = (str: string) =>
        str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));

    const templates: Record<EmailTemplateId, EmailTemplate> = {
        rapport_soumis: {
            subject: 'Nouveau rapport soumis — {{ministere}}',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002D62; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">🏛 SGG Digital</h1>
            <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8;">Secrétariat Général du Gouvernement</p>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #002D62; margin-top: 0;">Nouveau rapport soumis</h2>
            <p>Le ministère <strong>{{ministere}}</strong> a soumis un rapport mensuel pour le mois de <strong>{{mois}}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Programme</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{programme}}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Pilier</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{pilier}}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Soumis par</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{soumis_par}}</td></tr>
            </table>
            <a href="{{lien}}" style="display: inline-block; background: #002D62; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Consulter le rapport</a>
          </div>
          <div style="padding: 15px; text-align: center; font-size: 11px; color: #6b7280;">
            © 2026 SGG Digital — Tous droits réservés
          </div>
        </div>
      `,
            text: 'Nouveau rapport soumis par {{ministere}} pour {{mois}}. Programme: {{programme}}, Pilier: {{pilier}}. Consulter: {{lien}}',
        },

        rapport_valide_sgg: {
            subject: 'Rapport validé (SGG) — {{ministere}}',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002D62; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">✅ SGG Digital</h1>
          </div>
          <div style="padding: 30px; background: #f0fdf4; border: 1px solid #bbf7d0;">
            <h2 style="color: #16a34a; margin-top: 0;">Rapport validé par le SGG</h2>
            <p>Le rapport de <strong>{{ministere}}</strong> pour <strong>{{mois}}</strong> a été validé par le SGG.</p>
            <p>Validé par: <strong>{{validateur}}</strong></p>
            <a href="{{lien}}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Voir le détail</a>
          </div>
        </div>
      `,
            text: 'Rapport de {{ministere}} pour {{mois}} validé par le SGG. Validateur: {{validateur}}. Lien: {{lien}}',
        },

        rapport_valide_sgpr: {
            subject: 'Rapport validé (SGPR) — {{ministere}}',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002D62; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">🏆 SGG Digital</h1>
          </div>
          <div style="padding: 30px; background: #eff6ff; border: 1px solid #bfdbfe;">
            <h2 style="color: #1d4ed8; margin-top: 0;">Rapport validé par le SGPR</h2>
            <p>Le rapport de <strong>{{ministere}}</strong> pour <strong>{{mois}}</strong> a reçu la validation finale du SGPR.</p>
            <p>Ce rapport est désormais officiellement approuvé.</p>
            <a href="{{lien}}" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Voir le rapport finalisé</a>
          </div>
        </div>
      `,
            text: 'Rapport de {{ministere}} pour {{mois}} validé par le SGPR (validation finale). Lien: {{lien}}',
        },

        rapport_rejete: {
            subject: '⚠️ Rapport rejeté — {{ministere}}',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #991b1b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">⚠️ SGG Digital</h1>
          </div>
          <div style="padding: 30px; background: #fef2f2; border: 1px solid #fecaca;">
            <h2 style="color: #dc2626; margin-top: 0;">Rapport rejeté</h2>
            <p>Le rapport de <strong>{{ministere}}</strong> pour <strong>{{mois}}</strong> a été rejeté.</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 15px 0;">
              <strong>Motif :</strong><br/>{{motif}}
            </div>
            <p>Veuillez corriger le rapport et le soumettre à nouveau.</p>
            <a href="{{lien}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Corriger le rapport</a>
          </div>
        </div>
      `,
            text: 'Rapport de {{ministere}} pour {{mois}} rejeté. Motif: {{motif}}. Corrigez et resoumettez: {{lien}}',
        },

        alerte_systeme: {
            subject: '🚨 Alerte système SGG Digital — {{niveau}}',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">🚨 Alerte Système</h1>
          </div>
          <div style="padding: 30px; background: #faf5ff; border: 1px solid #e9d5ff;">
            <h2 style="color: #7c3aed; margin-top: 0;">{{titre}}</h2>
            <p>{{description}}</p>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr><td style="padding: 8px; font-weight: bold;">Niveau</td><td style="padding: 8px;">{{niveau}}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Service</td><td style="padding: 8px;">{{service}}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Horodatage</td><td style="padding: 8px;">{{timestamp}}</td></tr>
            </table>
          </div>
        </div>
      `,
            text: 'Alerte système SGG Digital — {{niveau}}: {{titre}}. {{description}}. Service: {{service}}.',
        },

        bienvenue: {
            subject: 'Bienvenue sur SGG Digital',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002D62; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">🏛 Bienvenue sur SGG Digital</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #002D62; margin-top: 0;">Bonjour {{nom}} !</h2>
            <p>Votre compte sur la plateforme SGG Digital a été créé avec succès.</p>
            <p>Rôle attribué : <strong>{{role}}</strong></p>
            <p>Institution : <strong>{{institution}}</strong></p>
            <a href="{{lien}}" style="display: inline-block; background: #002D62; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder à votre espace</a>
          </div>
        </div>
      `,
            text: 'Bienvenue {{nom}} sur SGG Digital ! Rôle: {{role}}, Institution: {{institution}}. Accès: {{lien}}',
        },

        rappel_saisie: {
            subject: '📋 Rappel : Saisie mensuelle en attente — {{mois}}',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #d97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">📋 Rappel SGG Digital</h1>
          </div>
          <div style="padding: 30px; background: #fffbeb; border: 1px solid #fde68a;">
            <h2 style="color: #d97706; margin-top: 0;">Saisie mensuelle en attente</h2>
            <p>Bonjour <strong>{{nom}}</strong>,</p>
            <p>Le rapport mensuel de <strong>{{ministere}}</strong> pour <strong>{{mois}}</strong> n'a pas encore été soumis.</p>
            <p>Date limite : <strong>{{date_limite}}</strong></p>
            <a href="{{lien}}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Compléter la saisie</a>
          </div>
        </div>
      `,
            text: 'Rappel: Le rapport mensuel de {{ministere}} pour {{mois}} est en attente. Date limite: {{date_limite}}. Lien: {{lien}}',
        },
    };

    const tmpl = templates[templateId];
    return {
        subject: interpolate(tmpl.subject),
        html: interpolate(tmpl.html),
        text: interpolate(tmpl.text),
    };
}

// ── Rate Limiting ───────────────────────────────────────────────────────────

const sentTimestamps: number[] = [];
const MAX_PER_MINUTE = 100;

function checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;

    // Clean old entries
    while (sentTimestamps.length > 0 && sentTimestamps[0] < oneMinuteAgo) {
        sentTimestamps.shift();
    }

    return sentTimestamps.length < MAX_PER_MINUTE;
}

// ── Email Queue with Retry ──────────────────────────────────────────────────

const MAX_RETRIES = 3;

async function sendWithRetry(msg: MailDataRequired, attempt = 1): Promise<EmailResult> {
    try {
        if (DRY_RUN) {
            const toStr = Array.isArray(msg.to)
                ? (msg.to as any).map((r: any) => r.email || r).join(', ')
                : (msg.to as any).email || msg.to;
            console.log(`[EMAIL DRY RUN] To: ${toStr} | Subject: ${msg.subject}`);
            return { success: true, messageId: `dry-run-${Date.now()}`, dryRun: true };
        }

        if (!checkRateLimit()) {
            console.warn('[EMAIL] Rate limit reached, waiting 5s...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        const [response] = await sgMail.send(msg);
        sentTimestamps.push(Date.now());

        return {
            success: true,
            messageId: response.headers['x-message-id'] as string,
            dryRun: false,
        };
    } catch (err: any) {
        if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.warn(`[EMAIL] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms: ${err.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return sendWithRetry(msg, attempt + 1);
        }

        return {
            success: false,
            error: err.message || 'Unknown SendGrid error',
            dryRun: false,
        };
    }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
    const template = getTemplate(payload.template, payload.variables);

    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

    const msg: MailDataRequired = {
        to: recipients.map(r => ({ email: r.email, name: r.name })),
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: template.subject,
        html: template.html,
        text: template.text,
        ...(payload.cc && { cc: payload.cc.map(r => ({ email: r.email, name: r.name })) }),
        ...(payload.priority === 'high' && { headers: { 'X-Priority': '1' } }),
    };

    return sendWithRetry(msg);
}

/**
 * Shorthand: Send a report notification
 */
export async function notifyReportStatus(
    template: Extract<EmailTemplateId, 'rapport_soumis' | 'rapport_valide_sgg' | 'rapport_valide_sgpr' | 'rapport_rejete'>,
    to: EmailRecipient,
    variables: {
        ministere: string;
        mois: string;
        programme?: string;
        pilier?: string;
        soumis_par?: string;
        validateur?: string;
        motif?: string;
        lien: string;
    }
): Promise<EmailResult> {
    return sendEmail({
        to,
        template,
        variables: variables as Record<string, string>,
        priority: template === 'rapport_rejete' ? 'high' : 'normal',
    });
}

/**
 * Shorthand: Send a system alert
 */
export async function sendSystemAlert(
    to: EmailRecipient[],
    variables: {
        titre: string;
        description: string;
        niveau: 'critique' | 'alerte' | 'info';
        service: string;
    }
): Promise<EmailResult> {
    return sendEmail({
        to,
        template: 'alerte_systeme',
        variables: {
            ...variables,
            timestamp: new Date().toISOString(),
        },
        priority: variables.niveau === 'critique' ? 'high' : 'normal',
    });
}

/**
 * Shorthand: Send monthly entry reminders in batch
 */
export async function sendBatchReminders(
    recipients: Array<{
        email: string;
        name: string;
        ministere: string;
        mois: string;
        date_limite: string;
        lien: string;
    }>
): Promise<{ sent: number; failed: number; results: EmailResult[] }> {
    const results: EmailResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
        const result = await sendEmail({
            to: { email: r.email, name: r.name },
            template: 'rappel_saisie',
            variables: { nom: r.name, ...r },
        });

        results.push(result);
        if (result.success) sent++;
        else failed++;
    }

    return { sent, failed, results };
}
