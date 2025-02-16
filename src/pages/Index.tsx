
import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGameInit } from "@/hooks/useGameInit";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { useGameSubscription } from "@/hooks/useGameSubscription";
import LoadingScreen from "@/components/game/LoadingScreen";
import ErrorScreen from "@/components/game/ErrorScreen";
import GameWrapper from "@/components/game/GameWrapper";
import GameContainer from "@/components/game/GameContainer";
import { isValidGameState } from "@/lib/game-validation";
import { toast } from "sonner";
import { GameMode, GameState } from "@/types/game";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
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

  const initialGameState: GameState = {
    id: '',
    phase: 'setup',
    turn: 1,
    currentPlayer: '',
    players: [],
    territories: [],
    updates: [],
    weather: 'clear',
    timeOfDay: 'day',
    lastUpdated: Date.now(),
    version: 1
  };

  const { gameState, dispatchAction } = useGameState(initialGameState);

  const {
    gameId,
    roomId,
    joinRoomId,
    setJoinRoomId,
    isHost,
    connectedPlayers,
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
  } = useOnlineGame();

  const handleActionDispatch = (state: GameState) => {
    if (isValidGameState(state)) {
      dispatchAction({
        type: 'SET_STATE',
        payload: { state },
        playerId: user?.id || '',
        timestamp: Date.now()
      });
    }
  };

  useGameSubscription(gameId, setGameStarted, setGameStatus, handleActionDispatch);

  if (authLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (initializationError) {
    return <ErrorScreen message={initializationError} onRetry={() => navigate('/game')} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#141B2C] text-white">
      {gameStarted ? (
        <GameContainer 
          gameMode={gameMode as GameMode} 
          onBack={handleBackFromGame}
        />
      ) : (
        <GameWrapper
          showLeaderboard={showLeaderboard}
          gameStatus={gameStatus}
          gameMode={gameMode}
          onBackToMenu={handleBackToMainMenu}
          onSelectMode={(mode) => {
            setGameMode(mode);
            setGameStatus("mode_select");
          }}
          onCreateGame={async (numPlayers, boardSize) => {
            try {
              const result = await handleCreateGame(numPlayers, boardSize);
              if (result?.initialState) {
                handleActionDispatch(result.initialState);
              }
            } catch (error) {
              console.error('Error creating game:', error);
              toast.error('Failed to create game. Please try again.');
            }
          }}
          onJoinGame={async () => {
            try {
              await handleJoinGame();
            } catch (error) {
              console.error('Error joining game:', error);
              toast.error('Failed to join game. Please try again.');
            }
          }}
          joinRoomId={joinRoomId}
          onJoinRoomIdChange={setJoinRoomId}
          isHost={isHost}
          onStartAnyway={handleStartAnyway}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowStats={() => setGameStatus("stats")}
          connectedPlayers={connectedPlayers}
        />
      )}
    </div>
  );
};

export default Index;
