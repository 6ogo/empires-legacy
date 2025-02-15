import React, { useCallback, useState } from "react";
import { Territory, GameState } from "@/types/game";
import HexGrid from "./HexGrid";
import ResourceDisplay from "./ResourceDisplay";
import GameControls from "./GameControls";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGameActions } from "@/hooks/useGameActions";
import { toast } from "sonner";

interface GameBoardProps {
  gameState: GameState;
  dispatchAction: (action: any) => boolean;
  onBack: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  dispatchAction,
  onBack,
}) => {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  
  const {
    claimTerritory,
    buildStructure,
    recruitUnit,
    attackTerritory,
    endTurn,
    endPhase
  } = useGameActions(dispatchAction);

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );

  const handleTerritoryClick = useCallback((territory: Territory) => {
    if (gameState.phase === 'setup') {
      if (claimTerritory(territory.id, gameState.currentPlayer)) {
        setSelectedTerritory(null);
      }
    } else {
      setSelectedTerritory(territory);
    }
  }, [gameState.phase, gameState.currentPlayer, claimTerritory]);

  const handleBuild = useCallback((buildingType: string) => {
    if (!selectedTerritory) {
      toast.error("No territory selected");
      return;
    }

    if (buildStructure(selectedTerritory.id, buildingType, gameState.currentPlayer)) {
      setSelectedTerritory(null);
    }
  }, [selectedTerritory, gameState.currentPlayer, buildStructure]);

  const handleRecruit = useCallback((unitType: string) => {
    if (!selectedTerritory) {
      toast.error("No territory selected");
      return;
    }

    const unit = {
      type: unitType,
      health: 100,
      damage: 50,
      cost: { gold: 100 }
    };

    if (recruitUnit(selectedTerritory.id, unit, gameState.currentPlayer)) {
      setSelectedTerritory(null);
    }
  }, [selectedTerritory, gameState.currentPlayer, recruitUnit]);

  const handleEndTurn = useCallback(() => {
    endTurn(gameState.currentPlayer);
  }, [gameState.currentPlayer, endTurn]);

  const handleEndPhase = useCallback(() => {
    endPhase(gameState.currentPlayer);
  }, [gameState.currentPlayer, endPhase]);

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

      <div className="absolute top-0 left-0 right-0 p-4">
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
          onEndTurn={handleEndTurn}
          onEndPhase={handleEndPhase}
        />
      </div>

      {selectedTerritory && (
        <>
          <div className="absolute top-24 left-4">
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
          </div>
          <div className="absolute top-24 right-4">
            <RecruitmentMenu 
              onRecruit={handleRecruit}
              resources={currentPlayer?.resources || {
                gold: 0,
                wood: 0,
                stone: 0,
                food: 0,
              }}
              selectedTerritory={selectedTerritory}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GameBoard;
