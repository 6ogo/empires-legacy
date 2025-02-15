import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { user, isLoading } = useAuth();
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

  const { gameState, dispatchAction } = useGameState(gameMode);

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

  useGameSubscription(gameId, setGameStarted, setGameStatus, dispatchAction);

  const handleDispatch = (action: GameAction): boolean => {
    const fullAction: GameAction = {
      ...action,
      playerId: user?.id || '',
      timestamp: Date.now()
    };
    
    return true;
  };

  const handleStateUpdate = (newState: GameState) => {
    dispatchAction({
      type: 'SET_STATE',
      payload: { state: newState },
      playerId: user?.id || '',
      timestamp: Date.now()
    });
  };

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [isLoading, user, navigate]);

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
            await onCreateGame(numPlayers, boardSize, gameMode, handleCreateGame, dispatchAction);
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
                dispatchAction({ 
                  type: 'SET_STATE', 
                  payload: { state: stateToValidate as GameState }
                });
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

  return <GameContainer gameMode={gameMode as GameMode} onBack={handleBackToMainMenu} />;
};

export default Index;
