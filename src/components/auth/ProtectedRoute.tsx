//ProtectedRoute.tsx
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/game/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children,
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { user, profile, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Only show loading during initial auth check
  if (!isInitialized) {
    return <LoadingScreen message="Loading..." />;
  }

  // After initialization, handle routing
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/game" replace />;
  }

  return <>{children}</>;
};

// Also export as PrivateRoute for backwards compatibility
export { ProtectedRoute as PrivateRoute };