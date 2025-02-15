
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

const queryClient = new QueryClient();

function RouteHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle direct navigation to sub-routes
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth', { replace: true });
      return;
    }

    // If we're on a game-related route and it's a page refresh
    if (location.pathname.includes('/game/') && !location.key) {
      navigate('/game', { replace: true });
    }
  }, [location, navigate, user, loading]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      console.log('No user or profile, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [loading, user, profile, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return null;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      console.log('User is logged in, redirecting to game');
      navigate('/game', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }
  
  if (user) {
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
            <Route path="/game" element={<ProtectedRoute><Index /></ProtectedRoute>} />
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
