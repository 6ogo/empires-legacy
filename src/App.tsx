// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AuthPage from '@/pages/Auth';
import GamePage from '@/pages/GamePage';
import IndexPage from '@/pages/Index';
import Leaderboard from '@/components/game/Leaderboard';
import { Toaster } from '@/components/ui/sonner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider children={undefined}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<IndexPage />} />
            <Route 
              path="/auth/*" 
              element={
                <ProtectedRoute requireAuth={false} children={undefined}>
                  <AuthPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/game/*" 
              element={
                <ProtectedRoute children={undefined}>
                  <GamePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute children={undefined}>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;