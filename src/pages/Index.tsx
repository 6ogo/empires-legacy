
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGameInit } from "@/hooks/useGameInit";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { useAuth } from "@/hooks/useAuth";
import MainMenu from "@/components/game/MainMenu";
import PreGameScreens from "@/components/game/PreGameScreens";
import GameContainer from "@/components/game/GameContainer";
import { GameState } from "@/types/game";
import { isValidGameState } from "@/lib/game-validation";
import { Loader } from "lucide-react";

const Index = () => {
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

  // Ensure gameStatus is set to "menu" when component mounts and user is authenticated
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

  // Handle back button in game
  const handleBackFromGame = () => {
    setGameStarted(false);
    setGameStatus("menu");
    setGameMode(null);
    setGameState(null);
    if (joinRoomId) {
      setJoinRoomId('');
    }
  };

  // Handle back button in mode selection
  const handleBackToMenu = () => {
    setGameMode(null);
    setGameStatus("menu");
    if (joinRoomId) {
      setJoinRoomId('');
    }
  };

  useEffect(() => {
    if (gameId) {
      const subscription = supabase
        .channel(`game_updates_${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        }, (payload: any) => {
          if (payload.new.game_status === 'playing') {
            setGameStarted(true);
            setGameStatus("playing");
            const newState = payload.new.state as unknown as GameState;
            if (isValidGameState(newState)) {
              setGameState(newState);
            } else {
              console.error('Invalid game state received:', newState);
              toast.error('Failed to load game state');
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [gameId, setGameStarted, setGameStatus, setGameState]);

  const wrappedJoinGame = async () => {
    try {
      const data = await handleJoinGame();
      if (data) {
        const parsedState = data.state as unknown as GameState;
        if (isValidGameState(parsedState)) {
          return {
            state: parsedState,
            game_status: data.game_status
          };
        } else {
          console.error('Invalid game state received:', data.state);
          toast.error('Failed to load game state');
          return undefined;
        }
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. Please try again.');
    }
  };

  // Show proper loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-game-gold animate-spin mb-4" />
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <div className="text-white text-lg mb-4">{initializationError}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user || !profile) {
    window.location.href = '/auth';
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-game-gold animate-spin mb-4" />
        <div className="text-white text-lg">Redirecting to login...</div>
      </div>
    );
  }

  // Show loading state while game status is being initialized
  if (!gameStatus) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-game-gold animate-spin mb-4" />
        <div className="text-white text-lg">Initializing game...</div>
      </div>
    );
  }

  if (!gameStarted) {
    console.log("Game not started, showing pre-game screens");
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-6 md:px-0 md:py-0">
        <PreGameScreens
          showLeaderboard={showLeaderboard}
          gameStatus={gameStatus}
          onBackToMenu={handleBackToMenu}
        >
          <MainMenu
            gameStatus={gameStatus}
            gameMode={gameMode}
            onSelectMode={(mode) => {
              setGameMode(mode);
              setGameStatus("mode_select");
            }}
            onCreateGame={async (numPlayers, boardSize) => {
              try {
                await onCreateGame(numPlayers, boardSize, gameMode, handleCreateGame, setGameState);
              } catch (error) {
                console.error('Error creating game:', error);
                toast.error('Failed to create game. Please try again.');
              }
            }}
            onJoinGame={async () => {
              try {
                await onJoinGame(wrappedJoinGame, setGameState);
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
        </PreGameScreens>
      </div>
    );
  }

  console.log("Rendering game container with mode:", gameMode);
  return <GameContainer gameMode={gameMode} onBack={handleBackFromGame} />;
};

export default Index;
