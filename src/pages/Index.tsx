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
  const { user } = useAuth();
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

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleBackFromGame = () => {
    setGameStarted(false);
    setGameStatus("menu");
    setGameMode(null);
    if (joinRoomId) {
      setJoinRoomId('');
    }
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setGameStatus("menu");
    if (joinRoomId) {
      setJoinRoomId('');
    }
  };

  const handleBackToMainMenu = () => {
    navigate('/game');
    setGameStarted(false);
    setGameStatus("menu");
    setGameMode(null);
    setShowLeaderboard(false);
    if (joinRoomId) {
      setJoinRoomId('');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (initializationError) {
    return <ErrorScreen message={initializationError} onRetry={handleBackToMainMenu} />;
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
