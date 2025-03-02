
// Types for the game map and territories

export interface Position {
  x: number;
  y: number;
}

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
}

export interface Building {
  id: number;
  type: string;
  level?: number;
  effects?: any;
}

export interface Unit {
  id: number;
  type: string;
  health: number;
  attack: number;
  defense: number;
  movementPoints?: number;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  resources: Resources;
  buildings: Building[];
  researched?: string[];
}

export interface Territory {
  id: number;
  position: Position;
  type: string;
  owner: number | null;
  resources: Resources;
  buildings: (Building | number)[];
  units: Unit[];
  adjacentTerritories?: number[];
}

export interface GameMap {
  territories: Territory[];
  players: Player[];
}

export type GamePhase = "setup" | "playing" | "ended";
export type ActionType = "none" | "build" | "expand" | "attack" | "recruit";

export interface ActionsPerformed {
  build: boolean;
  recruit: boolean;
  expand: boolean;
  attack: boolean;
}
