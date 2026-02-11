import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useDemoUser } from "@/hooks/useDemoUser";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requiredModule?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredModule
}: ProtectedRouteProps) {
  const { user, role, loading, canAccessModule } = useAuth();
  const { demoUser, getModuleAccess } = useDemoUser();
  const location = useLocation();

  // Check if demo user is active
  const isDemoMode = demoUser !== null;

  // Wait for auth state and role to be loaded (only if not in demo mode)
  if (!isDemoMode && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-government-navy" />
      </div>
    );
  }

  // Demo mode: check module access based on demo user profile
  if (isDemoMode) {
    const moduleAccess = getModuleAccess();

    // Check module access for demo user
    if (requiredModule) {
      const moduleKey = requiredModule as keyof typeof moduleAccess;
      if (!moduleAccess[moduleKey]) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Check requiredRoles for demo users by mapping demo IDs to AppRoles
    if (requiredRoles && requiredRoles.length > 0) {
      // Map demo user IDs to equivalent AppRole strings
      const demoRoleToAppRole: Record<string, string[]> = {
        "president": ["admin_sgg", "sgpr"],
        "vice-president": ["admin_sgg", "sgpr"],
        "premier-ministre": ["admin_sgg"],
        "sgpr": ["sgpr", "admin_sgg"],
        "sgg-admin": ["admin_sgg"],
        "sgg-directeur": ["admin_sgg", "directeur_sgg"],
      };

      const mappedRoles = demoRoleToAppRole[demoUser!.id] || [];
      const hasRequiredRole = requiredRoles.some(r => mappedRoles.includes(r));

      // Also check if the route's module key is accessible (e.g., consolidated)
      if (!hasRequiredRole && !moduleAccess.adminUsers) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    return <>{children}</>;
  }

  // Not authenticated (and not in demo mode)
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for role to be loaded before checking permissions
  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-government-navy" />
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles && !requiredRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check module access
  if (requiredModule && !canAccessModule(requiredModule)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
