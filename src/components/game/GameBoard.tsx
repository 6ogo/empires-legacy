
import React from "react";
import { Territory, GameState } from "@/types/game";
import HexGrid from "./HexGrid";
import ResourceDisplay from "./ResourceDisplay";
import GameControls from "./GameControls";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GameBoardProps {
  gameState: GameState;
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onBuild: (buildingType: string) => void;
  onRecruit: (unitType: string) => void;
  onGiveUp: () => void;
  onBack: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  selectedTerritory,
  onTerritoryClick,
  onEndTurn,
  onEndPhase,
  onBuild,
  onRecruit,
  onGiveUp,
  onBack,
}) => {
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );

  const currentPlayerResources = currentPlayer?.resources || {
    gold: 0,
    wood: 0,
    stone: 0,
    food: 0,
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Back Button */}
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
          resources={currentPlayerResources}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <HexGrid
          territories={gameState.territories}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={onTerritoryClick}
          currentPlayer={gameState.currentPlayer}
          playerResources={currentPlayerResources}
          phase={gameState.phase}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <GameControls
          onEndTurn={onEndTurn}
          onEndPhase={onEndPhase}
          onGiveUp={onGiveUp}
          gameState={gameState}
        />
      </div>

      {selectedTerritory && (
        <>
          <div className="absolute top-24 left-4">
            <BuildingMenu 
              onBuild={onBuild} 
              selectedTerritory={selectedTerritory}
              resources={currentPlayerResources}
            />
          </div>
          <div className="absolute top-24 right-4">
            <RecruitmentMenu 
              onRecruit={onRecruit}
              resources={currentPlayerResources}
              selectedTerritory={selectedTerritory}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GameBoard;
