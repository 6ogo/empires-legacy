// src/pages/GamePage.tsx

import React, { useCallback, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GameWrapper from "@/components/game/GameWrapper";
import LoadingScreen from "@/components/game/LoadingScreen";
import { useGameInit } from "@/hooks/useGameInit";
import { useGameState } from "@/hooks/useGameState";
import { createInitialGameState } from "@/lib/game-utils";
import { GameStatus, GameMode, GameState, UIPlayer } from "@/types/game";
import { toast } from "sonner";

const GamePage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, refreshSession } = useAuth();
  const {
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
  } = useGameInit();

  const initialState = createInitialGameState(2, 24);
  const { gameState, dispatchAction } = useGameState(initialState);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user && !isLoading) {
        await refreshSession();
      }
    };
    checkAuth();
  }, [user, isLoading, refreshSession]);

  const handleCreateGame = useCallback(async (numPlayers: number, boardSize: number) => {
    try {
      const state = createInitialGameState(numPlayers, boardSize);
      setGameStarted(true);
      setGameStatus("playing");
      return state;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
      return null;
    }
  }, [setGameStarted, setGameStatus]);

  const handleShowStats = useCallback(() => {
    setGameStatus("stats");
  }, [setGameStatus]);

  const handleLocalGame = useCallback(() => {
    setGameMode("local");
    setGameStatus("creating");
  }, [setGameMode, setGameStatus]);

  const handleOnlineGame = useCallback(() => {
    setGameMode("online");
    setGameStatus("joining");
  }, [setGameMode, setGameStatus]);

  const handleShowLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, [setShowLeaderboard]);

  const handleJoinGame = useCallback(async () => {
    try {
      setGameStarted(true);
      setGameStatus("playing");
      return true;
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
      return false;
    }
  }, [setGameStarted, setGameStatus]);

  if (isLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const connectedPlayers: UIPlayer[] = [{
    id: profile.id,
    username: profile.username || 'Player',
    avatarUrl: profile.avatarUrl,
    level: profile.level || 1,
    xp: profile.xp || 0,
    isReady: true,
    color: 'player1'
  }];

  return (
    <GameWrapper
      showLeaderboard={showLeaderboard}
      gameStatus={gameStatus}
      gameMode={gameMode}
      onBackToMenu={handleBackToMainMenu}
      onSelectMode={setGameMode}
      onCreateGame={handleCreateGame}
      onJoinGame={handleJoinGame}
      joinRoomId=""
      onJoinRoomIdChange={() => {}}
      isHost={true}
      onStartAnyway={() => {}}
      onShowLeaderboard={handleShowLeaderboard}
      onShowStats={handleShowStats}
      onOnlineGame={handleOnlineGame}
      connectedPlayers={connectedPlayers}
      playerProfile={profile}
    />
  );
};

export default GamePage;