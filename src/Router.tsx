import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import Callback from '@/pages/Auth/Callback';
import GamePage from '@/pages/GamePage';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

// Game components
import Achievements from '@/components/game/Achievements';
import Leaderboard from '@/components/game/Leaderboard';
import Stats from '@/components/game/Stats';
import LoadingScreen from '@/components/game/LoadingScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isLoading, isInitialized } = useAuth();
  
  if (isLoading || !isInitialized) {
    return <LoadingScreen message="Loading..." />;
  }
  
  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isLoading, isInitialized } = useAuth();
  
  if (isLoading || !isInitialized) {
    return <LoadingScreen message="Loading..." />;
  }
  
  if (user && profile) {
    return <Navigate to="/game" replace />;
  }
  
  return <>{children}</>;
};

const Router = () => {
  return (
    <Routes>
      {/* Public routes that don't require authentication */}
      <Route path="/" element={<Index />} />
      
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/callback/:token" element={<Callback />} />
      
      {/* Protected routes that require authentication */}
      <Route path="/game" element={
        <ProtectedRoute>
          <GamePage />
        </ProtectedRoute>
      } />
      
      <Route path="/game/achievements" element={
        <ProtectedRoute>
          <Achievements />
        </ProtectedRoute>
      } />
      
      <Route path="/game/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />
      
      <Route path="/game/stats" element={
        <ProtectedRoute>
          <Stats />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* 404 Not Found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;