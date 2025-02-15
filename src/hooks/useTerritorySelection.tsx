
import { useState, useCallback } from "react";
import { Territory, GameState } from "@/types/game";
import { toast } from "sonner";

export const useTerritorySelection = (
  gameState: GameState,
  claimTerritory: (territoryId: string, playerId: string) => boolean,
  attackTerritory: (fromTerritoryId: string, toTerritoryId: string, playerId: string) => boolean
) => {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showMenus, setShowMenus] = useState(false);

  const handleTerritoryClick = useCallback((territory: Territory) => {
    // If it's setup phase, handle territory claiming
    if (gameState.phase === 'setup') {
      if (territory.owner === null) {
        if (claimTerritory(territory.id, gameState.currentPlayer)) {
          setSelectedTerritory(null);
        }
      } else {
        toast.error("This territory is already claimed");
      }
      return;
    }

    // For other phases, validate territory selection
    if (territory.owner === gameState.currentPlayer) {
      setSelectedTerritory(territory);
      setShowMenus(true);
    } else if (selectedTerritory && territory.owner !== gameState.currentPlayer) {
      // Handle attack if we have a selected territory and click on enemy territory
      if (attackTerritory(selectedTerritory.id, territory.id, gameState.currentPlayer)) {
        setSelectedTerritory(null);
        setShowMenus(false);
      }
    }
  }, [gameState.phase, gameState.currentPlayer, claimTerritory, attackTerritory, selectedTerritory]);

  return {
    selectedTerritory,
    setSelectedTerritory,
    showMenus,
    setShowMenus,
    handleTerritoryClick,
  };
};
