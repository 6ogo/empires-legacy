
import { GameState } from "@/types/game";

export const isValidGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== 'object') return false;
  
  const gameState = state as Partial<GameState>;
  
  // Check all required properties exist and have correct types
  if (!gameState.players || !Array.isArray(gameState.players)) return false;
  if (!gameState.territories || !Array.isArray(gameState.territories)) return false;
  if (!gameState.currentPlayer || typeof gameState.currentPlayer !== 'string') return false;
  if (!gameState.phase || typeof gameState.phase !== 'string') return false;
  if (typeof gameState.turn !== 'number') return false;
  if (!gameState.updates || !Array.isArray(gameState.updates)) return false;
  if (typeof gameState.hasExpandedThisTurn !== 'boolean') return false;
  if (typeof gameState.hasRecruitedThisTurn !== 'boolean') return false;

  // If all checks pass, return true
  return true;
};
