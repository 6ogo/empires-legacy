import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import LandingPage from './pages/Landing';
import GamePage from './pages/GamePage';
import AuthPage from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import LoadingScreen from './components/game/LoadingScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoadingScreen message="Checking authentication..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/game/*" 
        element={
          user ? <GamePage /> : <AuthPage />
        } 
      />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
