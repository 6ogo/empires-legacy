
export type ResourceType = "gold" | "wood" | "stone" | "food";
export type TerritoryType = "plains" | "mountains" | "forests" | "coast" | "capital";
export type PlayerColor = "player1" | "player2";

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
}

export interface Player {
  id: PlayerColor;
  resources: Resources;
  territories: Territory[];
}

export interface GameState {
  players: Player[];
  territories: Territory[];
  currentPlayer: PlayerColor;
  phase: "setup" | "resource" | "building" | "recruitment" | "movement" | "combat";
  turn: number;
}
