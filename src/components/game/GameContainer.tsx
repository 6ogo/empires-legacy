
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
    
    // Allow building on any owned territory
    return true;
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
      
      // Make sure to close any menu that might be open
      setActiveMenu(null);
    } else if (menu === "build") {
      const buildableTerritories = gameState.players[gameState.currentPlayer].territories;
      
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
  
    const currentPlayer = gameState.players[gameState.currentPlayer];
    let canBuild = false;
    let costMessage = "";
    
    switch (buildingType) {
      case "lumberMill":
        costMessage = "50 Wood, 20 Stone";
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.stone >= 20;
        break;
      case "mine":
        costMessage = "50 Wood, 20 Stone";
        canBuild = currentPlayer.resources.wood >= 50 && currentPlayer.resources.stone >= 20;
        break;
      case "farm":
        costMessage = "30 Wood";
        canBuild = currentPlayer.resources.wood >= 30;
        break;
      case "market":
        costMessage = "50 Wood, 30 Stone, 50 Gold";
        canBuild = currentPlayer.resources.wood >= 50 && 
                currentPlayer.resources.stone >= 30 && 
                currentPlayer.resources.gold >= 50;
        break;
      case "barracks":
        costMessage = "80 Wood, 40 Stone, 100 Gold";
        canBuild = currentPlayer.resources.wood >= 80 && 
                currentPlayer.resources.stone >= 40 && 
                currentPlayer.resources.gold >= 100;
        break;
      case "fortress":
        costMessage = "120 Wood, 160 Stone, 200 Gold";
        canBuild = currentPlayer.resources.wood >= 120 && 
                currentPlayer.resources.stone >= 160 && 
                currentPlayer.resources.gold >= 200;
        break;
    }
    
    if (!canBuild) {
      toast.error(`Not enough resources to build! Need ${costMessage}.`);
      return;
    }
    
    // Deduct resources
    const updatedPlayers = [...gameState.players];
    
    switch (buildingType) {
      case "lumberMill":
        updatedPlayers[gameState.currentPlayer].resources.wood -= 50;
        updatedPlayers[gameState.currentPlayer].resources.stone -= 20;
        break;
      case "mine":
        updatedPlayers[gameState.currentPlayer].resources.wood -= 50;
        updatedPlayers[gameState.currentPlayer].resources.stone -= 20;
        break;
      case "farm":
        updatedPlayers[gameState.currentPlayer].resources.wood -= 30;
        break;
      case "market":
        updatedPlayers[gameState.currentPlayer].resources.wood -= 50;
        updatedPlayers[gameState.currentPlayer].resources.stone -= 30;
        updatedPlayers[gameState.currentPlayer].resources.gold -= 50;
        break;
      case "barracks":
        updatedPlayers[gameState.currentPlayer].resources.wood -= 80;
        updatedPlayers[gameState.currentPlayer].resources.stone -= 40;
        updatedPlayers[gameState.currentPlayer].resources.gold -= 100;
        break;
      case "fortress":
        updatedPlayers[gameState.currentPlayer].resources.wood -= 120;
        updatedPlayers[gameState.currentPlayer].resources.stone -= 160;
        updatedPlayers[gameState.currentPlayer].resources.gold -= 200;
        break;
    }
    
    // Create building
    const newBuildingId = Math.max(0, ...currentPlayer.buildings.map(b => b.id)) + 1;
    
    const newBuilding: Building = {
      id: newBuildingId,
      type: buildingType as any,
      territoryId: selectedTerritory
    };
    
    updatedPlayers[gameState.currentPlayer].buildings.push(newBuilding);
    
    // Update territory
    const updatedTerritories = [...gameState.territories];
    const territoryIndex = updatedTerritories.findIndex(t => t.id === selectedTerritory);
    updatedTerritories[territoryIndex].buildings.push(newBuildingId);
    
    const updatedActionsPerformed = {
      ...gameState.actionsPerformed,
      build: true
    };
    
    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
      currentAction: "none",
      actionsPerformed: updatedActionsPerformed
    });
    
    setActiveMenu(null);
    toast.success(`${buildingType} built successfully!`);
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
    
    if (!canRecruitInTerritory(selectedTerritory)) {
      toast.error("Cannot recruit in this territory - needs a barracks and space for units.");
      return;
    }
    
    if (!canRecruitUnitTypeInTerritory(selectedTerritory, unitType)) {
      toast.error("Cannot recruit this unit type - already have 2 different unit types.");
      return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    let canRecruit = false;
    let costMessage = "";
    
    switch (unitType) {
      case "infantry":
        costMessage = "50 Food, 30 Gold";
        canRecruit = currentPlayer.resources.food >= 50 && currentPlayer.resources.gold >= 30;
        break;
      case "cavalry":
        costMessage = "80 Food, 70 Gold";
        canRecruit = currentPlayer.resources.food >= 80 && currentPlayer.resources.gold >= 70;
        break;
      case "artillery":
        costMessage = "60 Food, 50 Gold, 30 Wood, 20 Stone";
        canRecruit = currentPlayer.resources.food >= 60 && 
                  currentPlayer.resources.gold >= 50 &&
                  currentPlayer.resources.wood >= 30 &&
                  currentPlayer.resources.stone >= 20;
        break;
    }
    
    if (!canRecruit) {
      toast.error(`Not enough resources to recruit! Need ${costMessage}.`);
      return;
    }
    
    // Deduct resources
    const updatedPlayers = [...gameState.players];
    
    switch (unitType) {
      case "infantry":
        updatedPlayers[gameState.currentPlayer].resources.food -= 50;
        updatedPlayers[gameState.currentPlayer].resources.gold -= 30;
        break;
      case "cavalry":
        updatedPlayers[gameState.currentPlayer].resources.food -= 80;
        updatedPlayers[gameState.currentPlayer].resources.gold -= 70;
        break;
      case "artillery":
        updatedPlayers[gameState.currentPlayer].resources.food -= 60;
        updatedPlayers[gameState.currentPlayer].resources.gold -= 50;
        updatedPlayers[gameState.currentPlayer].resources.wood -= 30;
        updatedPlayers[gameState.currentPlayer].resources.stone -= 20;
        break;
    }
    
    // Create unit
    const newUnitId = Math.max(0, ...currentPlayer.units.map(u => u.id)) + 1;
    
    const newUnit: Unit = {
      id: newUnitId,
      type: unitType as any,
      territoryId: selectedTerritory,
      health: 100,
      experience: 0
    };
    
    updatedPlayers[gameState.currentPlayer].units.push(newUnit);
    
    // Update territory
    const updatedTerritories = [...gameState.territories];
    const territoryIndex = updatedTerritories.findIndex(t => t.id === selectedTerritory);
    updatedTerritories[territoryIndex].units.push(newUnitId);
    
    const updatedActionsPerformed = {
      ...gameState.actionsPerformed,
      recruit: true
    };
    
    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
      currentAction: "none",
      actionsPerformed: updatedActionsPerformed
    });
    
    setActiveMenu(null);
    toast.success(`${unitType} recruited successfully!`);
  };

  const handleClaimTerritory = (territoryId: number) => {
    if (!gameState) return;
    
    const territory = gameState.territories.find(t => t.id === territoryId);
    if (!territory) return;
    
    if (gameState.phase === "setup") {
      // Setup phase: claim an initial territory
      if (territory.owner !== null) {
        toast.error("This territory is already claimed");
        return;
      }
      
      if (territoryClaimInProgress) {
        toast.error("Territory claim in progress, please wait");
        return;
      }
      
      setTerritoryClaimInProgress(true);
      
      const updatedTerritories = [...gameState.territories];
      const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
      updatedTerritories[territoryIndex].owner = gameState.currentPlayer;
      updatedTerritories[territoryIndex].type = "capital";
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayer].territories.push(territoryId);
      
      setGameState({
        ...gameState,
        territories: updatedTerritories,
        players: updatedPlayers,
        actionTaken: true
      });
      
      toast.success(`Capital territory claimed by Player ${gameState.currentPlayer + 1}`);
      
      setTimeout(() => {
        handleEndTurn();
      }, 1000);
    } else if (gameState.phase === "playing") {
      // Playing phase: expand to an adjacent territory
      if (gameState.currentAction === "expand") {
        handleExpandTerritory(territoryId);
      }
    }
  };
  
  const handleAttackTerritory = (defendingTerritoryId: number) => {
    if (!gameState || !selectedTerritory) return;
    
    // Check if attack action has already been performed
    if (gameState.actionsPerformed.attack) {
      toast.error("You've already attacked this turn");
      return;
    }
    
    const attackingTerritory = gameState.territories.find(t => t.id === selectedTerritory);
    const defendingTerritory = gameState.territories.find(t => t.id === defendingTerritoryId);
    
    if (!attackingTerritory || !defendingTerritory) return;
    
    if (attackingTerritory.owner !== gameState.currentPlayer) {
      toast.error("You must attack from your own territory");
      return;
    }
    
    if (defendingTerritory.owner === gameState.currentPlayer) {
      toast.error("You cannot attack your own territory");
      return;
    }
    
    if (attackingTerritory.units.length === 0) {
      toast.error("You need military units to attack");
      return;
    }
    
    if (!attackingTerritory.adjacentTerritories.includes(defendingTerritoryId)) {
      toast.error("You can only attack adjacent territories");
      return;
    }
    
    // Get attacking units
    const attackingPlayer = gameState.players[gameState.currentPlayer];
    const attackingUnits = attackingPlayer.units.filter(unit => 
      attackingTerritory.units.includes(unit.id)
    );
    
    if (attackingUnits.length === 0) {
      toast.error("No units available to attack with");
      return;
    }
    
    // Get defending units
    const defendingPlayer = gameState.players[defendingTerritory.owner as number];
    const defendingUnits = defendingPlayer.units.filter(unit => 
      defendingTerritory.units.includes(unit.id)
    );
    
    // Calculate attack strength
    let attackStrength = 0;
    attackingUnits.forEach(unit => {
      let baseStrength = 0;
      switch (unit.type) {
        case "infantry":
          baseStrength = 10;
          break;
        case "cavalry":
          baseStrength = 15;
          break;
        case "artillery":
          baseStrength = 20;
          break;
      }
      
      // Adjust for health and experience
      const healthFactor = unit.health / 100;
      const experienceFactor = 1 + (unit.experience / 1000);
      
      attackStrength += baseStrength * healthFactor * experienceFactor;
    });
    
    // Calculate defense strength
    let defenseStrength = 5; // Base defense for territory
    
    // Add fortress defense if present
    const hasFortress = defendingTerritory.buildings.some(buildingId => {
      const building = defendingPlayer.buildings.find(b => b.id === buildingId);
      return building && building.type === "fortress";
    });
    
    if (hasFortress) {
      defenseStrength += 15;
    }
    
    defendingUnits.forEach(unit => {
      let baseStrength = 0;
      switch (unit.type) {
        case "infantry":
          baseStrength = 12; // Better on defense
          break;
        case "cavalry":
          baseStrength = 10; // Worse on defense
          break;
        case "artillery":
          baseStrength = 18; // Good on defense
          break;
      }
      
      // Adjust for health and experience
      const healthFactor = unit.health / 100;
      const experienceFactor = 1 + (unit.experience / 1000);
      
      defenseStrength += baseStrength * healthFactor * experienceFactor;
    });
    
    // Combat resolution
    const attackRoll = Math.random() * attackStrength;
    const defenseRoll = Math.random() * defenseStrength;
    
    const attackerWins = attackRoll > defenseRoll;
    
    // Update units' health and experience based on combat
    const updatedPlayers = [...gameState.players];
    const attackerIndex = gameState.currentPlayer;
    const defenderIndex = defendingTerritory.owner as number;
    
    // Both sides gain experience
    const attackerExperienceGain = 10;
    const defenderExperienceGain = 8;
    
    // Damage is proportional to strength difference
    const strengthDifference = Math.abs(attackRoll - defenseRoll) / 5;
    
    // Apply damage to units
    let updatedAttackingUnits = attackingUnits.map(unit => ({
      ...unit,
      health: Math.max(0, attackerWins ? unit.health - 5 : unit.health - (10 + strengthDifference)),
      experience: unit.experience + attackerExperienceGain
    }));
    
    let updatedDefendingUnits = defendingUnits.map(unit => ({
      ...unit,
      health: Math.max(0, attackerWins ? unit.health - (15 + strengthDifference) : unit.health - 5),
      experience: unit.experience + defenderExperienceGain
    }));
    
    // Filter out dead units
    updatedAttackingUnits = updatedAttackingUnits.filter(unit => unit.health > 0);
    updatedDefendingUnits = updatedDefendingUnits.filter(unit => unit.health > 0);
    
    // Update territories
    let updatedTerritories = [...gameState.territories];
    
    // Update attacking territory
    const attackingTerritoryIndex = updatedTerritories.findIndex(t => t.id === selectedTerritory);
    updatedTerritories[attackingTerritoryIndex].units = updatedAttackingUnits.map(u => u.id);
    
    // Update defending territory
    const defendingTerritoryIndex = updatedTerritories.findIndex(t => t.id === defendingTerritoryId);
    updatedTerritories[defendingTerritoryIndex].units = updatedDefendingUnits.map(u => u.id);
    
    // Update player units
    const attackerUnitIds = new Set(updatedAttackingUnits.map(u => u.id));
    const defenderUnitIds = new Set(updatedDefendingUnits.map(u => u.id));
    
    updatedPlayers[attackerIndex].units = updatedPlayers[attackerIndex].units.filter(u => 
      attackerUnitIds.has(u.id) || u.territoryId !== selectedTerritory
    );
    
    for (const unit of updatedAttackingUnits) {
      const existingUnitIndex = updatedPlayers[attackerIndex].units.findIndex(u => u.id === unit.id);
      if (existingUnitIndex >= 0) {
        updatedPlayers[attackerIndex].units[existingUnitIndex] = unit;
      } else {
        updatedPlayers[attackerIndex].units.push(unit);
      }
    }
    
    updatedPlayers[defenderIndex].units = updatedPlayers[defenderIndex].units.filter(u => 
      defenderUnitIds.has(u.id) || u.territoryId !== defendingTerritoryId
    );
    
    for (const unit of updatedDefendingUnits) {
      const existingUnitIndex = updatedPlayers[defenderIndex].units.findIndex(u => u.id === unit.id);
      if (existingUnitIndex >= 0) {
        updatedPlayers[defenderIndex].units[existingUnitIndex] = unit;
      } else {
        updatedPlayers[defenderIndex].units.push(unit);
      }
    }
    
    // If attacker wins and defender has no units left, territory is captured
    if (attackerWins && updatedDefendingUnits.length === 0) {
      // Transfer territory ownership
      updatedTerritories[defendingTerritoryIndex].owner = attackerIndex;
      
      // Update player territories lists
      updatedPlayers[attackerIndex].territories.push(defendingTerritoryId);
      updatedPlayers[defenderIndex].territories = updatedPlayers[defenderIndex].territories.filter(
        t => t !== defendingTerritoryId
      );
      
      // Handle captured buildings
      // Buildings stay in place but ownership transfers
      updatedTerritories[defendingTerritoryIndex].buildings.forEach(buildingId => {
        const building = updatedPlayers[defenderIndex].buildings.find(b => b.id === buildingId);
        if (building) {
          // Remove from defender's building list
          updatedPlayers[defenderIndex].buildings = updatedPlayers[defenderIndex].buildings.filter(
            b => b.id !== buildingId
          );
          
          // Add to attacker's building list with new ID
          const newBuildingId = Math.max(0, ...updatedPlayers[attackerIndex].buildings.map(b => b.id)) + 1;
          
          updatedPlayers[attackerIndex].buildings.push({
            id: newBuildingId,
            type: building.type,
            territoryId: defendingTerritoryId
          });
          
          // Update territory building reference
          const buildingIndex = updatedTerritories[defendingTerritoryIndex].buildings.indexOf(buildingId);
          if (buildingIndex >= 0) {
            updatedTerritories[defendingTerritoryIndex].buildings[buildingIndex] = newBuildingId;
          }
        }
      });
      
      toast.success(`You captured territory ${defendingTerritoryId}!`);
    } else if (attackerWins) {
      toast.success(`Attack successful! Enemy units damaged.`);
    } else {
      toast.error(`Attack repelled! Your units suffered casualties.`);
    }
    
    const updatedActionsPerformed = {
      ...gameState.actionsPerformed,
      attack: true
    };
    
    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
      currentAction: "none",
      actionsPerformed: updatedActionsPerformed
    });
    
    setSelectedTerritory(null);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorScreen message={error} onBack={() => window.location.reload()} />;
  }

  if (!gameState) {
    return <ErrorScreen message="Failed to initialize game state" onBack={() => window.location.reload()} />;
  }

  const renderPhase = () => {
    if (gameState.phase === "setup") {
      return (
        <div className="absolute top-0 left-0 w-full p-4 bg-gray-800 bg-opacity-75 text-white text-center z-10">
          <h2 className="text-xl font-bold">Setup Phase</h2>
          <p>Player {gameState.currentPlayer + 1}: Select a starting territory</p>
        </div>
      );
    }
    return null;
  };

  const renderGameOver = () => {
    if (gameState.gameOver) {
      return (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-lg max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-6">
              Player {gameState.winner !== null ? gameState.winner + 1 : "unknown"} wins!
            </p>
            <Button onClick={onExitGame}>Return to Menu</Button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderResourceGainToast = () => {
    if (showResourceGain && gameState.lastResourceGain) {
      const gain = gameState.lastResourceGain;
      return (
        <div className="absolute top-16 right-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-30 animate-fadeIn">
          <h3 className="text-lg font-bold mb-2">Resources Collected</h3>
          <ul>
            <li>Gold: +{gain.gold}</li>
            <li>Wood: +{gain.wood}</li>
            <li>Stone: +{gain.stone}</li>
            <li>Food: +{gain.food}</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      <GameTopBar 
        turn={gameState.turn}
        currentPlayer={gameState.currentPlayer}
        playerName={gameState.players[gameState.currentPlayer].name}
        playerColor={gameState.players[gameState.currentPlayer].color}
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
          />
          
          {renderPhase()}
          {renderGameOver()}
          {renderResourceGainToast()}
        </div>
        
        {!isMobile && (
          <div className="w-64 bg-gray-100 p-4 flex flex-col">
            <ResourceDisplay 
              resources={gameState.players[gameState.currentPlayer].resources}
              resourceGain={gameState.lastResourceGain}
            />
            
            {gameState.phase === "playing" && (
              <GameControls 
                onBuildClick={() => handleMenuSelect("build")}
                onRecruitClick={() => handleMenuSelect("recruit")}
                onExpandClick={() => handleMenuSelect("expand")}
                onAttackClick={() => handleMenuSelect("attack")}
                onEndTurnClick={handleEndTurn}
                disabled={gameState.actionTaken}
                actionTaken={gameState.actionTaken}
                expandMode={gameState.currentAction === "expand"}
                attackMode={gameState.currentAction === "attack"}
                canAttack={gameState.players[gameState.currentPlayer].units.length > 0 && hasEnemyAdjacentTerritories()}
                hasResourcesForExpansion={hasResourcesForExpansion()}
                canRecruit={gameState.players[gameState.currentPlayer].territories.some(territoryId => canRecruitInTerritory(territoryId))}
                canBuild={gameState.players[gameState.currentPlayer].territories.length > 0}
                actionsPerformed={gameState.actionsPerformed}
                errorMessages={errorMessages}
              />
            )}
            
            {activeMenu === "build" && selectedTerritory !== null && (
              <BuildingMenu 
                onSelect={handleBuildStructure}
              />
            )}
            
            {activeMenu === "recruit" && selectedTerritory !== null && (
              <RecruitmentMenu 
                onSelect={handleRecruitUnit}
              />
            )}
          </div>
        )}
      </div>
      
      {isMobile && gameState.phase === "playing" && (
        <div className="bg-gray-100 p-2">
          <GameControls 
            onBuildClick={() => handleMenuSelect("build")}
            onRecruitClick={() => handleMenuSelect("recruit")}
            onExpandClick={() => handleMenuSelect("expand")}
            onAttackClick={() => handleMenuSelect("attack")}
            onEndTurnClick={handleEndTurn}
            disabled={gameState.actionTaken}
            actionTaken={gameState.actionTaken}
            expandMode={gameState.currentAction === "expand"}
            attackMode={gameState.currentAction === "attack"}
            canAttack={gameState.players[gameState.currentPlayer].units.length > 0 && hasEnemyAdjacentTerritories()}
            hasResourcesForExpansion={hasResourcesForExpansion()}
            canRecruit={gameState.players[gameState.currentPlayer].territories.some(territoryId => canRecruitInTerritory(territoryId))}
            canBuild={gameState.players[gameState.currentPlayer].territories.length > 0}
            actionsPerformed={gameState.actionsPerformed}
            errorMessages={errorMessages}
          />
        </div>
      )}
      
      {activeInfoModal && (
        <GameInfoModal 
          type={activeInfoModal}
          onClose={() => setActiveInfoModal(null)}
        />
      )}
    </div>
  );
};
