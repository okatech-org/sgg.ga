/**
 * SGG Digital — Types & Schemas Zod pour l'Espace Utilisateur
 */

import { z } from 'zod';
import type { DemoCategory } from '@/hooks/useDemoUser';

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  roleLabel: string;
  institution: string;
  institutionId?: string;
  isActive: boolean;
  isVerified: boolean;
  totpEnabled: boolean;
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
  category: DemoCategory;
}

export interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  device: string;
  location?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  date: string;
  ipAddress: string;
  browser: string;
  device: string;
  location?: string;
  success: boolean;
}

export type ActivityAction = 'soumission' | 'validation' | 'consultation' | 'modification' | 'connexion' | 'export';

export interface UserActivityEntry {
  id: string;
  action: ActivityAction;
  module: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreference {
  moduleKey: string;
  moduleLabel: string;
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  tableDensity: 'compact' | 'normal' | 'comfortable';
}

export type PermissionLevel = 'W' | 'V' | 'R' | 'none';

export interface ModulePermission {
  moduleKey: string;
  moduleLabel: string;
  moduleIcon: string;
  permission: PermissionLevel;
  description: string;
  route?: string;
}

// ─── SCHEMAS ZOD ────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  phone: z
    .string()
    .regex(/^(\+241)?[0-9]{8,9}$/, 'Numéro de téléphone invalide (format : +241XXXXXXXX)')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Le mot de passe actuel est requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
    confirmPassword: z
      .string()
      .min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const contactSupportSchema = z.object({
  subject: z
    .string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne doit pas dépasser 200 caractères'),
  message: z
    .string()
    .min(20, 'Le message doit contenir au moins 20 caractères')
    .max(2000, 'Le message ne doit pas dépasser 2000 caractères'),
  category: z.enum(['bug', 'question', 'suggestion', 'autre']),
});

export type ContactSupportFormValues = z.infer<typeof contactSupportSchema>;

// ─── ROLE LABELS ────────────────────────────────────────────────────────────

export const ROLE_DISPLAY_LABELS: Record<string, string> = {
  'sgg-admin': 'Administrateur SGG',
  'sgg-directeur': 'Directeur SGG',
  'sg-ministere': 'Secrétaire Général de Ministère',
  'sgpr': 'Secrétariat Général de la Présidence',
  'premier-ministre': 'Vice-Président du Gouvernement',
  'ministre': 'Ministre',
  'assemblee': 'Assemblée Nationale',
  'senat': 'Sénat',
  'conseil-etat': 'Conseil d\'État',
  'cour-constitutionnelle': 'Cour Constitutionnelle',
  'dgjo': 'Direction du Journal Officiel',
  'citoyen': 'Citoyen',
  'vice-president': 'Vice-Président de la République',
  'president': 'Président de la République',
  'professionnel-droit': 'Professionnel du Droit',
};

export const ROLE_COLORS: Record<string, string> = {
  'sgg-admin': 'bg-red-100 text-red-800 border-red-200',
  'sgg-directeur': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'sg-ministere': 'bg-blue-100 text-blue-800 border-blue-200',
  'sgpr': 'bg-amber-100 text-amber-800 border-amber-200',
  'premier-ministre': 'bg-purple-100 text-purple-800 border-purple-200',
  'ministre': 'bg-sky-100 text-sky-800 border-sky-200',
  'assemblee': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'senat': 'bg-teal-100 text-teal-800 border-teal-200',
  'conseil-etat': 'bg-orange-100 text-orange-800 border-orange-200',
  'cour-constitutionnelle': 'bg-pink-100 text-pink-800 border-pink-200',
  'dgjo': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'citoyen': 'bg-gray-100 text-gray-800 border-gray-200',
  'vice-president': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'president': 'bg-government-gold/20 text-government-gold border-government-gold/30',
  'professionnel-droit': 'bg-slate-100 text-slate-800 border-slate-200',
};

export const CATEGORY_LABELS: Record<string, string> = {
  executif: 'Exécutif',
  presidence: 'Présidence',
  legislatif: 'Législatif',
  juridictionnel: 'Juridictionnel',
  administratif: 'Administratif',
  public: 'Public',
};
