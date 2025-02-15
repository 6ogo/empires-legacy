
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
    if (gameId) {
      const subscription = supabase
        .channel(`game_updates_${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        }, (payload: GameUpdatePayload) => {
          if (payload.new.game_status === 'playing') {
            setGameStarted(true);
            setGameStatus("playing");
            
            try {
              const state = payload.new.state;
              const stateObj = typeof state === 'string' ? JSON.parse(state) : state;
              const validatedState = stateObj as unknown;
              
              if (isValidGameState(validatedState)) {
                setGameState(validatedState);
              } else {
                console.error('Invalid game state received:', validatedState);
                toast.error('Received invalid game state from server');
              }
            } catch (error) {
              console.error('Error parsing game state:', error);
              toast.error('Error parsing game state');
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [gameId, setGameStarted, setGameStatus, setGameState]);
};
