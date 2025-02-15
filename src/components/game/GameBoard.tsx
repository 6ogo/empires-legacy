
import React, { useCallback } from "react";
import { GameState, MilitaryUnit } from "@/types/game";
import HexGrid from "./HexGrid";
import GameControls from "./GameControls";
import { useGameActions } from "@/hooks/useGameActions";
import { useTerritorySelection } from "@/hooks/useTerritorySelection";
import GameTopBar from "./GameTopBar";
import GameMenus from "./GameMenus";
import { toast } from "sonner";
import { militaryUnits } from "@/data/military-units";

interface GameBoardProps {
  gameState: GameState;
  dispatchAction: (action: any) => boolean;
  onShowCombatHistory: () => void;
  onBack: () => void;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onGiveUp: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  dispatchAction,
  onShowCombatHistory,
  onBack,
  onEndTurn,
  onEndPhase,
  onGiveUp,
}) => {
  const {
    claimTerritory,
    buildStructure,
    recruitUnit,
    attackTerritory,
  } = useGameActions(dispatchAction);

  const {
    selectedTerritory,
    setSelectedTerritory,
    showMenus,
    setShowMenus,
    handleTerritoryClick,
  } = useTerritorySelection(gameState, claimTerritory, attackTerritory);

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );

  const handleBuild = useCallback((buildingType: string) => {
    if (!selectedTerritory) {
      toast.error("No territory selected");
      return;
    }

    if (buildStructure(selectedTerritory.id, buildingType, gameState.currentPlayer)) {
      setSelectedTerritory(null);
      setShowMenus(false);
    }
  }, [selectedTerritory, gameState.currentPlayer, buildStructure, setSelectedTerritory, setShowMenus]);

  const handleRecruit = useCallback((unitType: string) => {
    if (!selectedTerritory) return;
    const unit = militaryUnits[unitType] as MilitaryUnit;
    recruitUnit(selectedTerritory.id, unit, gameState.currentPlayer);
  }, [selectedTerritory, gameState.currentPlayer, recruitUnit]);

  const defaultResources = {
    gold: 0,
    wood: 0,
    stone: 0,
    food: 0,
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <GameTopBar
        onBack={onBack}
        resources={currentPlayer?.resources || defaultResources}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={gameState.currentPlayer}
          playerResources={currentPlayer?.resources || defaultResources}
          phase={gameState.phase}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <GameControls
          gameState={gameState}
          onEndTurn={onEndTurn}
          onEndPhase={onEndPhase}
          onGiveUp={onGiveUp}
        />
      </div>

      <GameMenus
        showMenus={showMenus}
        selectedTerritory={selectedTerritory}
        onBuild={handleBuild}
        onRecruit={handleRecruit}
        resources={currentPlayer?.resources || defaultResources}
      />
    </div>
  );
};

export default GameBoard;
