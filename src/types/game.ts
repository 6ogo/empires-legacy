export type ResourceType = "gold" | "wood" | "stone" | "food";
export type TerritoryType = "plains" | "mountains" | "forests" | "coast" | "capital";
export type PlayerColor = "player1" | "player2";
export type GamePhase = "setup" | "resource" | "building" | "recruitment" | "movement" | "combat";

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
}

export interface Territory {
  id: string;
  type: TerritoryType;
  owner: PlayerColor | null;
  coordinates: { q: number; r: number; s: number };
  resources: Partial<Resources>;
  building?: string;
  buildings?: string[];  // Add this line to support multiple buildings
}

export interface Player {
  id: PlayerColor;
  resources: Resources;
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
