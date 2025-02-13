import React, { useState, useEffect } from "react";
import HexGrid from "@/components/game/HexGrid";
import ResourceDisplay from "@/components/game/ResourceDisplay";
import GameControls from "@/components/game/GameControls";
import BuildingMenu from "@/components/game/BuildingMenu";
import { GameState, Territory, Resources, PlayerColor, GameUpdate } from "@/types/game";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const generateInitialTerritories = (): Territory[] => {
  const territories: Territory[] = [];
  const radius = 3;

  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        const resources: Partial<Resources> = {};
        const resourceTypes = ['gold', 'wood', 'stone', 'food'] as const;
        
        resourceTypes.forEach(resource => {
          if (Math.random() < 0.6) {
            resources[resource] = Math.floor(Math.random() * 3) + 1;
          }
        });

        territories.push({
          id: `${q},${r},${s}`,
          type: "plains",
          owner: null,
          coordinates: { q, r, s },
          resources,
        });
      }
    }
  }

  return territories;
};

const createInitialGameState = (numPlayers: number): GameState => ({
  players: Array.from({ length: numPlayers }, (_, i) => ({
    id: `player${i + 1}` as PlayerColor,
    resources: { gold: 100, wood: 50, stone: 50, food: 50 },
    territories: [],
  })),
  territories: generateInitialTerritories(),
  currentPlayer: "player1" as PlayerColor,
  phase: "setup",
  turn: 1,
  updates: [],
});

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"menu" | "creating" | "joining" | "playing">("menu");

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
            setGameState(data.state as GameState);
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

  const handleCreateGame = async (numPlayers: number) => {
    const initialState = createInitialGameState(numPlayers);
    
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
        setGameState(data.state as GameState);
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

      const nextPlayer = gameState.currentPlayer === "player1" ? "player2" as PlayerColor : "player1" as PlayerColor;

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

  const handleBuild = (buildingType: string) => {
    if (!gameState) return;
    if (!selectedTerritory) {
      toast.error("Select a territory to build in!");
      return;
    }

    if (selectedTerritory.owner !== gameState.currentPlayer) {
      toast.error("You can only build in your own territories!");
      return;
    }

    if (selectedTerritory.building) {
      toast.error("This territory already has a building!");
      return;
    }

    const currentPlayer = gameState.players.find(
      (p) => p.id === gameState.currentPlayer
    );

    if (!currentPlayer) return;

    const building = buildings.find((b) => b.id === buildingType);
    if (!building) return;
    
    const canAfford = Object.entries(building.cost).every(
      ([resource, cost]) => 
        currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= cost
    );

    if (!canAfford) {
      toast.error("Not enough resources to build this!");
      return;
    }

    const updatedPlayers = gameState.players.map((player) =>
      player.id === gameState.currentPlayer
        ? {
            ...player,
            resources: Object.entries(building.cost).reduce(
              (acc, [resource, cost]) => ({
                ...acc,
                [resource]: player.resources[resource as keyof Resources] - cost,
              }),
              player.resources
            ),
          }
        : player
    );

    const updatedTerritories = gameState.territories.map((t) =>
      t.id === selectedTerritory.id
        ? { ...t, building: buildingType }
        : t
    );

    setGameState({
      ...gameState,
      territories: updatedTerritories,
      players: updatedPlayers,
    });

    toast.success(`Built ${building.name} in selected territory!`);
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

  const handleEndTurn = async () => {
    if (!gameState || !gameId) return;

    const nextPlayer = gameState.currentPlayer === "player1" ? "player2" as PlayerColor : "player1" as PlayerColor;

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

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-game-gold mb-8">Empire's Legacy</h1>
        <div className="space-y-4">
          <h2 className="text-2xl text-center mb-4">Select number of players</h2>
          <div className="flex gap-4">
            {[2, 3, 4].map((num) => (
              <Button
                key={num}
                onClick={() => handleCreateGame(num)}
                className="px-8 py-4 text-xl"
              >
                {num} Players
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading game state...</h2>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );

  if (!currentPlayer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-game-gold">Empire's Legacy</h1>
          <p className="text-gray-400">
            Turn {gameState.turn} - {currentPlayer.id}'s turn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-xl">
              <HexGrid
                territories={gameState.territories}
                onTerritoryClick={handleTerritoryClick}
                selectedTerritory={selectedTerritory}
              />
            </div>
          </div>

          <div className="space-y-4">
            <ResourceDisplay resources={currentPlayer.resources} />
            {gameState.phase === "building" && (
              <BuildingMenu 
                onBuild={handleBuild}
                resources={currentPlayer.resources}
              />
            )}
            <GameControls
              gameState={gameState}
              onEndTurn={handleEndTurn}
              onEndPhase={handleEndPhase}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const buildings = [
  {
    id: "lumber_mill",
    name: "Lumber Mill",
    icon: "TreeDeciduous",
    cost: { gold: 50, wood: 20 },
    description: "+2 wood per turn",
  },
  {
    id: "mine",
    name: "Mine",
    icon: "Mountain",
    cost: { gold: 50, stone: 20 },
    description: "+2 stone per turn",
  },
  {
    id: "market",
    name: "Market",
    icon: "Store",
    cost: { gold: 100, wood: 30 },
    description: "+2 gold per turn",
  },
  {
    id: "farm",
    name: "Farm",
    icon: "GalleryThumbnails",
    cost: { gold: 50, wood: 20 },
    description: "+2 food per turn",
  },
  {
    id: "barracks",
    name: "Barracks",
    icon: "Sword",
    cost: { gold: 150, wood: 50, stone: 50 },
    description: "Enables unit training",
  },
  {
    id: "fortress",
    name: "Fortress",
    icon: "Castle",
    cost: { gold: 300, stone: 150 },
    description: "+50% defense",
  },
];

export default Index;
