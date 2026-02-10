/**
 * NEOCORTEX — 🔧 Plasticité
 * Configuration dynamique & poids synaptiques adaptatifs.
 * Permet de modifier le comportement du système sans redéploiement.
 */

import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';

const CONFIG_CACHE_PREFIX = 'neocortex:config:';
const CONFIG_CACHE_TTL = 300; // 5 minutes

// ============================================================================
// CONFIG DYNAMIQUE
// ============================================================================

/**
 * Lire une config par clé. Utilise Redis cache d'abord.
 */
export async function lireConfig<T = unknown>(cle: string): Promise<T | null> {
    // Cache d'abord
    const cached = await cacheGet<T>(`${CONFIG_CACHE_PREFIX}${cle}`);
    if (cached !== null) return cached;

    const result = await query(
        `SELECT valeur FROM neocortex.config_systeme WHERE cle = $1`,
        [cle]
    );

    if (result.rows.length === 0) return null;

    const valeur = (result.rows[0] as any).valeur as T;
    await cacheSet(`${CONFIG_CACHE_PREFIX}${cle}`, valeur, CONFIG_CACHE_TTL);
    return valeur;
}

/**
 * Lire config avec une valeur par défaut si non trouvée.
 */
export async function lireConfigOuDefaut<T>(cle: string, defaut: T): Promise<T> {
    const val = await lireConfig<T>(cle);
    return val !== null ? val : defaut;
}

/**
 * Écrire/mettre à jour une config.
 */
export async function ecrireConfig(
    cle: string,
    valeur: unknown,
    modifiePar?: string,
    description?: string
): Promise<void> {
    await query(
        `INSERT INTO neocortex.config_systeme (cle, valeur, description, modifie_par, updated_at, version)
     VALUES ($1, $2, $3, $4, NOW(), 1)
     ON CONFLICT (cle) DO UPDATE SET
       valeur = $2,
       modifie_par = $4,
       updated_at = NOW(),
       version = neocortex.config_systeme.version + 1`,
        [cle, JSON.stringify(valeur), description || null, modifiePar || null]
    );

    // Invalider le cache
    await cacheDelete(`${CONFIG_CACHE_PREFIX}${cle}`);
}

/**
 * Lire toutes les configs d'une catégorie.
 */
export async function lireConfigsParCategorie(categorie: string): Promise<
    Array<{ cle: string; valeur: unknown; description: string | null; version: number }>
> {
    const result = await query(
        `SELECT cle, valeur, description, version
     FROM neocortex.config_systeme
     WHERE categorie = $1
     ORDER BY cle`,
        [categorie]
    );

    return result.rows.map((r: any) => ({
        cle: r.cle,
        valeur: r.valeur,
        description: r.description,
        version: r.version,
    }));
}

// ============================================================================
// POIDS ADAPTATIFS
// ============================================================================

/**
 * Lire les poids adaptatifs pour un type de signal.
 */
export async function lirePoidsAdaptatifs(signalType: string): Promise<
    Array<{ regle: string; poids: number; reussites: number; echecs: number }>
> {
    const result = await query(
        `SELECT regle, poids, executions_reussies, executions_echouees
     FROM neocortex.poids_adaptatifs
     WHERE signal_type = $1
     ORDER BY poids DESC`,
        [signalType]
    );

    return result.rows.map((r: any) => ({
        regle: r.regle,
        poids: parseFloat(r.poids),
        reussites: r.executions_reussies,
        echecs: r.executions_echouees,
    }));
}

/**
 * Ajuster un poids synaptique suite à une exécution (renforcement/affaiblissement).
 */
export async function ajusterPoids(
    signalType: string,
    regle: string,
    succes: boolean
): Promise<number> {
    const pas = await lireConfigOuDefaut<number>('plasticite.ajustement_pas', 0.05);

    const ajustement = succes ? pas : -pas;
    const colonne = succes ? 'executions_reussies' : 'executions_echouees';

    const result = await query<{ poids: number }>(
        `UPDATE neocortex.poids_adaptatifs
     SET poids = GREATEST(0, LEAST(1, poids + $1)),
         ${colonne} = ${colonne} + 1,
         dernier_ajustement = NOW()
     WHERE signal_type = $2 AND regle = $3
     RETURNING poids`,
        [ajustement, signalType, regle]
    );

    if (result.rows.length === 0) {
        // Créer le poids s'il n'existe pas
        const initPoids = 0.5 + ajustement;
        await query(
            `INSERT INTO neocortex.poids_adaptatifs (signal_type, regle, poids, ${colonne})
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (signal_type, regle) DO NOTHING`,
            [signalType, regle, initPoids]
        );
        return initPoids;
    }

    return parseFloat(String(result.rows[0].poids));
}
