
import React, { useState, useEffect } from "react";
import { GameState, Territory, GameUpdate } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import GameModeSelect from "@/components/game/GameModeSelect";
import BoardSizeSelect from "@/components/game/BoardSizeSelect";
import GameBoard from "@/components/game/GameBoard";
import { createInitialGameState } from "@/lib/game-utils";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"menu" | "mode_select" | "creating" | "joining" | "playing">("menu");
  const [gameMode, setGameMode] = useState<"local" | "online" | null>(null);

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
            setGameStatus("playing");
            toast.success(`Game loaded!`);
          }
        } catch (error) {
          console.error('Error loading game:', error);
          toast.error('Failed to load game. Please try again.');
        }
      };

      fetchGame();
    }
  }, [gameId]);

  const handleCreateGame = async (numPlayers: number, boardSize: number) => {
    if (gameMode === "local") {
      const initialState = createInitialGameState(numPlayers, boardSize);
      setGameState(initialState);
      setGameStarted(true);
      setGameStatus("playing");
      return;
    }
    
    const initialState = createInitialGameState(numPlayers, boardSize);
    
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          state: initialState as unknown as Json,
          created_at: new Date().toISOString(),
          current_player: initialState.currentPlayer,
          phase: initialState.phase,
          num_players: numPlayers,
          game_status: 'waiting',
        })
        .select('id, room_id')
        .single();

      if (error) throw error;
      
      if (data) {
        setGameId(data.id);
        setRoomId(data.room_id);
        setGameState(initialState);
        setGameStarted(true);
        setGameStatus("playing");
        toast.success(`Game created! Room ID: ${data.room_id}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game. Please try again.');
    }
  };

  const handleJoinGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', joinRoomId)
        .single();

      if (error) throw error;

      if (data) {
        if (data.joined_players >= data.num_players) {
          toast.error('Game is full!');
          return;
        }

        const { error: updateError } = await supabase
          .from('games')
          .update({ 
            joined_players: data.joined_players + 1,
            game_status: data.joined_players + 1 === data.num_players ? 'playing' : 'waiting'
          })
          .eq('id', data.id);

        if (updateError) throw updateError;

        setGameId(data.id);
        setGameState(data.state as unknown as GameState);
        setGameStarted(true);
        setGameStatus("playing");
        toast.success('Joined game successfully!');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. Please check the Room ID and try again.');
    }
  };

  const handleTerritoryClick = async (territory: Territory) => {
    if (!gameState || !gameId) return;

    if (gameState.phase === "setup") {
      if (territory.owner) {
        toast.error("This territory is already claimed!");
        return;
      }

      const updatedTerritories = gameState.territories.map((t) =>
        t.id === territory.id ? { ...t, owner: gameState.currentPlayer } : t
      );

      const updatedPlayers = gameState.players.map((player) =>
        player.id === gameState.currentPlayer
          ? {
              ...player,
              territories: [...player.territories, territory],
            }
          : player
      );

      const nextPlayer = gameState.currentPlayer === "player1" ? "player2" : "player1";

      const newUpdate: GameUpdate = {
        type: "territory_claimed",
        message: `${gameState.currentPlayer} claimed a territory`,
        timestamp: Date.now(),
      };

      const updatedState: GameState = {
        ...gameState,
        territories: updatedTerritories,
        players: updatedPlayers,
        currentPlayer: nextPlayer,
        updates: [...gameState.updates, newUpdate],
      };

      try {
        const { error } = await supabase
          .from('games')
          .update({ 
            state: updatedState as unknown as Json,
            current_player: updatedState.currentPlayer,
            phase: updatedState.phase,
          })
          .eq('id', gameId);

        if (error) throw error;

        setGameState(updatedState);
        toast.success(`Territory claimed by ${gameState.currentPlayer}!`);
      } catch (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update game state. Please try again.');
      }
    } else {
      setSelectedTerritory(territory);
    }
  };

  const handleEndTurn = async () => {
    if (!gameState || !gameId) return;

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

      setGameState(updatedState);
      toast.success(`Turn ${updatedState.turn} begins!`);
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game state. Please try again.');
    }
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
            onCreateGame={handleCreateGame}
            gameMode={gameMode!}
            onJoinGame={handleJoinGame}
            joinRoomId={joinRoomId}
            onJoinRoomIdChange={(value) => setJoinRoomId(value)}
          />
        )}
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <GameBoard
      gameState={gameState}
      selectedTerritory={selectedTerritory}
      onTerritoryClick={handleTerritoryClick}
      onEndTurn={handleEndTurn}
      onEndPhase={handleEndPhase}
      onBuild={() => {}}
    />
  );
};

export default Index;
