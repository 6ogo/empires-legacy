import { GameState, GameAction, Territory, GamePlayer, Resources, MilitaryUnit, ValidationResult, GamePhase } from '@/types/game';
import { BUILDING_COSTS } from './game-constants';

export class GameStateValidator {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  validateAction(action: GameAction): ValidationResult {
    // SET_STATE is always valid structurally — let validateSetState check the payload
    if (action.type === 'SET_STATE') {
      return this.validateSetState(action);
    }

    if (action.playerId !== this.state.currentPlayer) {
      return { valid: false, message: 'Not your turn' };
    }

    switch (action.type) {
      case 'CLAIM_TERRITORY': return this.validateClaimTerritory(action);
      case 'BUILD':           return this.validateBuild(action);
      case 'RECRUIT':         return this.validateRecruit(action);
      case 'ATTACK':          return this.validateAttack(action);
      case 'END_TURN':        return this.validateEndTurn(action);
      case 'END_PHASE':       return this.validateEndPhase(action);
      default:
        return { valid: false, message: `Unknown action type: ${action.type}` };
    }
  }

  validateGameState(state: GameState): ValidationResult {
    if (!this.validateStateStructure(state)) {
      return { valid: false, message: 'Invalid state structure' };
    }
    return { valid: true };
  }

  private validateStateStructure(state: unknown): state is GameState {
    if (!state || typeof state !== 'object') return false;
    const required = ['id', 'phase', 'turn', 'currentPlayer', 'players', 'territories', 'updates', 'weather', 'timeOfDay', 'lastUpdated', 'version'];
    const obj = state as Record<string, unknown>;
    return required.every(prop => obj[prop] !== undefined);
  }

  private validatePlayer(player: GamePlayer): ValidationResult {
    if (!this.validateResources(player.resources)) {
      return { valid: false, message: 'Invalid resources' };
    }
    if (!Array.isArray(player.territories)) {
      return { valid: false, message: 'Invalid territories list' };
    }
    return { valid: true };
  }

  private validateResources(resources: Resources): boolean {
    return (
      typeof resources.gold === 'number' &&
      typeof resources.wood === 'number' &&
      typeof resources.stone === 'number' &&
      typeof resources.food === 'number' &&
      resources.gold >= 0 &&
      resources.wood >= 0 &&
      resources.stone >= 0 &&
      resources.food >= 0
    );
  }

  private validateMilitaryUnit(unit: MilitaryUnit): boolean {
    return (
      typeof unit.type === 'string' &&
      typeof unit.health === 'number' &&
      typeof unit.damage === 'number' &&
      typeof unit.experience === 'number' &&
      typeof unit.hasMoved === 'boolean' &&
      unit.health > 0 &&
      unit.damage > 0 &&
      unit.experience >= 0
    );
  }

  private validateTerritory(territory: Territory): ValidationResult {
    if (!territory.coordinates ||
        typeof territory.coordinates.q !== 'number' ||
        typeof territory.coordinates.r !== 'number') {
      return { valid: false, message: 'Invalid coordinates' };
    }
    if (!this.validateResources(territory.resources)) {
      return { valid: false, message: 'Invalid resources' };
    }
    if (territory.militaryUnit && !this.validateMilitaryUnit(territory.militaryUnit)) {
      return { valid: false, message: 'Invalid military unit' };
    }
    return { valid: true };
  }

  private validateClaimTerritory(action: GameAction): ValidationResult {
    if (this.state.phase !== 'setup') {
      return { valid: false, message: 'Can only claim territories in setup phase' };
    }

    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return { valid: false, message: 'Territory not found' };
    if (territory.owner) return { valid: false, message: 'Territory already claimed' };

    const playerTerritories = this.state.territories.filter(t => t.owner === action.playerId);
    if (playerTerritories.length >= 1) {
      return { valid: false, message: 'Already claimed starting territory' };
    }

    // Ensure not adjacent to other claimed territories
    const hasAdjacentClaimed = this.state.territories.some(t =>
      t.owner !== null && this.areTerritoriesAdjacent(territory, t)
    );
    if (hasAdjacentClaimed) {
      return { valid: false, message: 'Starting territory must not be adjacent to another claimed territory' };
    }

    return { valid: true };
  }

  private validateBuild(action: GameAction): ValidationResult {
    if (this.state.phase !== 'building') {
      return { valid: false, message: 'Can only build during building phase' };
    }

    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return { valid: false, message: 'Territory not found' };
    if (territory.owner !== action.playerId) {
      return { valid: false, message: 'Cannot build on territory you do not own' };
    }
    if (territory.building) {
      return { valid: false, message: 'Territory already has a building' };
    }

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) return { valid: false, message: 'Player not found' };

    const cost = BUILDING_COSTS[action.payload.buildingType] ?? {};
    for (const [resource, amount] of Object.entries(cost) as Array<[keyof Resources, number]>) {
      if ((player.resources[resource] ?? 0) < (amount ?? 0)) {
        return { valid: false, message: `Insufficient ${resource} (need ${amount}, have ${player.resources[resource] ?? 0})` };
      }
    }

    return { valid: true };
  }

  private validateRecruit(action: GameAction): ValidationResult {
    if (this.state.phase !== 'recruitment') {
      return { valid: false, message: 'Can only recruit during recruitment phase' };
    }

    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return { valid: false, message: 'Territory not found' };
    if (territory.owner !== action.playerId) {
      return { valid: false, message: 'Cannot recruit in territory you do not own' };
    }
    if (territory.militaryUnit) {
      return { valid: false, message: 'Territory already has a military unit' };
    }
    if (territory.building !== 'barracks') {
      return { valid: false, message: 'Can only recruit in territories with a barracks' };
    }

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) return { valid: false, message: 'Player not found' };

    const unit = action.payload.unit;
    if (!unit) return { valid: false, message: 'No unit specified' };

    const unitCost = unit.cost ?? {};
    for (const [resource, amount] of Object.entries(unitCost) as Array<[keyof Resources, number]>) {
      if ((player.resources[resource] ?? 0) < (amount ?? 0)) {
        return { valid: false, message: `Insufficient ${resource}` };
      }
    }

    return { valid: true };
  }

  private validateAttack(action: GameAction): ValidationResult {
    if (this.state.phase !== 'combat') {
      return { valid: false, message: 'Can only attack during combat phase' };
    }

    const fromTerritory = this.state.territories.find(t => t.id === action.payload.fromTerritoryId);
    const toTerritory = this.state.territories.find(t => t.id === action.payload.toTerritoryId);

    if (!fromTerritory || !toTerritory) return { valid: false, message: 'Territory not found' };
    if (fromTerritory.owner !== action.playerId) {
      return { valid: false, message: 'Cannot attack from territory you do not own' };
    }
    if (toTerritory.owner === action.playerId) {
      return { valid: false, message: 'Cannot attack your own territory' };
    }
    if (!fromTerritory.militaryUnit) {
      return { valid: false, message: 'No military unit to attack with' };
    }
    if (fromTerritory.militaryUnit.hasMoved) {
      return { valid: false, message: 'Unit has already moved this turn' };
    }
    if (!this.areTerritoriesAdjacent(fromTerritory, toTerritory)) {
      return { valid: false, message: 'Can only attack adjacent territories' };
    }

    return { valid: true };
  }

  private validateEndTurn(action: GameAction): ValidationResult {
    // Simplified — just check it's the current player's turn (already verified by the outer check)
    return { valid: true };
  }

  private validateEndPhase(action: GameAction): ValidationResult {
    return this.canEndPhase(this.state.phase);
  }

  private validateSetState(action: GameAction): ValidationResult {
    return this.validateGameState(action.payload.state);
  }

  private areTerritoriesAdjacent(t1: Territory, t2: Territory): boolean {
    const dx = Math.abs(t1.coordinates.q - t2.coordinates.q);
    const dy = Math.abs(t1.coordinates.r - t2.coordinates.r);
    const ds = Math.abs((t1.coordinates.q + t1.coordinates.r) - (t2.coordinates.q + t2.coordinates.r));
    return (dx <= 1 && dy <= 1 && ds <= 1) && !(dx === 0 && dy === 0);
  }

  private canEndPhase(phase: GamePhase): ValidationResult {
    switch (phase) {
      case 'setup': {
        const claimedCount = this.state.territories.filter(t => t.owner !== null).length;
        if (claimedCount < this.state.players.length) {
          return { valid: false, message: 'All players must claim a starting territory before ending setup' };
        }
        break;
      }
      case 'building':
      case 'recruitment':
      case 'combat':
        // No mandatory requirements
        break;
      default:
        return { valid: false, message: 'Cannot end this phase' };
    }
    return { valid: true };
  }
}

export function isValidGameState(state: unknown): state is GameState {
  const validator = new GameStateValidator(state as GameState);
  const validation = validator.validateGameState(state as GameState);
  return validation.valid;
}

export function validateGameAction(state: GameState, action: GameAction): ValidationResult {
  const validator = new GameStateValidator(state);
  return validator.validateAction(action);
}
