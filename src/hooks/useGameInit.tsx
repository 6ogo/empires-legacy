
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createInitialGameState } from "@/lib/game-utils";
import { GameState } from "@/types/game";
import { toast } from "sonner";
import { isValidGameState } from "@/lib/game-validation";

export const useGameInit = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<"menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats">("menu");
  const [gameMode, setGameMode] = useState<"local" | "online" | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const onCreateGame = async (
    numPlayers: number,
    boardSize: number,
    gameMode: "local" | "online" | null,
    handleCreateGame: (numPlayers: number, boardSize: number) => Promise<{ initialState: GameState } | undefined>,
    setGameState: (state: GameState) => void
  ) => {
    if (gameMode === "local") {
      const initialState = createInitialGameState(numPlayers, boardSize);
      setGameState(initialState);
      setGameStarted(true);
      setGameStatus("playing");
      return;
    }
    
    const result = await handleCreateGame(numPlayers, boardSize);
    if (result) {
      setGameState(result.initialState);
      setGameStatus("waiting");
    }
  };

  const onJoinGame = async (
    handleJoinGame: () => Promise<{ state: GameState; game_status: string } | undefined>,
    setGameState: (state: GameState) => void
  ) => {
    const data = await handleJoinGame();
    if (data) {
      if (isValidGameState(data.state)) {
        setGameState(data.state);
        setGameStatus(data.game_status === 'playing' ? 'playing' : 'waiting');
        if (data.game_status === 'playing') {
          setGameStarted(true);
        }
      } else {
        console.error('Invalid game state received:', data.state);
        toast.error('Failed to load game state');
      }
    }
  };

  return {
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
  };
};
