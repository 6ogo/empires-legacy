// src/components/game/GameWrapper.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { withErrorHandling, handleGameError } from '@/utils/error-handling';
import { routes, getRoute } from '@/routes';
import { GameState, GameMode } from '@/types/game';
import MainMenu from './MainMenu';
import GameBoard from './GameBoard';
import ErrorScreen from './ErrorScreen';
import LoadingScreen from './LoadingScreen';
import { toast } from 'sonner';

interface GameWrapperProps {
  showLeaderboard: boolean;
  gameStatus: GameStatus;
  gameMode: GameMode;
  onBackToMenu: () => void;
  onSelectMode: Dispatch<SetStateAction<GameMode>>;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<GameState | null>;
  onJoinGame: () => Promise<boolean>;
  joinRoomId: string;
  onJoinRoomIdChange: (id: string) => void;
  isHost: boolean;
  onStartAnyway: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  onOnlineGame: () => void;
  connectedPlayers: Player[];
  playerProfile: UserProfile;
}

  const handleCreateGame = async (numPlayers: number, boardSize: number) => {
    try {
      await withErrorHandling(
        (async () => {
          setGameStatus('creating');
          await initializeGame(numPlayers, boardSize);
          setGameStatus('playing');
        })(),
        { context: 'Game Creation' }
      );
    } catch (error) {
      handleGameError(error, 'Game Creation Failed');
      setGameStatus('menu');
    }
  };

  const handleBackToMenu = () => {
    resetGame();
    navigate(getRoute('game'));
  };

  const handleBackFromGame = () => {
    setGameStatus('mode_select');
  };

  if (isLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error.message}
        onRetry={handleBackToMenu}
      />
    );
  }

  if (gameStatus === 'playing' && gameState) {
    return (
      <GameBoard
        gameState={gameState}
        onBack={handleBackFromGame}
      />
    );
  }

  return (
    <MainMenu
      gameStatus={gameStatus}
      gameMode={gameMode}
      onSelectMode={setGameMode}
      onCreateGame={handleCreateGame}
      onBack={handleBackToMenu}
    />
  );
};

export default GameWrapper;
