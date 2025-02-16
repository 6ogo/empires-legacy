import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GameWrapper from "@/components/game/GameWrapper";
import LoadingScreen from "@/components/game/LoadingScreen";
import { useGameInit } from "@/hooks/useGameInit";
import { useGameState } from "@/hooks/useGameState";
import { createInitialGameState } from "@/lib/game-utils";

const GamePage = () => {
  const { user, profile, isLoading } = useAuth();
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

  const initialState = createInitialGameState(2, 24); // Default values
  const { gameState, dispatchAction } = useGameState(initialState);

  if (isLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <GameWrapper
      showLeaderboard={showLeaderboard}
      gameStatus={gameStatus}
      gameMode={gameMode}
      onBackToMenu={handleBackToMainMenu}
      onSelectMode={setGameMode}
      onCreateGame={async (numPlayers, boardSize) => {
        const state = createInitialGameState(numPlayers, boardSize);
        setGameStarted(true);
        return state;
      }}
      onJoinGame={async () => {
        setGameStarted(true);
        return true;
      }}
      joinRoomId=""
      onJoinRoomIdChange={() => {}}
      isHost={true}
      onStartAnyway={() => {}}
      onShowLeaderboard={() => setShowLeaderboard(true)}
      onShowStats={() => setGameStatus("stats")}
      connectedPlayers={[{ username: profile.username || 'Player' }]}
    />
  );
};

export default GamePage;