/**
 * SGG Digital — Tests des Schemas Zod
 * Validation des schemas du profil utilisateur
 */

import { describe, it, expect } from 'vitest';
import {
  profileSchema,
  passwordSchema,
  contactSupportSchema,
  ROLE_DISPLAY_LABELS,
  ROLE_COLORS,
  CATEGORY_LABELS,
} from '@/types/user-profile';

// ─── Profile Schema ────────────────────────────────────────────────────────

describe('profileSchema', () => {
  it('should validate a correct profile', () => {
    const result = profileSchema.safeParse({
      fullName: 'Jean-Pierre Mbourou',
      phone: '+24177000001',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a short name (< 3 chars)', () => {
    const result = profileSchema.safeParse({
      fullName: 'AB',
      phone: '+24177000001',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('3 caractères');
    }
  });

  it('should reject a name exceeding 100 characters', () => {
    const result = profileSchema.safeParse({
      fullName: 'A'.repeat(101),
      phone: '+24177000001',
    });
    expect(result.success).toBe(false);
  });

  it('should accept a valid Gabonese phone number', () => {
    const validNumbers = ['+24177000001', '+241066000001', '77000001', '066000001'];
    validNumbers.forEach((phone) => {
      const result = profileSchema.safeParse({ fullName: 'Test User', phone });
      expect(result.success).toBe(true);
    });
  });

  it('should reject an invalid phone number', () => {
    const result = profileSchema.safeParse({
      fullName: 'Test User',
      phone: '+33612345678',
    });
    expect(result.success).toBe(false);
  });

  it('should accept an empty phone number', () => {
    const result = profileSchema.safeParse({
      fullName: 'Test User',
      phone: '',
    });
    expect(result.success).toBe(true);
  });

  it('should accept when phone is omitted', () => {
    const result = profileSchema.safeParse({
      fullName: 'Test User',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Password Schema ───────────────────────────────────────────────────────

describe('passwordSchema', () => {
  it('should validate a correct password change', () => {
    const result = passwordSchema.safeParse({
      currentPassword: 'OldPassword1',
      newPassword: 'NewSecure8A',
      confirmPassword: 'NewSecure8A',
    });
    expect(result.success).toBe(true);
  });

  it('should reject when passwords dont match', () => {
    const result = passwordSchema.safeParse({
      currentPassword: 'OldPassword1',
      newPassword: 'NewSecure8A',
      confirmPassword: 'DifferentPass9B',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('should reject a new password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse({
      currentPassword: 'OldPassword1',
      newPassword: 'Short1',
      confirmPassword: 'Short1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a new password without uppercase', () => {
    const result = passwordSchema.safeParse({
      currentPassword: 'OldPassword1',
      newPassword: 'nouppercase1',
      confirmPassword: 'nouppercase1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a new password without digit', () => {
    const result = passwordSchema.safeParse({
      currentPassword: 'OldPassword1',
      newPassword: 'NoDigitHere',
      confirmPassword: 'NoDigitHere',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty current password', () => {
    const result = passwordSchema.safeParse({
      currentPassword: '',
      newPassword: 'ValidPass8A',
      confirmPassword: 'ValidPass8A',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Contact Support Schema ────────────────────────────────────────────────

describe('contactSupportSchema', () => {
  it('should validate a correct support message', () => {
    const result = contactSupportSchema.safeParse({
      subject: 'Probleme de connexion',
      message: 'Je ne parviens pas a me connecter depuis hier soir avec mon compte.',
      category: 'bug',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a short subject (< 5 chars)', () => {
    const result = contactSupportSchema.safeParse({
      subject: 'Bug',
      message: 'Description detaillee du probleme rencontre dans le module.',
      category: 'bug',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a short message (< 20 chars)', () => {
    const result = contactSupportSchema.safeParse({
      subject: 'Probleme technique',
      message: 'Trop court',
      category: 'question',
    });
    expect(result.success).toBe(false);
  });

  it('should reject an invalid category', () => {
    const result = contactSupportSchema.safeParse({
      subject: 'Test sujet valide',
      message: 'Ce message est suffisamment long pour passer la validation.',
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid categories', () => {
    const categories = ['bug', 'question', 'suggestion', 'autre'] as const;
    categories.forEach((category) => {
      const result = contactSupportSchema.safeParse({
        subject: 'Sujet de test valide',
        message: 'Ce message est suffisamment long pour passer la validation du schema.',
        category,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ─── Constants ─────────────────────────────────────────────────────────────

describe('ROLE_DISPLAY_LABELS', () => {
  it('should have all 15 roles defined', () => {
    expect(Object.keys(ROLE_DISPLAY_LABELS)).toHaveLength(15);
  });

  it('should contain the admin role', () => {
    expect(ROLE_DISPLAY_LABELS['sgg-admin']).toBe('Administrateur SGG');
  });

  it('should contain the president role', () => {
    expect(ROLE_DISPLAY_LABELS['president']).toBe('Président de la République');
  });

  it('should contain the citoyen role', () => {
    expect(ROLE_DISPLAY_LABELS['citoyen']).toBe('Citoyen');
  });
});

describe('ROLE_COLORS', () => {
  it('should have a color for every role label', () => {
    const labelKeys = Object.keys(ROLE_DISPLAY_LABELS);
    const colorKeys = Object.keys(ROLE_COLORS);
    labelKeys.forEach((key) => {
      expect(colorKeys).toContain(key);
    });
  });
});

describe('CATEGORY_LABELS', () => {
  it('should have all 6 categories', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(6);
  });

  it('should contain executif category', () => {
    expect(CATEGORY_LABELS['executif']).toBe('Exécutif');
  });
});
