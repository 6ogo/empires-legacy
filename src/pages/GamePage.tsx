import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GameWrapper from "@/components/game/GameWrapper";
import GameStartMenu from "@/components/game/GameStartMenu";
import GameScreen from "@/components/game/GameScreen";
import CombatHistory from "@/components/game/CombatHistory";
import LoadingScreen from "@/components/game/LoadingScreen";
import { useGameInit } from "@/hooks/useGameInit";
import { useGameState } from "@/hooks/useGameState";
import { createInitialGameState } from "@/lib/game-utils";
import { toast } from "sonner";
import { GameState, GameAction } from "@/types/game";
import RandomEventsDialog from "@/components/game/menu/RandomEventsDialog";

const GamePage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, isInitialized } = useAuth();
  const [showRandomEventsInfo, setShowRandomEventsInfo] = useState(false);
  const [showCombatHistory, setShowCombatHistory] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [playerColors, setPlayerColors] = useState<string[]>(["player1", "player2", "player3", "player4", "player5", "player6"]);
  const [selectedBoardSize, setSelectedBoardSize] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [enableRandomEvents, setEnableRandomEvents] = useState(false);
  
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

  // Initialize with a dummy state that will be replaced
  const initialState = createInitialGameState(2, 24);
  const { 
    gameState, 
    dispatchAction, 
    resetState 
  } = useGameState(initialState);

  const handleCreateGame = useCallback(async (numPlayers: number, boardSize: number, enableRNG: boolean = false) => {
    try {
      console.log(`Creating ${gameMode} game with ${numPlayers} players, ${boardSize} hexes, random events: ${enableRNG}`);
      const newState = createInitialGameState(numPlayers, boardSize);
      
      // Set random events flag - add to game state via custom property
      (newState as any).randomEventsEnabled = enableRNG;
      
      // Update the max players
      setMaxPlayers(numPlayers);
      
      // Record the selected board size
      setSelectedBoardSize(boardSize);
      
      if (gameMode === 'local') {
        setGameStarted(true);
        setGameStatus("playing");
        resetState(newState);
        return newState;
      } else if (gameMode === 'online') {
        // For online games, show the waiting room first
        setGameStatus("waiting");
        // Generate a random room ID if not already set
        if (!joinRoomId) {
          setJoinRoomId(Math.random().toString(36).substring(2, 8).toUpperCase());
        }
        return newState;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
      return null;
    }
  }, [gameMode, setGameStarted, setGameStatus, resetState, joinRoomId]);

  const handleShowStats = useCallback(() => {
    setGameStatus("stats");
  }, [setGameStatus]);

  const handleJoinGame = useCallback(async () => {
    try {
      if (!joinRoomId) {
        toast.error('Please enter a room ID');
        return false;
      }
      
      console.log(`Joining game with room ID: ${joinRoomId}`);
      
      // For the demo/prototype, we'll just simulate joining
      // In a real implementation, this would verify the room exists with the backend
      
      if (gameMode === 'online') {
        setGameStatus("waiting");
        toast.success(`Joined room ${joinRoomId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
      return false;
    }
  }, [joinRoomId, gameMode, setGameStatus]);

  const handleStartOnlineGame = useCallback(() => {
    if (gameMode === 'online' && gameStatus === 'waiting') {
      setGameStarted(true);
      setGameStatus("playing");
      
      // Create a new game state with the specified number of players and board size
      const newState = createInitialGameState(maxPlayers, selectedBoardSize);
      (newState as any).randomEventsEnabled = enableRandomEvents;
      resetState(newState);
      
      toast.success('Game started!');
      return true;
    }
    return false;
  }, [gameMode, gameStatus, setGameStarted, setGameStatus, maxPlayers, selectedBoardSize, enableRandomEvents, resetState]);

  const handleAction = useCallback(async (action: GameAction): Promise<boolean> => {
    try {
      const result = await dispatchAction(action);
      return result;
    } catch (error) {
      console.error('Error handling game action:', error);
      toast.error('Failed to perform action');
      return false;
    }
  }, [dispatchAction]);

  const handleShowRandomEventsInfo = useCallback(() => {
    setShowRandomEventsInfo(true);
  }, []);

  const handleShowCombatHistory = useCallback(() => {
    setShowCombatHistory(true);
  }, []);

  // Wait for auth to initialize and user/profile to be available
  if (isLoading || !isInitialized) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (!user || !profile) {
    // Redirect to login if not authenticated
    navigate('/auth', { replace: true });
    return null;
  }

  // Prepare connected players for UI (simulated for local mode)
  const connectedPlayers = gameMode === 'local' 
    ? Array.from({ length: maxPlayers }, (_, i) => ({
        username: i === 0 ? profile.username || 'Player 1' : `Player ${i + 1}`,
        color: playerColors[i]
      }))
    : [{ 
        username: profile.username || 'Host',
        color: playerColors[0]
      }];

  return (
    <>
      {gameStarted && gameStatus === 'playing' ? (
        <GameScreen
          gameState={gameState}
          dispatchAction={handleAction}
          onShowCombatHistory={handleShowCombatHistory}
          onBack={handleBackFromGame}
        />
      ) : (
        <GameStartMenu
          gameStatus={gameStatus}
          gameMode={gameMode}
          onSelectMode={setGameMode}
          onCreateGame={async (numPlayers, boardSize, enableRNG) => {
            await handleCreateGame(numPlayers, boardSize, enableRNG);
          }}
          onJoinGame={async () => {
            await handleJoinGame();
          }}
          joinRoomId={joinRoomId}
          onJoinRoomIdChange={setJoinRoomId}
          isHost={true}
          onStartAnyway={handleStartOnlineGame}
          connectedPlayers={connectedPlayers}
          selectedBoardSize={selectedBoardSize}
          maxPlayers={maxPlayers}
          onShowRandomEventsInfo={handleShowRandomEventsInfo}
        />
      )}

      {showCombatHistory && (
        <CombatHistory 
          gameState={gameState} 
          onClose={() => setShowCombatHistory(false)} 
        />
      )}

      <RandomEventsDialog
        open={showRandomEventsInfo}
        onOpenChange={setShowRandomEventsInfo}
      />
    </>
  );
};

export default GamePage;