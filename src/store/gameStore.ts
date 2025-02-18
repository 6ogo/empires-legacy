// src/store/gameStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameState, GameStatus, GameMode, Territory, Player } from '@/types/game';
import { createInitialGameState } from '@/lib/game-utils';

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
  connectedPlayers: Player[];
  
  // Actions
  setGameStatus: (status: GameStatus) => void;
  setGameMode: (mode: GameMode | null) => void;
  setShowLeaderboard: (show: boolean) => void;
  setGameState: (state: GameState | null) => void;
  setSelectedTerritory: (territory: Territory | null) => void;
  updateConnectedPlayers: (players: Player[]) => void;
  resetGame: () => void;
  initializeGame: (numPlayers: number, boardSize: number) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        gameStatus: 'menu',
        gameMode: null,
        showLeaderboard: false,
        isLoading: false,
        error: null,
        gameState: null,
        selectedTerritory: null,
        connectedPlayers: [],
        
        // Actions
        setGameStatus: (status) => set({ gameStatus: status }),
        setGameMode: (mode) => set({ gameMode: mode }),
        setShowLeaderboard: (show) => set({ showLeaderboard: show }),
        setGameState: (state) => set({ gameState: state }),
        setSelectedTerritory: (territory) => set({ selectedTerritory: territory }),
        updateConnectedPlayers: (players) => set({ connectedPlayers: players }),
        
        resetGame: () => set({
          gameStatus: 'menu',
          gameMode: null,
          gameState: null,
          selectedTerritory: null,
          connectedPlayers: [],
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
        }),
      }
    )
  )
);

// Optional: Create selector hooks for specific parts of the state
export const useGameStatus = () => useGameStore((state) => state.gameStatus);
export const useGameMode = () => useGameStore((state) => state.gameMode);
export const useSelectedTerritory = () => useGameStore((state) => state.selectedTerritory);