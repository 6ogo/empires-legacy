
import React, { createContext, useContext, useState, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { GamePhase, GameSettings } from "../components/game/GameWrapper";

// Territory type
export interface Territory {
  id: number;
  owner: number | null;
  type: "plains" | "mountains" | "forest" | "coast" | "capital";
  position: { x: number; y: number };
  coordinates: { q: number; r: number };
  resources: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  };
  buildings: string[];
  units: number[];
  terrain?: string;
}

// Player type
export interface Player {
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
  units: Unit[];
  buildings: {
    count: {
      fortress: number;
      farm: number;
      mine: number;
      lumbermill: number;
      market: number;
      barracks: number;
      watchtower: number;
      castle: number;
    };
  };
  score: number;
}

// Unit type
export interface Unit {
  id: number;
  type: "infantry" | "cavalry" | "artillery";
  attack: number;
  defense: number;
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  territoryId: number;
}

// Building costs and bonuses
export const BUILDINGS = {
  fortress: {
    name: "Fortress",
    cost: { gold: 100, wood: 50, stone: 150, food: 0 },
    bonus: "Defense +25%",
    description: "Improves territory defense against attacks"
  },
  farm: {
    name: "Farm",
    cost: { gold: 50, wood: 25, stone: 25, food: 0 },
    bonus: "Food +3 per turn",
    description: "Produces food for your empire"
  },
  mine: {
    name: "Mine",
    cost: { gold: 75, wood: 50, stone: 25, food: 0 },
    bonus: "Gold +2, Stone +2 per turn",
    description: "Produces gold and stone"
  },
  lumbermill: {
    name: "Lumbermill",
    cost: { gold: 75, wood: 25, stone: 50, food: 0 },
    bonus: "Wood +3 per turn",
    description: "Produces wood for construction"
  },
  market: {
    name: "Market",
    cost: { gold: 100, wood: 75, stone: 75, food: 0 },
    bonus: "Gold +3 per turn",
    description: "Improves commerce and gold generation"
  },
  barracks: {
    name: "Barracks",
    cost: { gold: 150, wood: 100, stone: 100, food: 0 },
    bonus: "Unit training cost -15%",
    description: "Reduces cost of training military units"
  },
  watchtower: {
    name: "Watchtower",
    cost: { gold: 75, wood: 100, stone: 75, food: 0 },
    bonus: "Visibility +1 territory",
    description: "Expands your vision range"
  },
  castle: {
    name: "Castle",
    cost: { gold: 300, wood: 200, stone: 300, food: 0 },
    bonus: "All resources +1, Defense +35%",
    description: "Major fortification providing multiple bonuses"
  }
};

// Unit costs and stats
export const UNITS = {
  infantry: {
    name: "Infantry",
    cost: { gold: 50, wood: 0, stone: 0, food: 25 },
    attack: 10,
    defense: 10,
    health: 50,
    description: "Basic foot soldiers, balanced attack and defense"
  },
  cavalry: {
    name: "Cavalry",
    cost: { gold: 75, wood: 0, stone: 0, food: 50 },
    attack: 15,
    defense: 5,
    health: 40,
    description: "Fast moving mounted units with high attack"
  },
  artillery: {
    name: "Artillery",
    cost: { gold: 100, wood: 50, stone: 50, food: 25 },
    attack: 25,
    defense: 3,
    health: 30,
    description: "Powerful long-range units with high attack but low defense"
  }
};

// Action types for reducer
type GameAction = 
  | { type: 'START_GAME', settings: GameSettings }
  | { type: 'END_TURN' }
  | { type: 'CLAIM_TERRITORY', territoryId: number, playerId: number }
  | { type: 'BUILD_STRUCTURE', territoryId: number, buildingType: string }
  | { type: 'RECRUIT_UNIT', territoryId: number, unitType: string }
  | { type: 'ATTACK_TERRITORY', fromTerritoryId: number, toTerritoryId: number }
  | { type: 'END_GAME', winnerId: number };

// Game state type
interface GameState {
  settings: GameSettings;
  phase: GamePhase;
  turn: number;
  currentPlayer: number;
  players: Player[];
  territories: Territory[];
  actionsPerformed: {
    build: boolean;
    recruit: boolean;
    expand: boolean;
    attack: boolean;
  };
  selectedTerritory: number | null;
  winner: number | null;
}

// Initial state
const initialState: GameState = {
  settings: {
    boardSize: "medium",
    playerCount: 2,
    gameMode: "local",
    playerNames: ["Player 1", "Player 2"],
    playerColors: ["#FF5733", "#33A1FF"]
  },
  phase: "setup",
  turn: 1,
  currentPlayer: 0,
  players: [],
  territories: [],
  actionsPerformed: {
    build: false,
    recruit: false,
    expand: false,
    attack: false
  },
  selectedTerritory: null,
  winner: null
};

// Game state reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        settings: action.settings,
        players: Array.from({ length: action.settings.playerCount }, (_, i) => ({
          id: i,
          name: action.settings.playerNames[i],
          color: action.settings.playerColors[i],
          resources: { gold: 200, wood: 100, stone: 100, food: 100 },
          territories: [],
          units: [],
          buildings: {
            count: {
              fortress: 0,
              farm: 0, 
              mine: 0,
              lumbermill: 0,
              market: 0,
              barracks: 0,
              watchtower: 0,
              castle: 0
            }
          },
          score: 0
        })),
        territories: generateTerritories(action.settings.boardSize),
        phase: "setup"
      };
    
    case 'CLAIM_TERRITORY':
      const updatedTerritories = state.territories.map(territory => 
        territory.id === action.territoryId 
          ? { ...territory, owner: action.playerId } 
          : territory
      );
      
      const updatedPlayers = state.players.map(player => 
        player.id === action.playerId
          ? { 
              ...player, 
              territories: [...player.territories, action.territoryId],
              resources: collectResourcesFromTerritory(
                player.resources, 
                state.territories.find(t => t.id === action.territoryId)?.resources || { gold: 0, wood: 0, stone: 0, food: 0 }
              )
            }
          : player
      );
      
      return {
        ...state,
        territories: updatedTerritories,
        players: updatedPlayers,
        actionsPerformed: {
          ...state.actionsPerformed,
          expand: true
        }
      };
    
    case 'END_TURN':
      // Check if all players have claimed at least one territory during setup
      if (state.phase === "setup") {
        const allPlayersClaimed = state.players.every(player => player.territories.length > 0);
        
        if (allPlayersClaimed) {
          return {
            ...state,
            currentPlayer: (state.currentPlayer + 1) % state.players.length,
            turn: state.currentPlayer === state.players.length - 1 ? state.turn + 1 : state.turn,
            phase: "playing",
            actionsPerformed: {
              build: false,
              recruit: false,
              expand: false,
              attack: false
            }
          };
        }
      }
      
      // Process end of turn (collect resources, regenerate units, etc.)
      const playersWithUpdatedResources = state.players.map(player => ({
        ...player,
        resources: calculateResourcesPerTurn(player, state.territories)
      }));
      
      // Check victory conditions
      const winner = checkVictoryConditions(playersWithUpdatedResources, state.territories);
      
      if (winner !== null) {
        return {
          ...state,
          winner,
          phase: "completed"
        };
      }
      
      return {
        ...state,
        currentPlayer: (state.currentPlayer + 1) % state.players.length,
        turn: state.currentPlayer === state.players.length - 1 ? state.turn + 1 : state.turn,
        players: playersWithUpdatedResources,
        actionsPerformed: {
          build: false,
          recruit: false,
          expand: false,
          attack: false
        }
      };
      
    case 'BUILD_STRUCTURE':
      // Find the territory and player
      const territoryToBuild = state.territories.find(t => t.id === action.territoryId);
      const playerBuilding = state.players[state.currentPlayer];
      
      if (!territoryToBuild || territoryToBuild.owner !== playerBuilding.id) {
        return state;
      }
      
      // Check if player has enough resources
      const buildingCost = BUILDINGS[action.buildingType as keyof typeof BUILDINGS].cost;
      
      if (!hasEnoughResources(playerBuilding.resources, buildingCost)) {
        return state;
      }
      
      // Update territory with new building
      const territoriesWithNewBuilding = state.territories.map(t => 
        t.id === action.territoryId 
          ? { ...t, buildings: [...t.buildings, action.buildingType] } 
          : t
      );
      
      // Update player resources and building count
      const playersAfterBuilding = state.players.map(p => 
        p.id === playerBuilding.id 
          ? { 
              ...p, 
              resources: subtractResources(p.resources, buildingCost),
              buildings: {
                ...p.buildings,
                count: {
                  ...p.buildings.count,
                  [action.buildingType]: p.buildings.count[action.buildingType as keyof typeof p.buildings.count] + 1
                }
              }
            } 
          : p
      );
      
      return {
        ...state,
        territories: territoriesWithNewBuilding,
        players: playersAfterBuilding,
        actionsPerformed: {
          ...state.actionsPerformed,
          build: true
        }
      };
    
    case 'RECRUIT_UNIT':
      const territoryToRecruit = state.territories.find(t => t.id === action.territoryId);
      const playerRecruiting = state.players[state.currentPlayer];
      
      if (!territoryToRecruit || territoryToRecruit.owner !== playerRecruiting.id) {
        return state;
      }
      
      // Check if player has enough resources
      const unitCost = UNITS[action.unitType as keyof typeof UNITS].cost;
      
      if (!hasEnoughResources(playerRecruiting.resources, unitCost)) {
        return state;
      }
      
      // Create new unit
      const unitStats = UNITS[action.unitType as keyof typeof UNITS];
      const newUnit: Unit = {
        id: Date.now(), // Simple unique ID
        type: action.unitType as "infantry" | "cavalry" | "artillery",
        attack: unitStats.attack,
        defense: unitStats.defense,
        health: unitStats.health,
        maxHealth: unitStats.health,
        experience: 0,
        level: 1,
        territoryId: action.territoryId
      };
      
      // Update territory with new unit
      const territoriesWithNewUnit = state.territories.map(t => 
        t.id === action.territoryId 
          ? { ...t, units: [...t.units, newUnit.id] } 
          : t
      );
      
      // Update player resources and units
      const playersAfterRecruitment = state.players.map(p => 
        p.id === playerRecruiting.id 
          ? { 
              ...p, 
              resources: subtractResources(p.resources, unitCost),
              units: [...p.units, newUnit]
            } 
          : p
      );
      
      return {
        ...state,
        territories: territoriesWithNewUnit,
        players: playersAfterRecruitment,
        actionsPerformed: {
          ...state.actionsPerformed,
          recruit: true
        }
      };
    
    case 'ATTACK_TERRITORY':
      // Implement combat logic here
      // This is a simplified version - real implementation would be more complex
      const attackingTerritory = state.territories.find(t => t.id === action.fromTerritoryId);
      const defendingTerritory = state.territories.find(t => t.id === action.toTerritoryId);
      
      if (!attackingTerritory || !defendingTerritory || 
          attackingTerritory.owner !== state.currentPlayer || 
          defendingTerritory.owner === state.currentPlayer) {
        return state;
      }
      
      // Calculate attack strength (sum of all units' attack in territory)
      const attackingPlayer = state.players[state.currentPlayer];
      const attackStrength = calculateAttackStrength(attackingTerritory, attackingPlayer);
      
      // Calculate defense strength
      const defendingPlayer = defendingTerritory.owner !== null 
        ? state.players[defendingTerritory.owner] 
        : null;
      const defenseStrength = defendingPlayer 
        ? calculateDefenseStrength(defendingTerritory, defendingPlayer) 
        : 0;
      
      // Determine winner
      const attackSuccess = attackStrength > defenseStrength;
      
      if (attackSuccess) {
        // Update territory ownership
        const updatedTerritoriesAfterAttack = state.territories.map(t => 
          t.id === action.toTerritoryId 
            ? { ...t, owner: state.currentPlayer } 
            : t
        );
        
        // Update player territories
        const updatedPlayersAfterAttack = state.players.map(p => {
          if (p.id === state.currentPlayer) {
            return {
              ...p,
              territories: [...p.territories, action.toTerritoryId]
            };
          } else if (p.id === defendingTerritory.owner) {
            return {
              ...p,
              territories: p.territories.filter(id => id !== action.toTerritoryId)
            };
          }
          return p;
        });
        
        return {
          ...state,
          territories: updatedTerritoriesAfterAttack,
          players: updatedPlayersAfterAttack,
          actionsPerformed: {
            ...state.actionsPerformed,
            attack: true
          }
        };
      }
      
      // Attack failed, but action was taken
      return {
        ...state,
        actionsPerformed: {
          ...state.actionsPerformed,
          attack: true
        }
      };
    
    case 'END_GAME':
      return {
        ...state,
        phase: "completed",
        winner: action.winnerId
      };
      
    default:
      return state;
  }
}

// Helper functions for the reducer
function generateTerritories(boardSize: string): Territory[] {
  // Generate different sized boards based on the boardSize parameter
  let boardRadius;
  
  switch (boardSize) {
    case "small":
      boardRadius = 3;
      break;
    case "large":
      boardRadius = 5;
      break;
    case "medium":
    default:
      boardRadius = 4;
      break;
  }
  
  const territories: Territory[] = [];
  let id = 0;
  
  // Generate a hexagonal map using axial coordinates
  for (let q = -boardRadius; q <= boardRadius; q++) {
    const r1 = Math.max(-boardRadius, -q - boardRadius);
    const r2 = Math.min(boardRadius, -q + boardRadius);
    
    for (let r = r1; r <= r2; r++) {
      // Convert axial coordinates to pixel position
      const x = q;
      const y = r;
      
      // Randomly determine territory type
      const territoryTypes: Array<"plains" | "mountains" | "forest" | "coast" | "capital"> = [
        "plains", "plains", "plains", "mountains", "forest", "coast"
      ];
      const type = territoryTypes[Math.floor(Math.random() * territoryTypes.length)];
      
      // Generate resources based on territory type
      let resources = { gold: 0, wood: 0, stone: 0, food: 0 };
      
      switch (type) {
        case "plains":
          resources = { gold: 1, wood: 1, stone: 1, food: 2 };
          break;
        case "mountains":
          resources = { gold: 2, wood: 0, stone: 3, food: 0 };
          break;
        case "forest":
          resources = { gold: 0, wood: 3, stone: 1, food: 1 };
          break;
        case "coast":
          resources = { gold: 2, wood: 0, stone: 0, food: 3 };
          break;
        case "capital":
          resources = { gold: 3, wood: 3, stone: 3, food: 3 };
          break;
      }
      
      // Add some randomness to resources
      Object.keys(resources).forEach(key => {
        const resourceKey = key as keyof typeof resources;
        resources[resourceKey] += Math.floor(Math.random() * 2);
      });
      
      territories.push({
        id: id++,
        owner: null,
        type,
        position: { x, y },
        coordinates: { q, r },
        resources,
        buildings: [],
        units: [],
        terrain: type === "mountains" ? "mountains" : type === "forest" ? "forest" : "plains"
      });
    }
  }
  
  return territories;
}

function collectResourcesFromTerritory(
  playerResources: { gold: number; wood: number; stone: number; food: number },
  territoryResources: { gold: number; wood: number; stone: number; food: number }
) {
  return {
    gold: playerResources.gold + territoryResources.gold,
    wood: playerResources.wood + territoryResources.wood,
    stone: playerResources.stone + territoryResources.stone,
    food: playerResources.food + territoryResources.food
  };
}

function calculateResourcesPerTurn(player: Player, territories: Territory[]) {
  // Start with current resources
  let newResources = { ...player.resources };
  
  // Add resources from territories
  player.territories.forEach(territoryId => {
    const territory = territories.find(t => t.id === territoryId);
    if (territory) {
      // Base resources from territory
      newResources.gold += territory.resources.gold;
      newResources.wood += territory.resources.wood;
      newResources.stone += territory.resources.stone;
      newResources.food += territory.resources.food;
      
      // Additional resources from buildings
      territory.buildings.forEach(building => {
        switch (building) {
          case "farm":
            newResources.food += 3;
            break;
          case "mine":
            newResources.gold += 2;
            newResources.stone += 2;
            break;
          case "lumbermill":
            newResources.wood += 3;
            break;
          case "market":
            newResources.gold += 3;
            break;
          case "castle":
            newResources.gold += 1;
            newResources.wood += 1;
            newResources.stone += 1;
            newResources.food += 1;
            break;
        }
      });
    }
  });
  
  return newResources;
}

function hasEnoughResources(
  playerResources: { gold: number; wood: number; stone: number; food: number },
  cost: { gold: number; wood: number; stone: number; food: number }
) {
  return (
    playerResources.gold >= cost.gold &&
    playerResources.wood >= cost.wood &&
    playerResources.stone >= cost.stone &&
    playerResources.food >= cost.food
  );
}

function subtractResources(
  playerResources: { gold: number; wood: number; stone: number; food: number },
  cost: { gold: number; wood: number; stone: number; food: number }
) {
  return {
    gold: playerResources.gold - cost.gold,
    wood: playerResources.wood - cost.wood,
    stone: playerResources.stone - cost.stone,
    food: playerResources.food - cost.food
  };
}

function calculateAttackStrength(territory: Territory, player: Player) {
  let strength = 0;
  
  // Sum attack power of all units in territory
  territory.units.forEach(unitId => {
    const unit = player.units.find(u => u.id === unitId);
    if (unit) {
      strength += unit.attack * (1 + 0.1 * (unit.level - 1)); // 10% increase per level
    }
  });
  
  return strength;
}

function calculateDefenseStrength(territory: Territory, player: Player) {
  let strength = 5; // Base defense value for territory
  
  // Add defense from units
  territory.units.forEach(unitId => {
    const unit = player.units.find(u => u.id === unitId);
    if (unit) {
      strength += unit.defense * (1 + 0.1 * (unit.level - 1)); // 10% increase per level
    }
  });
  
  // Add defense from buildings
  territory.buildings.forEach(building => {
    switch (building) {
      case "fortress":
        strength *= 1.25; // 25% increase
        break;
      case "castle":
        strength *= 1.35; // 35% increase
        break;
      case "watchtower":
        strength += 5;
        break;
    }
  });
  
  return strength;
}

function checkVictoryConditions(players: Player[], territories: Territory[]): number | null {
  // Check for domination victory (owns all territories)
  for (const player of players) {
    if (player.territories.length === territories.length) {
      return player.id;
    }
  }
  
  // Check for economic victory (1000+ gold)
  for (const player of players) {
    if (player.resources.gold >= 1000) {
      return player.id;
    }
  }
  
  // Check for military victory (15+ units)
  for (const player of players) {
    if (player.units.length >= 15) {
      return player.id;
    }
  }
  
  return null;
}

// Context setup
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Helper functions exposed to components
  getExpandableTerritories: () => number[];
  getAttackableTerritories: () => number[];
  getBuildableTerritories: () => number[];
  getRecruitableTerritories: () => number[];
  canAffordBuilding: (buildingType: string) => boolean;
  canAffordUnit: (unitType: string) => boolean;
  hasResourcesForExpansion: () => boolean;
  canAttack: () => boolean;
  canBuild: () => boolean;
  canRecruit: () => boolean;
}

const GameStateContext = createContext<GameContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Helper function to get territories that can be expanded to
  const getExpandableTerritories = (): number[] => {
    if (state.phase === "setup") {
      // During setup, players can claim any unclaimed territory
      return state.territories
        .filter(t => t.owner === null)
        .map(t => t.id);
    }
    
    // During playing phase, players can only expand to adjacent unclaimed territories
    const playerTerritories = state.territories.filter(
      t => t.owner === state.currentPlayer
    );
    
    // Get all territories adjacent to player territories
    const adjacentTerritoryIds: number[] = [];
    
    playerTerritories.forEach(territory => {
      const { q, r } = territory.coordinates;
      
      // Axial coordinate directions for adjacent hexes
      const directions = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
      ];
      
      // Find all adjacent territories
      directions.forEach(dir => {
        const adjQ = q + dir.q;
        const adjR = r + dir.r;
        
        const adjacentTerritory = state.territories.find(
          t => t.coordinates.q === adjQ && t.coordinates.r === adjR && t.owner === null
        );
        
        if (adjacentTerritory) {
          adjacentTerritoryIds.push(adjacentTerritory.id);
        }
      });
    });
    
    // Remove duplicates
    return [...new Set(adjacentTerritoryIds)];
  };
  
  // Helper function to get territories that can be attacked
  const getAttackableTerritories = (): number[] => {
    if (state.phase !== "playing") {
      return [];
    }
    
    const playerTerritories = state.territories.filter(
      t => t.owner === state.currentPlayer
    );
    
    // Get territories adjacent to player territories that belong to other players
    const attackableTerritoryIds: number[] = [];
    
    playerTerritories.forEach(territory => {
      const { q, r } = territory.coordinates;
      
      // Axial coordinate directions for adjacent hexes
      const directions = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
      ];
      
      // Find all adjacent territories
      directions.forEach(dir => {
        const adjQ = q + dir.q;
        const adjR = r + dir.r;
        
        const adjacentTerritory = state.territories.find(
          t => t.coordinates.q === adjQ && t.coordinates.r === adjR && 
              t.owner !== null && t.owner !== state.currentPlayer
        );
        
        if (adjacentTerritory) {
          attackableTerritoryIds.push(adjacentTerritory.id);
        }
      });
    });
    
    // Remove duplicates
    return [...new Set(attackableTerritoryIds)];
  };
  
  // Helper function to get territories where buildings can be constructed
  const getBuildableTerritories = (): number[] => {
    if (state.phase !== "playing") {
      return [];
    }
    
    // Can build on any owned territory that doesn't have too many buildings already
    return state.territories
      .filter(t => t.owner === state.currentPlayer && t.buildings.length < 3)
      .map(t => t.id);
  };
  
  // Helper function to get territories where units can be recruited
  const getRecruitableTerritories = (): number[] => {
    if (state.phase !== "playing") {
      return [];
    }
    
    // Can recruit on any owned territory
    return state.territories
      .filter(t => t.owner === state.currentPlayer)
      .map(t => t.id);
  };
  
  // Helper function to check if player can afford a building
  const canAffordBuilding = (buildingType: string): boolean => {
    const player = state.players[state.currentPlayer];
    if (!player) return false;
    
    const building = BUILDINGS[buildingType as keyof typeof BUILDINGS];
    if (!building) return false;
    
    return hasEnoughResources(player.resources, building.cost);
  };
  
  // Helper function to check if player can afford a unit
  const canAffordUnit = (unitType: string): boolean => {
    const player = state.players[state.currentPlayer];
    if (!player) return false;
    
    const unit = UNITS[unitType as keyof typeof UNITS];
    if (!unit) return false;
    
    return hasEnoughResources(player.resources, unit.cost);
  };
  
  // Helper function to check if player has resources for expansion
  const hasResourcesForExpansion = (): boolean => {
    const expansionCost = { gold: 50, wood: 25, stone: 25, food: 0 };
    const player = state.players[state.currentPlayer];
    
    return player && hasEnoughResources(player.resources, expansionCost);
  };
  
  // Helper function to check if player can attack
  const canAttack = (): boolean => {
    return getAttackableTerritories().length > 0 && !state.actionsPerformed.attack;
  };
  
  // Helper function to check if player can build
  const canBuild = (): boolean => {
    return getBuildableTerritories().length > 0 && !state.actionsPerformed.build;
  };
  
  // Helper function to check if player can recruit
  const canRecruit = (): boolean => {
    return getRecruitableTerritories().length > 0 && !state.actionsPerformed.recruit;
  };
  
  // Effects for gameplay events (notifications, etc.)
  useEffect(() => {
    // Display turn notifications
    if (state.turn > 1 && state.currentPlayer === 0) {
      toast.info(`Turn ${state.turn} has begun!`);
    }
    
    // Victory notification
    if (state.phase === "completed" && state.winner !== null) {
      toast.success(`Player ${state.players[state.winner].name} has won the game!`);
    }
  }, [state.turn, state.currentPlayer, state.phase, state.winner]);
  
  const contextValue: GameContextType = {
    state,
    dispatch,
    getExpandableTerritories,
    getAttackableTerritories,
    getBuildableTerritories,
    getRecruitableTerritories,
    canAffordBuilding,
    canAffordUnit,
    hasResourcesForExpansion,
    canAttack,
    canBuild,
    canRecruit
  };
  
  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
}

// Custom hook for accessing the game state
export function useGameState() {
  const context = useContext(GameStateContext);
  
  if (context === undefined) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  
  return context;
}
