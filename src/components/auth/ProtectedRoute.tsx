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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user && !isLoading && !isRefreshing) {
        setIsRefreshing(true);
        await refreshSession();
        setIsRefreshing(false);
      }
    };

    checkAuth();
  }, [user, isLoading, refreshSession]);

  // Show loading screen during initial load or session refresh
  if (isLoading || isRefreshing) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Handle error state
  if (error) {
    toast.error("Authentication error. Please try logging in again.");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // No user or profile, redirect to auth
  if (!user || !profile) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}