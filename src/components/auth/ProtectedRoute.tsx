
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/game/LoadingScreen";
import { useEffect } from "react";
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

  useEffect(() => {
    if (!user && !isLoading) {
      refreshSession();
    }
  }, [user, isLoading, refreshSession]);

  useEffect(() => {
    if (error) {
      toast.error("Authentication error. Please try logging in again.");
    }
  }, [error]);

  useEffect(() => {
    console.log('ProtectedRoute check:', { user, profile, isLoading });
  }, [user, profile, isLoading]);

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (user && !profile) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (requireEmailVerified && !profile?.email_verified) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
        <p className="text-muted-foreground mb-4">
          Please verify your email address before accessing this page.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your inbox for the verification email.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
