// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, profile } = useAuth();
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

  const { gameState, setGameState } = useGameState(gameMode);

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

  useGameSubscription(gameId, setGameStarted, setGameStatus, setGameState);

  const handleBackFromGame = () => {
    setGameStarted(false);
    setGameStatus("menu");
    setGameMode(null);
    setGameState(null);
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
    setGameState(null);
    setShowLeaderboard(false);
    if (joinRoomId) {
      setJoinRoomId('');
    }
  };

  // Only initialize game status when we're on the /game route
  useEffect(() => {
    if (!authLoading && location.pathname === '/game') {
      if (user && profile) {
        setGameStatus("menu");
      }
    }
  }, [authLoading, user, profile, location.pathname, setGameStatus]);

  // Show loading screen only during auth check on /game route
  if (authLoading && location.pathname === '/game') {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Show landing page for root route when not authenticated
  if (location.pathname === '/' && !user) {
    return <Landing />;
  }

  // Redirect to landing if trying to access /game without auth
  if (location.pathname === '/game' && !user && !authLoading) {
    navigate('/', { replace: true });
    return null;
  }

  // Handle initialization error
  if (initializationError) {
    return <ErrorScreen message={initializationError} onRetry={handleBackToMainMenu} />;
  }

  // Show game UI for authenticated users on /game route
  if (location.pathname === '/game' && user && profile) {
    if (!gameStarted) {
      return (
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
              await onCreateGame(numPlayers, boardSize, gameMode, handleCreateGame, setGameState);
            } catch (error) {
              console.error('Error creating game:', error);
            }
          }}
          onJoinGame={async () => {
            try {
              const result = await handleJoinGame();
              if (result && 'state' in result) {
                const stateToValidate = result.state as unknown;
                if (isValidGameState(stateToValidate)) {
                  setGameState(stateToValidate);
                  if (result.game_status === 'playing') {
                    setGameStarted(true);
                    setGameStatus('playing');
                  }
                } else {
                  console.error('Invalid game state received:', result.state);
                  toast.error('Invalid game state received');
                }
              }
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
    }

    return <GameContainer gameMode={gameMode} onBack={handleBackToMainMenu} />;
  }

  // Redirect to landing for any other case
  navigate('/', { replace: true });
  return null;
};

export default Index;
