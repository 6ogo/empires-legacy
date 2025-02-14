
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Achievements from "./components/game/Achievements";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log("Protected Route State:", { user, loading }); // Debug log

  // Show nothing during the initial load to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  // If there's no user after loading completes, redirect to auth
  if (!user) {
    console.log("No user found, redirecting to auth"); // Debug log
    return <Navigate to="/auth" replace />;
  }

  // If we have a user, render the protected content
  console.log("User found, rendering protected content"); // Debug log
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log("Auth Route State:", { user, loading }); // Debug log

  // Show nothing during the initial load to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  // If user is already authenticated, redirect to game
  if (user) {
    console.log("User already authenticated, redirecting to game"); // Debug log
    return <Navigate to="/game" replace />;
  }

  // If there's no user, show auth page
  console.log("No user found, showing auth page"); // Debug log
  return <>{children}</>;
}

const App = () => {
  console.log("App rendering"); // Debug log
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/game" replace />} />
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
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
