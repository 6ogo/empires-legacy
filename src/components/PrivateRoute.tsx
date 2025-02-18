import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/game/LoadingScreen';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (requireAuth && (!user || !profile)) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && user && profile) {
    return <Navigate to="/game" replace />;
  }

  return <>{children}</>;
};