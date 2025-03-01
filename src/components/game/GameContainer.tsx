
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
import { useMediaQuery } from "../../hooks/use-media-query";

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
  attackableTerritories: number[];
  buildableTerritories: number[];
  recruitableTerritories: number[];
  lastResourceGain: ResourceGain | null;
  actionsPerformed: {
    build: boolean;
    recruit: boolean;
    expand: boolean;
    attack: boolean;
  };
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
  const [territoryClaimInProgress, setTerritoryClaimInProgress] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Error messages for why actions can't be performed
  const [errorMessages, setErrorMessages] = useState({
    attack: "No valid targets",
    recruit: "Need barracks",
    build: "No territory selected",
    expand: "Need resources"
  });

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
        attackableTerritories: [],
        buildableTerritories: [],
        recruitableTerritories: [],
        lastResourceGain: null,
        actionsPerformed: {
          build: false,
          recruit: false,
          expand: false,
          attack: false
        }
      };
      
      setGameState(initialState);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing game:", err);
      setError("Failed to initialize game. Please try again.");
      setLoading(false);
    }
  }, [settings]);

  // Update available territories for current action when selectedTerritory changes
  useEffect(() => {
    if (!gameState || gameState.phase !== "playing") return;
    
    // Update buildable and recruitable territories based on selection
    updateActionableTerritories();
  }, [selectedTerritory, gameState?.currentAction]);

  const updateActionableTerritories = () => {
    if (!gameState) return;
    
    // Generate lists of territories where actions can be performed
    const expandableTerritories = getExpandableTerritories();
    const attackableTerritories = getAttackableTerritories();
    
    // Get territories where buildings can be placed (owned and no existing buildings)
    const buildableTerritories = gameState.players[gameState.currentPlayer].territories.filter(
      territoryId => canBuildOnTerritory(territoryId)
    );
    
    // Get territories where units can be recruited (owned, has barracks, has fewer than 2 unit types)
    const recruitableTerritories = gameState.players[gameState.currentPlayer].territories.filter(
      territoryId => canRecruitInTerritory(territoryId)
    );
    
    setGameState(prevState => {
      if (!prevState) return null;
      return {
        ...prevState,
        expandableTerritories,
        attackableTerritories,
        buildableTerritories,
        recruitableTerritories
      };
    });
    
    // Update error messages based on available territories
    const newErrorMessages = {
      attack: hasEnemyAdjacentTerritories() ? 
        (gameState.players[gameState.currentPlayer].units.length > 0 ? 
          "Select your territory first" : "No military units") : 
        "No enemy territories nearby",
      recruit: recruitableTerritories.length > 0 ? 
        "Select territory with barracks" : 
        "Need barracks with space for units",
      build: buildableTerritories.length > 0 ? 
        "Select territory to build on" : 
        "No available territories",
      expand: hasResourcesForExpansion() ? 
        (expandableTerritories.length > 0 ? 
          "Select territory to expand to" : 
          "No available territories") : 
        "Need 100 Gold and 20 Food"
    };
    
    setErrorMessages(newErrorMessages);
  };

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

  const getUnitTypesInTerritory = (territoryId: number): string[] => {
    if (!gameState) return [];
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== gameState.currentPlayer) return [];
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const unitTypes = new Set<string>();
    
    territory.units.forEach(unitId => {
      const unit = currentPlayer.units.find(u => u.id === unitId);
      if (unit) {
        unitTypes.add(unit.type);
      }
    });
    
    return Array.from(unitTypes);
  };

  const canRecruitInTerritory = (territoryId: number): boolean => {
    if (!gameState) return false;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== gameState.currentPlayer) return false;
    
    const hasBarracks = territory.buildings.some(buildingId => {
      const building = gameState.players[gameState.currentPlayer].buildings.find(b => b.id === buildingId);
      return building && building.type === "barracks";
    });
    
    // Check if there's less than 2 unit types already
    const unitTypes = getUnitTypesInTerritory(territoryId);
    const hasSpaceForNewUnitType = unitTypes.length < 2;
    
    return hasBarracks && hasSpaceForNewUnitType;
  };

  const canRecruitUnitTypeInTerritory = (territoryId: number, unitType: string): boolean => {
    if (!gameState) return false;
    
    const unitTypes = getUnitTypesInTerritory(territoryId);
    
    // If no units, can recruit any type
    if (unitTypes.length === 0) return true;
    
    // If one unit type, can only recruit that same type or a new type if less than 2
    if (unitTypes.length === 1) {
      return unitTypes[0] === unitType || unitTypes.length < 2;
    }
    
    // If already 2 types, can only recruit those same types
    return unitTypes.includes(unitType);
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

  const getAttackableTerritories = (): number[] => {
    if (!gameState || !selectedTerritory) return [];
    
    const territory = gameState.territories.find(t => t.id === selectedTerritory);
    if (!territory || territory.owner !== gameState.currentPlayer || territory.units.length === 0) return [];
    
    // Return adjacent enemy territories
    return territory.adjacentTerritories.filter(adjId => {
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
    
    // Update selected territory based on current action
    setSelectedTerritory(territoryId);
  };

  const handleMenuSelect = (menu: string) => {
    if (!gameState || gameState.actionTaken) return;
    
    // Check if action has already been performed
    if (gameState.actionsPerformed[menu as keyof typeof gameState.actionsPerformed]) {
      toast.error(`You've already performed a ${menu} action this turn`);
      return;
    }
    
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
      
      setGameState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentAction: "expand",
          expandableTerritories
        };
      });
    } else if (menu === "build") {
      const buildableTerritories = gameState.players[gameState.currentPlayer].territories.filter(
        territoryId => canBuildOnTerritory(territoryId)
      );
      
      if (buildableTerritories.length === 0) {
        toast.error("No available territories to build on!");
        return;
      }
      
      setGameState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentAction: "build",
          buildableTerritories
        };
      });
      
      setActiveMenu("build");
    } else if (menu === "recruit") {
      const recruitableTerritories = gameState.players[gameState.currentPlayer].territories.filter(
        territoryId => canRecruitInTerritory(territoryId)
      );
      
      if (recruitableTerritories.length === 0) {
        toast.error("No barracks available to recruit units! Build a barracks first.");
        return;
      }
      
      setGameState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentAction: "recruit",
          recruitableTerritories
        };
      });
      
      setActiveMenu("recruit");
    } else if (menu === "attack") {
      // For attack, we first need to select a territory that has military units
      const territoriesWithUnits = gameState.players[gameState.currentPlayer].territories.filter(territoryId => {
        const territory = gameState.territories.find(t => t.id === territoryId);
        return territory && territory.units.length > 0;
      });
      
      if (territoriesWithUnits.length === 0) {
        toast.error("No military units available! Recruit units first.");
        return;
      }
      
      if (!hasEnemyAdjacentTerritories()) {
        toast.error("No enemy territories nearby to attack!");
        return;
      }
      
      setGameState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentAction: "attack"
        };
      });
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
    
    // Check if expand action has already been performed
    if (gameState.actionsPerformed.expand) {
      toast.error("You've already expanded this turn");
      return;
    }
    
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
      
      const updatedActionsPerformed = {
        ...gameState.actionsPerformed,
        expand: true
      };
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories,
        currentAction: "none",
        actionsPerformed: updatedActionsPerformed,
        expandableTerritories: []
      });
      
      setSelectedTerritory(null);
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
    
    // Record if food was negative for unit health reduction
    const foodDeficit = player.resources.food < 0;
    
    // Ensure resources don't go below 0
    player.resources.food = Math.max(0, player.resources.food);
    
    // If food was negative, reduce unit health by 20
    if (foodDeficit) {
      // Apply food shortage penalties to units
      const updatedUnits = player.units.map(unit => ({
        ...unit,
        health: Math.max(0, unit.health - 20)
      }));
      
      // Filter out dead units
      const aliveUnits = updatedUnits.filter(unit => unit.health > 0);
      
      // Update territories to remove dead units
      if (aliveUnits.length < player.units.length) {
        toast.error(`Player ${player.name} lost units due to food shortage!`);
        
        // Update territories
        const updatedTerritories = [...gameState.territories];
        updatedTerritories.forEach(territory => {
          if (territory.owner === player.id) {
            territory.units = territory.units.filter(unitId => {
              const unit = aliveUnits.find(u => u.id === unitId);
              return unit !== undefined;
            });
          }
        });
        
        player.units = aliveUnits;
        
        return {
          updatedPlayers,
          updatedTerritories,
          resourceGain
        };
      }
      
      player.units = updatedUnits;
    }
    
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
        actionTaken: false,
        actionsPerformed: {
          build: false,
          recruit: false,
          expand: false,
          attack: false
        }
      });
      
      setTimeout(() => {
        if (gameState) {
          const result = collectResources(0);
          if (result) {
            const { updatedPlayers, updatedTerritories, resourceGain } = result;
            
            setGameState(prevState => {
              if (!prevState) return null;
              return {
                ...prevState,
                players: updatedPlayers,
                territories: updatedTerritories || prevState.territories,
                lastResourceGain: resourceGain
              };
            });
            
            if (resourceGain) {
              setShowResourceGain(true);
              setTimeout(() => setShowResourceGain(false), 3000);
            }
          }
        }
      }, 500);
    } else {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        currentPlayer: nextPlayer,
        actionTaken: false
      });
    }
    
    setSelectedTerritory(null);
    setActiveMenu(null);
    setTerritoryClaimInProgress(false);
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
      expandableTerritories: [],
      attackableTerritories: [],
      buildableTerritories: [],
      recruitableTerritories: [],
      actionsPerformed: {
        build: false,
        recruit: false,
        expand: false,
        attack: false
      }
    });
    
    setSelectedTerritory(null);
    setActiveMenu(null);
    
    if (!gameOver) {
      setTimeout(() => {
        if (gameState) {
          const result = collectResources(nextPlayerId);
          if (result) {
            const { updatedPlayers, updatedTerritories, resourceGain } = result;
            
            setGameState(prevState => {
              if (!prevState) return null;
              return {
                ...prevState,
                players: updatedPlayers,
                territories: updatedTerritories || prevState.territories,
                lastResourceGain: resourceGain
              };
            });
            
            if (resourceGain) {
              setShowResourceGain(true);
              setTimeout(() => setShowResourceGain(false), 3000);
            }
          }
        }
      }, 500);
    }
  };

  const handleBuildStructure = (buildingType: string) => {
    if (!gameState || selectedTerritory === null) return;
    
    // Check if build action has already been performed
    if (gameState.actionsPerformed.build) {
      toast.error("You've already built this turn");
      return;
    }
    
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
      
      const updatedActionsPerformed = {
        ...gameState.actionsPerformed,
        build: true
      };
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories,
        currentAction: "none",
        actionsPerformed: updatedActionsPerformed,
        buildableTerritories: []
      });
      
      setActiveMenu(null);
      setSelectedTerritory(null);
      toast.success(`Built ${buildingType} successfully!`);
    } else {
      toast.error(`Not enough resources to build! Needs ${costMessage}.`);
    }
  };

  const handleRecruitUnit = (unitType: string) => {
    if (!gameState || selectedTerritory === null) return;
    
    // Check if recruit action has already been performed
    if (gameState.actionsPerformed.recruit) {
      toast.error("You've already recruited this turn");
      return;
    }
    
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
    
    // Check unit type constraints
    const unitTypes = getUnitTypesInTerritory(selectedTerritory);
    if (unitTypes.length >= 2 && !unitTypes.includes(unitType)) {
      toast.error("Cannot recruit more than 2 different unit types in a territory.");
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
      
      const updatedActionsPerformed = {
        ...gameState.actionsPerformed,
        recruit: true
      };
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories,
        currentAction: "none",
        actionsPerformed: updatedActionsPerformed,
        recruitableTerritories: []
      });
      
      setActiveMenu(null);
      setSelectedTerritory(null);
      toast.success(`Recruited ${unitType} successfully!`);
    } else {
      toast.error(`Not enough resources to recruit! Needs ${costMessage}.`);
    }
  };

  const handleClaimTerritory = (territoryId: number) => {
    if (!gameState || territoryClaimInProgress) return;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== null) return;
    
    if (gameState.phase === "setup") {
      // Set flag to prevent double-clicking
      setTerritoryClaimInProgress(true);
      
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
      
      updatedTerritories[territoryIndex].owner = gameState.currentPlayer;
      updatedTerritories[territoryIndex].type = "capital";
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].territories.push(territoryId);
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        territories: updatedTerritories,
        actionTaken: true
      });
      
      setTimeout(() => handleEndTurn(), 500);
      return;
    }
  };

  const handleAttackTerritory = (targetTerritoryId: number) => {
    if (!gameState || !selectedTerritory) return;
    
    // Check if attack action has already been performed
    if (gameState.actionsPerformed.attack) {
      toast.error("You've already attacked this turn");
      return;
    }
    
    const sourceTerritory = gameState.territories.find(t => t.id === selectedTerritory);
    const targetTerritory = gameState.territories.find(t => t.id === targetTerritoryId);
    
    if (!sourceTerritory || !targetTerritory) return;
    if (sourceTerritory.owner !== gameState.currentPlayer) return;
    if (targetTerritory.owner === gameState.currentPlayer) return;
    if (targetTerritory.owner === null) return;
    
    const isAdjacent = sourceTerritory.adjacentTerritories.includes(targetTerritoryId);
    if (!isAdjacent) {
      toast.error("Can only attack adjacent territories!");
      return;
    }
    
    if (sourceTerritory.units.length === 0) {
      toast.error("Need military units to attack!");
      return;
    }
    
    // Calculate attack power from source territory
    let attackPower = 0;
    const attacker = gameState.players[gameState.currentPlayer];
    
    sourceTerritory.units.forEach(unitId => {
      const unit = attacker.units.find(u => u.id === unitId);
      if (!unit) return;
      
      switch(unit.type) {
        case "infantry": 
          attackPower += 10;
          break;
        case "cavalry": 
          attackPower += 15;
          break;
        case "artillery": 
          attackPower += 25;
          break;
      }
    });
    
    // Calculate defense power from target territory
    let defenseHealth = 0;
    const defenderId = targetTerritory.owner;
    const defender = gameState.players[defenderId];
    
    targetTerritory.units.forEach(unitId => {
      const unit = defender.units.find(u => u.id === unitId);
      if (!unit) return;
      defenseHealth += unit.health;
    });
    
    // Add fortress bonus if present
    const hasFortress = targetTerritory.buildings.some(buildingId => {
      const building = defender.buildings.find(b => b.id === buildingId);
      return building && building.type === "fortress";
    });
    
    if (hasFortress) {
      defenseHealth += 50; // Fortress bonus
    }
    
    // Resolve combat
    const updatedTerritories = [...gameState.territories];
    const targetIndex = updatedTerritories.findIndex(t => t.id === targetTerritoryId);
    const updatedPlayers = [...gameState.players];
    
    if (attackPower > defenseHealth) {
      // Attacker wins
      // Transfer territory ownership
      updatedTerritories[targetIndex].owner = gameState.currentPlayer;
      
      // Remove defender's units from this territory
      updatedTerritories[targetIndex].units = [];
      
      // Update player territory lists
      updatedPlayers[gameState.currentPlayer].territories.push(targetTerritoryId);
      updatedPlayers[defenderId].territories = updatedPlayers[defenderId].territories.filter(
        id => id !== targetTerritoryId
      );
      
      // Remove defender's units tied to this territory
      updatedPlayers[defenderId].units = updatedPlayers[defenderId].units.filter(
        unit => unit.territoryId !== targetTerritoryId
      );
      
      toast.success(`Attack successful! Territory captured.`);
    } else {
      // Defender wins or tie (defender has advantage)
      // Reduce defender units' health
      targetTerritory.units.forEach(unitId => {
        const unitIndex = updatedPlayers[defenderId].units.findIndex(u => u.id === unitId);
        if (unitIndex === -1) return;
        
        // Distribute damage proportionally
        const unit = updatedPlayers[defenderId].units[unitIndex];
        const damageRatio = attackPower / defenseHealth;
        const damage = Math.floor(unit.health * damageRatio);
        unit.health -= damage;
        
        // Remove dead units
        if (unit.health <= 0) {
          updatedPlayers[defenderId].units.splice(unitIndex, 1);
          updatedTerritories[targetIndex].units = updatedTerritories[targetIndex].units.filter(
            id => id !== unitId
          );
        }
      });
      
      toast.error(`Attack failed! Defender maintains control.`);
    }
    
    // Mark attack action as performed
    const updatedActionsPerformed = {
      ...gameState.actionsPerformed,
      attack: true
    };
    
    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
      currentAction: "none",
      actionsPerformed: updatedActionsPerformed,
      attackableTerritories: []
    });
    
    setSelectedTerritory(null);
  };
  
  const handleInfoButtonClick = (infoType: string) => {
    setActiveInfoModal(infoType);
  };
  
  const closeInfoModal = () => {
    setActiveInfoModal(null);
  };
  
  const handleAttackClick = () => {
    handleMenuSelect("attack");
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
  const canRecruit = gameState.players[gameState.currentPlayer].territories.some(
    territoryId => canRecruitInTerritory(territoryId)
  );
  const canBuild = gameState.players[gameState.currentPlayer].territories.some(
    territoryId => canBuildOnTerritory(territoryId)
  );

  return (
    <div className={`flex flex-col h-full ${isMobile ? "text-sm" : ""}`}>
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
            attackableTerritories={gameState.attackableTerritories}
            buildableTerritories={gameState.buildableTerritories}
            recruitableTerritories={gameState.recruitableTerritories}
            currentAction={gameState.currentAction}
            actionsPerformed={gameState.actionsPerformed}
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
        
        <div className={`${isMobile ? "w-48" : "w-64"} bg-gray-900 p-4 flex flex-col`}>
          <ResourceDisplay 
            resources={currentPlayer.resources}
            resourceGain={showResourceGain ? gameState.lastResourceGain : null}
          />
          
          {gameState.phase === "playing" && (
            <>
              <div className="mb-2 bg-gray-800 rounded-lg p-2">
                <h3 className="text-white text-sm font-bold mb-1">Current Action</h3>
                <p className="text-gray-300 text-xs">
                  {Object.values(gameState.actionsPerformed).some(Boolean) ? 
                    `Actions performed: ${Object.entries(gameState.actionsPerformed)
                      .filter(([_, performed]) => performed)
                      .map(([action]) => action.charAt(0).toUpperCase() + action.slice(1))
                      .join(', ')}` : 
                    "No actions taken yet"}
                </p>
              </div>

              <GameControls 
                onBuildClick={() => handleMenuSelect("build")}
                onRecruitClick={() => handleMenuSelect("recruit")}
                onExpandClick={() => handleMenuSelect("expand")}
                onAttackClick={handleAttackClick}
                onEndTurnClick={handleEndTurn}
                disabled={selectedTerritory === null}
                actionTaken={gameState.actionTaken}
                expandMode={gameState.currentAction === "expand"}
                attackMode={gameState.currentAction === "attack"}
                canAttack={hasUnits && anyEnemyAdjacent}
                hasResourcesForExpansion={hasResourcesForExpansion()}
                canRecruit={canRecruit}
                canBuild={canBuild}
                actionsPerformed={gameState.actionsPerformed}
                errorMessages={errorMessages}
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
                disabled={territoryClaimInProgress}
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
