
import { GameState, GameAction, Territory, Player, Resources, MilitaryUnit, ValidationResult, GamePhase, GameUpdate, GameUpdateType } from '@/types/game';

export class GameStateValidator {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  validateAction(action: GameAction): ValidationResult {
    if (action.playerId !== this.state.currentPlayer) {
      return {
        valid: false,
        message: "Not your turn"
      };
    }

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
      case 'SET_STATE':
        return this.validateSetState(action);
      default:
        return {
          valid: false,
          message: `Invalid action type: ${action.type}`
        };
    }
  }

  validateGameState(state: GameState): ValidationResult {
    const errors: string[] = [];

    if (!this.validateStateStructure(state)) {
      return {
        valid: false,
        message: "Invalid state structure"
      };
    }

    state.territories.forEach(territory => {
      const territoryValidation = this.validateTerritory(territory);
      if (!territoryValidation.valid) {
        errors.push(`Territory ${territory.id}: ${territoryValidation.message}`);
      }
    });

    state.players.forEach(player => {
      const playerValidation = this.validatePlayer(player);
      if (!playerValidation.valid) {
        errors.push(`Player ${player.id}: ${playerValidation.message}`);
      }
    });

    if (typeof state.turn !== 'number' || state.turn < 1) {
      errors.push("Invalid turn number");
    }

    return {
      valid: errors.length === 0,
      message: errors.join(", ")
    };
  }

  private getActionHistory(): Array<{ type: GameUpdateType; playerId: string; timestamp: number }> {
    return this.state.updates
      .filter(update => (update.type === 'territory' || update.type === 'combat'))
      .map(update => ({
        type: update.type,
        playerId: update.playerId || '',
        timestamp: update.timestamp
      }));
  }

  private validateStateStructure(state: unknown): state is GameState {
    if (!state || typeof state !== 'object') return false;

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

    const stateObj = state as Record<string, unknown>;
    return requiredProperties.every(prop => {
      const value = stateObj[prop];
      return value !== undefined;
    });
  }

  private validatePlayer(player: Player): ValidationResult {
    const errors: string[] = [];

    if (!this.validateResources(player.resources)) {
      errors.push("Invalid resources");
    }

    if (!Array.isArray(player.territories)) {
      errors.push("Invalid territories list");
    } else {
      const validTerritoryIds = new Set(this.state.territories.map(t => t.id));
      player.territories.forEach(territoryId => {
        if (!validTerritoryIds.has(territoryId)) {
          errors.push(`Invalid territory reference: ${territoryId}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      message: errors.join(", ")
    };
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
    const defaultResources: Resources = {
      gold: 0,
      wood: 0,
      stone: 0,
      food: 0
    };

    return (
      typeof unit.type === 'string' &&
      typeof unit.health === 'number' &&
      typeof unit.damage === 'number' &&
      typeof unit.experience === 'number' &&
      typeof unit.hasMoved === 'boolean' &&
      this.validateResources({ ...defaultResources, ...unit.cost }) && // Merge with default resources
      unit.health > 0 &&
      unit.damage > 0 &&
      unit.experience >= 0
    );
  }

  private validateTerritory(territory: Territory): ValidationResult {
    const errors: string[] = [];

    if (!territory.coordinates || 
        typeof territory.coordinates.q !== 'number' || 
        typeof territory.coordinates.r !== 'number') {
      errors.push("Invalid coordinates");
    }

    if (!this.validateResources(territory.resources)) {
      errors.push("Invalid resources");
    }

    if (territory.militaryUnit && !this.validateMilitaryUnit(territory.militaryUnit)) {
      errors.push("Invalid military unit");
    }

    if (territory.owner && !this.state.players.some(p => p.id === territory.owner)) {
      errors.push("Invalid owner reference");
    }

    return {
      valid: errors.length === 0,
      message: errors.join(", ")
    };
  }

  private validateTurnActions(playerId: string): ValidationResult {
    const turnUpdates = this.state.updates.filter(update => {
      const timestamp = Number(update.timestamp);
      const lastUpdated = Number(this.state.lastUpdated);
      if (isNaN(timestamp) || isNaN(lastUpdated)) return false;
      return timestamp > lastUpdated && update.playerId === playerId;
    });

    return {
      valid: turnUpdates.length > 0,
      message: turnUpdates.length === 0 ? "No actions taken this turn" : ""
    };
  }

  private validateClaimTerritory(action: GameAction): ValidationResult {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    
    if (!territory) {
      return {
        valid: false,
        message: "Territory not found"
      };
    }

    if (territory.owner) {
      return {
        valid: false,
        message: "Territory already claimed"
      };
    }

    if (this.state.phase !== 'setup') {
      return {
        valid: false,
        message: "Can only claim territories in setup phase"
      };
    }

    const playerTerritories = this.state.territories.filter(t => t.owner === action.playerId);
    if (playerTerritories.length >= 1) {
      return {
        valid: false,
        message: "Already claimed maximum territories for setup phase"
      };
    }

    return { valid: true };
  }

  private validateBuild(action: GameAction): ValidationResult {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    
    if (!territory) {
      return {
        valid: false,
        message: "Territory not found"
      };
    }

    if (territory.owner !== action.playerId) {
      return {
        valid: false,
        message: "Cannot build on territory you don't own"
      };
    }

    if (territory.building) {
      return {
        valid: false,
        message: "Territory already has a building"
      };
    }

    if (this.state.phase !== 'building') {
      return {
        valid: false,
        message: "Can only build during building phase"
      };
    }

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player || !this.validateResources(player.resources)) {
      return {
        valid: false,
        message: "Insufficient resources"
      };
    }

    return { valid: true };
  }

  private validateRecruit(action: GameAction): ValidationResult {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    
    if (!territory) {
      return {
        valid: false,
        message: "Territory not found"
      };
    }

    if (territory.owner !== action.playerId) {
      return {
        valid: false,
        message: "Cannot recruit in territory you don't own"
      };
    }

    if (territory.militaryUnit) {
      return {
        valid: false,
        message: "Territory already has a military unit"
      };
    }

    if (this.state.phase !== 'recruitment') {
      return {
        valid: false,
        message: "Can only recruit during recruitment phase"
      };
    }

    if (territory.building !== 'barracks') {
      return {
        valid: false,
        message: "Can only recruit in territories with barracks"
      };
    }

    if (!this.validateMilitaryUnit(action.payload.unit)) {
      return {
        valid: false,
        message: "Invalid military unit configuration"
      };
    }

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) {
      return {
        valid: false,
        message: "Player not found"
      };
    }

    const unitCost = action.payload.unit.cost;
  
    // Use type assertion for the entries
    for (const [resource, cost] of Object.entries(unitCost) as Array<[keyof Resources, number]>) {
      if ((player.resources[resource] || 0) < (cost || 0)) {
        return {
          valid: false,
          message: `Insufficient ${resource}`
        };
      }
    }
  
    return { valid: true };
  }

  private validateAttack(action: GameAction): ValidationResult {
    const fromTerritory = this.state.territories.find(t => t.id === action.payload.fromTerritoryId);
    const toTerritory = this.state.territories.find(t => t.id === action.payload.toTerritoryId);
    
    if (!fromTerritory || !toTerritory) {
      return {
        valid: false,
        message: "Territory not found"
      };
    }

    if (fromTerritory.owner !== action.playerId) {
      return {
        valid: false,
        message: "Cannot attack from territory you don't own"
      };
    }

    if (toTerritory.owner === action.playerId) {
      return {
        valid: false,
        message: "Cannot attack your own territory"
      };
    }

    if (!fromTerritory.militaryUnit) {
      return {
        valid: false,
        message: "No military unit available to attack with"
      };
    }

    if (fromTerritory.militaryUnit.hasMoved) {
      return {
        valid: false,
        message: "Unit has already moved this turn"
      };
    }

    if (this.state.phase !== 'combat') {
      return {
        valid: false,
        message: "Can only attack during combat phase"
      };
    }

    if (!this.areTerritoriesAdjacent(fromTerritory, toTerritory)) {
      return {
        valid: false,
        message: "Can only attack adjacent territories"
      };
    }

    return { valid: true };
  }

  private validateEndTurn(action: GameAction): ValidationResult {
    const mandatoryActions = this.getMandatoryActionsForPhase(this.state.phase);
    const playerUpdates = this.state.updates.filter(
      update => update.playerId === action.playerId &&
                update.timestamp > this.state.lastUpdated &&
                (update.type === 'territory' || update.type === 'combat' || update.type === 'building')
    );

    for (const actionType of mandatoryActions) {
      const hasRequiredAction = playerUpdates.some(update => 
        (actionType === 'CLAIM_TERRITORY' && update.type === 'territory') ||
        (actionType === 'BUILD' && update.type === 'building') ||
        (actionType === 'ATTACK' && update.type === 'combat')
      );

      if (!hasRequiredAction) {
        return {
          valid: false,
          message: `Must perform ${actionType} before ending turn`
        };
      }
    }

    return { valid: true };
  }

  private validateEndPhase(action: GameAction): ValidationResult {
    const canEndPhase = this.canEndPhase(this.state.phase);
    if (!canEndPhase.valid) {
      return canEndPhase;
    }

    const uniquePlayers = new Set(
      this.state.updates
        .filter(update => {
          if (!update.timestamp || !update.playerId) return false;
          const updateTime = Number(update.timestamp);
          const lastUpdated = Number(this.state.lastUpdated);
          
          if (isNaN(updateTime) || isNaN(lastUpdated)) return false;
          
          return updateTime > lastUpdated &&
                 (update.type === 'territory' || update.type === 'combat' || update.type === 'building');
        })
        .map(update => update.playerId)
    );

    if (uniquePlayers.size < this.state.players.length) {
      return {
        valid: false,
        message: "All players must take their turns before ending phase"
      };
    }

    return { valid: true };
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

  private getMandatoryActionsForPhase(phase: string): string[] {
    switch (phase) {
      case 'setup':
        return ['CLAIM_TERRITORY'];
      case 'building':
        return []; // Building is optional
      case 'recruitment':
        return []; // Recruitment is optional
      case 'combat':
        return []; // Combat is optional
      default:
        return [];
    }
  }

  private canEndPhase(phase: GamePhase): ValidationResult {
    switch (phase) {
      case 'setup':
        const claimedTerritories = this.state.territories.filter(t => t.owner !== null);
        if (claimedTerritories.length < this.state.players.length) {
          return {
            valid: false,
            message: "All players must claim their starting territory"
          };
        }
        break;

      case 'building':
        for (const player of this.state.players) {
          if (this.hasExcessResources(player.resources)) {
            return {
              valid: false,
              message: `Player ${player.id} has unused resources`
            };
          }
        }
        break;

      case 'combat':
        break;

      default:
        return {
          valid: false,
          message: "Invalid phase"
        };
    }

    return { valid: true };
  }

  private hasExcessResources(resources: Resources): boolean {
    const thresholds = {
      gold: 200,
      wood: 100,
      stone: 100,
      food: 100
    };

    return Object.entries(resources).some(
      ([resource, amount]) => {
        if (typeof amount !== 'number') return false;
        const threshold = thresholds[resource as keyof typeof thresholds];
        return amount > threshold;
      }
    );
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
