import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameActions } from '@/hooks/useGameActions';
import { GameState, GameAction, Territory, Resources } from '@/types/game';
import { militaryUnits } from '@/data/military-units';
import { withErrorHandling, handleGameError } from '@/utils/error-handling';
import { toast } from 'sonner';
import HexGrid from './HexGrid';
import GameControls from './GameControls';
import GameTopBar from './GameTopBar';
import GameMenus from './GameMenus';

interface GameBoardProps {
  gameState: GameState;
  dispatchAction: (action: GameAction) => boolean;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onGiveUp: () => void;
  onBack: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  dispatchAction,
  onEndTurn,
  onEndPhase,
  onGiveUp,
  onBack,
}) => {
  const { selectedTerritory, setSelectedTerritory } = useGameStore();

  const { claimTerritory, buildStructure, recruitUnit, attackTerritory } = useGameActions(dispatchAction);

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const resources: Resources = currentPlayer?.resources ?? { gold: 0, wood: 0, stone: 0, food: 0 };

  const showMenus = ['building', 'recruitment'].includes(gameState.phase);

  const handleTerritoryClick = async (territory: Territory) => {
    try {
      await withErrorHandling(
        (async () => {
          if (!currentPlayer) return;

          if (gameState.phase === 'setup') {
            await claimTerritory(territory.id, currentPlayer.id);
            return;
          }

          if (gameState.phase === 'combat') {
            if (selectedTerritory) {
              // Second click — attack if it's an enemy adjacent territory
              if (territory.owner !== currentPlayer.id && territory.id !== selectedTerritory.id) {
                await attackTerritory(selectedTerritory.id, territory.id, currentPlayer.id);
                setSelectedTerritory(null);
              } else if (territory.id === selectedTerritory.id) {
                setSelectedTerritory(null);
              } else {
                setSelectedTerritory(territory);
              }
            } else {
              // First click — select own territory with unit
              if (territory.owner === currentPlayer.id && territory.militaryUnit) {
                setSelectedTerritory(territory);
              } else if (territory.owner !== currentPlayer.id) {
                toast.error('Select one of your territories with a unit first');
              }
            }
            return;
          }

          // Building or recruitment phase — select own territories
          if (territory.owner === currentPlayer.id) {
            setSelectedTerritory(selectedTerritory?.id === territory.id ? null : territory);
          } else {
            toast.error('Select one of your own territories');
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
    if (!selectedTerritory || !currentPlayer) return;
    try {
      await withErrorHandling(
        buildStructure(selectedTerritory.id, buildingType, currentPlayer.id),
        { context: 'Building Construction' }
      );
      setSelectedTerritory(null);
    } catch (error) {
      handleGameError(error, 'Building Construction Failed');
    }
  };

  const handleRecruit = async (unitType: string) => {
    if (!selectedTerritory || !currentPlayer) return;
    const unitTemplate = militaryUnits[unitType.toUpperCase()];
    if (!unitTemplate) {
      toast.error('Unknown unit type');
      return;
    }
    try {
      await withErrorHandling(
        recruitUnit(
          selectedTerritory.id,
          { ...unitTemplate, hasMoved: false },
          currentPlayer.id
        ),
        { context: 'Unit Recruitment' }
      );
      setSelectedTerritory(null);
    } catch (error) {
      handleGameError(error, 'Recruitment Failed');
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <GameTopBar onBack={onBack} resources={resources} />

      <div className="absolute inset-0 pt-16 pb-32">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={gameState.currentPlayer}
          playerResources={resources}
          phase={gameState.phase}
        />
      </div>

      <div className="absolute bottom-4 right-4 left-4 md:left-auto md:right-4 md:w-64">
        <GameControls
          gameState={gameState}
          onEndTurn={onEndTurn}
          onEndPhase={onEndPhase}
          onGiveUp={onGiveUp}
        />
      </div>

      {showMenus && (
        <div className="absolute top-20 left-4 right-4 md:left-4 md:right-auto md:w-72 max-h-[60vh] overflow-y-auto">
          <GameMenus
            showMenus={showMenus}
            selectedTerritory={selectedTerritory}
            onBuild={handleBuild}
            onRecruit={handleRecruit}
            resources={resources}
            currentPlayerId={currentPlayer?.id ?? ''}
          />
        </div>
      )}

      {/* Phase and turn indicator */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1 text-white text-sm">
        <span className="text-game-gold font-bold capitalize">{gameState.phase}</span>
        {' — '}
        <span className="capitalize">{gameState.currentPlayer}&apos;s turn</span>
        {' — '}Turn {gameState.turn}
      </div>

      {/* Win screen */}
      {gameState.phase === 'end' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a2237] border border-game-gold rounded-xl p-8 text-center max-w-sm">
            <h2 className="text-3xl font-bold text-game-gold mb-4">Game Over!</h2>
            <p className="text-white mb-2">
              {gameState.updates.filter(u => u.type === 'system').pop()?.message ?? 'The game has ended.'}
            </p>
            <button
              onClick={onBack}
              className="mt-6 px-6 py-2 bg-game-gold text-black font-bold rounded-lg hover:bg-game-gold/90"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
