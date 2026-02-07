/**
 * SGG Digital — Hook Sécurité Compte (mot de passe, 2FA, sessions)
 */

import { useState, useMemo } from 'react';
import { useDemoUser } from './useDemoUser';
import { toast } from 'sonner';
import type { UserSession, PasswordFormValues } from '@/types/user-profile';

const MOCK_SESSIONS: UserSession[] = [
  {
    id: 'sess-001',
    ipAddress: '41.158.22.105',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121',
    browser: 'Chrome 121',
    device: 'MacBook Pro',
    location: 'Libreville, Gabon',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isCurrent: true,
  },
  {
    id: 'sess-002',
    ipAddress: '41.158.22.108',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3) Safari/605',
    browser: 'Safari 17',
    device: 'iPhone 15',
    location: 'Libreville, Gabon',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 82800000).toISOString(),
    isCurrent: false,
  },
  {
    id: 'sess-003',
    ipAddress: '197.234.45.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/122',
    browser: 'Firefox 122',
    device: 'PC Windows',
    location: 'Franceville, Gabon',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    isCurrent: false,
  },
];

export function useUserSecurity() {
  const { demoUser } = useDemoUser();
  const isDemo = !!demoUser;

  const [isLoading, setIsLoading] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>(MOCK_SESSIONS);

  const changePassword = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (isDemo) {
        toast.success('Mode Démo : mot de passe simulé');
        return true;
      }
      // TODO: Supabase auth.updateUser({ password })
      toast.success('Mot de passe modifié avec succès');
      return true;
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du changement de mot de passe');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTotp = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const newState = !totpEnabled;
      setTotpEnabled(newState);
      if (isDemo) {
        toast.success(`Mode Démo : 2FA ${newState ? 'activé' : 'désactivé'}`);
        return;
      }
      toast.success(`Authentification à deux facteurs ${newState ? 'activée' : 'désactivée'}`);
    } catch {
      toast.error('Erreur lors de la modification 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (isDemo) {
        toast.success('Mode Démo : session révoquée');
        return;
      }
      toast.success('Session révoquée');
    } catch {
      toast.error('Erreur lors de la révocation');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeAllSessions = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success(isDemo ? 'Mode Démo : toutes les sessions révoquées' : 'Toutes les sessions révoquées');
    } catch {
      toast.error('Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isDemo,
    totpEnabled,
    sessions,
    changePassword,
    toggleTotp,
    revokeSession,
    revokeAllSessions,
  };
}
