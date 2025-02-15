import { GameState, GameAction, ValidationResult } from '@/types/game';

export class TurnManager {
  private state: GameState;
  private actionHistory: GameAction[];

  constructor(state: GameState) {
    this.state = state;
    this.actionHistory = [];
  }

  canPerformAction(action: GameAction): ValidationResult {
    const currentPhase = this.state.phase;
    const actionType = action.type;

    // Phase-specific validations
    switch (currentPhase) {
      case 'setup':
        if (actionType !== 'CLAIM_TERRITORY') {
          return {
            valid: false,
            message: 'Only territory claiming is allowed during setup'
          };
        }
        break;

      case 'building':
        if (!['BUILD', 'END_PHASE'].includes(actionType)) {
          return {
            valid: false,
            message: 'Only building actions are allowed during building phase'
          };
        }
        break;

      case 'recruitment':
        if (!['RECRUIT', 'END_PHASE'].includes(actionType)) {
          return {
            valid: false,
            message: 'Only recruitment actions are allowed during recruitment phase'
          };
        }
        break;

      case 'combat':
        if (!['ATTACK', 'END_PHASE', 'END_TURN'].includes(actionType)) {
          return {
            valid: false,
            message: 'Only combat actions are allowed during combat phase'
          };
        }
        break;

      default:
        return {
          valid: false,
          message: 'Invalid game phase'
        };
    }

    return this.validatePhaseRequirements(action);
  }

  validatePhaseRequirements(action: GameAction): ValidationResult {
    const currentPhase = this.state.phase;

    switch (currentPhase) {
      case 'setup':
        // Validate one territory claim per player
        const playerClaims = this.actionHistory.filter(
          a => a.type === 'CLAIM_TERRITORY' && a.playerId === action.playerId
        );
        if (playerClaims.length >= 1) {
          return {
            valid: false,
            message: 'You can only claim one territory during setup'
          };
        }
        break;

      case 'building':
        // Validate building limits
        const buildActions = this.actionHistory.filter(
          a => a.type === 'BUILD' && a.playerId === action.playerId
        );
        if (buildActions.length >= 3) {
          return {
            valid: false,
            message: 'Maximum building actions reached for this turn'
          };
        }
        break;

      case 'recruitment':
        // Validate recruitment limits
        const recruitActions = this.actionHistory.filter(
          a => a.type === 'RECRUIT' && a.playerId === action.playerId
        );
        if (recruitActions.length >= 2) {
          return {
            valid: false,
            message: 'Maximum recruitment actions reached for this turn'
          };
        }
        break;

      case 'combat':
        // Validate attack limits
        const attackActions = this.actionHistory.filter(
          a => a.type === 'ATTACK' && a.playerId === action.playerId
        );
        if (attackActions.length >= 3) {
          return {
            valid: false,
            message: 'Maximum attack actions reached for this turn'
          };
        }
        break;
    }

    return {
      valid: true,
      message: ''
    };
  }

  validateTurnTransition(): ValidationResult {
    const currentPhase = this.state.phase;
    
    // Phase-specific requirements for ending turn
    switch (currentPhase) {
      case 'setup':
        const hasClaimedTerritory = this.actionHistory.some(a => a.type === 'CLAIM_TERRITORY');
        if (!hasClaimedTerritory) {
          return {
            valid: false,
            message: 'Must claim a territory before ending turn'
          };
        }
        break;

      case 'combat':
        // No specific requirements for ending combat phase
        break;

      default:
        return {
          valid: false,
          message: 'Can only end turn during setup or combat phases'
        };
    }

    return {
      valid: true,
      message: ''
    };
  }

  trackAction(action: GameAction) {
    this.actionHistory.push(action);
  }

  clearTurnTracking() {
    this.actionHistory = [];
  }

  getActionHistory(): GameAction[] {
    return [...this.actionHistory];
  }
}
