import { useCallback, useRef } from 'react';
import { TurnManager } from '@/lib/TurnManager';
import { CombatManager } from '@/lib/CombatManager';
import { GameState, GameAction } from '@/types/game';
import { toast } from 'sonner';

export const useGameFlow = (
  gameState: GameState,
  dispatchAction: (action: GameAction) => boolean
) => {
  const turnManagerRef = useRef(new TurnManager(gameState));
  const combatManagerRef = useRef(new CombatManager(gameState));

  const handleAction = useCallback((action: GameAction) => {
    const turnManager = turnManagerRef.current;
    
    // Validate if action can be performed
    if (!turnManager.canPerformAction(action)) {
      toast.error("Invalid action for current phase");
      return false;
    }

    // Track the action
    turnManager.trackAction(action);

    // Dispatch the action
    const success = dispatchAction(action);
    
    if (!success) {
      toast.error("Failed to perform action");
      return false;
    }

    return true;
  }, [dispatchAction]);

  const handleEndTurn = useCallback(() => {
    const turnManager = turnManagerRef.current;
    
    // Validate turn end
    const validation = turnManager.validateTurnTransition();
    if (!validation.valid) {
      toast.error(validation.message || "Cannot end turn");
      return false;
    }

    // Clear turn tracking
    turnManager.clearTurnTracking();

    // Dispatch end turn action
    return dispatchAction({
      type: 'END_TURN',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: {}
    });
  }, [gameState.currentPlayer, dispatchAction]);

  const handleEndPhase = useCallback(() => {
    const turnManager = turnManagerRef.current;
    
    // Validate phase requirements
    const validation = turnManager.validatePhaseRequirements();
    if (!validation.valid) {
      toast.error(validation.message || "Cannot end phase");
      return false;
    }

    // Dispatch end phase action
    return dispatchAction({
      type: 'END_PHASE',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: {}
    });
  }, [gameState.currentPlayer, dispatchAction]);

  return {
    handleAction,
    handleEndTurn,
    handleEndPhase,
    getActionHistory: turnManagerRef.current.getActionHistory.bind(turnManagerRef.current)
  };
};
