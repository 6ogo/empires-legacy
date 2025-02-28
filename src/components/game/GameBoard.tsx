
import React from "react";
import { HexGrid } from "./HexGrid";

export const GameBoard: React.FC<{
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritorySelect: (id: number) => void;
  onClaimTerritory: (id: number) => void;
  currentPlayer: number;
}> = ({ 
  territories, 
  players, 
  selectedTerritory, 
  onTerritorySelect, 
  onClaimTerritory,
  currentPlayer 
}) => {
  const handleTerritoryClick = (territoryId: number) => {
    const territory = territories.find(t => t.id === territoryId);
    
    // If territory is unclaimed and in setup phase, claim it
    if (territory && territory.owner === null) {
      onClaimTerritory(territoryId);
    } else {
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
      />
    </div>
  );
};
