import React from "react";
import { Territory } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { useGameActions } from "@/hooks/useGameActions";
import GameScreen from "./GameScreen";

interface GameContainerProps {
  gameMode: "local" | "online" | null;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameMode }) => {
  const {
    gameState,
    setGameState,
    selectedTerritory,
    setSelectedTerritory,
    handleTerritoryClick,
  } = useGameState(gameMode);

  const {
    handleEndTurn,
    handleEndPhase,
    handleGiveUp,
  } = useGameActions(gameState, setGameState, gameMode, null);

  const handleBuild = (buildingType: string) => {
    if (!gameState || !selectedTerritory) return;

    const buildingCost = {
      lumber_mill: { gold: 50, wood: 20, stone: 0, food: 0 },
      mine: { gold: 50, stone: 20, wood: 0, food: 0 },
      market: { gold: 100, wood: 30, stone: 0, food: 0 },
      farm: { gold: 50, wood: 20, stone: 0, food: 0 },
      road: { wood: 25, stone: 25, gold: 0, food: 0 },
      barracks: { gold: 150, wood: 50, stone: 50, food: 0 },
      fortress: { gold: 300, stone: 150, wood: 0, food: 0 },
    }[buildingType] || { gold: 0, wood: 0, stone: 0, food: 0 };

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    if (currentPlayer.resources.gold < (buildingCost.gold || 0) ||
        currentPlayer.resources.wood < (buildingCost.wood || 0) ||
        currentPlayer.resources.stone < (buildingCost.stone || 0) ||
        currentPlayer.resources.food < (buildingCost.food || 0)) {
      toast.error("Insufficient resources!");
      return;
    }

    const updatedPlayers = gameState.players.map(player => {
      if (player.id === gameState.currentPlayer) {
        return {
          ...player,
          resources: {
            gold: player.resources.gold - (buildingCost.gold || 0),
            wood: player.resources.wood - (buildingCost.wood || 0),
            stone: player.resources.stone - (buildingCost.stone || 0),
            food: player.resources.food - (buildingCost.food || 0),
          },
        };
      }
      return player;
    });

    const updatedTerritories = gameState.territories.map(t => {
      if (t.id === selectedTerritory.id) {
        return {
          ...t,
          building: buildingType,
        };
      }
      return t;
    });

    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
    });

    toast.success(`${buildingType} built!`);
    setSelectedTerritory(null);
  };

  const handleRecruit = (unitType: string) => {
    if (!gameState || !selectedTerritory) return;

    const unitCost = {
      infantry: { gold: 100, food: 1, wood: 0, stone: 0 },
      cavalry: { gold: 200, food: 2, wood: 0, stone: 0 },
      artillery: { gold: 300, food: 2, wood: 0, stone: 0 },
    }[unitType] || { gold: 0, food: 0, wood: 0, stone: 0 };

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    if (currentPlayer.resources.gold < (unitCost.gold || 0) ||
        currentPlayer.resources.food < (unitCost.food || 0)) {
      toast.error("Insufficient resources!");
      return;
    }

    const updatedPlayers = gameState.players.map(player => {
      if (player.id === gameState.currentPlayer) {
        return {
          ...player,
          resources: {
            ...player.resources,
            gold: player.resources.gold - (unitCost.gold || 0),
            food: player.resources.food - (unitCost.food || 0),
          },
          units: {
            ...player.units,
            [unitType]: (player.units[unitType as keyof typeof player.units] || 0) + 1,
          },
        };
      }
      return player;
    });

    setGameState({
      ...gameState,
      players: updatedPlayers,
    });

    toast.success(`${unitType} recruited!`);
    setSelectedTerritory(null);
  };

  if (!gameState) return null;

  return (
    <GameScreen
      gameState={gameState}
      selectedTerritory={selectedTerritory}
      onTerritoryClick={(territory: Territory) => handleTerritoryClick(territory, null)}
      onEndTurn={handleEndTurn}
      onEndPhase={handleEndPhase}
      onBuild={handleBuild}
      onRecruit={handleRecruit}
      onGiveUp={handleGiveUp}
    />
  );
};

export default GameContainer;
