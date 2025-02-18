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

const GameWrapper = () => {
  const navigate = useNavigate();
  const {
    gameStatus,
    gameMode,
    gameState,
    isLoading,
    error,
    setGameStatus,
    setGameMode,
    setGameState,
    initializeGame,
    resetGame
  } = useGameStore();

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
