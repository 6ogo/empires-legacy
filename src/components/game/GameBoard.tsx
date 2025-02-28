import React from 'react';
import { Territory, Resources } from '@/types/game';
import HexGrid from './HexGrid';

interface GameBoardProps {
  territories: Territory[];
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
  currentPlayer: string;
  playerResources: Resources;
  phase: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  territories, 
  selectedTerritory,
  onTerritoryClick,
  currentPlayer,
  playerResources,
  phase
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <HexGrid
        territories={territories}
        selectedTerritory={selectedTerritory}
        onTerritoryClick={onTerritoryClick}
        currentPlayer={currentPlayer}
        playerResources={playerResources}
        phase={phase}
      />
    </div>
  );
};

export default GameBoard;