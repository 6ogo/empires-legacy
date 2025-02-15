
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Callback from "./pages/Auth/Callback";
import Settings from "./pages/Settings";
import Achievements from "./components/game/Achievements";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/game/LoadingScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, profile } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Wait for auth to initialize
      if (loading) return;

      // Mark as initialized
      if (!isInitialized) {
        setIsInitialized(true);
      }

      // Handle authentication routing
      if (!user && !loading && location.pathname !== '/auth' && location.pathname !== '/auth/callback') {
        console.log('No user found, redirecting to auth', { pathname: location.pathname });
        navigate('/auth', { replace: true });
        return;
      }

      // If we have a user but no profile, redirect to auth
      if (user && !profile && !loading && location.pathname !== '/auth/callback') {
        console.log('No profile found, redirecting to auth');
        navigate('/auth', { replace: true });
        return;
      }

      // If authenticated and on auth page, redirect to game
      if (user && profile && location.pathname === '/auth') {
        console.log('User is authenticated, redirecting to game');
        navigate('/game', { replace: true });
        return;
      }

      // If we're on a game sub-route and it's a page refresh, redirect to main game page
      if (location.pathname.includes('/game/') && !location.key) {
        console.log('Game sub-route detected on refresh, redirecting to main game page');
        navigate('/game', { replace: true });
      }
    };

    initializeAuth();
  }, [loading, user, profile, location, navigate, isInitialized]);

  // Show loading screen until auth is initialized
  if (loading || !isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      console.log('Protected route - no user or profile, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [loading, user, profile, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }
  
  if (!user || !profile) {
    return null;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('Auth route - user is logged in, redirecting to game');
      navigate('/game', { replace: true });
    }
  }, [loading, user, profile, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }
  
  if (user && profile) {
    return null;
  }

  return <>{children}</>;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteHandler />
          <Routes>
            <Route path="/" element={<Navigate to="/game" replace />} />
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/game/*" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
