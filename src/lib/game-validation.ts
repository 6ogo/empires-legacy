// src/lib/game-validation.ts
import { GameState, GameAction, Territory, Player, Resources, MilitaryUnit, ValidationResult } from '@/types/game';

export class GameStateValidator {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  validateAction(action: GameAction): ValidationResult {
    // First check if it's the player's turn
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

    // Validate basic state structure
    if (!this.validateStateStructure(state)) {
      return {
        valid: false,
        message: "Invalid state structure"
      };
    }

    // Validate territories
    state.territories.forEach(territory => {
      const territoryValidation = this.validateTerritory(territory);
      if (!territoryValidation.valid) {
        errors.push(`Territory ${territory.id}: ${territoryValidation.message}`);
      }
    });

    // Validate players
    state.players.forEach(player => {
      const playerValidation = this.validatePlayer(player);
      if (!playerValidation.valid) {
        errors.push(`Player ${player.id}: ${playerValidation.message}`);
      }
    });

    // Validate current player
    if (!state.players.some(p => p.id === state.currentPlayer)) {
      errors.push("Current player not found in players list");
    }

    // Validate game phase
    if (!['setup', 'building', 'recruitment', 'combat', 'end'].includes(state.phase)) {
      errors.push("Invalid game phase");
    }

    // Validate turn number
    if (typeof state.turn !== 'number' || state.turn < 1) {
      errors.push("Invalid turn number");
    }

    return {
      valid: errors.length === 0,
      message: errors.join(", ")
    };
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

    return requiredProperties.every(prop => prop in state);
  }

  private validateTerritory(territory: Territory): ValidationResult {
    const errors: string[] = [];

    // Validate coordinates
    if (!territory.coordinates || 
        typeof territory.coordinates.q !== 'number' || 
        typeof territory.coordinates.r !== 'number') {
      errors.push("Invalid coordinates");
    }

    // Validate resources
    if (!this.validateResources(territory.resources)) {
      errors.push("Invalid resources");
    }

    // Validate military unit if present
    if (territory.militaryUnit && !this.validateMilitaryUnit(territory.militaryUnit)) {
      errors.push("Invalid military unit");
    }

    // Validate owner reference
    if (territory.owner && !this.state.players.some(p => p.id === territory.owner)) {
      errors.push("Invalid owner reference");
    }

    return {
      valid: errors.length === 0,
      message: errors.join(", ")
    };
  }

  private validatePlayer(player: Player): ValidationResult {
    const errors: string[] = [];

    // Validate resources
    if (!this.validateResources(player.resources)) {
      errors.push("Invalid resources");
    }

    // Validate territories list
    if (!Array.isArray(player.territories)) {
      errors.push("Invalid territories list");
    } else {
      player.territories.forEach(territoryId => {
        if (!this.state.territories.some(t => t.id === territoryId)) {
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

    // Check if in setup phase
    if (this.state.phase !== 'setup') {
      return {
        valid: false,
        message: "Can only claim territories in setup phase"
      };
    }

    // Check if player has already claimed a territory
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

    // Check building phase
    if (this.state.phase !== 'building') {
      return {
        valid: false,
        message: "Can only build during building phase"
      };
    }

    // Check if player has sufficient resources
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

    // Check recruitment phase
    if (this.state.phase !== 'recruitment') {
      return {
        valid: false,
        message: "Can only recruit during recruitment phase"
      };
    }

    // Check if territory has barracks
    if (territory.building !== 'barracks') {
      return {
        valid: false,
        message: "Can only recruit in territories with barracks"
      };
    }

    // Validate unit being recruited
    if (!this.validateMilitaryUnit(action.payload.unit)) {
      return {
        valid: false,
        message: "Invalid military unit configuration"
      };
    }

    // Check if player has sufficient resources
    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) {
      return {
        valid: false,
        message: "Player not found"
      };
    }

    const unitCost = action.payload.unit.cost;
    for (const [resource, cost] of Object.entries(unitCost)) {
      if ((player.resources[resource as keyof Resources] || 0) < (cost || 0)) {
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

    // Check combat phase
    if (this.state.phase !== 'combat') {
      return {
        valid: false,
        message: "Can only attack during combat phase"
      };
    }

    // Check if territories are adjacent
    if (!this.areTerritoriesAdjacent(fromTerritory, toTerritory)) {
      return {
        valid: false,
        message: "Can only attack adjacent territories"
      };
    }

    return { valid: true };
  }

  private validateEndTurn(action: GameAction): ValidationResult {
    // Check if player has completed required actions for the phase
    const mandatoryActions = this.getMandatoryActionsForPhase(this.state.phase);
    const playerActions = this.state.updates.filter(
      update => update.type === 'action' && 
                update.playerId === action.playerId &&
                update.timestamp > this.state.lastUpdated
    );

    for (const actionType of mandatoryActions) {
      if (!playerActions.some(action => action.type === actionType)) {
        return {
          valid: false,
          message: `Must perform ${actionType} before ending turn`
        };
      }
    }

    return { valid: true };
  }

  private validateEndPhase(action: GameAction): ValidationResult {
    // Check if phase can be ended
    const canEndPhase = this.canEndPhase(this.state.phase);
    if (!canEndPhase.valid) {
      return canEndPhase;
    }

    // Check if all players have taken their turns
    const uniquePlayers = new Set(
      this.state.updates
        .filter(update => update.type === 'action' && update.timestamp > this.state.lastUpdated)
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
    // Validate the entire new state
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

  private canEndPhase(phase: string): ValidationResult {
    switch (phase) {
      case 'setup':
        // Check if all players have claimed their starting territory
        const claimedTerritories = this.state.territories.filter(t => t.owner !== null);
        if (claimedTerritories.length < this.state.players.length) {
          return {
            valid: false,
            message: "All players must claim their starting territory"
          };
        }
        break;

      case 'building':
        // Check if any player has pending resources to spend
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
        // Combat phase can always be ended
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
    // Define resource thresholds for excess
    const thresholds = {
      gold: 200,
      wood: 100,
      stone: 100,
      food: 100
    };

    return Object.entries(resources).some(
      ([resource, amount]) => amount > thresholds[resource as keyof typeof thresholds]
    );
  }
}

// Export helper functions for external use
export function isValidGameState(state: unknown): state is GameState {
  const validator = new GameStateValidator(state as GameState);
  const validation = validator.validateGameState(state as GameState);
  return validation.valid;
}

export function validateGameAction(state: GameState, action: GameAction): ValidationResult {
  const validator = new GameStateValidator(state);
  return validator.validateAction(action);
}
