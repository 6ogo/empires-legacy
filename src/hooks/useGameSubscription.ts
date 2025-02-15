import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GameState } from "@/types/game";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { isValidGameState } from "@/lib/game-validation";

interface GameUpdatePayload {
  new: {
    game_status: string;
    state: Json;
  };
}

export const useGameSubscription = (
  gameId: number | null,
  setGameStarted: (started: boolean) => void,
  setGameStatus: (status: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats") => void,
  setGameState: (state: GameState | null) => void
) => {
  useEffect(() => {
    if (!gameId) return;

    let isSubscribed = true;

    const subscription = supabase
      .channel(`game_updates_${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload: GameUpdatePayload) => {
        if (!isSubscribed) return;

        if (payload.new.game_status === 'playing') {
          try {
            const state = payload.new.state;
            const parsedState = (typeof state === 'string' ? JSON.parse(state) : state) as unknown;
            
            if (isValidGameState(parsedState)) {
              // Update game status first
              setGameStatus("playing");
              setGameStarted(true);
              
              // Then update game state
              setGameState(parsedState);
            } else {
              console.error('Invalid game state received:', parsedState);
              toast.error('Received invalid game state from server');
            }
          } catch (error) {
            console.error('Error processing game state:', error);
            toast.error('Error processing game state');
          }
        }
      })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(subscription);
    };
  }, [gameId, setGameStarted, setGameStatus, setGameState]);
};
