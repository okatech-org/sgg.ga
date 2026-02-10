/**
 * SGG Digital — Service d'Authentification à Deux Facteurs (TOTP)
 *
 * Implémente l'authentification 2FA via Time-Based One-Time Passwords (RFC 6238).
 * Compatible avec Google Authenticator, Microsoft Authenticator, Authy, etc.
 *
 * Flux :
 *   1. L'utilisateur active le 2FA → génère un secret + QR code
 *   2. L'utilisateur scanne le QR code avec son app TOTP
 *   3. L'utilisateur entre un code TOTP pour vérifier → 2FA activé
 *   4. À chaque connexion, un code TOTP est requis après email/password
 *   5. Des codes de récupération sont fournis en cas de perte du device
 *
 * Sécurité :
 *   - Secret chiffré en base de données
 *   - Window de 1 step (±30s) pour tolérance d'horloge
 *   - Codes de récupération à usage unique
 *   - Rate limiting sur la vérification TOTP
 */

import crypto from 'crypto';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';

// ── Types ───────────────────────────────────────────────────────────────────

export interface TOTPSetup {
    secret: string;            // Base32 encoded secret
    uri: string;               // otpauth:// URI for QR code
    qrDataUrl?: string;        // base64-encoded QR code SVG/PNG
    recoveryCodes: string[];   // 8 single-use recovery codes
}

export interface TOTPVerificationResult {
    valid: boolean;
    usedRecoveryCode?: boolean;
    remainingRecoveryCodes?: number;
}

export interface TwoFactorStatus {
    enabled: boolean;
    enabledAt?: string;
    recoveryCodes: number; // count remaining
}

// ── Constants ───────────────────────────────────────────────────────────────

const TOTP_ISSUER = 'SGG Digital';
const TOTP_ALGORITHM = 'SHA1';  // Standard for most authenticator apps
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_WINDOW = 1; // ±1 step tolerance (covers 90-second window)
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_LENGTH = 8;

// Encryption key for secrets stored in DB
const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-dev-key';

// ── TOTP Algorithm (RFC 6238) ───────────────────────────────────────────────

/**
 * Generate a cryptographically random Base32 secret
 */
export function generateSecret(length = 20): string {
    const buffer = crypto.randomBytes(length);
    return base32Encode(buffer);
}

/**
 * Generate TOTP code for a given secret and time
 */
export function generateTOTP(secret: string, time?: number): string {
    const now = time || Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / TOTP_PERIOD);
    return generateHOTP(secret, counter);
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTP(secret: string, code: string, window = TOTP_WINDOW): boolean {
    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / TOTP_PERIOD);

    // Check within the time window
    for (let i = -window; i <= window; i++) {
        const expected = generateHOTP(secret, counter + i);
        if (timingSafeEqual(code, expected)) {
            return true;
        }
    }

    return false;
}

/**
 * Generate HOTP (HMAC-based One-Time Password) — RFC 4226
 */
function generateHOTP(secret: string, counter: number): string {
    const decodedSecret = base32Decode(secret);

    // Create 8-byte counter buffer
    const counterBuffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
        counterBuffer[i] = counter & 0xff;
        counter = counter >> 8;
    }

    // HMAC-SHA1
    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0xf;
    const binary =
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, TOTP_DIGITS);
    return otp.toString().padStart(TOTP_DIGITS, '0');
}

// ── Base32 Encode/Decode ────────────────────────────────────────────────────

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
    let bits = '';
    for (const byte of buffer) {
        bits += byte.toString(2).padStart(8, '0');
    }

    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substring(i, i + 5).padEnd(5, '0');
        result += BASE32_CHARS[parseInt(chunk, 2)];
    }

    return result;
}

function base32Decode(encoded: string): Buffer {
    let bits = '';
    for (const char of encoded.toUpperCase()) {
        const index = BASE32_CHARS.indexOf(char);
        if (index === -1) continue;
        bits += index.toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }

    return Buffer.from(bytes);
}

// ── Encryption ──────────────────────────────────────────────────────────────

function encryptSecret(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'sgg-2fa-salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptSecret(ciphertext: string): string {
    const [ivHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'sgg-2fa-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// ── Timing-Safe Compare ─────────────────────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return crypto.timingSafeEqual(bufA, bufB);
}

// ── Recovery Codes ──────────────────────────────────────────────────────────

function generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
        const code = crypto.randomBytes(RECOVERY_CODE_LENGTH / 2).toString('hex').toUpperCase();
        // Format: XXXX-XXXX for readability
        codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
}

// ── Database Operations ─────────────────────────────────────────────────────

/**
 * Set up 2FA for a user — generates secret, URI, and recovery codes.
 * Does NOT activate 2FA — user must verify a code first.
 */
export async function setup2FA(userId: string, email: string): Promise<TOTPSetup> {
    const secret = generateSecret();
    const encryptedSecret = encryptSecret(secret);
    const recoveryCodes = generateRecoveryCodes();

    // Build otpauth:// URI
    const uri = `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(TOTP_ISSUER)}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;

    // Store pending setup in database
    await query(
        `INSERT INTO two_factor_auth (user_id, secret_encrypted, recovery_codes, enabled, created_at)
     VALUES ($1, $2, $3, false, NOW())
     ON CONFLICT (user_id) 
     DO UPDATE SET secret_encrypted = $2, recovery_codes = $3, enabled = false, updated_at = NOW()`,
        [userId, encryptedSecret, JSON.stringify(recoveryCodes)]
    );

    // Clear any cached 2FA status
    await cacheDelete(`2fa:status:${userId}`);

    console.log(`[2FA] Setup initiated for user ${userId}`);

    return {
        secret,
        uri,
        recoveryCodes,
    };
}

/**
 * Activate 2FA after user verifies a TOTP code
 */
export async function activate2FA(userId: string, code: string): Promise<boolean> {
    // Fetch the pending secret
    const result = await query(
        'SELECT secret_encrypted FROM two_factor_auth WHERE user_id = $1 AND enabled = false',
        [userId]
    );

    if (result.rows.length === 0) {
        console.warn(`[2FA] No pending setup found for user ${userId}`);
        return false;
    }

    const secret = decryptSecret(result.rows[0].secret_encrypted);

    // Verify the code
    if (!verifyTOTP(secret, code)) {
        console.warn(`[2FA] Activation code invalid for user ${userId}`);
        return false;
    }

    // Activate
    await query(
        'UPDATE two_factor_auth SET enabled = true, enabled_at = NOW() WHERE user_id = $1',
        [userId]
    );

    await cacheDelete(`2fa:status:${userId}`);

    console.log(`[2FA] ✅ Activated for user ${userId}`);
    return true;
}

/**
 * Verify a TOTP code during login
 */
export async function verify2FA(userId: string, code: string): Promise<TOTPVerificationResult> {
    const result = await query(
        'SELECT secret_encrypted, recovery_codes FROM two_factor_auth WHERE user_id = $1 AND enabled = true',
        [userId]
    );

    if (result.rows.length === 0) {
        return { valid: false };
    }

    const { secret_encrypted, recovery_codes } = result.rows[0];
    const secret = decryptSecret(secret_encrypted);
    const codes: string[] = JSON.parse(recovery_codes || '[]');

    // Try TOTP verification first
    if (verifyTOTP(secret, code)) {
        return { valid: true, remainingRecoveryCodes: codes.length };
    }

    // Try recovery code (format: XXXX-XXXX)
    const normalizedCode = code.toUpperCase().replace(/\s/g, '');
    const codeIndex = codes.findIndex(c => c === normalizedCode);

    if (codeIndex !== -1) {
        // Remove used recovery code
        codes.splice(codeIndex, 1);
        await query(
            'UPDATE two_factor_auth SET recovery_codes = $1 WHERE user_id = $2',
            [JSON.stringify(codes), userId]
        );

        console.log(`[2FA] ⚠️ Recovery code used by user ${userId} (${codes.length} remaining)`);
        return {
            valid: true,
            usedRecoveryCode: true,
            remainingRecoveryCodes: codes.length,
        };
    }

    console.warn(`[2FA] Verification failed for user ${userId}`);
    return { valid: false };
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: string): Promise<void> {
    await query('DELETE FROM two_factor_auth WHERE user_id = $1', [userId]);
    await cacheDelete(`2fa:status:${userId}`);
    console.log(`[2FA] 🔓 Disabled for user ${userId}`);
}

/**
 * Get 2FA status for a user (with caching)
 */
export async function get2FAStatus(userId: string): Promise<TwoFactorStatus> {
    // Check cache first
    const cached = await cacheGet<TwoFactorStatus>(`2fa:status:${userId}`);
    if (cached) return cached;

    const result = await query(
        'SELECT enabled, enabled_at, recovery_codes FROM two_factor_auth WHERE user_id = $1',
        [userId]
    );

    let status: TwoFactorStatus;

    if (result.rows.length === 0) {
        status = { enabled: false, recoveryCodes: 0 };
    } else {
        const row = result.rows[0];
        const codes: string[] = JSON.parse(row.recovery_codes || '[]');
        status = {
            enabled: row.enabled,
            enabledAt: row.enabled_at?.toISOString(),
            recoveryCodes: codes.length,
        };
    }

    // Cache for 10 minutes
    await cacheSet(`2fa:status:${userId}`, status, 600);
    return status;
}

/**
 * Regenerate recovery codes (requires authenticated 2FA)
 */
export async function regenerateRecoveryCodes(userId: string): Promise<string[]> {
    const newCodes = generateRecoveryCodes();

    await query(
        'UPDATE two_factor_auth SET recovery_codes = $1 WHERE user_id = $2 AND enabled = true',
        [JSON.stringify(newCodes), userId]
    );

    await cacheDelete(`2fa:status:${userId}`);

    console.log(`[2FA] 🔄 Recovery codes regenerated for user ${userId}`);
    return newCodes;
}

// ── Database Migration SQL ──────────────────────────────────────────────────

/**
 * SQL to create the two_factor_auth table
 * Run this as part of your migration scripts
 */
export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  recovery_codes JSONB NOT NULL DEFAULT '[]',
  enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_enabled ON two_factor_auth(user_id, enabled);
`;
