import { GameState, GameAction, Territory, Player } from '@/types/game';

export class GameStateValidator {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  validateAction(action: GameAction): boolean {
    switch (action.type) {
      case 'CLAIM_TERRITORY':
        return this.validateClaimTerritory(action);
      case 'BUILD':
        return this.validateBuild(action);
      case 'RECRUIT':
        return this.validateRecruit(action);
      case 'ATTACK':
        return this.validateAttack(action);
      case 'END_TURN':
        return this.validateEndTurn(action);
      case 'END_PHASE':
        return this.validateEndPhase(action);
      default:
        return false;
    }
  }

  validateResources(player: Player, cost: Partial<Record<string, number>>): boolean {
    return Object.entries(cost).every(
      ([resource, amount]) => player.resources[resource as keyof typeof player.resources] >= (amount || 0)
    );
  }

  validateTurnTransition(): boolean {
    // Check if current player has completed required actions
    return true;
  }

  private validateClaimTerritory(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    return !!territory && !territory.owner;
  }

  private validateBuild(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    return !!territory && territory.owner === action.playerId && !territory.building;
  }

  private validateRecruit(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    return !!territory && territory.owner === action.playerId && !territory.militaryUnit;
  }

  private validateAttack(action: GameAction): boolean {
    const fromTerritory = this.state.territories.find(t => t.id === action.payload.fromTerritoryId);
    const toTerritory = this.state.territories.find(t => t.id === action.payload.toTerritoryId);
    
    return !!fromTerritory && 
           !!toTerritory && 
           fromTerritory.owner === action.playerId && 
           toTerritory.owner !== action.playerId &&
           fromTerritory.militaryUnit != null;
  }

  private validateEndTurn(action: GameAction): boolean {
    return this.state.currentPlayer === action.playerId;
  }

  private validateEndPhase(action: GameAction): boolean {
    return this.state.currentPlayer === action.playerId;
  }
}

export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') return false;

  const gameState = state as any;

  // Check required properties
  const requiredProperties = [
    'id',
    'phase',
    'turn',
    'currentPlayer',
    'players',
    'territories',
    'updates',
    'weather',
    'timeOfDay',
    'lastUpdated',
    'version'
  ];

  return requiredProperties.every(prop => prop in gameState);
}
