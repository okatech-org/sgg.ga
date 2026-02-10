/**
 * SGG Digital — Hook CRUD Profil Utilisateur
 * Compatible mode Demo (sessionStorage) + Supabase
 */

import { useState, useMemo } from 'react';
import { useDemoUser } from './useDemoUser';
import { useAuth } from '@/contexts/AuthContext';
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
  const { supabase, user } = useAuth();
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
        toast.success('Mode Demo : modifications simulees');
        return;
      }
      // Production: Supabase profile update
      if (supabase && user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: data.fullName, phone: data.phone })
          .eq('id', user.id);
        if (updateError) throw updateError;
      }
      toast.success('Profil mis a jour');
    } catch (e: any) {
      setError(e.message);
      toast.error('Erreur lors de la mise a jour');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        toast.success('Mode Demo : avatar simule');
        return;
      }
      // Production: Supabase storage upload
      if (supabase && user) {
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);

        // Avatar URL is derived from storage path

        toast.success('Avatar mis a jour');
      }
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
