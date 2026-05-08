import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameAction, ValidationResult, GamePhase } from '@/types/game';
import { GameStateManager, BUILDING_COSTS, checkVictoryCondition } from '@/lib/game-utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface GameStateOptions {
  persist?: boolean;
  onStateChange?: (state: GameState) => void;
  validateState?: (state: GameState) => ValidationResult;
}

const PERSIST_KEY = 'game:state';

function deepCopyState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => ({
      ...p,
      resources: { ...p.resources },
      territories: [...p.territories],
    })),
    territories: state.territories.map(t => ({
      ...t,
      resources: { ...t.resources },
      militaryUnit: t.militaryUnit ? { ...t.militaryUnit } : null,
    })),
    updates: [...state.updates],
  };
}

export const useGameState = (
  initialState: GameState,
  options: GameStateOptions = {}
) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [lastAction, setLastAction] = useState<GameAction | null>(null);
  const gameStateManagerRef = useRef(new GameStateManager(initialState));
  const queryClient = useQueryClient();

  const historyRef = useRef<GameState[]>([initialState]);
  const currentIndexRef = useRef(0);

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
              localStorage.removeItem(PERSIST_KEY);
            }
          } else {
            setGameState(parsedState);
            gameStateManagerRef.current.setState(parsedState);
            historyRef.current = [parsedState];
            currentIndexRef.current = 0;
          }
        } catch {
          localStorage.removeItem(PERSIST_KEY);
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const newState = deepCopyState(currentState);

    switch (action.type) {
      case 'CLAIM_TERRITORY': {
        const territory = newState.territories.find(t => t.id === action.payload.territoryId);
        const player = newState.players.find(p => p.id === action.playerId);
        if (territory && player) {
          territory.owner = action.playerId;
          territory.lastUpdated = action.timestamp;
          if (!player.territories.includes(territory.id)) {
            player.territories.push(territory.id);
          }
        }
        break;
      }

      case 'BUILD': {
        const territory = newState.territories.find(t => t.id === action.payload.territoryId);
        const player = newState.players.find(p => p.id === action.playerId);
        if (territory && player) {
          const cost = BUILDING_COSTS[action.payload.buildingType] ?? {};
          for (const [res, amt] of Object.entries(cost) as Array<[keyof typeof player.resources, number]>) {
            player.resources[res] = Math.max(0, (player.resources[res] ?? 0) - (amt ?? 0));
          }
          territory.building = action.payload.buildingType;
          territory.lastUpdated = action.timestamp;
        }
        break;
      }

      case 'RECRUIT': {
        const territory = newState.territories.find(t => t.id === action.payload.territoryId);
        const player = newState.players.find(p => p.id === action.playerId);
        if (territory && player) {
          const unitCost = action.payload.unit?.cost ?? {};
          for (const [res, amt] of Object.entries(unitCost) as Array<[keyof typeof player.resources, number]>) {
            player.resources[res] = Math.max(0, (player.resources[res] ?? 0) - (amt ?? 0));
          }
          territory.militaryUnit = { ...action.payload.unit, hasMoved: false };
          territory.lastUpdated = action.timestamp;
        }
        break;
      }

      case 'ATTACK': {
        const fromTerritory = newState.territories.find(t => t.id === action.payload.fromTerritoryId);
        const toTerritory = newState.territories.find(t => t.id === action.payload.toTerritoryId);

        if (fromTerritory && toTerritory && fromTerritory.militaryUnit) {
          const combatResult = gameStateManagerRef.current.getCombatResult(fromTerritory, toTerritory);

          // Apply damage
          if (fromTerritory.militaryUnit) {
            fromTerritory.militaryUnit.health -= combatResult.attackerDamage;
            fromTerritory.militaryUnit.hasMoved = true;
          }
          if (toTerritory.militaryUnit) {
            toTerritory.militaryUnit.health -= combatResult.defenderDamage;
          }

          // Resolve deaths
          if (fromTerritory.militaryUnit && fromTerritory.militaryUnit.health <= 0) {
            fromTerritory.militaryUnit = null;
          }

          const prevDefenderOwner = toTerritory.owner;
          if (combatResult.defenderDestroyed || !toTerritory.militaryUnit) {
            if (toTerritory.militaryUnit && toTerritory.militaryUnit.health <= 0) {
              toTerritory.militaryUnit = null;
            }
            toTerritory.owner = fromTerritory.owner;
            toTerritory.building = null;

            // Update territory lists
            if (prevDefenderOwner && prevDefenderOwner !== toTerritory.owner) {
              const oldOwner = newState.players.find(p => p.id === prevDefenderOwner);
              if (oldOwner) oldOwner.territories = oldOwner.territories.filter(id => id !== toTerritory.id);
              const newOwner = newState.players.find(p => p.id === toTerritory.owner);
              if (newOwner && !newOwner.territories.includes(toTerritory.id)) {
                newOwner.territories.push(toTerritory.id);
              }
            }
          } else if (toTerritory.militaryUnit && toTerritory.militaryUnit.health <= 0) {
            toTerritory.militaryUnit = null;
          }

          fromTerritory.lastUpdated = action.timestamp;
          toTerritory.lastUpdated = action.timestamp;
        }
        break;
      }

      case 'END_TURN': {
        // Building income for the player ending their turn
        const turningPlayer = newState.players.find(p => p.id === action.playerId);
        if (turningPlayer) {
          const playerTerritories = newState.territories.filter(t => t.owner === turningPlayer.id);
          for (const territory of playerTerritories) {
            if (territory.building === 'lumber_mill') turningPlayer.resources.wood += 5;
            else if (territory.building === 'mine')   turningPlayer.resources.stone += 5;
            else if (territory.building === 'market') turningPlayer.resources.gold += 5;
            else if (territory.building === 'farm')   turningPlayer.resources.food += 5;
          }
        }

        const currentPlayerIndex = newState.players.findIndex(p => p.id === newState.currentPlayer);
        const nextPlayerIndex = (currentPlayerIndex + 1) % newState.players.length;
        newState.currentPlayer = newState.players[nextPlayerIndex].id;
        newState.turn += 1;

        for (const territory of newState.territories) {
          if (territory.militaryUnit) territory.militaryUnit.hasMoved = false;
        }
        break;
      }

      case 'END_PHASE': {
        const phases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
        const currentPhaseIndex = phases.indexOf(newState.phase);
        if (currentPhaseIndex < phases.length - 1) {
          newState.phase = phases[currentPhaseIndex + 1];
        }
        // When moving to building phase from setup, reset currentPlayer to first player
        if (newState.phase === 'building') {
          newState.currentPlayer = newState.players[0].id;
        }
        break;
      }

      case 'SET_STATE': {
        return action.payload.state as GameState;
      }
    }

    newState.version += 1;
    newState.lastUpdated = action.timestamp;

    // Check victory after every game action
    if (action.type !== 'SET_STATE' && newState.phase !== 'end') {
      const victory = checkVictoryCondition(newState);
      if (victory.winner) {
        newState.phase = 'end';
        newState.updates.push({
          type: 'system',
          message: `${victory.winner} wins by ${victory.type}!`,
          timestamp: action.timestamp,
        });
        toast.success(`${victory.winner} wins by ${victory.type} victory!`);
      }
    }

    return newState;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dispatchAction = useCallback(async (action: GameAction): Promise<boolean> => {
    try {
      const validation = gameStateManagerRef.current.validateGameAction(action);
      if (!validation.valid) {
        toast.error(validation.message || 'Invalid action');
        return false;
      }

      const newState = computeNewState(action, gameState);

      if (options.validateState) {
        const stateValidation = options.validateState(newState);
        if (!stateValidation.valid) {
          toast.error('Invalid game state after action');
          return false;
        }
      }

      setGameState(newState);
      setLastAction(action);
      addToHistory(newState);
      gameStateManagerRef.current.setState(newState);

      queryClient.setQueryData(['gameState', newState.id], newState);

      if (options.persist) {
        localStorage.setItem(PERSIST_KEY, JSON.stringify(newState));
      }

      if (options.onStateChange) {
        options.onStateChange(newState);
      }

      return true;
    } catch (error) {
      console.error('Error dispatching action:', error);
      toast.error('Error processing game action');
      return false;
    }
  }, [gameState, computeNewState, options, addToHistory, queryClient]);

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
