
import { GameState, GameAction, GamePhase } from '@/types/game';

export class TurnManager {
  private state: GameState;
  private maxTurns: number;
  private actionsPerTurn: number;

  constructor(state: GameState, maxTurns: number = 100, actionsPerTurn: number = 3) {
    this.state = state;
    this.maxTurns = maxTurns;
    this.actionsPerTurn = actionsPerTurn;
  }

  isGameOver(): boolean {
    return this.state.phase === 'end' || this.state.turn >= this.maxTurns;
  }

  validateTurnTransition(): boolean {
    // Check if current player has completed required actions
    return true;
  }

  validatePhaseRequirements(action: GameAction): boolean {
    const { phase } = this.state;
    const { type } = action;

    // Validate phase-specific actions
    switch (phase) {
      case 'setup':
        return type === 'CLAIM_TERRITORY' || type === 'END_PHASE';

      case 'building':
        return type === 'BUILD' || type === 'END_PHASE';

      case 'recruitment':
        return type === 'RECRUIT' || type === 'END_PHASE';

      case 'combat':
        return type === 'ATTACK' || type === 'END_PHASE';

      case 'end':
        return false;

      default:
        return false;
    }
  }

  private validateAction(action: GameAction): boolean {
    // Basic validation
    if (!action.playerId || !action.type) {
      return false;
    }

    // Check if it's the player's turn
    if (action.playerId !== this.state.currentPlayer) {
      return false;
    }

    // Validate based on game phase
    return this.validatePhaseRequirements(action);
  }

  getNextPhase(): GamePhase {
    const phases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
    const currentIndex = phases.indexOf(this.state.phase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : 'end';
  }
}
