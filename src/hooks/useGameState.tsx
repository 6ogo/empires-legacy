import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameAction, ValidationResult, GamePhase, CombatResult } from '@/types/game';
import { GameStateManager } from '@/lib/game-utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface GameStateOptions {
  persist?: boolean;
  onStateChange?: (state: GameState) => void;
  validateState?: (state: GameState) => ValidationResult;
}

const PERSIST_KEY = 'game:state';

export const useGameState = (
  initialState: GameState,
  options: GameStateOptions = {}
) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [lastAction, setLastAction] = useState<GameAction | null>(null);
  const gameStateManagerRef = useRef(new GameStateManager(initialState));
  const queryClient = useQueryClient();

  // Keep track of undo/redo history
  const historyRef = useRef<GameState[]>([initialState]);
  const currentIndexRef = useRef(0);

  // Load persisted state if enabled
  useEffect(() => {
    if (options.persist) {
      const persistedState = localStorage.getItem(PERSIST_KEY);
      if (persistedState) {
        try {
          const parsedState = JSON.parse(persistedState);
          if (options.validateState) {
            const validation = options.validateState(parsedState);
            if (validation.valid) {
              setGameState(parsedState);
              gameStateManagerRef.current.setState(parsedState);
              historyRef.current = [parsedState];
              currentIndexRef.current = 0;
            } else {
              console.error('Invalid persisted state:', validation.message);
              localStorage.removeItem(PERSIST_KEY);
            }
          } else {
            setGameState(parsedState);
            gameStateManagerRef.current.setState(parsedState);
            historyRef.current = [parsedState];
            currentIndexRef.current = 0;
          }
        } catch (error) {
          console.error('Error loading persisted state:', error);
          localStorage.removeItem(PERSIST_KEY);
        }
      }
    }
  }, [options.persist, options.validateState]);

  const addToHistory = useCallback((state: GameState) => {
    historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    historyRef.current.push(state);
    currentIndexRef.current++;
    
    if (historyRef.current.length > 50) {
      historyRef.current = historyRef.current.slice(-50);
      currentIndexRef.current = historyRef.current.length - 1;
    }
  }, []);

  const computeNewState = useCallback((action: GameAction, currentState: GameState): GameState => {
    const newState = { ...currentState };

    switch (action.type) {
      case 'CLAIM_TERRITORY': {
        const territory = newState.territories.find(t => t.id === action.payload.territoryId);
        if (territory) {
          territory.owner = action.playerId;
          territory.lastUpdated = action.timestamp;
        }
        break;
      }
      case 'BUILD': {
        const territory = newState.territories.find(t => t.id === action.payload.territoryId);
        if (territory) {
          territory.building = action.payload.buildingType;
          territory.lastUpdated = action.timestamp;
        }
        break;
      }
      case 'RECRUIT': {
        const territory = newState.territories.find(t => t.id === action.payload.territoryId);
        if (territory) {
          territory.militaryUnit = action.payload.unit;
          territory.lastUpdated = action.timestamp;
        }
        break;
      }
      case 'ATTACK': {
        const fromTerritory = newState.territories.find(t => t.id === action.payload.fromTerritoryId);
        const toTerritory = newState.territories.find(t => t.id === action.payload.toTerritoryId);
        
        if (fromTerritory && toTerritory) {
          const combatResult = gameStateManagerRef.current.getCombatResult(fromTerritory, toTerritory);
          
          if (combatResult.defenderDestroyed) {
            toTerritory.owner = fromTerritory.owner;
            toTerritory.militaryUnit = null;
          }
          
          if (fromTerritory.militaryUnit) {
            fromTerritory.militaryUnit.health -= combatResult.attackerDamage;
          }
          if (toTerritory.militaryUnit) {
            toTerritory.militaryUnit.health -= combatResult.defenderDamage;
          }
          
          if (fromTerritory.militaryUnit?.health <= 0) {
            fromTerritory.militaryUnit = null;
          }
          if (toTerritory.militaryUnit?.health <= 0) {
            toTerritory.militaryUnit = null;
          }

          fromTerritory.lastUpdated = action.timestamp;
          toTerritory.lastUpdated = action.timestamp;
        }
        break;
      }
      case 'END_TURN': {
        const currentPlayerIndex = newState.players.findIndex(p => p.id === newState.currentPlayer);
        const nextPlayerIndex = (currentPlayerIndex + 1) % newState.players.length;
        
        newState.currentPlayer = newState.players[nextPlayerIndex].id;
        newState.turn += 1;
        
        newState.territories.forEach(territory => {
          if (territory.militaryUnit) {
            territory.militaryUnit.hasMoved = false;
          }
        });
        break;
      }
      case 'END_PHASE': {
        const phases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
        const currentPhaseIndex = phases.indexOf(newState.phase);
        
        if (currentPhaseIndex === phases.length - 1) {
          newState.phase = 'end';
        } else {
          newState.phase = phases[currentPhaseIndex + 1];
        }
        break;
      }
      case 'SET_STATE': {
        return action.payload.state;
      }
    }

    newState.version += 1;
    newState.lastUpdated = action.timestamp;

    return newState;
  }, []);

  const dispatchAction = useCallback(async (action: GameAction) => {
    try {
      const validation = await gameStateManagerRef.current.validateGameAction(action);
      if (!validation.valid) {
        toast.error(validation.message || 'Invalid action');
        return false;
      }

      const newState = computeNewState(action, gameState);

      if (options.validateState) {
        const stateValidation = options.validateState(newState);
        if (!stateValidation.valid) {
          toast.error('Invalid game state');
          return false;
        }
      }

      setGameState(newState);
      setLastAction(action);
      addToHistory(newState);
      gameStateManagerRef.current.setState(newState);

      queryClient.setQueryData(['gameState', newState.id], newState);

      if (action.type !== 'SET_STATE' && newState.id) {
        await supabase
          .from('games')
          .update({ 
            state: JSON.stringify(newState) as unknown as Json,
            last_action_timestamp: action.timestamp.toString(),
            current_player: newState.currentPlayer,
            phase: newState.phase
          })
          .eq('id', parseInt(newState.id));
      }

      return true;
    } catch (error) {
      console.error('Error dispatching action:', error);
      toast.error('Error processing game action');
      return false;
    }
  }, [gameState, computeNewState, options.validateState, addToHistory, queryClient]);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      const previousState = historyRef.current[currentIndexRef.current];
      setGameState(previousState);
      gameStateManagerRef.current.setState(previousState);
    }
  }, []);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const nextState = historyRef.current[currentIndexRef.current];
      setGameState(nextState);
      gameStateManagerRef.current.setState(nextState);
    }
  }, []);

  const resetState = useCallback((newState: GameState = initialState) => {
    setGameState(newState);
    gameStateManagerRef.current.setState(newState);
    historyRef.current = [newState];
    currentIndexRef.current = 0;
    setLastAction(null);
    
    if (options.persist) {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(newState));
    }
  }, [initialState, options.persist]);

  return {
    gameState,
    lastAction,
    dispatchAction,
    undo,
    redo,
    resetState,
    canUndo: currentIndexRef.current > 0,
    canRedo: currentIndexRef.current < historyRef.current.length - 1,
  };
};

export default useGameState;
