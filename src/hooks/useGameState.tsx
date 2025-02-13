
import { useState } from "react";
import { GameState, Territory, GameUpdate, PlayerColor } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const useGameState = (gameMode: "local" | "online" | null) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  const handleTerritoryClick = async (territory: Territory, gameId: number | null) => {
    if (!gameState) return;

    if (gameMode === "online" && gameState.currentPlayer !== `player${gameState.players.length - 1}`) {
      toast.error("It's not your turn!");
      return;
    }

    if (gameState.phase === "setup") {
      if (territory.owner) {
        toast.error("This territory is already claimed!");
        return;
      }

      const currentPlayerTerritories = gameState.territories.filter(
        t => t.owner === gameState.currentPlayer
      );

      if (currentPlayerTerritories.length >= 1) {
        toast.error("You can only claim one starting territory!");
        return;
      }

      const updatedTerritories = gameState.territories.map((t) =>
        t.id === territory.id ? { ...t, owner: gameState.currentPlayer } : t
      );

      const updatedPlayers = gameState.players.map((player) =>
        player.id === gameState.currentPlayer
          ? {
              ...player,
              territories: [...player.territories, territory],
            }
          : player
      );

      const nextPlayer: PlayerColor = gameState.currentPlayer === "player1" ? "player2" : "player1";

      const allPlayersHaveClaimed = updatedPlayers.every(
        player => player.territories.length === 1
      );

      const newUpdate: GameUpdate = {
        type: "territory_claimed",
        message: `${gameState.currentPlayer} claimed their starting territory`,
        timestamp: Date.now(),
      };

      const updatedState: GameState = {
        ...gameState,
        territories: updatedTerritories,
        players: updatedPlayers,
        currentPlayer: nextPlayer,
        phase: allPlayersHaveClaimed ? "resource" : "setup",
        updates: [...gameState.updates, newUpdate],
      };

      setGameState(updatedState);

      if (gameMode === "online" && gameId) {
        try {
          const { error } = await supabase
            .from('games')
            .update({ 
              state: updatedState as unknown as Json,
              current_player: nextPlayer,
              phase: allPlayersHaveClaimed ? "resource" : "setup",
            })
            .eq('id', gameId);

          if (error) throw error;
        } catch (error) {
          console.error('Error updating game:', error);
          toast.error('Failed to update game state. Please try again.');
        }
      }

      if (allPlayersHaveClaimed) {
        toast.success("All players have claimed their starting territories. Moving to resource phase!");
      } else {
        toast.success(`Territory claimed by ${gameState.currentPlayer}!`);
      }
    } else if (gameState.phase === "building") {
      setSelectedTerritory(territory);
    }
  };

  return {
    gameState,
    setGameState,
    selectedTerritory,
    setSelectedTerritory,
    handleTerritoryClick,
  };
};
