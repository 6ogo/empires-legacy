
import React, { useState, useEffect } from "react";
import { GameState, GameUpdate } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import GameModeSelect from "@/components/game/GameModeSelect";
import BoardSizeSelect from "@/components/game/BoardSizeSelect";
import GameBoard from "@/components/game/GameBoard";
import { createInitialGameState } from "@/lib/game-utils";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { Button } from "@/components/ui/button";

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

  const onStartAnyway = async () => {
    const success = await handleStartAnyway();
    if (success) {
      setGameStatus('playing');
    }
  };

  const handleEndTurn = async () => {
    if (!gameState) return;

    const nextPlayer = gameState.currentPlayer === "player1" ? "player2" : "player1";

    const newUpdate: GameUpdate = {
      type: "turn_ended",
      message: `${gameState.currentPlayer} ended their turn`,
      timestamp: Date.now(),
    };

    const updatedState: GameState = {
      ...gameState,
      currentPlayer: nextPlayer,
      phase: "resource",
      turn: gameState.turn + 1,
      updates: [...gameState.updates, newUpdate],
    };

    setGameState(updatedState);

    if (gameMode === "online" && gameId) {
      try {
        const { error } = await supabase
          .from('games')
          .update({ 
            state: updatedState as unknown as Json,
            current_player: nextPlayer,
            phase: "resource",
          })
          .eq('id', gameId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update game state. Please try again.');
      }
    }

    toast.success(`Turn ${updatedState.turn} begins!`);
  };

  const collectResources = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players.find(
      (p) => p.id === gameState.currentPlayer
    );

    if (!currentPlayer) return;

    const ownedTerritories = gameState.territories.filter(
      (t) => t.owner === gameState.currentPlayer
    );

    const resourceGains = ownedTerritories.reduce(
      (acc, territory) => {
        Object.entries(territory.resources).forEach(([resource, amount]) => {
          acc[resource as keyof typeof acc] += amount;
        });
        return acc;
      },
      { gold: 2, wood: 1, stone: 1, food: 1 }
    );

    const updatedPlayers = gameState.players.map((player) =>
      player.id === gameState.currentPlayer
        ? {
            ...player,
            resources: {
              gold: player.resources.gold + resourceGains.gold,
              wood: player.resources.wood + resourceGains.wood,
              stone: player.resources.stone + resourceGains.stone,
              food: player.resources.food + resourceGains.food,
            },
          }
        : player
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
    });

    toast.success("Resources collected!");
  };

  const handleEndPhase = () => {
    if (!gameState) return;

    const phases: GameState["phase"][] = [
      "resource",
      "building",
      "recruitment",
      "movement",
      "combat",
    ];
    const currentPhaseIndex = phases.indexOf(gameState.phase as any);
    const nextPhase =
      currentPhaseIndex === phases.length - 1
        ? phases[0]
        : phases[currentPhaseIndex + 1];

    if (gameState.phase === "resource") {
      collectResources();
    }

    setGameState({
      ...gameState,
      phase: nextPhase,
    });

    toast.success(`Moving to ${nextPhase} phase`);
  };

  const handleGiveUp = () => {
    if (!gameState) return;
    
    if (gameState.players.length === 2) {
      const winner = gameState.players.find(p => p.id !== gameState.currentPlayer);
      if (winner) {
        toast.success(`${winner.id} wins!`);
        setGameStarted(false);
        setGameStatus("menu");
      }
    } else {
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer);
      const remainingPlayers = gameState.players.filter(p => p.id !== gameState.currentPlayer);
      
      if (remainingPlayers.length === 1) {
        toast.success(`${remainingPlayers[0].id} wins!`);
        setGameStarted(false);
        setGameStatus("menu");
      } else {
        const nextPlayer = gameState.players[(currentPlayerIndex + 1) % gameState.players.length].id;
        setGameState({
          ...gameState,
          players: remainingPlayers,
          currentPlayer: nextPlayer,
        });
        toast.info(`${gameState.currentPlayer} has given up!`);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-game-gold mb-8">Empire's Legacy</h1>
        
        {gameStatus === "menu" && (
          <GameModeSelect onSelectMode={(mode) => {
            setGameMode(mode);
            setGameStatus("mode_select");
          }} />
        )}

        {gameStatus === "mode_select" && (
          <BoardSizeSelect
            onCreateGame={onCreateGame}
            gameMode={gameMode!}
            onJoinGame={onJoinGame}
            joinRoomId={joinRoomId}
            onJoinRoomIdChange={(value) => setJoinRoomId(value)}
          />
        )}

        {gameStatus === "waiting" && (
          <div className="text-center">
            <h2 className="text-2xl mb-4">Waiting for players...</h2>
            {isHost && (
              <Button onClick={onStartAnyway} className="mt-4">
                Start Game Anyway
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <GameBoard
      gameState={gameState}
      selectedTerritory={selectedTerritory}
      onTerritoryClick={(territory) => handleTerritoryClick(territory, gameId)}
      onEndTurn={handleEndTurn}
      onEndPhase={handleEndPhase}
      onBuild={() => {}}
      onGiveUp={handleGiveUp}
    />
  );
};

export default Index;
