import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/game/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
}

export function ProtectedRoute({ 
  children,
  requireEmailVerified = false 
}: ProtectedRouteProps) {
  const { user, profile, isLoading, error, refreshSession } = useAuth();
  const location = useLocation();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user && !isLoading && !hasAttemptedRefresh) {
        setHasAttemptedRefresh(true);
        try {
          await refreshSession();
        } catch (error) {
          console.error('Session refresh failed:', error);
        }
      }
    };

    checkAuth();
  }, [user, isLoading, refreshSession, hasAttemptedRefresh]);

  // Show loading screen only during initial load
  if (isLoading && !hasAttemptedRefresh) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Handle error state
  if (error) {
    toast.error("Authentication error. Please try logging in again.");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // No user or profile after refresh attempt, redirect to auth
  if (!user || !profile) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}