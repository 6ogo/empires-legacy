import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameState, GameStatus, GameMode, Territory } from '@/types/game';
import { createInitialGameState } from '@/lib/game-utils';

interface ConnectedPlayer {
  username: string;
}

interface GameStore {
  // UI State
  gameStatus: GameStatus;
  gameMode: GameMode | null;
  showLeaderboard: boolean;
  isLoading: boolean;
  error: Error | null;

  // Game State
  gameState: GameState | null;
  selectedTerritory: Territory | null;
  connectedPlayers: ConnectedPlayer[];

  // Online game state
  gameId: number | null;
  roomId: string;
  isHost: boolean;

  // Player identification (no auth)
  playerNames: string[];

  // Actions
  setGameStatus: (status: GameStatus) => void;
  setGameMode: (mode: GameMode | null) => void;
  setShowLeaderboard: (show: boolean) => void;
  setGameState: (state: GameState | null) => void;
  setSelectedTerritory: (territory: Territory | null) => void;
  updateConnectedPlayers: (players: ConnectedPlayer[]) => void;
  setGameId: (id: number | null) => void;
  setRoomId: (id: string) => void;
  setIsHost: (isHost: boolean) => void;
  setPlayerNames: (names: string[]) => void;
  resetGame: () => void;
  initializeGame: (numPlayers: number, boardSize: number) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        gameStatus: 'menu',
        gameMode: null,
        showLeaderboard: false,
        isLoading: false,
        error: null,
        gameState: null,
        selectedTerritory: null,
        connectedPlayers: [],
        gameId: null,
        roomId: '',
        isHost: false,
        playerNames: [],

        // Actions
        setGameStatus: (status) => set({ gameStatus: status }),
        setGameMode: (mode) => set({ gameMode: mode }),
        setShowLeaderboard: (show) => set({ showLeaderboard: show }),
        setGameState: (state) => set({ gameState: state }),
        setSelectedTerritory: (territory) => set({ selectedTerritory: territory }),
        updateConnectedPlayers: (players) => set({ connectedPlayers: players }),
        setGameId: (id) => set({ gameId: id }),
        setRoomId: (id) => set({ roomId: id }),
        setIsHost: (isHost) => set({ isHost }),
        setPlayerNames: (names) => set({ playerNames: names }),

        resetGame: () => set({
          gameStatus: 'menu',
          gameMode: null,
          gameState: null,
          selectedTerritory: null,
          connectedPlayers: [],
          gameId: null,
          roomId: '',
          isHost: false,
        }),

        initializeGame: (numPlayers, boardSize) => {
          const initialState = createInitialGameState(numPlayers, boardSize);
          set({
            gameState: initialState,
            gameStatus: 'playing',
          });
        },
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({
          gameMode: state.gameMode,
          gameState: state.gameState,
          playerNames: state.playerNames,
        }),
      }
    )
  )
);

export const useGameStatus = () => useGameStore((state) => state.gameStatus);
export const useGameMode = () => useGameStore((state) => state.gameMode);
export const useSelectedTerritory = () => useGameStore((state) => state.selectedTerritory);
