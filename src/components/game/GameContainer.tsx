import React, { useState, useEffect } from "react";
import { GameBoard } from "./GameBoard";
import { GameTopBar } from "./GameTopBar";
import { GameControls } from "./GameControls";
import { ResourceDisplay } from "./ResourceDisplay";
import { BuildingMenu } from "./BuildingMenu";
import { RecruitmentMenu } from "./RecruitmentMenu";
import { GameMenus } from "./GameMenus";
import { ErrorScreen } from "./ErrorScreen";
import { Button } from "../ui/button";
import { GameInfoModal } from "./GameInfoModal";
import { toast } from "sonner";

interface GameState {
  phase: "setup" | "playing";
  turn: number;
  currentPlayer: number;
  players: Player[];
  territories: Territory[];
  randomEvents: RandomEvent[];
  gameOver: boolean;
  winner: number | null;
  setupComplete: boolean;
  currentAction: "none" | "build" | "expand" | "attack" | "recruit";
  actionTaken: boolean;
  expandableTerritories: number[];
  lastResourceGain: ResourceGain | null;
}

interface ResourceGain {
  gold: number;
  wood: number;
  stone: number;
  food: number;
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
  hasSelectedStartingTerritory: boolean;
}

interface Territory {
  id: number;
  type: "plains" | "mountains" | "forests" | "coast" | "capital";
  owner: number | null;
  buildings: number[];
  units: number[];
  position: { x: number; y: number };
  adjacentTerritories: number[];
  resources: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  };
}

interface Building {
  id: number;
  type: "lumberMill" | "mine" | "market" | "farm" | "barracks" | "fortress";
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
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [showResourceGain, setShowResourceGain] = useState<boolean>(false);

  useEffect(() => {
    try {
      const boardSize = getBoardSize(settings.playerCount, settings.boardSize);
      const territories = generateTerritories(boardSize);
      
      const players = Array.from({ length: settings.playerCount }, (_, i) => ({
        id: i,
        name: settings.playerNames ? settings.playerNames[i] : `Player ${i + 1}`,
        color: settings.playerColors ? settings.playerColors[i] : getPlayerColor(i),
        resources: {
          gold: 300,
          wood: 100,
          stone: 100,
          food: 100
        },
        territories: [],
        buildings: [],
        units: [],
        hasSelectedStartingTerritory: false
      }));
      
      const initialState: GameState = {
        phase: "setup",
        turn: 1,
        currentPlayer: 0,
        players,
        territories,
        randomEvents: [],
        gameOver: false,
        winner: null,
        setupComplete: false,
        currentAction: "none",
        actionTaken: false,
        expandableTerritories: [],
        lastResourceGain: null
      };
      
      setGameState(initialState);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing game:", err);
      setError("Failed to initialize game. Please try again.");
      setLoading(false);
    }
  }, [settings]);

  const getBoardSize = (playerCount: number, sizePreference: string): number => {
    const baseSizes = {
      small: 5,
      medium: 7,
      large: 9
    };
    
    let playerAdjustment = 0;
    if (playerCount > 2) playerAdjustment = playerCount - 2;
    
    let finalSize = baseSizes[sizePreference as keyof typeof baseSizes] || 7;
    finalSize += playerAdjustment;
    
    return Math.min(finalSize, 13);
  };

  const generateTerritories = (boardSize: number): Territory[] => {
    const territories: Territory[] = [];
    let id = 0;
    
    const radius = Math.floor(boardSize / 2);
    
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      
      for (let r = r1; r <= r2; r++) {
        if (Math.random() < 0.1 && Math.abs(q) > 1 && Math.abs(r) > 1 && Math.abs(-q-r) > 1) {
          continue;
        }
        
        const type = getRandomTerritoryType();
        const resources = generateResourcesForType(type);
        
        territories.push({
          id,
          type,
          owner: null,
          buildings: [],
          units: [],
          position: { 
            x: q, 
            y: r
          },
          adjacentTerritories: [],
          resources
        });
        id++;
      }
    }
    
    for (const territory of territories) {
      const { x, y } = territory.position;
      const directions = [
        { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 },
        { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }
      ];
      
      for (const dir of directions) {
        const adjX = x + dir.x;
        const adjY = y + dir.y;
        
        const adjTerritory = territories.find(
          t => t.position.x === adjX && t.position.y === adjY
        );
        
        if (adjTerritory) {
          territory.adjacentTerritories.push(adjTerritory.id);
        }
      }
    }
    
    return territories;
  };

  const getRandomTerritoryType = (): "plains" | "mountains" | "forests" | "coast" | "capital" => {
    const types = ["plains", "mountains", "forests", "coast"];
    const weights = [0.40, 0.25, 0.25, 0.10];
    
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

  const generateResourcesForType = (type: string): { gold: number; wood: number; stone: number; food: number } => {
    const baseResources = {
      gold: 0,
      wood: 0,
      stone: 0,
      food: 0
    };
    
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    switch (type) {
      case "plains":
        baseResources.food = Math.floor(10 * randomFactor);
        baseResources.wood = Math.floor(5 * randomFactor);
        baseResources.stone = Math.floor(3 * randomFactor);
        baseResources.gold = Math.floor(5 * randomFactor);
        break;
      case "mountains":
        baseResources.stone = Math.floor(15 * randomFactor);
        baseResources.gold = Math.floor(8 * randomFactor);
        baseResources.wood = Math.floor(3 * randomFactor);
        baseResources.food = Math.floor(2 * randomFactor);
        break;
      case "forests":
        baseResources.wood = Math.floor(15 * randomFactor);
        baseResources.food = Math.floor(7 * randomFactor);
        baseResources.stone = Math.floor(3 * randomFactor);
        baseResources.gold = Math.floor(3 * randomFactor);
        break;
      case "coast":
        baseResources.food = Math.floor(12 * randomFactor);
        baseResources.gold = Math.floor(10 * randomFactor);
        baseResources.wood = Math.floor(3 * randomFactor);
        baseResources.stone = Math.floor(2 * randomFactor);
        break;
      case "capital":
        baseResources.gold = 20;
        baseResources.wood = Math.floor(10 * randomFactor);
        baseResources.stone = Math.floor(10 * randomFactor);
        baseResources.food = Math.floor(10 * randomFactor);
        break;
    }
    
    return baseResources;
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

  const canBuildOnTerritory = (territoryId: number): boolean => {
    if (!gameState) return false;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== gameState.currentPlayer) return false;
    
    return territory.buildings.length === 0;
  };

  const canRecruitInTerritory = (territoryId: number): boolean => {
    if (!gameState) return false;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== gameState.currentPlayer) return false;
    
    const hasBarracks = territory.buildings.some(buildingId => {
      const building = gameState.players[gameState.currentPlayer].buildings.find(b => b.id === buildingId);
      return building && building.type === "barracks";
    });
    
    const hasUnits = territory.units.length > 0;
    
    return hasBarracks && !hasUnits;
  };

  const canAttackFromTerritory = (territoryId: number): boolean => {
    if (!gameState) return false;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== gameState.currentPlayer) return false;
    
    if (territory.units.length === 0) return false;
    
    return territory.adjacentTerritories.some(adjId => {
      const adjTerritory = gameState.territories.find(t => t.id === adjId);
      return adjTerritory && adjTerritory.owner !== null && adjTerritory.owner !== gameState.currentPlayer;
    });
  };

  const hasEnemyAdjacentTerritories = (): boolean => {
    if (!gameState) return false;
    
    return gameState.players[gameState.currentPlayer].territories.some(territoryId => {
      const territory = gameState.territories.find(t => t.id === territoryId);
      if (!territory) return false;
      
      return territory.adjacentTerritories.some(adjId => {
        const adjTerritory = gameState.territories.find(t => t.id === adjId);
        return adjTerritory && adjTerritory.owner !== null && adjTerritory.owner !== gameState.currentPlayer;
      });
    });
  };

  const handleTerritorySelect = (territoryId: number) => {
    if (!gameState) return;
    
    if (gameState.phase === "setup") {
      const player = gameState.players[gameState.currentPlayer];
      if (player.hasSelectedStartingTerritory) return;
      
      handleClaimTerritory(territoryId);
      return;
    }
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory) return;
    
    const isOwned = territory.owner === gameState.currentPlayer;
    const isExpandable = gameState.expandableTerritories.includes(territoryId);
    
    if (isOwned) {
      setSelectedTerritory(territoryId);
    } else if (isExpandable && gameState.currentAction === "expand") {
      handleExpandTerritory(territoryId);
    }
  };

  const handleMenuSelect = (menu: string) => {
    if (!gameState || gameState.actionTaken) return;
    
    if (menu === "expand") {
      const expandableTerritories = getExpandableTerritories();
      
      if (expandableTerritories.length === 0) {
        toast.error("No available territories to expand to!");
        return;
      }
      
      const canExpand = hasResourcesForExpansion();
      if (!canExpand) {
        toast.error("Not enough resources to expand! Need 100 Gold and 20 Food.");
        return;
      }
      
      setGameState({
        ...gameState,
        currentAction: "expand",
        expandableTerritories
      });
    } else if (menu === "build") {
      const canBuildAnywhere = gameState.players[gameState.currentPlayer].territories.some(
        territoryId => canBuildOnTerritory(territoryId)
      );
      
      if (!canBuildAnywhere) {
        toast.error("No available territories to build on!");
        return;
      }
      
      if (selectedTerritory !== null && !canBuildOnTerritory(selectedTerritory)) {
        toast.error("Cannot build on this territory!");
        return;
      }
      
      setActiveMenu(menu);
    } else if (menu === "recruit") {
      const canRecruitAnywhere = gameState.players[gameState.currentPlayer].territories.some(
        territoryId => canRecruitInTerritory(territoryId)
      );
      
      if (!canRecruitAnywhere) {
        toast.error("No barracks available to recruit units! Build a barracks first.");
        return;
      }
      
      if (selectedTerritory !== null && !canRecruitInTerritory(selectedTerritory)) {
        toast.error("Cannot recruit in this territory! Need a barracks with no existing units.");
        return;
      }
      
      setActiveMenu(menu);
    } else {
      setActiveMenu(menu);
    }
  };
  
  const hasResourcesForExpansion = (): boolean => {
    if (!gameState) return false;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    return currentPlayer.resources.gold >= 100 && currentPlayer.resources.food >= 20;
  };
  
  const getExpandableTerritories = () => {
    if (!gameState) return [];
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const expandableTerritories: number[] = [];
    
    currentPlayer.territories.forEach(territoryId => {
      const territory = gameState.territories.find(t => t.id === territoryId);
      if (!territory) return;
      
      territory.adjacentTerritories.forEach(adjId => {
        const adjTerritory = gameState.territories.find(t => t.id === adjId);
        if (adjTerritory && adjTerritory.owner === null) {
          if (!expandableTerritories.includes(adjId)) {
            expandableTerritories.push(adjId);
          }
        }
      });
    });
    
    return expandableTerritories;
  };

  const handleExpandTerritory = (territoryId: number) => {
    if (!gameState || !gameState.expandableTerritories.includes(territoryId)) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const canExpand = currentPlayer.resources.gold >= 100 && currentPlayer.resources.food >= 20;
    
    if (canExpand) {
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].resources.gold -= 100;
      updatedPlayers[gameState.currentPlayer].resources.food -= 20;
      updatedPlayers[gameState.currentPlayer].territories.push(territoryId);
      
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
      updatedTerritories[territoryIndex].owner = gameState.currentPlayer;
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories,
        currentAction: "none",
        actionTaken: true,
        expandableTerritories: []
      });
      
      toast.success("Territory expanded successfully!");
    } else {
      toast.error("Not enough resources to expand! Need 100 Gold and 20 Food.");
    }
  };

  const collectResources = (playerId: number) => {
    if (!gameState) return;
    
    const updatedPlayers = [...gameState.players];
    const player = updatedPlayers[playerId];
    
    const resourceGain = {
      gold: 0,
      wood: 0,
      stone: 0,
      food: 0
    };
    
    let capitalCount = 0;
    
    player.territories.forEach(territoryId => {
      const territory = gameState.territories.find(t => t.id === territoryId);
      if (!territory) return;
      
      resourceGain.gold += territory.resources.gold;
      resourceGain.wood += territory.resources.wood;
      resourceGain.stone += territory.resources.stone;
      resourceGain.food += territory.resources.food;
      
      if (territory.type === "capital") {
        capitalCount++;
      }
      
      territory.buildings.forEach(buildingId => {
        const building = player.buildings.find(b => b.id === buildingId);
        if (!building) return;
        
        switch (building.type) {
          case "lumberMill":
            resourceGain.wood += 20;
            break;
          case "mine":
            resourceGain.stone += 20;
            break;
          case "market":
            resourceGain.gold += 20;
            break;
          case "farm":
            resourceGain.food += 8;
            break;
        }
      });
    });
    
    resourceGain.gold += capitalCount * 20;
    
    let foodUpkeep = 0;
    player.units.forEach(unit => {
      switch (unit.type) {
        case "infantry":
          foodUpkeep += 1;
          break;
        case "cavalry":
          foodUpkeep += 2;
          break;
        case "artillery":
          foodUpkeep += 2;
          break;
      }
    });
    
    resourceGain.food -= foodUpkeep;
    
    player.resources.gold += resourceGain.gold;
    player.resources.wood += resourceGain.wood;
    player.resources.stone += resourceGain.stone;
    player.resources.food += resourceGain.food;
    
    player.resources.food = Math.max(0, player.resources.food);
    
    return {
      updatedPlayers,
      resourceGain
    };
  };

  const handleEndTurn = () => {
    if (!gameState) return;
    
    if (gameState.phase === "setup") {
      handleSetupPhaseEndTurn();
      return;
    }
    
    handlePlayingPhaseEndTurn();
  };

  const handleSetupPhaseEndTurn = () => {
    if (!gameState) return;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayer].hasSelectedStartingTerritory = true;
    
    let nextPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    let setupComplete = true;
    
    for (let i = 0; i < gameState.players.length; i++) {
      const playerIndex = (nextPlayer + i) % gameState.players.length;
      if (!updatedPlayers[playerIndex].hasSelectedStartingTerritory) {
        nextPlayer = playerIndex;
        setupComplete = false;
        break;
      }
    }
    
    if (setupComplete) {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        phase: "playing",
        currentPlayer: 0,
        setupComplete: true,
        currentAction: "none",
        actionTaken: false
      });
      
      setTimeout(() => {
        if (gameState) {
          const { updatedPlayers, resourceGain } = collectResources(0) || { updatedPlayers: gameState.players, resourceGain: null };
          setGameState(prevState => prevState ? {
            ...prevState,
            players: updatedPlayers,
            lastResourceGain: resourceGain
          } : null);
          
          if (resourceGain) {
            setShowResourceGain(true);
            setTimeout(() => setShowResourceGain(false), 3000);
          }
        }
      }, 500);
    } else {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        currentPlayer: nextPlayer
      });
    }
    
    setSelectedTerritory(null);
    setActiveMenu(null);
  };

  const handlePlayingPhaseEndTurn = () => {
    if (!gameState) return;
    
    const nextPlayerId = (gameState.currentPlayer + 1) % gameState.players.length;
    const nextTurn = nextPlayerId === 0 ? gameState.turn + 1 : gameState.turn;
    
    let gameOver = false;
    let winner = null;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
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
      gameOver,
      winner,
      currentAction: "none",
      actionTaken: false,
      expandableTerritories: []
    });
    
    setSelectedTerritory(null);
    setActiveMenu(null);
    
    if (!gameOver) {
      setTimeout(() => {
        if (gameState) {
          const { updatedPlayers, resourceGain } = collectResources(nextPlayerId) || { updatedPlayers: gameState.players, resourceGain: null };
          setGameState(prevState => prevState ? {
            ...prevState,
            players: updatedPlayers,
            lastResourceGain: resourceGain
          } : null);
          
          if (resourceGain) {
            setShowResourceGain(true);
            setTimeout(() => setShowResourceGain(false), 3000);
          }
        }
      }, 500);
    }
  };

  const handleBuildStructure = (buildingType: string) => {
    if (!gameState || selectedTerritory === null || gameState.actionTaken) return;
    
    const territory = gameState.territories.find(t => t.id === selectedTerritory);
    if (!territory || territory.owner !== gameState.currentPlayer) return;
    
    if (territory.buildings.length > 0) {
      toast.error("This territory already has a building!");
      return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    let canBuild = false;
    let costMessage = "";
    
    switch (buildingType) {
      case "lumberMill":
        costMessage = "50 Wood, 20 Stone";
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.stone >= 20;
        if (canBuild) {
          currentPlayer.resources.wood -= 50;
          currentPlayer.resources.stone -= 20;
        }
        break;
      case "mine":
        costMessage = "30 Wood, 50 Stone";
        canBuild = currentPlayer.resources.wood >= 30 && currentPlayer.resources.stone >= 50;
        if (canBuild) {
          currentPlayer.resources.wood -= 30;
          currentPlayer.resources.stone -= 50;
        }
        break;
      case "market":
        costMessage = "40 Wood, 40 Stone, 100 Gold";
        canBuild = currentPlayer.resources.wood >= 40 && currentPlayer.resources.stone >= 40 && currentPlayer.resources.gold >= 100;
        if (canBuild) {
          currentPlayer.resources.wood -= 40;
          currentPlayer.resources.stone -= 40;
          currentPlayer.resources.gold -= 100;
        }
        break;
      case "farm":
        costMessage = "50 Wood, 50 Gold";
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.gold >= 50;
        if (canBuild) {
          currentPlayer.resources.wood -= 50;
          currentPlayer.resources.gold -= 50;
        }
        break;
      case "barracks":
        costMessage = "80 Wood, 60 Stone, 150 Gold";
        canBuild = currentPlayer.resources.wood >= 80 && currentPlayer.resources.stone >= 60 && currentPlayer.resources.gold >= 150;
        if (canBuild) {
          currentPlayer.resources.wood -= 80;
          currentPlayer.resources.stone -= 60;
          currentPlayer.resources.gold -= 150;
        }
        break;
      case "fortress":
        costMessage = "50 Wood, 150 Stone, 200 Gold";
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.stone >= 150 && currentPlayer.resources.gold >= 200;
        if (canBuild) {
          currentPlayer.resources.wood -= 50;
          currentPlayer.resources.stone -= 150;
          currentPlayer.resources.gold -= 200;
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
        territories: updatedTerritories,
        currentAction: "build",
        actionTaken: true
      });
      
      setActiveMenu(null);
      toast.success(`Built ${buildingType} successfully!`);
    } else {
      toast.error(`Not enough resources to build! Needs ${costMessage}.`);
    }
  };

  const handleRecruitUnit = (unitType: string) => {
    if (!gameState || selectedTerritory === null || gameState.actionTaken) return;
    
    const territory = gameState.territories.find(t => t.id === selectedTerritory);
    if (!territory || territory.owner !== gameState.currentPlayer) return;
    
    const hasBarracks = territory.buildings.some(buildingId => {
      const building = gameState.players[gameState.currentPlayer].buildings.find(b => b.id === buildingId);
      return building && building.type === "barracks";
    });
    
    if (!hasBarracks) {
      toast.error("Cannot recruit in this territory! Need a barracks first.");
      return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    let canRecruit = false;
    let costMessage = "";
    
    switch (unitType) {
      case "infantry":
        costMessage = "100 Gold, 10 Food";
        canRecruit = currentPlayer.resources.gold >= 100 && currentPlayer.resources.food >= 10;
        if (canRecruit) {
          currentPlayer.resources.gold -= 100;
          currentPlayer.resources.food -= 10;
        }
        break;
      case "cavalry":
        costMessage = "200 Gold, 20 Food";
        canRecruit = currentPlayer.resources.gold >= 200 && currentPlayer.resources.food >= 20;
        if (canRecruit) {
          currentPlayer.resources.gold -= 200;
          currentPlayer.resources.food -= 20;
        }
        break;
      case "artillery":
        costMessage = "300 Gold, 50 Stone, 20 Food";
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
        territories: updatedTerritories,
        currentAction: "recruit",
        actionTaken: true
      });
      
      setActiveMenu(null);
      toast.success(`Recruited ${unitType} successfully!`);
    } else {
      toast.error(`Not enough resources to recruit! Needs ${costMessage}.`);
    }
  };

  const handleClaimTerritory = (territoryId: number) => {
    if (!gameState) return;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== null) return;
    
    if (gameState.phase === "setup") {
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
      
      updatedTerritories[territoryIndex].owner = gameState.currentPlayer;
      updatedTerritories[territoryIndex].type = "capital";
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].territories.push(territoryId);
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories
      });
      
      setTimeout(() => handleEndTurn(), 500);
      return;
    }
  };

  const handleAttackTerritory = (targetTerritoryId: number) => {
    if (!gameState || !selectedTerritory || gameState.actionTaken) return;
    
    const sourceTerritory = gameState.territories.find(t => t.id === selectedTerritory);
    const targetTerritory = gameState.territories.find(t => t.id === targetTerritoryId);
    
    if (!sourceTerritory || !targetTerritory) return;
    if (sourceTerritory.owner !== gameState.currentPlayer) return;
    if (targetTerritory.owner === gameState.currentPlayer) return;
    if (targetTerritory.owner === null) return;
    
    const isAdjacent = sourceTerritory.adjacentTerritories.includes(targetTerritoryId);
    if (!isAdjacent) return;
    
    if (sourceTerritory.units.length === 0) return;
    
    const updatedTerritories = [...gameState.territories];
    const targetIndex = updatedTerritories.findIndex(t => t.id === targetTerritoryId);
    
    const previousOwner = targetTerritory.owner;
    
    updatedTerritories[targetIndex].owner = gameState.currentPlayer;
    
    const updatedPlayers = [...gameState.players];
    
    updatedPlayers[gameState.currentPlayer].territories.push(targetTerritoryId);
    
    const previousOwnerTerritories = updatedPlayers[previousOwner].territories;
    updatedPlayers[previousOwner].territories = previousOwnerTerritories.filter(
      id => id !== targetTerritoryId
    );
    
    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
      currentAction: "attack",
      actionTaken: true
    });
  };
  
  const handleInfoButtonClick = (infoType: string) => {
    setActiveInfoModal(infoType);
  };
  
  const closeInfoModal = () => {
    setActiveInfoModal(null);
  };

  if (error) {
    return <ErrorScreen message={error} onBack={onExitGame} />;
  }

  if (!gameState || loading) {
    return <div className="flex items-center justify-center h-full">Loading game...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const anyEnemyAdjacent = hasEnemyAdjacentTerritories();
  const hasUnits = currentPlayer.units.length > 0;

  return (
    <div className="flex flex-col h-full">
      <GameTopBar 
        turn={gameState.turn} 
        currentPlayer={gameState.currentPlayer}
        playerColor={currentPlayer.color}
        playerName={currentPlayer.name}
        onExitGame={onExitGame}
        phase={gameState.phase}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <GameBoard 
            territories={gameState.territories}
            players={gameState.players}
            selectedTerritory={selectedTerritory}
            onTerritorySelect={handleTerritorySelect}
            onClaimTerritory={handleClaimTerritory}
            onAttackTerritory={handleAttackTerritory}
            currentPlayer={gameState.currentPlayer}
            phase={gameState.phase}
            actionTaken={gameState.actionTaken}
            expandableTerritories={gameState.expandableTerritories}
          />

          {gameState.phase === "setup" && (
            <div className="absolute top-4 left-0 right-0 mx-auto text-center">
              <div className="bg-gray-900 bg-opacity-80 rounded-lg p-4 inline-block">
                <h3 className="text-white font-bold mb-2">Setup Phase</h3>
                <p className="text-gray-300 text-sm">
                  {currentPlayer.name}, select your capital location.
                </p>
              </div>
            </div>
          )}
          
          {showResourceGain && gameState.lastResourceGain && (
            <div className="absolute top-4 left-0 right-0 mx-auto text-center animate-fade-in-out">
              <div className="bg-gray-900 bg-opacity-80 rounded-lg p-4 inline-block">
                <h3 className="text-white font-bold mb-2">Resources Gained</h3>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-yellow-400">
                    <span>Gold: +{gameState.lastResourceGain.gold}</span>
                  </div>
                  <div className="text-green-500">
                    <span>Wood: +{gameState.lastResourceGain.wood}</span>
                  </div>
                  <div className="text-gray-400">
                    <span>Stone: +{gameState.lastResourceGain.stone}</span>
                  </div>
                  <div className="text-red-500">
                    <span>Food: +{gameState.lastResourceGain.food}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-64 bg-gray-900 p-4 flex flex-col">
          <ResourceDisplay 
            resources={currentPlayer.resources}
            resourceGain={showResourceGain ? gameState.lastResourceGain : null}
          />
          
          {gameState.phase === "playing" && (
            <>
              <div className="mb-2 bg-gray-800 rounded-lg p-2">
                <h3 className="text-white text-sm font-bold mb-1">Current Action</h3>
                <p className="text-gray-300 text-xs">
                  {gameState.actionTaken 
                    ? `Action taken: ${gameState.currentAction.charAt(0).toUpperCase() + gameState.currentAction.slice(1)}` 
                    : "No action taken yet"}
                </p>
              </div>

              <GameControls 
                onBuildClick={() => handleMenuSelect("build")}
                onRecruitClick={() => handleMenuSelect("recruit")}
                onExpandClick={() => handleMenuSelect("expand")}
                onEndTurnClick={handleEndTurn}
                disabled={selectedTerritory === null}
                actionTaken={gameState.actionTaken}
                expandMode={gameState.currentAction === "expand"}
                canAttack={hasUnits && anyEnemyAdjacent}
                hasResourcesForExpansion={hasResourcesForExpansion()}
              />
              
              {activeMenu === "build" && (
                <BuildingMenu onSelect={handleBuildStructure} />
              )}
              
              {activeMenu === "recruit" && (
                <RecruitmentMenu onSelect={handleRecruitUnit} />
              )}
            </>
          )}
          
          {gameState.phase === "setup" && (
            <div className="mt-4">
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleEndTurn}
              >
                Skip Turn
              </Button>
            </div>
          )}
          
          <GameMenus onInfoButtonClick={handleInfoButtonClick} />
        </div>
      </div>
      
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Game Over!
            </h2>
            <p className="text-xl text-amber-500 mb-6">
              {gameState.players[gameState.winner || 0].name} wins!
            </p>
            <Button onClick={onExitGame}>
              Return to Menu
            </Button>
          </div>
        </div>
      )}
      
      {activeInfoModal && (
        <GameInfoModal 
          type={activeInfoModal} 
          onClose={closeInfoModal} 
        />
      )}
    </div>
  );
};
