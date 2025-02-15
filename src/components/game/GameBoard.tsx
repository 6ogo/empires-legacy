
import React, { useCallback, useState } from "react";
import { Territory, GameState } from "@/types/game";
import HexGrid from "./HexGrid";
import ResourceDisplay from "./ResourceDisplay";
import GameControls from "./GameControls";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History } from "lucide-react";
import { useGameActions } from "@/hooks/useGameActions";
import { toast } from "sonner";

interface GameBoardProps {
  gameState: GameState;
  dispatchAction: (action: any) => boolean;
  onShowCombatHistory: () => void;
  onBack: () => void;
  onEndTurn: () => void;
  onEndPhase: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  dispatchAction,
  onShowCombatHistory,
  onBack,
  onEndTurn,
  onEndPhase,
}) => {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showMenus, setShowMenus] = useState(false);
  
  const {
    claimTerritory,
    buildStructure,
    recruitUnit,
    attackTerritory,
  } = useGameActions(dispatchAction);

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );

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

  const handleBuild = useCallback((buildingType: string) => {
    if (!selectedTerritory) {
      toast.error("No territory selected");
      return;
    }

    if (buildStructure(selectedTerritory.id, buildingType, gameState.currentPlayer)) {
      setSelectedTerritory(null);
      setShowMenus(false);
    }
  }, [selectedTerritory, gameState.currentPlayer, buildStructure]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <Button
        variant="outline"
        size="icon"
        onClick={onBack}
        className="absolute top-4 left-4 z-50 bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Single ResourceDisplay at the top */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-center">
        <ResourceDisplay
          resources={currentPlayer?.resources || {
            gold: 0,
            wood: 0,
            stone: 0,
            food: 0,
          }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={gameState.currentPlayer}
          playerResources={currentPlayer?.resources || {
            gold: 0,
            wood: 0,
            stone: 0,
            food: 0,
          }}
          phase={gameState.phase}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <GameControls
          gameState={gameState}
          onEndTurn={onEndTurn}
          onEndPhase={onEndPhase}
        />
      </div>

      {showMenus && selectedTerritory && (
        <div className="absolute top-24 inset-x-4 md:inset-x-auto md:left-4 md:right-4 flex flex-col md:flex-row justify-center gap-4">
          <BuildingMenu 
            onBuild={handleBuild}
            selectedTerritory={selectedTerritory}
            resources={currentPlayer?.resources || {
              gold: 0,
              wood: 0,
              stone: 0,
              food: 0,
            }}
          />
          <RecruitmentMenu 
            onRecruit={(unitType) => recruitUnit(selectedTerritory.id, unitType, gameState.currentPlayer)}
            resources={currentPlayer?.resources || {
              gold: 0,
              wood: 0,
              stone: 0,
              food: 0,
            }}
            selectedTerritory={selectedTerritory}
          />
        </div>
      )}
    </div>
  );
};

export default GameBoard;
