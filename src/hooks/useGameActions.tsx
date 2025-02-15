
import { useState } from "react";
import { GameState, GameUpdate } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const useGameActions = (
  gameState: GameState | null,
  setGameState: (state: GameState) => void,
  gameMode: "local" | "online" | null,
  gameId: number | null
) => {
  const handleEndTurn = async () => {
    if (!gameState) return;

    const nextPlayer = gameState.currentPlayer === "player1" ? "player2" : "player1";

    const newUpdate: GameUpdate = {
      type: "turn_ended",
      message: `${gameState.currentPlayer} ended their turn`,
      timestamp: Date.now(),
    };

    const updatedState: GameState = {
      ...gameState,
      currentPlayer: nextPlayer,
      phase: "build",
      turn: gameState.turn + 1,
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
            phase: "build",
          })
          .eq('id', gameId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update game state. Please try again.');
      }
    }

    toast.success(`${nextPlayer}'s turn begins!`);
  };

  const handleEndPhase = () => {
    if (!gameState) return;

    const phases: Array<"build" | "recruit" | "attack"> = ["build", "recruit", "attack"];
    const currentPhaseIndex = phases.indexOf(gameState.phase);
    const nextPhase = currentPhaseIndex === phases.length - 1
      ? phases[0]
      : phases[currentPhaseIndex + 1];

    if (currentPhaseIndex === phases.length - 1) {
      handleEndTurn();
      return;
    }

    setGameState({
      ...gameState,
      phase: nextPhase,
    });

    toast.success(`Moving to ${nextPhase} phase`);
  };

  const handleGiveUp = () => {
    if (!gameState) return;
    
    if (gameState.players.length === 2) {
      const winner = gameState.players.find(p => p.id !== gameState.currentPlayer);
      if (winner) {
        toast.success(`${winner.id} wins!`);
      }
    } else {
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer);
      const remainingPlayers = gameState.players.filter(p => p.id !== gameState.currentPlayer);
      
      if (remainingPlayers.length === 1) {
        toast.success(`${remainingPlayers[0].id} wins!`);
      } else {
        const nextPlayer = gameState.players[(currentPlayerIndex + 1) % gameState.players.length].id;
        setGameState({
          ...gameState,
          players: remainingPlayers,
          currentPlayer: nextPlayer,
        });
        toast.info(`${gameState.currentPlayer} has given up!`);
      }
    }
  };

  const collectResources = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players.find(
      (p) => p.id === gameState.currentPlayer
    );

    if (!currentPlayer) return;

    const ownedTerritories = gameState.territories.filter(
      (t) => t.owner === gameState.currentPlayer
    );

    const resourceGains = ownedTerritories.reduce(
      (acc, territory) => {
        acc.gold += 10;
        acc.wood += 5;
        acc.stone += 5;
        acc.food += 5;

        Object.entries(territory.resources).forEach(([resource, amount]) => {
          acc[resource as keyof typeof acc] += amount * 3;
        });

        if (territory.building === "lumber_mill") acc.wood += 20;
        if (territory.building === "mine") acc.stone += 20;
        if (territory.building === "market") {
          acc.gold += 20;
          acc.gold += (currentPlayer.resources.wood * 2);
          acc.gold += (currentPlayer.resources.stone * 2);
          acc.gold += (currentPlayer.resources.food * 5);
        }
        if (territory.building === "farm") acc.food += 8;

        return acc;
      },
      { gold: 0, wood: 0, stone: 0, food: 0 }
    );

    const updatedPlayers = gameState.players.map((player) =>
      player.id === gameState.currentPlayer
        ? {
            ...player,
            resources: {
              gold: player.resources.gold + resourceGains.gold,
              wood: player.resources.wood + resourceGains.wood,
              stone: player.resources.stone + resourceGains.stone,
              food: player.resources.food + resourceGains.food,
            },
          }
        : player
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
    });

    const marketBonus = ownedTerritories.some(t => t.building === "market")
      ? ` (+${currentPlayer.resources.wood * 2} gold from wood, +${currentPlayer.resources.stone * 2} gold from stone, +${currentPlayer.resources.food * 5} gold from food)`
      : '';

    toast.success(
      `Resources collected: ${Object.entries(resourceGains)
        .map(([resource, amount]) => `${amount} ${resource}`)
        .join(", ")}${marketBonus}`
    );
  };

  return {
    handleEndTurn,
    handleEndPhase,
    handleGiveUp,
    collectResources,
  };
};
