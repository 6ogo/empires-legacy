
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GameState } from "@/types/game";
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

  // Initialize game status when auth is ready
  useEffect(() => {
    // Only proceed if auth loading is complete
    if (!authLoading) {
      if (user && profile) {
        // User is authenticated, set game status to menu
        console.log("Auth complete, setting game status to menu for user:", user.email);
        setGameStatus("menu");
      } else if (!user) {
        // User is not authenticated, redirect to auth
        console.log("No user found, redirecting to auth");
        navigate('/auth', { replace: true });
      }
    }
  }, [authLoading, user, profile, navigate, setGameStatus]);

  // Handle page refreshes and focus events
  useEffect(() => {
    const handlePageRefresh = () => {
      if (location.pathname === '/game' && user && profile && !gameStatus) {
        console.log("Page refresh detected, reinitializing game menu");
        setGameStatus("menu");
      }
    };

    handlePageRefresh();
    window.addEventListener('focus', handlePageRefresh);
    return () => {
      window.removeEventListener('focus', handlePageRefresh);
    };
  }, [gameStatus, location.pathname, user, profile, setGameStatus]);

  // Show loading only during initial auth check
  if (authLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Show error if initialization failed
  if (initializationError) {
    return <ErrorScreen message={initializationError} onRetry={handleBackToMainMenu} />;
  }

  // Redirect to auth if no user
  if (!user || !profile) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  // Always show game menu if we have user and profile
  if (!gameStatus && user && profile) {
    console.log("No game status but user authenticated, setting to menu");
    setGameStatus("menu");
    return <LoadingScreen message="Loading game menu..." />;
  }

  // Show regular game UI once everything is initialized
  if (!gameStarted) {
    console.log("Game not started, showing pre-game screens");
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

  console.log("Rendering game container with mode:", gameMode);
  return <GameContainer gameMode={gameMode} onBack={handleBackToMainMenu} />;
};

export default Index;
