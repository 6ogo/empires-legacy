// src/App.tsx
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
import { PrivateRoute } from './components/auth/ProtectedRoute';
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
        // Any initial app setup can go here
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
    return null; // Or a loading component if you prefer
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ErrorBoundary>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path={routes.home} 
                  element={
                    <PrivateRoute requireAuth={false}>
                      <LandingPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path={routes.auth} 
                  element={
                    <PrivateRoute requireAuth={false}>
                      <AuthPage />
                    </PrivateRoute>
                  } 
                />
                <Route path={`${routes.auth}/callback`} element={<AuthCallback />} />
                
                {/* Protected Routes */}
                <Route path={routes.game} element={<PrivateRoute><GamePage /></PrivateRoute>} />
                <Route path={routes.settings} element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path={routes.achievements} element={<PrivateRoute><Achievements /></PrivateRoute>} />
                <Route path={routes.leaderboard} element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

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