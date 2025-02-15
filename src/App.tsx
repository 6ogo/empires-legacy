
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Callback from "./pages/Auth/Callback";
import Settings from "./pages/Settings";
import Achievements from "./components/game/Achievements";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import LoadingScreen from "@/components/game/LoadingScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// This wrapper handles the initial auth check and redirection
function AuthStateHandler({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        // If we're not on the auth or callback pages, redirect to auth
        if (!['/auth', '/auth/callback'].includes(location.pathname)) {
          console.log('No auth, redirecting to login from:', location.pathname);
          navigate('/auth', { replace: true });
        }
      } else if (location.pathname === '/auth') {
        // If authenticated and on auth page, redirect to game
        console.log('Authenticated, redirecting to game');
        navigate('/game', { replace: true });
      }
    }
  }, [user, profile, loading, navigate, location.pathname]);

  if (loading) {
    console.log('Initial auth check loading...');
    return <LoadingScreen message="Checking authentication..." />;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      console.log('Protected route: No auth, redirecting to login');
      navigate('/auth', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  if (!user || !profile) {
    return null;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('Auth route: Already authenticated, redirecting to game');
      navigate('/game', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading || (user && profile)) {
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
          <AuthStateHandler>
            <Routes>
              <Route path="/" element={<Navigate to="/game" replace />} />
              <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
              <Route path="/auth/callback" element={<Callback />} />
              <Route path="/game/*" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthStateHandler>
        </BrowserRouter>
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
