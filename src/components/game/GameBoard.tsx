import React, { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameActions } from '@/hooks/useGameActions';
import { GameState, GameAction, Territory, Resources } from '@/types/game';
import { militaryUnits } from '@/data/military-units';
import { withErrorHandling, handleGameError } from '@/utils/error-handling';
import { toast } from 'sonner';
import HexGrid from './HexGrid';
import GameControls from './GameControls';
import GameTopBar from './GameTopBar';
import TerritoryInfoPanel from './TerritoryInfoPanel';

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

  // Stable callback so React.memo(HexGrid) only re-renders when game phase/selection changes
  const handleTerritoryClick = useCallback(async (territory: Territory) => {
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
              if (territory.owner !== currentPlayer.id && territory.id !== selectedTerritory.id) {
                await attackTerritory(selectedTerritory.id, territory.id, currentPlayer.id);
                setSelectedTerritory(null);
              } else if (territory.id === selectedTerritory.id) {
                setSelectedTerritory(null);
              } else {
                setSelectedTerritory(territory);
              }
            } else {
              if (territory.owner === currentPlayer.id && territory.militaryUnit) {
                setSelectedTerritory(territory);
              } else if (territory.owner !== currentPlayer.id) {
                toast.error('Select one of your territories with a unit first');
              }
            }
            return;
          }

          // Building or recruitment phase — select own territories to show info panel
          if (territory.owner === currentPlayer.id) {
            setSelectedTerritory(selectedTerritory?.id === territory.id ? null : territory);
          } else {
            setSelectedTerritory(selectedTerritory?.id === territory.id ? null : territory);
          }
        })(),
        { context: 'Territory Action' }
      );
    } catch (error) {
      handleGameError(error, 'Territory Action Failed');
      setSelectedTerritory(null);
    }
  }, [currentPlayer, gameState.phase, selectedTerritory, claimTerritory, attackTerritory, setSelectedTerritory]);

  const handleBuild = useCallback(async (buildingType: string) => {
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
  }, [selectedTerritory, currentPlayer, buildStructure, setSelectedTerritory]);

  const handleRecruit = useCallback(async (unitType: string) => {
    if (!selectedTerritory || !currentPlayer) return;
    const unitTemplate = militaryUnits[unitType.toUpperCase()];
    if (!unitTemplate) { toast.error('Unknown unit type'); return; }
    try {
      await withErrorHandling(
        recruitUnit(selectedTerritory.id, { ...unitTemplate, hasMoved: false }, currentPlayer.id),
        { context: 'Unit Recruitment' }
      );
      setSelectedTerritory(null);
    } catch (error) {
      handleGameError(error, 'Recruitment Failed');
    }
  }, [selectedTerritory, currentPlayer, recruitUnit, setSelectedTerritory]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Top bar — h-14 */}
      <GameTopBar
        onBack={onBack}
        resources={resources}
        territories={gameState.territories}
        currentPlayerId={currentPlayer?.id ?? ''}
      />

      {/* Hex grid — fills below top bar, leaving room on right for TerritoryInfoPanel on desktop */}
      <div className="absolute inset-0 pt-14 md:pr-72">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={gameState.currentPlayer}
          playerResources={resources}
          phase={gameState.phase}
        />
      </div>

      {/* Game controls — bottom-left */}
      <div className={`absolute left-4 z-30 w-64 transition-all duration-200 ${selectedTerritory ? 'bottom-68 md:bottom-4' : 'bottom-4'}`}>
        <GameControls
          gameState={gameState}
          onEndTurn={onEndTurn}
          onEndPhase={onEndPhase}
          onGiveUp={onGiveUp}
        />
      </div>

      {/* Territory info panel — right sidebar (desktop) / bottom sheet (mobile) */}
      <TerritoryInfoPanel
        territory={selectedTerritory}
        phase={gameState.phase}
        currentPlayerId={currentPlayer?.id ?? ''}
        resources={resources}
        onClose={() => setSelectedTerritory(null)}
        onBuild={handleBuild}
        onRecruit={handleRecruit}
      />

      {/* Win screen */}
      {gameState.phase === 'end' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a2237] border border-game-gold rounded-xl p-8 text-center max-w-sm mx-4">
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
