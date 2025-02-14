
import React from "react";
import { GameState, Territory } from "@/types/game";
import GameBoard from "./GameBoard";
import GameUpdatesPanel from "./GameUpdatesPanel";

interface GameScreenProps {
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

const GameScreen: React.FC<GameScreenProps> = ({
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
  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 h-[70vh] md:h-screen relative">
        <GameBoard
          gameState={gameState}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={onTerritoryClick}
          onEndTurn={onEndTurn}
          onEndPhase={onEndPhase}
          onBuild={onBuild}
          onRecruit={onRecruit}
          onGiveUp={onGiveUp}
          onBack={onBack}
        />
      </div>
      <div className="h-[30vh] md:w-80 md:h-screen overflow-y-auto border-t md:border-l border-gray-700">
        <GameUpdatesPanel gameState={gameState} />
      </div>
    </div>
  );
};

export default GameScreen;
