export type ResourceType = "gold" | "wood" | "stone" | "food";
export type TerritoryType = "plains" | "mountains" | "forests" | "coast" | "capital";
export type PlayerColor = "player1" | "player2" | "player3" | "player4" | "player5" | "player6";
export type GamePhase = "setup" | "resource" | "building" | "recruitment" | "movement" | "combat";
export type GameStatus = "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting";

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
}

export interface Units {
  infantry: number;
  cavalry: number;
  artillery: number;
}

export interface MilitaryUnit {
  type: string;
  health: number;
  damage: number;
  cost: Partial<Resources>;
}

export interface Territory {
  id: string;
  type: TerritoryType;
  owner: PlayerColor | null;
  coordinates: { q: number; r: number; s: number };
  resources: Partial<Resources>;
  building?: string;
  buildings?: string[];
  militaryUnit?: MilitaryUnit;
}

export interface Player {
  id: PlayerColor;
  resources: Resources;
  units: Units;
  territories: Territory[];
}

export interface GameUpdate {
  type: "territory_claimed" | "building_constructed" | "resources_collected" | "turn_ended" | "phase_changed";
  message: string;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  territories: Territory[];
  currentPlayer: PlayerColor;
  phase: GamePhase;
  turn: number;
  updates: GameUpdate[];
}
