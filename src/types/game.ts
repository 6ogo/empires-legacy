// ================================================
// File: src/types/game.ts (REVISED - Source of Truth)
// ================================================

// --- Core Resource & Identifier Types ---
export type ResourceType = "gold" | "wood" | "stone" | "food";
export type PlayerId = number; // Using number for IDs consistently for local game logic
export type TerritoryId = number;
export type BuildingId = number;
export type UnitId = number;

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
}

export interface Coordinates {
  q: number;
  r: number;
}

// --- Entity Types ---
export type TerritoryType =
  | "plains"
  | "mountains"
  | "forests"
  | "coast"
  | "capital";
export type TerrainType = "plains" | "mountains" | "forests" | "coast"; // Match TerritoryType for simplicity or expand if needed
export type BuildingType = "lumberMill" | "mine" | "market" | "farm" | "barracks" | "fortress" | "road" | "castle" | "watchtower";
export type UnitType = "infantry" | "cavalry" | "artillery"; // From UNIT_DEFINITIONS keys

export interface GameBuilding {
  id: BuildingId;
  type: BuildingType;
  territoryId: TerritoryId;
  // Add level, health etc. if buildings can be damaged/upgraded
}

export interface GameUnit {
  id: UnitId;
  type: UnitType;
  territoryId: TerritoryId;
  ownerId: PlayerId; // Added ownerId property
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  attack: number;
  defense: number;
}

export interface Territory {
  id: TerritoryId;
  type: TerritoryType; // For generation/display
  terrain: TerrainType; // For game mechanics
  owner: PlayerId | null;
  coordinates: Coordinates;
  position: { x: number; y: number }; // Store axial q, r here for compatibility if needed
  resources: Resources; // Base resource generation
  buildings: BuildingId[]; // IDs of buildings in this territory
  units: UnitId[]; // IDs of units in this territory
  adjacentTerritories: TerritoryId[]; // IDs of adjacent territories
  lastUpdated?: number; // Optional timestamp
}

export interface GamePlayer {
  id: PlayerId;
  name: string;
  color: string; // Hex color string
  resources: Resources;
  territories: TerritoryId[]; // List of owned territory IDs
  units: GameUnit[]; // List of full unit objects owned by the player
  buildings: GameBuilding[]; // List of full building objects owned by the player
  hasSelectedStartingTerritory: boolean;
  score: number;
  ready?: boolean; // For online games
}

// --- Game State & Flow Types ---
export type GamePhase = "setup" | "playing" | "completed"; // Keep simplified phases
export type GameStatus =
  | "menu"
  | "mode_select"
  | "creating"
  | "joining"
  | "playing"
  | "waiting"
  | "stats";
export type GameMode = "local" | "online";
export type ActionType =
  | "CLAIM_TERRITORY"
  | "BUILD"
  | "RECRUIT"
  | "ATTACK"
  | "END_TURN"
  | "END_PHASE"
  | "SET_STATE"; // Keep as is
export type GameUpdateType =
  | "territory"
  | "resources"
  | "combat"
  | "building"
  | "system"; // Keep as is
export type VictoryType = "domination" | "economic" | "military";

export interface ResourceGain {
  // Type for resource toast
  gold: number;
  wood: number;
  stone: number;
  food: number;
}

export interface GameSettings {
  // Settings for starting a game
  boardSize: "small" | "medium" | "large";
  playerCount: number;
  gameMode: GameMode;
  playerNames: string[];
  playerColors: string[];
}

export interface GameUpdate {
  // Structure for game event log
  type: GameUpdateType;
  message: string;
  timestamp: number;
  playerId?: PlayerId; // Optional player associated with the update
}

// THIS IS THE MAIN GAME STATE TYPE TO USE
export interface GameState {
  phase: GamePhase;
  turn: number;
  currentPlayer: PlayerId;
  players: GamePlayer[];
  territories: Territory[];
  gameOver: boolean; // Added
  winner: PlayerId | null; // Added
  victoryType: VictoryType | null; // Added
  setupComplete: boolean; // Added
  currentAction: "none" | "build" | "expand" | "attack" | "recruit"; // Added
  expandableTerritories: TerritoryId[]; // Added
  attackableTerritories: TerritoryId[]; // Added
  buildableTerritories: TerritoryId[]; // Added
  recruitableTerritories: TerritoryId[]; // Added
  lastResourceGain: ResourceGain | null; // Added
  actionsPerformed: {
    // Added
    build: boolean;
    recruit: boolean;
    expand: boolean;
    attack: boolean;
  };
  // --- Optional properties ---
  id?: string; // Optional game ID
  updates?: GameUpdate[];
  weather?: string;
  timeOfDay?: string;
  lastUpdated?: number;
  version?: number;
}

// --- Utility Types ---
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface CombatResult {
  defenderDestroyed: boolean;
  attackerDamage: number;
  defenderDamage: number;
  attackerXP?: number;
  defenderXP?: number;
}

// Add UIPlayer if needed for display purposes separate from game logic state
export interface UIPlayer {
  id: string; // May differ from PlayerId if using Supabase IDs
  username: string;
  avatarUrl?: string;
  level?: number;
  xp?: number;
  color?: string; // Use the game color
  isReady?: boolean;
}
