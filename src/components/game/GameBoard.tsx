import React, { useState } from 'react';
import { HexGrid } from './HexGrid';
import HexGrid3D from './HexGrid3D';
// Fix: Import Cube3d instead of Cube
import { Cube3d as Cube } from 'lucide-react';

interface GameBoardProps {
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritoryClick: (id: number) => void;
  currentPlayer: number;
  phase: "setup" | "playing";
  expandableTerritories?: number[];
  attackableTerritories?: number[];
  buildableTerritories?: number[];
  recruitableTerritories?: number[];
  currentAction?: "none" | "build" | "expand" | "attack" | "recruit";
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  territories, 
  players, 
  selectedTerritory, 
  onTerritoryClick, 
  currentPlayer, 
  phase,
  expandableTerritories = [],
  attackableTerritories = [],
  buildableTerritories = [],
  recruitableTerritories = [],
  currentAction = "none"
}) => {
  const [view3D, setView3D] = useState(false);
  
  // Function to handle territory clicks
  const handleTerritoryClick = (id: number) => {
    onTerritoryClick(id);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={() => setView3D(!view3D)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center gap-2"
        >
          <Cube size={18} />
          {view3D ? '2D View' : '3D View'}
        </button>
      </div>
      
      <div className="flex-grow">
        {view3D ? (
          <HexGrid3D
            territories={territories}
            players={players}
            selectedTerritory={selectedTerritory}
            onTerritoryClick={onTerritoryClick}
            currentPlayer={currentPlayer}
            phase={phase}
            expandableTerritories={expandableTerritories}
            attackableTerritories={attackableTerritories}
            buildableTerritories={buildableTerritories}
            recruitableTerritories={recruitableTerritories}
            currentAction={currentAction}
          />
        ) : (
          <HexGrid
            territories={territories}
            players={players}
            selectedTerritory={selectedTerritory}
            onTerritoryClick={onTerritoryClick}
            currentPlayer={currentPlayer}
            phase={phase}
            expandableTerritories={expandableTerritories}
            attackableTerritories={attackableTerritories}
            buildableTerritories={buildableTerritories}
            recruitableTerritories={recruitableTerritories}
            currentAction={currentAction}
          />
        )}
      </div>
    </div>
  );
};

export default GameBoard;
