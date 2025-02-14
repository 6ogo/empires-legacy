import { useState } from "react";
import { GameState, Territory, GameUpdate, PlayerColor } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const useGameState = (gameMode: "local" | "online" | null) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  const checkAchievementProgress = async (userId: string) => {
    if (!gameState) return;

    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*');

    if (error) {
      console.error('Error fetching achievements:', error);
      return;
    }

    achievements.forEach(async (achievement) => {
      let progress = 0;

      // Calculate progress based on achievement type
      switch (achievement.title) {
        case 'Land Grabber':
          const territories = gameState.territories.filter(t => t.owner === gameState.currentPlayer);
          progress = (territories.length / 10) * 100;
          break;
        // Add more achievement progress calculations here
      }

      // If progress is close to completion (90% or more) and achievement not yet earned
      if (progress >= 90) {
        const { data: userAchievement } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .single();

        if (!userAchievement) {
          toast.success(
            `Almost there! ${achievement.title} - ${Math.floor(progress)}%`,
            {
              description: achievement.description,
              duration: 5000,
            }
          );
        }
      }
    });
  };

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

      // Find next player index
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer);
      const nextPlayer = gameState.players[(currentPlayerIndex + 1) % gameState.players.length].id;

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

          // Check achievement progress after state update
          const user = (await supabase.auth.getUser()).data.user;
          if (user) {
            await checkAchievementProgress(user.id);
          }
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
