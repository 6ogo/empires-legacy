
import { GameState, GameAction, GamePhase, ValidationResult } from '@/types/game';

export class TurnManager {
  private state: GameState;
  private maxTurns: number;
  private actionsPerTurn: number;
  private turnActions: GameAction[];

  constructor(state: GameState, maxTurns: number = 100, actionsPerTurn: number = 3) {
    this.state = state;
    this.maxTurns = maxTurns;
    this.actionsPerTurn = actionsPerTurn;
    this.turnActions = [];
  }

  canPerformAction(action: GameAction): boolean {
    return this.validatePhaseRequirements(action);
  }

  trackAction(action: GameAction): void {
    this.turnActions.push(action);
  }

  clearTurnTracking(): void {
    this.turnActions = [];
  }

  getActionHistory(): GameAction[] {
    return [...this.turnActions];
  }

  validateTurnTransition(): ValidationResult {
    const hasRequiredActions = this.turnActions.length >= 1;
    return {
      valid: hasRequiredActions,
      message: hasRequiredActions ? 'Turn can end' : 'Must perform at least one action before ending turn'
    };
  }

  validatePhaseRequirements(action: GameAction): ValidationResult {
    const { phase } = this.state;
    const { type } = action;

    let result: ValidationResult = { valid: false, message: 'Invalid action for current phase' };

    switch (phase) {
      case 'setup':
        result.valid = type === 'CLAIM_TERRITORY' || type === 'END_PHASE' || type === 'SET_STATE';
        break;
      case 'building':
        result.valid = type === 'BUILD' || type === 'END_PHASE' || type === 'SET_STATE';
        break;
      case 'recruitment':
        result.valid = type === 'RECRUIT' || type === 'END_PHASE' || type === 'SET_STATE';
        break;
      case 'combat':
        result.valid = type === 'ATTACK' || type === 'END_PHASE' || type === 'SET_STATE';
        break;
      case 'end':
        result.valid = type === 'SET_STATE';
        break;
    }

    return result;
  }

  getNextPhase(): GamePhase {
    const phases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
    const currentIndex = phases.indexOf(this.state.phase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : 'end';
  }
}
