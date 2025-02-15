import { useCallback } from 'react';
import { GameAction, Territory, MilitaryUnit } from '@/types/game';

export const useGameActions = (dispatchAction: (action: GameAction) => boolean) => {
  const claimTerritory = useCallback((territoryId: string, playerId: string) => {
    return dispatchAction({
      type: 'CLAIM_TERRITORY',
      payload: { territoryId },
      playerId,
      timestamp: Date.now()
    });
  }, [dispatchAction]);

  const buildStructure = useCallback((territoryId: string, buildingType: string, playerId: string) => {
    return dispatchAction({
      type: 'BUILD',
      payload: { territoryId, buildingType },
      playerId,
      timestamp: Date.now()
    });
  }, [dispatchAction]);

  const recruitUnit = useCallback((territoryId: string, unit: MilitaryUnit, playerId: string) => {
    return dispatchAction({
      type: 'RECRUIT',
      payload: { territoryId, unit },
      playerId,
      timestamp: Date.now()
    });
  }, [dispatchAction]);

  const attackTerritory = useCallback((
    fromTerritoryId: string, 
    toTerritoryId: string, 
    playerId: string
  ) => {
    return dispatchAction({
      type: 'ATTACK',
      payload: { fromTerritoryId, toTerritoryId },
      playerId,
      timestamp: Date.now()
    });
  }, [dispatchAction]);

  const endTurn = useCallback((playerId: string) => {
    return dispatchAction({
      type: 'END_TURN',
      payload: {},
      playerId,
      timestamp: Date.now()
    });
  }, [dispatchAction]);

  const endPhase = useCallback((playerId: string) => {
    return dispatchAction({
      type: 'END_PHASE',
      payload: {},
      playerId,
      timestamp: Date.now()
    });
  }, [dispatchAction]);

  return {
    claimTerritory,
    buildStructure,
    recruitUnit,
    attackTerritory,
    endTurn,
    endPhase
  };
};
