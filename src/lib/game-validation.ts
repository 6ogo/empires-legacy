
import { GameState } from "@/types/game";

export const isValidGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== 'object') return false;
  
  const gameState = state as Partial<GameState>;
  return !!(
    gameState &&
    Array.isArray(gameState.players) &&
    Array.isArray(gameState.territories) &&
    typeof gameState.currentPlayer === 'string' &&
    typeof gameState.phase === 'string' &&
    typeof gameState.turn === 'number' &&
    Array.isArray(gameState.updates) &&
    typeof gameState.hasExpandedThisTurn === 'boolean' &&
    typeof gameState.hasRecruitedThisTurn === 'boolean'
  );
};
