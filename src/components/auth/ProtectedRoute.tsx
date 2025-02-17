import { useEffect, useState } from "react";
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
    let mounted = true;

    const checkAuth = async () => {
      if (!user && !isLoading && !hasAttemptedRefresh) {
        setHasAttemptedRefresh(true);
        try {
          await refreshSession();
        } catch (error) {
          console.error('Session refresh failed:', error);
          if (mounted) {
            toast.error("Authentication failed. Please log in again.");
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
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

  // Check email verification if required
  if (requireEmailVerified && !profile.email_verified) {
    toast.error("Please verify your email first.");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
