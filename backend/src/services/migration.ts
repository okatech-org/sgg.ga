/**
 * SGG Digital — Service de Migration Mock → Base de données
 *
 * Ce service orchestre la migration progressive des données mock
 * vers la base de données PostgreSQL réelle.
 *
 * Pattern : « Shadow Migration »
 *   1. Les routes API lisent d'abord la base de données
 *   2. Si aucune donnée → fallback sur les mock (démonstration)
 *   3. Les données mock sont insérées dans la DB via ce service
 *   4. Une fois la DB alimentée, les mocks sont désactivés
 *
 * Usage CLI :
 *   npx tsx src/scripts/migrate-data.ts [--module reporting|gar|institutions] [--dry-run]
 */

import { query, transaction } from '../config/database.js';
// Simple structured logger for migration
const migrationLogger = {
    info: (...args: unknown[]) => console.log('[Migration]', ...args),
    error: (...args: unknown[]) => console.error('[Migration]', ...args),
    warn: (...args: unknown[]) => console.warn('[Migration]', ...args),
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface MigrationResult {
    module: string;
    inserted: number;
    skipped: number;
    errors: string[];
    durationMs: number;
}

interface MigrationPlan {
    modules: string[];
    dryRun: boolean;
    results: MigrationResult[];
    startedAt: Date;
    completedAt?: Date;
}

// ─── Mock Data Sources ──────────────────────────────────────────────────────

/**
 * Institutions mock data (mirrors frontend mock)
 */
function getInstitutionsMock() {
    return [
        { sigle: 'PR', nom: 'Présidence de la République', type: 'presidence', email_referent: 'sg@presidence.ga' },
        { sigle: 'PM', nom: 'Primature', type: 'primature', email_referent: 'sg@primature.ga' },
        { sigle: 'SGG', nom: 'Secrétariat Général du Gouvernement', type: 'sgg', email_referent: 'contact@sgg.ga' },
        { sigle: 'MINFI', nom: "Ministère de l'Économie et des Finances", type: 'ministere', email_referent: 'sg@minfi.ga' },
        { sigle: 'MINEDUC', nom: "Ministère de l'Éducation Nationale", type: 'ministere', email_referent: 'sg@mineduc.ga' },
        { sigle: 'MINSANTE', nom: 'Ministère de la Santé', type: 'ministere', email_referent: 'sg@minsante.ga' },
        { sigle: 'MINDEF', nom: 'Ministère de la Défense Nationale', type: 'ministere', email_referent: 'sg@mindef.ga' },
        { sigle: 'MINTP', nom: 'Ministère des Travaux Publics', type: 'ministere', email_referent: 'sg@mintp.ga' },
        { sigle: 'MINTRANS', nom: 'Ministère des Transports', type: 'ministere', email_referent: 'sg@mintrans.ga' },
        { sigle: 'MINAGRI', nom: "Ministère de l'Agriculture", type: 'ministere', email_referent: 'sg@minagri.ga' },
        { sigle: 'AN', nom: 'Assemblée Nationale', type: 'assemblee', email_referent: 'sg@assemblee.ga' },
        { sigle: 'SENAT', nom: 'Sénat', type: 'senat', email_referent: 'sg@senat.ga' },
    ];
}

/**
 * PAG Priorities mock data (mirrors GAR/PAG frontend)
 */
function getPrioritiesMock() {
    return [
        { code: 'P1', priorite: 1, titre: 'Infrastructure et connectivité', description: "Développement des infrastructures de transport, énergie et numérique", couleur: '#1e40af' },
        { code: 'P2', priorite: 2, titre: 'Capital humain et inclusion', description: "Éducation, santé, formation professionnelle et protection sociale", couleur: '#059669' },
        { code: 'P3', priorite: 3, titre: 'Économie diversifiée et compétitive', description: "Diversification économique, industrie, agriculture et tourisme", couleur: '#d97706' },
        { code: 'P4', priorite: 4, titre: 'Gouvernance et institutions', description: "Réforme de l'État, justice, décentralisation et sécurité", couleur: '#7c3aed' },
        { code: 'P5', priorite: 5, titre: 'Environnement et durabilité', description: "Gestion des ressources naturelles et transition écologique", couleur: '#0d9488' },
    ];
}

// ─── Migration Functions ────────────────────────────────────────────────────

async function migrateInstitutions(dryRun: boolean): Promise<MigrationResult> {
    const start = Date.now();
    const result: MigrationResult = { module: 'institutions', inserted: 0, skipped: 0, errors: [], durationMs: 0 };

    const institutions = getInstitutionsMock();
    migrationLogger.info?.(`Migration institutions: ${institutions.length} entrées`);

    for (const inst of institutions) {
        try {
            // Check if already exists
            const existing = await query(
                'SELECT id FROM institutions.institutions WHERE sigle = $1',
                [inst.sigle]
            );

            if (existing.rows.length > 0) {
                result.skipped++;
                continue;
            }

            if (dryRun) {
                migrationLogger.info?.(`[DRY RUN] Would insert: ${inst.sigle} — ${inst.nom}`);
                result.inserted++;
                continue;
            }

            await query(
                `INSERT INTO institutions.institutions (sigle, nom, type, email_referent, est_actif)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (sigle) DO NOTHING`,
                [inst.sigle, inst.nom, inst.type, inst.email_referent]
            );

            result.inserted++;
        } catch (err: any) {
            result.errors.push(`${inst.sigle}: ${err.message}`);
        }
    }

    result.durationMs = Date.now() - start;
    return result;
}

async function migratePriorities(dryRun: boolean): Promise<MigrationResult> {
    const start = Date.now();
    const result: MigrationResult = { module: 'gar_priorities', inserted: 0, skipped: 0, errors: [], durationMs: 0 };

    const priorities = getPrioritiesMock();
    migrationLogger.info?.(`Migration GAR priorities: ${priorities.length} entrées`);

    for (const prio of priorities) {
        try {
            const existing = await query(
                'SELECT id FROM gar.priorites_pag WHERE code = $1',
                [prio.code]
            );

            if (existing.rows.length > 0) {
                result.skipped++;
                continue;
            }

            if (dryRun) {
                migrationLogger.info?.(`[DRY RUN] Would insert: ${prio.code} — ${prio.titre}`);
                result.inserted++;
                continue;
            }

            await query(
                `INSERT INTO gar.priorites_pag (code, priorite, titre, description, couleur, annee, est_actif)
         VALUES ($1, $2, $3, $4, $5, 2026, true)
         ON CONFLICT (code) DO NOTHING`,
                [prio.code, prio.priorite, prio.titre, prio.description, prio.couleur]
            );

            result.inserted++;
        } catch (err: any) {
            result.errors.push(`${prio.code}: ${err.message}`);
        }
    }

    result.durationMs = Date.now() - start;
    return result;
}

async function migrateReportingStructure(dryRun: boolean): Promise<MigrationResult> {
    const start = Date.now();
    const result: MigrationResult = { module: 'reporting_structure', inserted: 0, skipped: 0, errors: [], durationMs: 0 };

    migrationLogger.info?.('Migration reporting structure: programmes PAG + piliers');

    try {
        // Check if programmes already exist
        const existing = await query('SELECT COUNT(*) as count FROM reporting.programmes_pag');

        if (parseInt(existing.rows[0]?.count ?? '0') > 0) {
            result.skipped++;
            migrationLogger.info?.('Reporting programmes already populated — skipping');
            result.durationMs = Date.now() - start;
            return result;
        }

        if (dryRun) {
            migrationLogger.info?.('[DRY RUN] Would create 5 programmes PAG + 5 piliers présidentiels');
            result.inserted = 10;
            result.durationMs = Date.now() - start;
            return result;
        }

        await transaction(async (client) => {
            // Create programmes matching the priorities
            const priorities = getPrioritiesMock();
            for (const prio of priorities) {
                await client.query(
                    `INSERT INTO reporting.programmes_pag (code, intitule, ministere_responsable, budget_md_fcfa)
           VALUES ($1, $2, 'SGG', 0)
           ON CONFLICT DO NOTHING`,
                    [`PROG-${prio.code}`, prio.titre]
                );
                result.inserted++;
            }

            // Create piliers présidentiels
            const piliers = [
                { code: 'PIL-1', intitule: 'Pilier Institutionnel' },
                { code: 'PIL-2', intitule: 'Pilier Économique' },
                { code: 'PIL-3', intitule: 'Pilier Social' },
                { code: 'PIL-4', intitule: 'Pilier Environnemental' },
                { code: 'PIL-5', intitule: 'Pilier Numérique' },
            ];

            for (const pilier of piliers) {
                await client.query(
                    `INSERT INTO reporting.piliers_presidentiels (code, intitule)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
                    [pilier.code, pilier.intitule]
                );
                result.inserted++;
            }
        });
    } catch (err: any) {
        result.errors.push(`reporting_structure: ${err.message}`);
    }

    result.durationMs = Date.now() - start;
    return result;
}

// ─── Main Migration Orchestrator ────────────────────────────────────────────

export async function runMigration(
    modules: string[] = ['institutions', 'gar', 'reporting'],
    dryRun = false
): Promise<MigrationPlan> {
    const plan: MigrationPlan = {
        modules,
        dryRun,
        results: [],
        startedAt: new Date(),
    };

    migrationLogger.info?.(`\n${'='.repeat(60)}`);
    migrationLogger.info?.(`SGG Digital — Migration de données`);
    migrationLogger.info?.(`Modules: ${modules.join(', ')}`);
    migrationLogger.info?.(`Mode: ${dryRun ? 'DRY RUN (aucune écriture)' : 'PRODUCTION'}`);
    migrationLogger.info?.(`${'='.repeat(60)}\n`);

    for (const mod of modules) {
        try {
            let result: MigrationResult;

            switch (mod) {
                case 'institutions':
                    result = await migrateInstitutions(dryRun);
                    break;
                case 'gar':
                    result = await migratePriorities(dryRun);
                    break;
                case 'reporting':
                    result = await migrateReportingStructure(dryRun);
                    break;
                default:
                    result = { module: mod, inserted: 0, skipped: 0, errors: [`Module inconnu: ${mod}`], durationMs: 0 };
            }

            plan.results.push(result);

            migrationLogger.info?.(
                `✅ ${result.module}: ${result.inserted} insérés, ${result.skipped} ignorés` +
                (result.errors.length ? `, ${result.errors.length} erreurs` : '') +
                ` (${result.durationMs}ms)`
            );
        } catch (err: any) {
            plan.results.push({
                module: mod,
                inserted: 0,
                skipped: 0,
                errors: [err.message],
                durationMs: 0,
            });
            migrationLogger.error?.(`❌ ${mod}: ${err.message}`);
        }
    }

    plan.completedAt = new Date();

    const totalInserted = plan.results.reduce((acc, r) => acc + r.inserted, 0);
    const totalSkipped = plan.results.reduce((acc, r) => acc + r.skipped, 0);
    const totalErrors = plan.results.reduce((acc, r) => acc + r.errors.length, 0);

    migrationLogger.info?.(`\n${'─'.repeat(60)}`);
    migrationLogger.info?.(`Migration terminée en ${plan.completedAt.getTime() - plan.startedAt.getTime()}ms`);
    migrationLogger.info?.(`Total: ${totalInserted} insérés, ${totalSkipped} ignorés, ${totalErrors} erreurs`);
    migrationLogger.info?.(`${'─'.repeat(60)}\n`);

    return plan;
}

export { type MigrationResult, type MigrationPlan };
