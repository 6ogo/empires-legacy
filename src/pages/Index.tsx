
import React, { useState } from "react";
import HexGrid from "@/components/game/HexGrid";
import ResourceDisplay from "@/components/game/ResourceDisplay";
import GameControls from "@/components/game/GameControls";
import { GameState, Territory } from "@/types/game";
import { toast } from "sonner";

const generateInitialTerritories = (): Territory[] => {
  const territories: Territory[] = [];
  const radius = 3;

  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        territories.push({
          id: `${q},${r},${s}`,
          type: "plains",
          owner: null,
          coordinates: { q, r, s },
          resources: {
            gold: Math.floor(Math.random() * 3),
            wood: Math.floor(Math.random() * 3),
            stone: Math.floor(Math.random() * 3),
            food: Math.floor(Math.random() * 3),
          },
        });
      }
    }
  }

  return territories;
};

const initialGameState: GameState = {
  players: [
    {
      id: "player1",
      resources: { gold: 100, wood: 50, stone: 50, food: 50 },
      territories: [],
    },
    {
      id: "player2",
      resources: { gold: 100, wood: 50, stone: 50, food: 50 },
      territories: [],
    },
  ],
  territories: generateInitialTerritories(),
  currentPlayer: "player1",
  phase: "setup",
  turn: 1,
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  const handleTerritoryClick = (territory: Territory) => {
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

      setGameState({
        ...gameState,
        territories: updatedTerritories,
        players: updatedPlayers,
        currentPlayer: gameState.currentPlayer === "player1" ? "player2" : "player1",
      });

      toast.success(`Territory claimed by ${gameState.currentPlayer}!`);
    } else {
      setSelectedTerritory(territory);
    }
  };

  const handleEndPhase = () => {
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

    setGameState({
      ...gameState,
      phase: nextPhase,
    });

    toast.success(`Moving to ${nextPhase} phase`);
  };

  const handleEndTurn = () => {
    setGameState({
      ...gameState,
      turn: gameState.turn + 1,
      currentPlayer: gameState.currentPlayer === "player1" ? "player2" : "player1",
      phase: "resource",
    });

    toast.success(`Turn ${gameState.turn + 1} begins!`);
  };

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  )!;

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

export default Index;
