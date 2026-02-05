/**
 * SGG Digital - Firebase Admin Configuration
 * Configuration for Firebase Authentication
 */

import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // In production, use service account from Secret Manager
  // In development, use GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'sgg-digital-gabon',
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use default credentials (for Cloud Run)
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'sgg-digital-gabon',
    });
  } else {
    throw new Error('Firebase credentials not configured');
  }

  console.log('Firebase Admin SDK initialized');
  return firebaseApp;
}

/**
 * Get Firebase Auth instance
 */
export function getAuth(): admin.auth.Auth {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.auth(firebaseApp);
}

/**
 * Verify an ID token from the client
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  const auth = getAuth();
  return auth.verifyIdToken(idToken);
}

/**
 * Get user by UID
 */
export async function getUser(uid: string): Promise<admin.auth.UserRecord> {
  const auth = getAuth();
  return auth.getUser(uid);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
  const auth = getAuth();
  try {
    return await auth.getUserByEmail(email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Create a new user in Firebase
 */
export async function createUser(
  email: string,
  password: string,
  displayName: string
): Promise<admin.auth.UserRecord> {
  const auth = getAuth();
  return auth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
  });
}

/**
 * Update user properties
 */
export async function updateUser(
  uid: string,
  properties: admin.auth.UpdateRequest
): Promise<admin.auth.UserRecord> {
  const auth = getAuth();
  return auth.updateUser(uid, properties);
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string): Promise<void> {
  const auth = getAuth();
  return auth.deleteUser(uid);
}

/**
 * Set custom claims for a user (for roles)
 */
export async function setCustomClaims(
  uid: string,
  claims: { role?: string; permissions?: string[] }
): Promise<void> {
  const auth = getAuth();
  await auth.setCustomUserClaims(uid, claims);
}

/**
 * Generate password reset link
 */
export async function generatePasswordResetLink(email: string): Promise<string> {
  const auth = getAuth();
  return auth.generatePasswordResetLink(email);
}

/**
 * Generate email verification link
 */
export async function generateEmailVerificationLink(email: string): Promise<string> {
  const auth = getAuth();
  return auth.generateEmailVerificationLink(email);
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeRefreshTokens(uid: string): Promise<void> {
  const auth = getAuth();
  await auth.revokeRefreshTokens(uid);
}

// Export types
export type { DecodedIdToken };
