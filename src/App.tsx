
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      console.log('No auth, redirecting to login', { user, profile }); // Debug log
      navigate('/auth', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Only show loading during initial check
  if (loading) {
    console.log('Protected route loading...'); // Debug log
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  // Don't show loading if we're already redirecting
  if (!user || !profile) {
    console.log('No user or profile, rendering null'); // Debug log
    return null;
  }
  
  console.log('Rendering protected content'); // Debug log
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('Already authenticated, redirecting to game'); // Debug log
      navigate('/game', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Never show loading on auth page
  if (loading || (user && profile)) {
    console.log('Auth route loading or already authenticated'); // Debug log
    return null;
  }

  console.log('Rendering auth content'); // Debug log
  return <>{children}</>;
}

const App = () => {
  console.log('App rendering'); // Debug log

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
