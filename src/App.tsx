import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AuthPage from '@/pages/Auth';
import GamePage from '@/pages/GamePage';
import IndexPage from '@/pages/Index';
import Leaderboard from '@/components/game/Leaderboard';
import { Toaster } from '@/components/ui/sonner';

// Components
import LandingPage from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Achievements from './components/game/Achievements';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route 
            path="/auth/*" 
            element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/game/*" 
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={<Leaderboard />} 
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;