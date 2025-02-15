
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
import { useEffect } from "react";
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

  useEffect(() => {
    if (!loading) {
      if (!user && location.pathname !== '/auth' && location.pathname !== '/auth/callback') {
        navigate('/auth', { replace: true });
      } else if (user && profile && location.pathname === '/auth') {
        navigate('/game', { replace: true });
      }
    }
  }, [loading, user, profile, location.pathname, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/auth', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) return <LoadingScreen message="Loading..." />;
  if (!user || !profile) return null;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user && profile) {
      navigate('/game', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) return <LoadingScreen message="Loading..." />;
  if (user && profile) return null;
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
