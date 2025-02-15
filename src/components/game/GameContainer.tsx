// src/components/game/GameContainer.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GameNavigation from './GameNavigation';
import { GameStatus } from '@/types/game';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface GameContainerProps {
  children: React.ReactNode;
  gameStatus: GameStatus;
  className?: string;
  roomId?: string;
  onNavigateBack?: () => void;
  currentView?: 'menu' | 'achievements' | 'leaderboard' | 'settings' | 'game';
}

const GameContainer: React.FC<GameContainerProps> = ({
  children,
  gameStatus,
  className,
  roomId,
  onNavigateBack,
  currentView = 'menu'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const handleBack = async () => {
    if (onNavigateBack) {
      onNavigateBack();
      return;
    }

    // Default navigation logic
    switch (currentView) {
      case 'achievements':
      case 'leaderboard':
      case 'settings':
        navigate('/game', { replace: true });
        break;
      case 'game':
        if (gameStatus === 'playing' || gameStatus === 'waiting') {
          // If in a game, confirm before leaving
          if (window.confirm('Are you sure you want to leave the game?')) {
            navigate('/game', { replace: true });
          }
        } else {
          navigate('/game', { replace: true });
        }
        break;
      default:
        if (!isAuthenticated) {
          navigate('/', { replace: true });
        }
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      className
    )}>
      <GameNavigation
        onBack={handleBack}
        mode={gameStatus}
        isInRoom={gameStatus === 'waiting' || gameStatus === 'playing'}
        roomId={roomId}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default GameContainer;
