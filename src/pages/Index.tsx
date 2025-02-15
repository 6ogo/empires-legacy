
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

  useEffect(() => {
    if (!authLoading && user && !gameStatus) {
      console.log("Setting initial game status to menu for user:", user.email);
      try {
        setGameStatus("menu");
      } catch (error) {
        console.error("Error setting initial game status:", error);
        setInitializationError("Failed to initialize game. Please try refreshing the page.");
      }
    }
  }, [authLoading, user, gameStatus, setGameStatus]);

  useEffect(() => {
    const handlePageRefresh = () => {
      if (location.pathname === '/game' && !gameStatus) {
        handleBackToMainMenu();
      }
    };

    handlePageRefresh();
    window.addEventListener('focus', handlePageRefresh);
    return () => {
      window.removeEventListener('focus', handlePageRefresh);
    };
  }, [gameStatus, location.pathname]);

  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (initializationError) {
    return <ErrorScreen message={initializationError} onRetry={handleBackToMainMenu} />;
  }

  if (!user || !profile) {
    navigate('/auth', { replace: true });
    return <LoadingScreen message="Redirecting to login..." />;
  }

  if (!gameStatus) {
    return <LoadingScreen message="Initializing game..." />;
  }

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
