import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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

interface ConvexUser {
  _id: Id<"users">;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  user: ConvexUser | null;
  userId: Id<"users"> | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
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
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [loading, setLoading] = useState(false);

  // Reactive queries — only run when userId is set
  const user = useQuery(api.auth.getUser, userId ? { userId } : "skip") as ConvexUser | null | undefined;
  const roles = useQuery(api.auth.getUserRoles, userId ? { userId } : "skip");

  // Derive primary role
  const primaryRole = roles?.find((r) => r.isPrimary);
  const role = (primaryRole?.role ?? roles?.[0]?.role ?? null) as AppRole | null;

  const signIn = useCallback(async (email: string) => {
    try {
      // For now, look up user by email (password auth will be handled separately)
      // In production, integrate with Better Auth or Convex Auth
      setLoading(true);
      // Placeholder: direct email lookup (no password check in Convex queries)
      // The actual auth flow should use Convex HTTP actions with bcrypt
      const searchUser = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => null);

      if (searchUser?.ok) {
        const data = await searchUser.json();
        setUserId(data.userId);
        setLoading(false);
        return { error: null };
      }

      // Fallback: use admin user for demo mode
      setLoading(false);
      return { error: new Error("Authentication not yet configured. Use Convex Auth.") };
    } catch (error) {
      setLoading(false);
      return { error: error as Error };
    }
  }, []);

  const signOut = useCallback(() => {
    setUserId(null);
  }, []);

  const hasRole = useCallback((checkRole: AppRole): boolean => {
    return role === checkRole;
  }, [role]);

  const canAccessModule = useCallback((module: string): boolean => {
    if (!role) return false;
    return roleModuleAccess[role]?.includes(module) ?? false;
  }, [role]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        userId,
        role,
        loading: loading || user === undefined,
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
