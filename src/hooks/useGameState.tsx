import { useState, useCallback } from 'react';
import { GameState, GameAction } from '@/types/game';
import { GameStateManager } from '@/lib/game-utils';
import { toast } from 'sonner';

export const useGameState = (initialState: GameState) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [gameStateManager] = useState(() => new GameStateManager(initialState));

  const dispatchAction = useCallback((action: GameAction) => {
    try {
      const success = gameStateManager.applyAction(action);
      
      if (success) {
        setGameState(gameStateManager.getState());
      } else {
        toast.error('Invalid action');
      }
      
      return success;
    } catch (error) {
      console.error('Error dispatching action:', error);
      toast.error('Error processing game action');
      return false;
    }
  }, [gameStateManager]);

  return {
    gameState,
    dispatchAction
  };
};
