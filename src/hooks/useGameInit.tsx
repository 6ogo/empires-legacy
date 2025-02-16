
import { useState, useCallback } from 'react';
import { GameMode, GameStatus } from '@/types/game';

export const useGameInit = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const resetGameState = useCallback(() => {
    setGameStarted(false);
    setGameStatus("menu");
    setGameMode(null);
    setShowLeaderboard(false);
  }, []);

  const handleBackToMainMenu = useCallback(() => {
    resetGameState();
  }, [resetGameState]);

  const handleBackFromGame = useCallback(() => {
    setGameStarted(false);
    setGameStatus("mode_select");
    // Keep the game mode when going back from a game
  }, []);

  return {
    gameStarted,
    setGameStarted,
    gameStatus,
    setGameStatus,
    gameMode,
    setGameMode,
    showLeaderboard,
    setShowLeaderboard,
    handleBackToMainMenu,
    handleBackFromGame,
    resetGameState,
  };
};
