import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameActions } from '@/hooks/useGameActions';
import { Territory } from '@/types/game';
import { withErrorHandling, handleGameError } from '@/utils/error-handling';
import HexGrid from './HexGrid';
import GameControls from './GameControls';
import GameTopBar from './GameTopBar';
import GameMenus from './GameMenus';

interface GameBoardProps {
  gameState: GameState;
  onBack: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onBack }) => {
  const {
    selectedTerritory,
    setSelectedTerritory
  } = useGameStore();

  const {
    claimTerritory,
    buildStructure,
    recruitUnit,
    attackTerritory
  } = useGameActions();

  const handleTerritoryClick = async (territory: Territory) => {
    try {
      await withErrorHandling(
        (async () => {
          if (selectedTerritory) {
            // Handle attack
            if (territory.owner !== selectedTerritory.owner) {
              await attackTerritory(selectedTerritory.id, territory.id);
              setSelectedTerritory(null);
            }
          } else {
            setSelectedTerritory(territory);
          }
        })(),
        { context: 'Territory Action' }
      );
    } catch (error) {
      handleGameError(error, 'Territory Action Failed');
      setSelectedTerritory(null);
    }
  };

  const handleBuild = async (buildingType: string) => {
    if (!selectedTerritory) return;

    try {
      await withErrorHandling(
        buildStructure(selectedTerritory.id, buildingType),
        { context: 'Building Construction' }
      );
      setSelectedTerritory(null);
    } catch (error) {
      handleGameError(error, 'Building Construction Failed');
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <GameTopBar onBack={onBack} />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={gameState.currentPlayer}
        />
      </div>

      <GameControls
        gameState={gameState}
        onEndTurn={async () => {
          try {
            await withErrorHandling(
              gameState.endTurn(),
              { context: 'End Turn' }
            );
          } catch (error) {
            handleGameError(error, 'End Turn Failed');
          }
        }}
      />

      <GameMenus
        selectedTerritory={selectedTerritory}
        onBuild={handleBuild}
      />
    </div>
  );
};

export default GameBoard;