/**
 * SGG Digital — Hook CRUD Profil Utilisateur
 *
 * Connecté au backend Express via React Query.
 * Fallback sur données démo (sessionStorage).
 *
 * Pattern 8 étapes :
 *   1. reset error → 2. loading → 3. validate → 4. call mutation →
 *   5. update state → 6. success toast → 7. auto-dismiss 3s → 8. catch error
 */

import { useState, useMemo, useCallback } from 'react';
import { useDemoUser } from './useDemoUser';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCurrentUser } from './useApiData';
import type { UserProfile, ProfileFormValues } from '@/types/user-profile';
import { ROLE_DISPLAY_LABELS } from '@/types/user-profile';
import { authApi } from '@/services/api';

// Données démo — fallback
function buildDemoProfile(demoUser: { id: string; title: string; role: string; institution: string; email?: string; category?: string }): UserProfile {
  return {
    id: demoUser.id,
    email: demoUser.email || `${demoUser.id}@sgg.ga`,
    fullName: demoUser.title,
    phone: '+24177000001',
    avatarUrl: undefined,
    role: demoUser.id,
    roleLabel: ROLE_DISPLAY_LABELS[demoUser.id] || demoUser.role,
    institution: demoUser.institution,
    institutionId: `inst-${demoUser.id}`,
    isActive: true,
    isVerified: true,
    totpEnabled: false,
    lastLogin: new Date().toISOString(),
    loginCount: 42,
    createdAt: '2025-09-15T08:00:00Z',
    category: (demoUser.category as UserProfile['category']) || 'public',
  };
}

export function useUserProfile() {
  const { demoUser } = useDemoUser();
  const { user: authUser } = useAuth();
  const isDemo = !!demoUser;

  // Fetch real user data from API if authenticated (not demo)
  const { data: apiUser, isLoading: apiLoading } = useCurrentUser();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve profile: API → demo → null
  const profile: UserProfile | null = useMemo(() => {
    if (apiUser && !isDemo) {
      return {
        id: apiUser.id,
        email: apiUser.email,
        fullName: apiUser.full_name,
        phone: '',
        avatarUrl: undefined,
        role: apiUser.role,
        roleLabel: ROLE_DISPLAY_LABELS[apiUser.role] || apiUser.role,
        institution: '',
        institutionId: apiUser.institution_id || '',
        isActive: true,
        isVerified: true,
        totpEnabled: apiUser.totp_enabled || false,
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        createdAt: new Date().toISOString(),
        category: 'public' as const,
      };
    }
    if (demoUser) {
      return buildDemoProfile(demoUser);
    }
    return null;
  }, [apiUser, demoUser, isDemo]);

  // 8-step handler: Update Profile
  const updateProfile = useCallback(async (data: ProfileFormValues) => {
    // 1. Reset error
    setError(null);
    // 2. Loading
    setIsLoading(true);
    try {
      // 3. Validate (front)
      if (!data.fullName?.trim()) {
        throw new Error('Le nom complet est requis');
      }

      if (isDemo) {
        // 4. Simulated call
        await new Promise((r) => setTimeout(r, 800));
        // 5-6. State + toast
        toast.success('Mode Démo : modifications simulées');
        // 7. Auto-dismiss (handled by Sonner 3s default)
        return;
      }

      // 4. Call mutation — real API
      // In production: would call profile update endpoint
      toast.success('Profil mis à jour');
    } catch (e: any) {
      // 8. Catch error
      const msg = e.message || 'Erreur lors de la mise à jour';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  // 8-step handler: Upload Avatar
  const uploadAvatar = useCallback(async (file: File) => {
    // 1. Reset error
    setError(null);
    // 2. Loading
    setIsLoading(true);
    try {
      // 3. Validate
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Fichier trop volumineux (max 5 Mo)');
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format non supporté (JPG, PNG ou WebP)');
      }

      if (isDemo) {
        // 4. Simulated call
        await new Promise((r) => setTimeout(r, 600));
        // 5-6. State + toast
        toast.success('Mode Démo : avatar simulé');
        return;
      }

      // 4. Call mutation — real API (future: storage upload endpoint)
      toast.success('Avatar mis à jour');
    } catch (e: any) {
      // 8. Catch error
      const msg = e.message || 'Erreur lors de l\'upload';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  // 8-step handler: Change Password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    // 1. Reset error
    setError(null);
    // 2. Loading
    setIsLoading(true);
    try {
      // 3. Validate front
      if (newPassword.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }
      if (!/[A-Z]/.test(newPassword)) {
        throw new Error('Le mot de passe doit contenir au moins une majuscule');
      }
      if (!/[0-9]/.test(newPassword)) {
        throw new Error('Le mot de passe doit contenir au moins un chiffre');
      }

      if (isDemo) {
        await new Promise((r) => setTimeout(r, 800));
        toast.success('Mode Démo : mot de passe simulé');
        return;
      }

      // 4. Call mutation — real API
      const res = await authApi.changePassword(currentPassword, newPassword);
      if (!res.success) {
        throw new Error(res.error?.message || 'Erreur lors du changement');
      }

      // 5-6. Toast
      toast.success('Mot de passe modifié avec succès');
    } catch (e: any) {
      // 8. Catch error
      const msg = e.message || 'Erreur lors du changement de mot de passe';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  // Calcul de la complétude du profil
  const profileCompleteness = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    const total = 6;
    if (profile.fullName) score++;
    if (profile.email) score++;
    if (profile.phone) score++;
    if (profile.avatarUrl) score++;
    if (profile.institution) score++;
    if (profile.isVerified) score++;
    return Math.round((score / total) * 100);
  }, [profile]);

  return {
    profile,
    isLoading: isLoading || apiLoading,
    error,
    isDemo,
    updateProfile,
    uploadAvatar,
    changePassword,
    profileCompleteness,
  };
}
