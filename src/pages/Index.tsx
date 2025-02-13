
import React, { useState, useEffect } from "react";
import { GameState } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import GameBoard from "@/components/game/GameBoard";
import { createInitialGameState } from "@/lib/game-utils";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import GameStartMenu from "@/components/game/GameStartMenu";
import GameUpdatesPanel from "@/components/game/GameUpdatesPanel";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<"menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting">("menu");
  const [gameMode, setGameMode] = useState<"local" | "online" | null>(null);

  const {
    gameState,
    setGameState,
    selectedTerritory,
    setSelectedTerritory,
    handleTerritoryClick,
  } = useGameState(gameMode);

  const {
    gameId,
    roomId,
    joinRoomId,
    setJoinRoomId,
    isHost,
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
  } = useOnlineGame();

  useEffect(() => {
    if (gameId) {
      const fetchGame = async () => {
        try {
          const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', gameId)
            .single();

          if (error) throw error;

          if (data) {
            setGameState(data.state as unknown as GameState);
            setGameStarted(true);
            setGameStatus(data.game_status === 'waiting' ? 'waiting' : 'playing');
            toast.success(`Game loaded!`);
          }
        } catch (error) {
          console.error('Error loading game:', error);
          toast.error('Failed to load game. Please try again.');
        }
      };

      const channel = supabase
        .channel(`game_${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        }, (payload) => {
          const gameData = payload.new;
          setGameState(gameData.state as unknown as GameState);
          if (gameData.game_status === 'playing') {
            setGameStatus('playing');
          }
        })
        .subscribe();

      fetchGame();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId]);

  const onCreateGame = async (numPlayers: number, boardSize: number) => {
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
      setGameStarted(true);
      setGameStatus("waiting");
    }
  };

  const onJoinGame = async () => {
    const data = await handleJoinGame();
    if (data) {
      setGameState(data.state as unknown as GameState);
      setGameStarted(true);
      setGameStatus(data.joined_players + 1 === data.num_players ? 'playing' : 'waiting');
    }
  };

  if (!gameStarted) {
    return (
      <GameStartMenu
        gameStatus={gameStatus}
        gameMode={gameMode}
        onSelectMode={(mode) => {
          setGameMode(mode);
          setGameStatus("mode_select");
        }}
        onCreateGame={onCreateGame}
        onJoinGame={onJoinGame}
        joinRoomId={joinRoomId}
        onJoinRoomIdChange={setJoinRoomId}
        isHost={isHost}
        onStartAnyway={handleStartAnyway}
      />
    );
  }

  if (!gameState) return null;

  return (
    <>
      <GameBoard
        gameState={gameState}
        selectedTerritory={selectedTerritory}
        onTerritoryClick={(territory) => handleTerritoryClick(territory, gameId)}
        onEndTurn={handleEndTurn}
        onEndPhase={handleEndPhase}
        onBuild={handleBuild}
        onRecruit={handleRecruit}
        onGiveUp={handleGiveUp}
      />
      <GameUpdatesPanel gameState={gameState} />
    </>
  );
};

export default Index;
