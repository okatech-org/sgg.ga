import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authLogger } from '@/services/logger';

// All 12 roles from backend auth.app_role enum (NEXUS-OMEGA P0-5)
export type AppRole =
  | "admin_sgg"
  | "directeur_sgg"
  | "sg_ministere"
  | "sgpr"
  | "premier_ministre"
  | "ministre"
  | "assemblee"
  | "senat"
  | "conseil_etat"
  | "cour_constitutionnelle"
  | "dgjo"
  | "citoyen";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  institution: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  supabase: typeof supabase;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  canAccessModule: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// All modules accessible in the platform
const ALL_MODULES = ["dashboard", "gar", "nominations", "egop", "journalOfficiel", "documents", "rapports", "formation", "parametres", "institutions", "cycleLegislatif", "matriceReporting", "ptmptg", "monitoring", "admin"];

// Role-based access configuration — all 12 roles (NEXUS-OMEGA aligned)
const roleModuleAccess: Record<AppRole, string[]> = {
  // SGG Central — full access
  admin_sgg: ALL_MODULES,
  directeur_sgg: ["dashboard", "gar", "nominations", "egop", "journalOfficiel", "documents", "rapports", "institutions", "cycleLegislatif", "matriceReporting", "ptmptg"],
  // Presidency
  sgpr: ["dashboard", "gar", "nominations", "egop", "journalOfficiel", "documents", "rapports", "cycleLegislatif", "ptmptg"],
  premier_ministre: ["dashboard", "gar", "nominations", "egop", "journalOfficiel", "documents", "rapports", "cycleLegislatif", "ptmptg"],
  // Government ministries
  ministre: ["dashboard", "gar", "nominations", "journalOfficiel", "documents", "rapports", "ptmptg"],
  sg_ministere: ["dashboard", "gar", "nominations", "journalOfficiel", "documents", "rapports", "ptmptg"],
  // Parliament & Judiciary
  assemblee: ["dashboard", "journalOfficiel", "documents", "cycleLegislatif"],
  senat: ["dashboard", "journalOfficiel", "documents", "cycleLegislatif"],
  conseil_etat: ["dashboard", "journalOfficiel", "documents", "cycleLegislatif"],
  cour_constitutionnelle: ["dashboard", "journalOfficiel", "documents", "cycleLegislatif"],
  // Journal Officiel direction
  dgjo: ["dashboard", "journalOfficiel", "documents", "rapports"],
  // Public
  citoyen: ["journalOfficiel"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and role
  const fetchUserData = async (userId: string): Promise<void> => {
    try {
      // Fetch profile and role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .single(),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data as Profile);
      }

      if (roleResult.data) {
        setRole(roleResult.data.role as AppRole);
      }
    } catch (error) {
      authLogger.error('Erreur chargement données utilisateur', { error: String(error) });
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Helper to load user data and set loading to false
    const loadUserData = async (userId: string) => {
      await fetchUserData(userId);
      if (isMounted) {
        setLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid deadlock in Supabase callback
          setTimeout(() => {
            loadUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const hasRole = (checkRole: AppRole): boolean => {
    return role === checkRole;
  };

  const canAccessModule = (module: string): boolean => {
    if (!role) return false;
    return roleModuleAccess[role]?.includes(module) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        supabase,
        signUp,
        signIn,
        signOut,
        hasRole,
        canAccessModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
