
export type ResourceType = "gold" | "wood" | "stone" | "food";
export type TerritoryType = "plains" | "mountains" | "forests" | "coast" | "capital";
export type PlayerColor = "player1" | "player2" | "player3" | "player4" | "player5" | "player6";
export type GamePhase = "build" | "recruit" | "attack";
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
  currentHealth?: number;
  currentDamage?: number;
  needsRestoration?: boolean;
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
  totalResourceYield?: Partial<Resources>;
}

export interface Player {
  id: PlayerColor;
  resources: Resources;
  units: Units;
  territories: Territory[];
  hasExpandedThisTurn?: boolean;
  hasRecruitedThisTurn?: boolean;
}

export interface GameUpdate {
  type: "territory_claimed" | "building_constructed" | "unit_recruited" | "territory_expanded" | "attack_performed" | "turn_ended";
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
  hasExpandedThisTurn: boolean;
  hasRecruitedThisTurn: boolean;
}
