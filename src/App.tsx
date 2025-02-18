import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Components
import LandingPage from './pages/Landing';
import GamePage from './pages/GamePage';
import AuthPage from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute'; // Updated import
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Achievements from './components/game/Achievements';
import Leaderboard from './components/game/Leaderboard';
import { routes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await queryClient.invalidateQueries();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ErrorBoundary children={undefined}>
            <AuthProvider children={undefined}>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path={routes.home} 
                  element={
                    <ProtectedRoute requireAuth={false} children={undefined}>
                      <LandingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path={routes.auth} 
                  element={
                    <ProtectedRoute requireAuth={false} children={undefined}>
                      <AuthPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path={`${routes.auth}/callback`} element={<AuthCallback />} />
                
                {/* Protected Routes */}
                <Route path={routes.game} element={<ProtectedRoute children={undefined}><GamePage /></ProtectedRoute>} />
                <Route path={routes.settings} element={<ProtectedRoute children={undefined}><Settings /></ProtectedRoute>} />
                <Route path={routes.achievements} element={<ProtectedRoute children={undefined}><Achievements /></ProtectedRoute>} />
                <Route path={routes.leaderboard} element={<ProtectedRoute children={undefined}><Leaderboard /></ProtectedRoute>} />

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;