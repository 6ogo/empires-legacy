
export type ResourceType = "gold" | "wood" | "stone" | "food";
export type TerritoryType = "plains" | "mountains" | "forests" | "coast" | "capital";
export type PlayerColor = "player1" | "player2" | "player3" | "player4" | "player5" | "player6";
export type GamePhase = 'setup' | 'building' | 'recruitment' | 'combat' | 'end';
export type GameStatus = "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
export type TerrainType = 'plains' | 'hills' | 'mountains' | 'forest' | 'river';
export type WeatherType = 'clear' | 'rain' | 'fog';
export type TimeOfDay = 'day' | 'night';
export type BuildingType = 'fortress' | 'walls' | 'watchtower' | 'barracks' | 'market' | 'farm';

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
  experience: number;
  hasMoved: boolean;
  cost: Partial<Resources>;
}

export interface Territory {
  id: string;
  coordinates: {
    q: number;
    r: number;
  };
  owner: string | null;
  terrain: TerrainType;
  resources: Resources;
  building?: BuildingType | null;
  militaryUnit?: MilitaryUnit | null;
  lastUpdated: number;
}

export interface Player {
  id: string;
  resources: Resources;
  territories: string[];
  ready: boolean;
}

export interface GameUpdate {
  type: 'territory' | 'resources' | 'combat' | 'building' | 'system';
  message: string;
  timestamp: number;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  turn: number;
  currentPlayer: string;
  players: Player[];
  territories: Territory[];
  updates: GameUpdate[];
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  lastUpdated: number;
  version: number;
}

export interface GameAction {
  type: 'CLAIM_TERRITORY' | 'BUILD' | 'RECRUIT' | 'ATTACK' | 'END_TURN' | 'END_PHASE';
  payload: any;
  playerId: string;
  timestamp: number;
}
