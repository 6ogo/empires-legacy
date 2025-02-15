
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { GameMode, GameState, GameAction } from "@/types/game";

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
    onCreateGame,
    onJoinGame,
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

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleStateUpdate = (newState: GameState) => {
    dispatchAction({
      type: 'SET_STATE',
      payload: { state: newState },
      playerId: user?.id || '',
      timestamp: Date.now()
    });
  };

  const handleActionDispatch = (state: GameState) => {
    if (isValidGameState(state)) {
      handleStateUpdate(state);
    }
  };

  useGameSubscription(gameId, setGameStarted, setGameStatus, handleActionDispatch);

  // Show loading screen while checking auth
  if (authLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  // Show error screen if there's an initialization error
  if (initializationError) {
    return <ErrorScreen message={initializationError} onRetry={() => navigate('/game')} />;
  }

  // Don't render anything if we're not authenticated
  if (!user) {
    return null;
  }

  return gameStarted ? (
    <GameContainer gameMode={gameMode as GameMode} onBack={handleBackFromGame} />
  ) : (
    <GameWrapper
      showLeaderboard={showLeaderboard}
      gameStatus={gameStatus}
      gameMode={gameMode}
      onBackToMenu={handleBackToMenu}
      onSelectMode={(mode) => {
        setGameMode(mode);
        setGameStatus("mode_select");
      }}
      onCreateGame={async (numPlayers, boardSize) => {
        try {
          await onCreateGame(numPlayers, boardSize, gameMode, handleCreateGame, handleActionDispatch);
        } catch (error) {
          console.error('Error creating game:', error);
        }
      }}
      onJoinGame={async () => {
        try {
          await handleJoinGame();
        } catch (error) {
          console.error('Error joining game:', error);
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
  );
};

export default Index;
