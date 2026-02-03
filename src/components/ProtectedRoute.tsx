import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
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
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-government-navy" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles && role && !requiredRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check module access
  if (requiredModule && !canAccessModule(requiredModule)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
