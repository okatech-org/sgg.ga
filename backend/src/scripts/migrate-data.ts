#!/usr/bin/env tsx
/**
 * SGG Digital — Script de migration CLI
 *
 * Usage:
 *   npx tsx src/scripts/migrate-data.ts
 *   npx tsx src/scripts/migrate-data.ts --module institutions
 *   npx tsx src/scripts/migrate-data.ts --module gar --dry-run
 *   npx tsx src/scripts/migrate-data.ts --module reporting,institutions
 */

import { runMigration } from '../services/migration.js';

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    // Parse --module flag
    const moduleIndex = args.findIndex(a => a === '--module');
    let modules = ['institutions', 'gar', 'reporting'];

    if (moduleIndex !== -1 && args[moduleIndex + 1]) {
        modules = args[moduleIndex + 1].split(',').map(m => m.trim());
    }

    console.log('🔄 SGG Digital — Migration de données mock → PostgreSQL');
    console.log(`   Modules : ${modules.join(', ')}`);
    console.log(`   Mode    : ${dryRun ? '🔍 DRY RUN' : '⚡ PRODUCTION'}\n`);

    try {
        const plan = await runMigration(modules, dryRun);

        // Summary
        const hasErrors = plan.results.some(r => r.errors.length > 0);

        if (hasErrors) {
            console.log('\n⚠️  Migration terminée avec des erreurs :');
            for (const r of plan.results) {
                for (const e of r.errors) {
                    console.error(`   ❌ [${r.module}] ${e}`);
                }
            }
            process.exit(1);
        }

        console.log('\n✅ Migration réussie !');
        process.exit(0);
    } catch (err: any) {
        console.error(`\n💥 Erreur fatale: ${err.message}`);
        process.exit(1);
    }
}

main();
