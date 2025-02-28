import React, { useState, useEffect } from "react";
import { GameBoard } from "./GameBoard";
import { GameTopBar } from "./GameTopBar";
import { GameControls } from "./GameControls";
import { ResourceDisplay } from "./ResourceDisplay";
import { BuildingMenu } from "./BuildingMenu";
import { RecruitmentMenu } from "./RecruitmentMenu";
import { GameMenus } from "./GameMenus";
import { ErrorScreen } from "./ErrorScreen";

interface GameState {
  turn: number;
  currentPlayer: number;
  players: Player[];
  territories: Territory[];
  randomEvents: RandomEvent[];
  gameOver: boolean;
  winner: number | null;
}

interface Player {
  id: number;
  name: string;
  color: string;
  resources: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  };
  territories: number[];
  buildings: Building[];
  units: Unit[];
}

interface Territory {
  id: number;
  type: "plains" | "mountains" | "forests" | "coast" | "capital";
  owner: number | null;
  buildings: number[];
  units: number[];
  position: { x: number; y: number };
}

interface Building {
  id: number;
  type: "lumberMill" | "mine" | "market" | "farm" | "barracks" | "fortress" | "road";
  territoryId: number;
}

interface Unit {
  id: number;
  type: "infantry" | "cavalry" | "artillery";
  territoryId: number;
  health: number;
  experience: number;
}

interface RandomEvent {
  id: number;
  type: string;
  description: string;
  duration: number;
  affectedPlayer: number | null;
  affectedTerritory: number | null;
  effect: any;
}

export const GameContainer: React.FC<{
  settings: any;
  onExitGame: () => void;
}> = ({ settings, onExitGame }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const territories = generateTerritories(settings.boardSize);
      
      const players = Array.from({ length: settings.playerCount }, (_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        color: getPlayerColor(i),
        resources: {
          gold: 500,
          wood: 200,
          stone: 100,
          food: 50
        },
        territories: [],
        buildings: [],
        units: []
      }));
      
      const initialState: GameState = {
        turn: 1,
        currentPlayer: 0,
        players,
        territories,
        randomEvents: [],
        gameOver: false,
        winner: null
      };
      
      setGameState(initialState);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing game:", err);
      setError("Failed to initialize game. Please try again.");
      setLoading(false);
    }
  }, [settings]);

  const generateTerritories = (boardSize: string): Territory[] => {
    let gridSize;
    switch (boardSize) {
      case "small":
        gridSize = 5;
        break;
      case "medium":
        gridSize = 7;
        break;
      case "large":
        gridSize = 10;
        break;
      default:
        gridSize = 7;
    }
    
    const territories: Territory[] = [];
    let id = 0;
    
    for (let q = -Math.floor(gridSize/2); q <= Math.floor(gridSize/2); q++) {
      const r1 = Math.max(-Math.floor(gridSize/2), -q - Math.floor(gridSize/2));
      const r2 = Math.min(Math.floor(gridSize/2), -q + Math.floor(gridSize/2));
      
      for (let r = r1; r <= r2; r++) {
        const type = getRandomTerritoryType();
        territories.push({
          id,
          type,
          owner: null,
          buildings: [],
          units: [],
          position: { 
            x: q * 1.5, 
            y: (r + q/2) * Math.sqrt(3)
          }
        });
        id++;
      }
    }
    
    return territories;
  };

  const getRandomTerritoryType = (): "plains" | "mountains" | "forests" | "coast" | "capital" => {
    const types = ["plains", "mountains", "forests", "coast"];
    const weights = [0.4, 0.2, 0.3, 0.1];
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulativeWeight += weights[i];
      if (random < cumulativeWeight) {
        return types[i] as any;
      }
    }
    
    return "plains";
  };

  const getPlayerColor = (index: number): string => {
    const colors = [
      "#FF5733",
      "#33A1FF",
      "#33FF57",
      "#F333FF",
      "#FFD433",
      "#33FFF6"
    ];
    
    return colors[index % colors.length];
  };

  const handleTerritorySelect = (territoryId: number) => {
    setSelectedTerritory(territoryId);
  };

  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleEndTurn = () => {
    if (!gameState) return;
    
    const nextPlayerId = (gameState.currentPlayer + 1) % gameState.players.length;
    const nextTurn = nextPlayerId === 0 ? gameState.turn + 1 : gameState.turn;
    
    const updatedPlayers = [...gameState.players];
    const currentPlayer = updatedPlayers[gameState.currentPlayer];
    
    currentPlayer.territories.forEach(territoryId => {
      const territory = gameState.territories.find(t => t.id === territoryId);
      if (!territory) return;
      
      switch (territory.type) {
        case "plains":
          currentPlayer.resources.gold += 10;
          currentPlayer.resources.wood += 5;
          currentPlayer.resources.stone += 5;
          currentPlayer.resources.food += 8;
          break;
        case "mountains":
          currentPlayer.resources.stone += 15;
          currentPlayer.resources.gold += 8;
          currentPlayer.resources.wood += 2;
          currentPlayer.resources.food += 3;
          break;
        case "forests":
          currentPlayer.resources.wood += 15;
          currentPlayer.resources.food += 5;
          currentPlayer.resources.gold += 5;
          currentPlayer.resources.stone += 3;
          break;
        case "coast":
          currentPlayer.resources.gold += 15;
          currentPlayer.resources.food += 10;
          currentPlayer.resources.wood += 3;
          currentPlayer.resources.stone += 2;
          break;
        case "capital":
          currentPlayer.resources.gold += 20;
          currentPlayer.resources.wood += 10;
          currentPlayer.resources.stone += 10;
          currentPlayer.resources.food += 15;
          break;
      }
      
      territory.buildings.forEach(buildingId => {
        const building = currentPlayer.buildings.find(b => b.id === buildingId);
        if (!building) return;
        
        switch (building.type) {
          case "lumberMill":
            currentPlayer.resources.wood += 20;
            break;
          case "mine":
            currentPlayer.resources.stone += 20;
            break;
          case "market":
            currentPlayer.resources.gold += 20;
            break;
          case "farm":
            currentPlayer.resources.food += 8;
            break;
        }
      });
    });
    
    currentPlayer.units.forEach(unit => {
      switch (unit.type) {
        case "infantry":
          currentPlayer.resources.food -= 1;
          break;
        case "cavalry":
          currentPlayer.resources.food -= 2;
          break;
        case "artillery":
          currentPlayer.resources.food -= 2;
          break;
      }
    });
    
    let gameOver = false;
    let winner = null;
    
    const totalTerritories = gameState.territories.length;
    const controlledTerritories = currentPlayer.territories.length;
    
    if ((controlledTerritories / totalTerritories) >= 0.75) {
      gameOver = true;
      winner = gameState.currentPlayer;
    }
    
    if (currentPlayer.resources.gold >= 10000) {
      gameOver = true;
      winner = gameState.currentPlayer;
    }
    
    setGameState({
      ...gameState,
      turn: nextTurn,
      currentPlayer: nextPlayerId,
      players: updatedPlayers,
      gameOver,
      winner
    });
    
    setSelectedTerritory(null);
    setActiveMenu(null);
  };

  const handleBuildStructure = (buildingType: string) => {
    if (!gameState || selectedTerritory === null) return;
    
    const territory = gameState.territories.find(t => t.id === selectedTerritory);
    if (!territory || territory.owner !== gameState.currentPlayer) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    let canBuild = false;
    
    switch (buildingType) {
      case "lumberMill":
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.stone >= 20;
        if (canBuild) {
          currentPlayer.resources.wood -= 50;
          currentPlayer.resources.stone -= 20;
        }
        break;
      case "mine":
        canBuild = currentPlayer.resources.wood >= 30 && currentPlayer.resources.stone >= 50;
        if (canBuild) {
          currentPlayer.resources.wood -= 30;
          currentPlayer.resources.stone -= 50;
        }
        break;
      case "market":
        canBuild = currentPlayer.resources.wood >= 40 && currentPlayer.resources.stone >= 40 && currentPlayer.resources.gold >= 100;
        if (canBuild) {
          currentPlayer.resources.wood -= 40;
          currentPlayer.resources.stone -= 40;
          currentPlayer.resources.gold -= 100;
        }
        break;
      case "farm":
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.gold >= 50;
        if (canBuild) {
          currentPlayer.resources.wood -= 50;
          currentPlayer.resources.gold -= 50;
        }
        break;
      case "barracks":
        canBuild = currentPlayer.resources.wood >= 80 && currentPlayer.resources.stone >= 60 && currentPlayer.resources.gold >= 150;
        if (canBuild) {
          currentPlayer.resources.wood -= 80;
          currentPlayer.resources.stone -= 60;
          currentPlayer.resources.gold -= 150;
        }
        break;
      case "fortress":
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.stone >= 150 && currentPlayer.resources.gold >= 200;
        if (canBuild) {
          currentPlayer.resources.wood -= 50;
          currentPlayer.resources.stone -= 150;
          currentPlayer.resources.gold -= 200;
        }
        break;
      case "road":
        canBuild = currentPlayer.resources.stone >= 30 && currentPlayer.resources.gold >= 50;
        if (canBuild) {
          currentPlayer.resources.stone -= 30;
          currentPlayer.resources.gold -= 50;
        }
        break;
    }
    
    if (canBuild) {
      const buildingId = Date.now();
      const newBuilding: Building = {
        id: buildingId,
        type: buildingType as any,
        territoryId: selectedTerritory
      };
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].buildings.push(newBuilding);
      
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === selectedTerritory);
      updatedTerritories[territoryIndex].buildings.push(buildingId);
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories
      });
      
      setActiveMenu(null);
    }
  };

  const handleRecruitUnit = (unitType: string) => {
    if (!gameState || selectedTerritory === null) return;
    
    const territory = gameState.territories.find(t => t.id === selectedTerritory);
    if (!territory || territory.owner !== gameState.currentPlayer) return;
    
    const hasBarracks = territory.buildings.some(buildingId => {
      const building = gameState.players[gameState.currentPlayer].buildings.find(b => b.id === buildingId);
      return building && building.type === "barracks";
    });
    
    if (!hasBarracks && unitType !== "settler") return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    let canRecruit = false;
    
    switch (unitType) {
      case "infantry":
        canRecruit = currentPlayer.resources.gold >= 100 && currentPlayer.resources.food >= 10;
        if (canRecruit) {
          currentPlayer.resources.gold -= 100;
          currentPlayer.resources.food -= 10;
        }
        break;
      case "cavalry":
        canRecruit = currentPlayer.resources.gold >= 200 && currentPlayer.resources.food >= 20;
        if (canRecruit) {
          currentPlayer.resources.gold -= 200;
          currentPlayer.resources.food -= 20;
        }
        break;
      case "artillery":
        canRecruit = currentPlayer.resources.gold >= 300 && currentPlayer.resources.stone >= 50 && currentPlayer.resources.food >= 20;
        if (canRecruit) {
          currentPlayer.resources.gold -= 300;
          currentPlayer.resources.stone -= 50;
          currentPlayer.resources.food -= 20;
        }
        break;
    }
    
    if (canRecruit) {
      const unitId = Date.now();
      const newUnit: Unit = {
        id: unitId,
        type: unitType as any,
        territoryId: selectedTerritory,
        health: 100,
        experience: 0
      };
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].units.push(newUnit);
      
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === selectedTerritory);
      updatedTerritories[territoryIndex].units.push(unitId);
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories
      });
      
      setActiveMenu(null);
    }
  };

  const handleClaimTerritory = (territoryId: number) => {
    if (!gameState) return;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== null) return;
    
    const hasAdjacentUnit = false;
    
    if (hasAdjacentUnit || gameState.turn <= 2) {
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
      updatedTerritories[territoryIndex].owner = gameState.currentPlayer;
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].territories.push(territoryId);
      
      if (updatedPlayers[gameState.currentPlayer].territories.length === 1) {
        updatedTerritories[territoryIndex].type = "capital";
      }
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories
      });
    }
  };

  if (error) {
    return <ErrorScreen message={error} onBack={onExitGame} />;
  }

  if (!gameState || loading) {
    return <div className="flex items-center justify-center h-full">Loading game...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <GameTopBar 
        turn={gameState.turn} 
        currentPlayer={gameState.currentPlayer}
        playerColor={gameState.players[gameState.currentPlayer].color}
        playerName={gameState.players[gameState.currentPlayer].name}
        onExitGame={onExitGame}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <GameBoard 
            territories={gameState.territories}
            players={gameState.players}
            selectedTerritory={selectedTerritory}
            onTerritorySelect={handleTerritorySelect}
            onClaimTerritory={handleClaimTerritory}
            currentPlayer={gameState.currentPlayer}
          />
        </div>
        
        <div className="w-64 bg-gray-900 p-4 flex flex-col">
          <ResourceDisplay 
            resources={gameState.players[gameState.currentPlayer].resources} 
          />
          
          <GameControls 
            onBuildClick={() => handleMenuSelect("build")}
            onRecruitClick={() => handleMenuSelect("recruit")}
            onEndTurnClick={handleEndTurn}
            disabled={selectedTerritory === null}
          />
          
          {activeMenu === "build" && (
            <BuildingMenu onSelect={handleBuildStructure} />
          )}
          
          {activeMenu === "recruit" && (
            <RecruitmentMenu onSelect={handleRecruitUnit} />
          )}
          
          <GameMenus />
        </div>
      </div>
      
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Game Over!
            </h2>
            <p className="text-xl text-amber-500 mb-6">
              Player {gameState.winner! + 1} wins!
            </p>
            <Button onClick={onExitGame}>
              Return to Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
