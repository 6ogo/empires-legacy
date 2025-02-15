import { GameState, GameAction, GamePhase, Territory, Player } from '@/types/game';
import { GameStateValidator } from './game-validation';

export class GameStateManager {
  private state: GameState;
  private validator: GameStateValidator;

  constructor(state: GameState) {
    this.state = state;
    this.validator = new GameStateValidator(state);
  }

  getState(): GameState {
    return this.state;
  }

  applyAction(action: GameAction): boolean {
    // Validate the action first
    if (!this.validator.validateAction(action)) {
      return false;
    }

    // Apply the action
    switch (action.type) {
      case 'CLAIM_TERRITORY':
        return this.handleClaimTerritory(action);
      case 'BUILD':
        return this.handleBuild(action);
      case 'RECRUIT':
        return this.handleRecruit(action);
      case 'ATTACK':
        return this.handleAttack(action);
      case 'END_TURN':
        return this.handleEndTurn(action);
      case 'END_PHASE':
        return this.handleEndPhase(action);
      default:
        return false;
    }
  }

  private handleClaimTerritory(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;

    territory.owner = action.playerId;
    territory.lastUpdated = action.timestamp;

    this.addUpdate({
      type: 'territory',
      message: `Player ${action.playerId} claimed territory ${territory.id}`,
      timestamp: action.timestamp
    });

    return true;
  }

  private handleBuild(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;

    territory.building = action.payload.buildingType;
    territory.lastUpdated = action.timestamp;

    this.addUpdate({
      type: 'building',
      message: `Player ${action.playerId} built ${action.payload.buildingType} in territory ${territory.id}`,
      timestamp: action.timestamp
    });

    return true;
  }

  private handleRecruit(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;

    territory.militaryUnit = action.payload.unit;
    territory.lastUpdated = action.timestamp;

    this.addUpdate({
      type: 'recruitment',
      message: `Player ${action.playerId} recruited ${action.payload.unit.type} in territory ${territory.id}`,
      timestamp: action.timestamp
    });

    return true;
  }

  private handleAttack(action: GameAction): boolean {
    const attackingTerritory = this.state.territories.find(t => t.id === action.payload.fromTerritoryId);
    const defendingTerritory = this.state.territories.find(t => t.id === action.payload.toTerritoryId);
    
    if (!attackingTerritory || !defendingTerritory) return false;

    // Apply combat results
    const result = this.resolveCombat(attackingTerritory, defendingTerritory);
    
    this.addUpdate({
      type: 'combat',
      message: `Combat occurred between territories ${attackingTerritory.id} and ${defendingTerritory.id}`,
      timestamp: action.timestamp
    });

    return true;
  }

  private handleEndTurn(action: GameAction): boolean {
    // Update current player
    const currentPlayerIndex = this.state.players.findIndex(p => p.id === this.state.currentPlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.state.players.length;
    
    this.state.currentPlayer = this.state.players[nextPlayerIndex].id;
    this.state.turn += 1;
    
    this.addUpdate({
      type: 'system',
      message: `Turn ended. Player ${this.state.currentPlayer}'s turn begins`,
      timestamp: action.timestamp
    });

    return true;
  }

  private handleEndPhase(action: GameAction): boolean {
    const phases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
    const currentPhaseIndex = phases.indexOf(this.state.phase);
    
    if (currentPhaseIndex === phases.length - 1) {
      // Game is over
      this.state.phase = 'end';
    } else {
      this.state.phase = phases[currentPhaseIndex + 1];
    }
    
    this.addUpdate({
      type: 'system',
      message: `Phase changed to ${this.state.phase}`,
      timestamp: action.timestamp
    });

    return true;
  }

  private resolveCombat(attackingTerritory: Territory, defendingTerritory: Territory): boolean {
    if (!attackingTerritory.militaryUnit || !defendingTerritory.militaryUnit) return false;

    const attackDamage = attackingTerritory.militaryUnit.damage;
    const defenderHealth = defendingTerritory.militaryUnit.health;

    // Apply damage
    defendingTerritory.militaryUnit.health -= attackDamage;

    // Check if defender is defeated
    if (defendingTerritory.militaryUnit.health <= 0) {
      // Capture territory
      defendingTerritory.owner = attackingTerritory.owner;
      defendingTerritory.militaryUnit = null;
      defendingTerritory.building = null;
    }

    return true;
  }

  private addUpdate(update: { type: string; message: string; timestamp: number }) {
    this.state.updates.push(update);
    this.state.lastUpdated = update.timestamp;
    this.state.version += 1;
  }
}
