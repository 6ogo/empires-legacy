
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
import { Loader } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

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

  // Handle back to main menu from any section
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

  // Initialize game status on mount and after auth
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

  // Handle page refresh and navigation
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

  // Handle online game updates
  useEffect(() => {
    if (gameId) {
      const subscription = supabase
        .channel(`game_updates_${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        }, (payload: { new: { game_status: string; state: Json } }) => {
          if (payload.new.game_status === 'playing') {
            setGameStarted(true);
            setGameStatus("playing");
            const stateData = typeof payload.new.state === 'string' 
              ? JSON.parse(payload.new.state) 
              : payload.new.state;
            setGameState(stateData as GameState);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [gameId, setGameStarted, setGameStatus, setGameState]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-game-gold animate-spin mb-4" />
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (initializationError) {
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <div className="text-white text-lg mb-4">{initializationError}</div>
        <button 
          onClick={handleBackToMainMenu}
          className="px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  if (!user || !profile) {
    navigate('/auth', { replace: true });
    return (
      <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-game-gold animate-spin mb-4" />
        <div className="text-white text-lg">Redirecting to login...</div>
      </div>
    );
  }

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
                const result = await handleJoinGame();
                if (result && 'state' in result) {
                  setGameState(result.state as GameState);
                  if (result.game_status === 'playing') {
                    setGameStarted(true);
                    setGameStatus('playing');
                  }
                }
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
  return <GameContainer gameMode={gameMode} onBack={handleBackToMainMenu} />;
};

export default Index;
