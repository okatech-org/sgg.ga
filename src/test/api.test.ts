/**
 * SGG Digital — Tests du service API centralisé
 * Vérifie la gestion des tokens, l'authentification et la construction des requêtes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
    isAuthenticated,
} from '@/services/api';
import type { AuthUser } from '@/services/api';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Token Management', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should return null when no token is stored', () => {
        expect(getToken()).toBeNull();
    });

    it('should store and retrieve a token', () => {
        setToken('test-jwt-token-123');
        expect(getToken()).toBe('test-jwt-token-123');
    });

    it('should remove token and user on removeToken()', () => {
        setToken('test-token');
        setStoredUser({
            id: '1',
            email: 'test@sgg.ga',
            full_name: 'Test User',
            role: 'admin_sgg',
        });
        removeToken();
        expect(getToken()).toBeNull();
        expect(getStoredUser()).toBeNull();
    });

    it('should detect authentication state', () => {
        expect(isAuthenticated()).toBe(false);
        setToken('valid-token');
        expect(isAuthenticated()).toBe(true);
    });
});

describe('User Storage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should return null when no user is stored', () => {
        expect(getStoredUser()).toBeNull();
    });

    it('should store and retrieve a user object', () => {
        const testUser: AuthUser = {
            id: 'user-001',
            email: 'admin@sgg.ga',
            full_name: 'Administrateur SGG',
            role: 'admin_sgg',
            institution_id: 'inst-sgg',
            totp_enabled: false,
        };

        setStoredUser(testUser);
        const retrieved = getStoredUser();

        expect(retrieved).not.toBeNull();
        expect(retrieved!.id).toBe('user-001');
        expect(retrieved!.email).toBe('admin@sgg.ga');
        expect(retrieved!.role).toBe('admin_sgg');
        expect(retrieved!.institution_id).toBe('inst-sgg');
    });

    it('should handle user with optional fields', () => {
        const minimalUser: AuthUser = {
            id: 'user-002',
            email: 'citoyen@sgg.ga',
            full_name: 'Jean Citoyen',
            role: 'citoyen',
        };

        setStoredUser(minimalUser);
        const retrieved = getStoredUser();

        expect(retrieved).not.toBeNull();
        expect(retrieved!.institution_id).toBeUndefined();
        expect(retrieved!.totp_enabled).toBeUndefined();
    });
});
