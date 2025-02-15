
import React from "react";
import { Territory, GameState } from "@/types/game";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import ResourceDisplay from "./ResourceDisplay";
import GameUpdatesPanel from "./GameUpdatesPanel";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

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
  onShowCombatHistory: () => void;
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
  onShowCombatHistory,
}) => {
  return (
    <div className="min-h-screen bg-[#141B2C] relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20"
        >
          Back to Menu
        </Button>
        <Button
          variant="outline"
          onClick={onShowCombatHistory}
          className="bg-white/10 hover:bg-white/20"
        >
          <History className="w-4 h-4 mr-2" />
          Combat History
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="flex-grow relative">
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
        
        <div className="w-full md:w-80 bg-gray-900/50 backdrop-blur-sm p-4 space-y-4">
          <ResourceDisplay
            resources={gameState.players.find(p => p.id === gameState.currentPlayer)?.resources || {
              gold: 0,
              wood: 0,
              stone: 0,
              food: 0,
            }}
          />
          <GameControls
            gameState={gameState}
            onEndTurn={onEndTurn}
            onEndPhase={onEndPhase}
            onGiveUp={onGiveUp}
          />
          <GameUpdatesPanel updates={gameState.updates} />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
