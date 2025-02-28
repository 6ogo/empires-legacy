
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { GameState, UIPlayer as Player, Territory, Resources } from '@/types/game';

type ResourceType = 'gold' | 'wood' | 'stone' | 'food';

interface GameStore {
  gameState: GameState | null;
  localGameId: string | null;
  isLocalGameStarted: boolean;
  saveLocalGame: (gameState: GameState) => void;
  startLocalGame: (settings: {
    boardSize: string;
    playerCount: number;
    gameMode: 'local' | 'online';
  }) => void;
  updateGameState: (updater: (state: GameState) => GameState) => void;
  addResources: (playerId: string, resources: Partial<Resources>) => void;
  deductResources: (playerId: string, resources: Partial<Resources>) => boolean;
  resetLocalGame: () => void;
  
  // For online games
  onlineGameId: string | null;
  joinOnlineGame: (gameId: string) => void;
  leaveOnlineGame: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        gameState: null,
        localGameId: null,
        isLocalGameStarted: false,
        onlineGameId: null,
        
        saveLocalGame: (gameState) => {
          set({ gameState, localGameId: gameState.id });
        },
        
        startLocalGame: (settings) => {
          // This would generate the initial game state
          console.log('Starting local game with settings:', settings);
          set({ isLocalGameStarted: true });
          // Implementation would create territories, players, etc.
        },
        
        updateGameState: (updater) => {
          const { gameState } = get();
          if (!gameState) return;
          
          set({ gameState: updater(gameState) });
        },
        
        addResources: (playerId, resources) => {
          const { gameState } = get();
          if (!gameState) return;
          
          set({
            gameState: {
              ...gameState,
              players: gameState.players.map((player) => {
                if (player.id !== playerId) return player;
                
                const updatedResources = { ...player.resources };
                (Object.keys(resources) as ResourceType[]).forEach((key) => {
                  updatedResources[key] += resources[key] || 0;
                });
                
                return {
                  ...player,
                  resources: updatedResources
                };
              })
            }
          });
        },
        
        deductResources: (playerId, resources) => {
          const { gameState } = get();
          if (!gameState) return false;
          
          const player = gameState.players.find((p) => p.id === playerId);
          if (!player) return false;
          
          // Check if player has enough resources
          for (const [key, value] of Object.entries(resources)) {
            if (player.resources[key as ResourceType] < (value || 0)) {
              toast.error(`Not enough ${key}`);
              return false;
            }
          }
          
          // Deduct resources
          set({
            gameState: {
              ...gameState,
              players: gameState.players.map((p) => {
                if (p.id !== playerId) return p;
                
                const updatedResources = { ...p.resources };
                (Object.keys(resources) as ResourceType[]).forEach((key) => {
                  updatedResources[key] -= resources[key] || 0;
                });
                
                return {
                  ...p,
                  resources: updatedResources
                };
              })
            }
          });
          
          return true;
        },
        
        resetLocalGame: () => {
          set({ gameState: null, localGameId: null, isLocalGameStarted: false });
        },
        
        joinOnlineGame: (gameId) => {
          set({ onlineGameId: gameId });
        },
        
        leaveOnlineGame: () => {
          set({ onlineGameId: null });
        }
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({ 
          localGameId: state.localGameId,
          gameState: state.gameState
        })
      }
    )
  )
);
