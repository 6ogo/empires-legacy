export type ResourceType = "gold" | "wood" | "stone" | "food";
export type TerritoryType = "plains" | "mountains" | "forests" | "coast" | "capital";
export type PlayerColor = "player1" | "player2" | "player3" | "player4" | "player5" | "player6";
export type GamePhase = 'setup' | 'building' | 'recruitment' | 'combat' | 'end';
export type GameStatus = "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
export type TerrainType = 'plains' | 'hills' | 'mountains' | 'forest' | 'river';
export type WeatherType = 'clear' | 'rain' | 'fog';
export type TimeOfDay = 'day' | 'night';
export type BuildingType = 'fortress' | 'walls' | 'watchtower' | 'barracks' | 'market' | 'farm' | 'expand' | 'lumber_mill' | 'mine' | 'road';
export type GameMode = 'local' | 'online';
export type ActionType = 'CLAIM_TERRITORY' | 'BUILD' | 'RECRUIT' | 'ATTACK' | 'END_TURN' | 'END_PHASE' | 'SET_STATE';
export type GameUpdateType = 'territory' | 'resources' | 'combat' | 'building' | 'system';

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface CombatResult {
  defenderDestroyed: boolean;
  attackerDamage: number;
  defenderDamage: number;
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

export interface GamePlayer {
  id: string;
  resources: Resources;
  territories: string[];
  ready: boolean;
}

export interface UIPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  level?: number;
  xp?: number;
  color?: PlayerColor;
  isReady?: boolean;
}

export interface GameUpdate {
  type: GameUpdateType;
  message: string;
  timestamp: number;
  playerId?: string;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  turn: number;
  currentPlayer: string;
  players: GamePlayer[];
  territories: Territory[];
  updates: GameUpdate[];
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  lastUpdated: number;
  version: number;
  randomEventsEnabled?: boolean;
}

export interface GameAction {
  type: ActionType;
  payload: any;
  playerId: string;
  timestamp: number;
}

// UI Component Types
export interface GameWrapperProps {
  showLeaderboard: boolean;
  gameStatus: GameStatus;
  gameMode: "local" | "online" | null;
  onBackToMenu: () => void;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost: boolean;
  onStartAnyway: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  connectedPlayers: { username: string }[];
}

export interface GameMenuProps {
  onLocalGame: () => void;
  onOnlineGame: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  onShowAchievements: () => void;
  playerProfile: any; // Replace with your UserProfile type
}

export interface GameSetupProps {
  gameMode: GameMode;
  onStartGame: (numPlayers: number, boardSize: number) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface LeaderboardProps {
  onClose: () => void;
  data: Array<{
    username: string;
    score: number;
    rank: number;
    avatarUrl?: string;
  }>;
}

export interface StatsProps {
  onClose: () => void;
  stats: {
    gamesPlayed: number;
    wins: number;
    totalPlayTime: number;
    favoriteUnit: string;
    resourcesCollected: Resources;
    territoriesConquered: number;
  };
}