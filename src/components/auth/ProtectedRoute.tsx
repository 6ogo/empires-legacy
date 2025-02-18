//ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/game/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, profile, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading screen only during initial auth check
  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Redirect to auth page if authentication is required but user is not authenticated
  if (requireAuth && (!user || !profile)) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to game page if user is authenticated but trying to access auth page
  if (!requireAuth && user && profile) {
    return <Navigate to="/game" replace />;
  }

  // Render the protected component
  return <>{children}</>;
};

export { ProtectedRoute as PrivateRoute };
// This component is used to protect routes that require authentication. It checks the user's authentication status and redirects them to the appropriate page if necessary. It also shows a loading screen while the authentication status is being checked. The component is used in App.tsx to protect routes that require authentication.