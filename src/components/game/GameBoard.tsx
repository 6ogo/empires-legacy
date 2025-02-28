
import React from "react";
import { HexGrid } from "./HexGrid";

export const GameBoard: React.FC<{
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritorySelect: (id: number) => void;
  onClaimTerritory: (id: number) => void;
  onAttackTerritory: (id: number) => void;
  currentPlayer: number;
  phase: "setup" | "playing";
  actionTaken: boolean;
}> = ({ 
  territories, 
  players, 
  selectedTerritory, 
  onTerritorySelect, 
  onClaimTerritory,
  onAttackTerritory,
  currentPlayer,
  phase,
  actionTaken
}) => {
  const handleTerritoryClick = (territoryId: number) => {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;
    
    // Setup phase: claim unclaimed territory
    if (phase === "setup" && territory.owner === null) {
      onClaimTerritory(territoryId);
      return;
    }
    
    // Playing phase
    if (phase === "playing") {
      // If already selected territory and clicking on another territory
      if (selectedTerritory !== null && selectedTerritory !== territoryId) {
        const selectedTerr = territories.find(t => t.id === selectedTerritory);
        
        // If attacking
        if (
          selectedTerr && 
          selectedTerr.owner === currentPlayer && 
          territory.owner !== null && 
          territory.owner !== currentPlayer &&
          !actionTaken
        ) {
          // Check if territories are adjacent
          const isAdjacent = selectedTerr.adjacentTerritories.includes(territoryId);
          if (isAdjacent) {
            onAttackTerritory(territoryId);
            return;
          }
        }
        
        // If expanding (claiming unclaimed territory)
        if (
          selectedTerr && 
          selectedTerr.owner === currentPlayer && 
          territory.owner === null &&
          !actionTaken
        ) {
          // Check if territories are adjacent
          const isAdjacent = selectedTerr.adjacentTerritories.includes(territoryId);
          if (isAdjacent) {
            onClaimTerritory(territoryId);
            return;
          }
        }
      }
      
      // Select owned territory or adjacent territory
      onTerritorySelect(territoryId);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <HexGrid 
        territories={territories}
        players={players}
        selectedTerritory={selectedTerritory}
        onTerritoryClick={handleTerritoryClick}
        currentPlayer={currentPlayer}
        phase={phase}
      />
    </div>
  );
};
