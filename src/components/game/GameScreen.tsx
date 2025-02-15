import React from "react";
import { GameState } from "@/types/game";
import GameBoard from "./GameBoard";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface GameScreenProps {
  gameState: GameState;
  dispatchAction: (action: any) => boolean;
  onShowCombatHistory: () => void;
  onBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  dispatchAction,
  onShowCombatHistory,
  onBack,
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
            dispatchAction={dispatchAction}
            onBack={onBack}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
