import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameActions } from '@/hooks/useGameActions';
import { Territory, GameState, MilitaryUnit, GameAction } from '@/types/game'; // Added GameAction
import { withErrorHandling, handleGameError } from '@/utils/error-handling';
import HexGrid from './HexGrid';
import GameControls from './GameControls';
import GameTopBar from './GameTopBar';
import GameMenus from './GameMenus';
import { militaryUnits } from '@/data/military-units';

interface GameBoardProps {
  gameState: GameState;
  onBack: () => void;
  dispatchAction: (action: any) => Promise<boolean>;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onBack, dispatchAction }) => {
  const {
    selectedTerritory,
    setSelectedTerritory
  } = useGameStore();

  // Create an adapter function that matches the expected synchronous signature
  const syncDispatchAction = (action: GameAction): boolean => {
    // Start the async operation but don't wait for it
    dispatchAction(action)
      .then(() => {
        // Handle success if needed (optional)
      })
      .catch(error => {
        // Handle any errors
        console.error('Dispatch action failed:', error);
      });
    
    // Return a default value immediately
    return true;
  };

  // Pass the synchronous adapter to useGameActions
  const {
    claimTerritory,
    buildStructure,
    recruitUnit,
    attackTerritory
  } = useGameActions(syncDispatchAction);

  const handleTerritoryClick = async (territory: Territory) => {
    try {
      await withErrorHandling(
        (async () => {
          if (selectedTerritory) {
            // Handle attack
            if (territory.owner !== selectedTerritory.owner) {
              await attackTerritory(selectedTerritory.id, territory.id, gameState.currentPlayer);
              setSelectedTerritory(null);
            }
          } else {
            setSelectedTerritory(territory);
          }
          return Promise.resolve();
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
        (async () => {
          await buildStructure(selectedTerritory.id, buildingType, gameState.currentPlayer);
          return Promise.resolve();
        })(),
        { context: 'Building Construction' }
      );
      setSelectedTerritory(null);
    } catch (error) {
      handleGameError(error, 'Building Construction Failed');
    }
  };

  const handleRecruit = async (unitType: string) => {
    if (!selectedTerritory) return;

    try {
      // Create proper MilitaryUnit object from unitType
      const unitTemplate = militaryUnits[unitType];
      if (!unitTemplate) {
        throw new Error(`Unknown unit type: ${unitType}`);
      }
      
      const militaryUnit: MilitaryUnit = {
        type: unitTemplate.type,
        health: unitTemplate.health,
        damage: unitTemplate.damage,
        experience: 0,
        hasMoved: false,
        cost: unitTemplate.cost
      };
      
      await withErrorHandling(
        (async () => {
          await recruitUnit(selectedTerritory.id, militaryUnit, gameState.currentPlayer);
          return Promise.resolve();
        })(),
        { context: 'Unit Recruitment' }
      );
      setSelectedTerritory(null);
    } catch (error) {
      handleGameError(error, 'Recruitment Failed');
    }
  };

  const handleEndTurn = async () => {
    try {
      await withErrorHandling(
        dispatchAction({
          type: 'END_TURN',
          playerId: gameState.currentPlayer,
          timestamp: Date.now(),
          payload: {}
        }),
        { context: 'End Turn' }
      );
    } catch (error) {
      handleGameError(error, 'End Turn Failed');
    }
  };

  const handleEndPhase = async () => {
    try {
      await dispatchAction({
        type: 'END_PHASE',
        playerId: gameState.currentPlayer,
        timestamp: Date.now(),
        payload: {}
      });
    } catch (error) {
      handleGameError(error, 'End Phase Failed');
    }
  };

  const handleGiveUp = async () => {
    try {
      // Implement give up logic with proper action dispatch
      console.log('Give up clicked');
      // Example implementation:
      // await dispatchAction({
      //   type: 'GIVE_UP',
      //   playerId: gameState.currentPlayer,
      //   timestamp: Date.now(),
      //   payload: {}
      // });
    } catch (error) {
      handleGameError(error, 'Give Up Failed');
    }
  };

  // Get the current player's resources
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const playerResources = currentPlayer ? currentPlayer.resources : { gold: 0, wood: 0, stone: 0, food: 0 };

  // Control whether to show menus
  const showMenus = !!selectedTerritory;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <GameTopBar 
        onBack={onBack} 
        resources={playerResources}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={gameState.currentPlayer}
          playerResources={playerResources}
          phase={gameState.phase}
        />
      </div>

      <GameControls
        gameState={gameState}
        onEndTurn={handleEndTurn}
        onEndPhase={handleEndPhase}
        onGiveUp={handleGiveUp}
      />

      <GameMenus
        selectedTerritory={selectedTerritory}
        onBuild={handleBuild}
        showMenus={showMenus}
        onRecruit={handleRecruit}
        resources={playerResources}
      />
    </div>
  );
};

export default GameBoard;