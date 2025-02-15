
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/game/LoadingScreen';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user || !profile) {
    console.log('No auth, redirecting to login from:', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
