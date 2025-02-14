
import { GameState } from "@/types/game";

export const isValidGameState = (state: any): state is GameState => {
  return (
    state &&
    Array.isArray(state.players) &&
    Array.isArray(state.territories) &&
    typeof state.currentPlayer === 'string' &&
    typeof state.phase === 'string' &&
    typeof state.turn === 'number' &&
    Array.isArray(state.updates)
  );
};
