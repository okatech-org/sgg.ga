/**
 * SGG Digital — Hook CRUD Profil Utilisateur
 * Compatible mode Demo (sessionStorage) + Supabase
 */

import { useState, useMemo } from 'react';
import { useDemoUser } from './useDemoUser';
import { toast } from 'sonner';
import type { UserProfile, ProfileFormValues } from '@/types/user-profile';
import { ROLE_DISPLAY_LABELS } from '@/types/user-profile';

// Données mock en mode Demo
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
  const isDemo = !!demoUser;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile: UserProfile | null = useMemo(() => {
    if (!demoUser) return null;
    return buildDemoProfile(demoUser);
  }, [demoUser]);

  const updateProfile = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isDemo) {
        // Simule un délai réseau
        await new Promise((r) => setTimeout(r, 800));
        toast.success('Mode Démo : modifications simulées');
        return;
      }
      // TODO: Supabase update
      toast.success('Profil mis à jour');
    } catch (e: any) {
      setError(e.message);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (_file: File) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        toast.success('Mode Démo : avatar simulé');
        return;
      }
      // TODO: Supabase storage upload
    } catch (e: any) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsLoading(false);
    }
  };

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

  return { profile, isLoading, error, isDemo, updateProfile, uploadAvatar, profileCompleteness };
}
