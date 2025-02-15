
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/game/LoadingScreen";

// Lazy load the main game components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Callback = lazy(() => import("./pages/Auth/Callback"));
const Settings = lazy(() => import("./pages/Settings"));
const Achievements = lazy(() => import("./components/game/Achievements"));
const Landing = lazy(() => import("./pages/Landing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen message="Loading..." />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<Callback />} />
                <Route 
                  path="/game/*" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements" 
                  element={
                    <ProtectedRoute>
                      <Achievements />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
