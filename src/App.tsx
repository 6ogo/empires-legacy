
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
  const { user, loading, initialized } = useAuth();

  // Show loading state only briefly while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  // If we're initialized and there's no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If we have a user, render the protected content
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/game" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/game" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
