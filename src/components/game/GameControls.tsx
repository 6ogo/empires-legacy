
import React from "react";
import { Button } from "@/components/ui/button";
import { GameState } from "@/types/game";

interface GameControlsProps {
  gameState: GameState;
  onEndTurn: () => void;
  onEndPhase: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onEndTurn,
  onEndPhase,
}) => {
  const phases = [
    "resource",
    "building",
    "recruitment",
    "movement",
    "combat",
  ] as const;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="text-sm font-semibold text-gray-400">
        Turn {gameState.turn} - {gameState.phase.toUpperCase()}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onEndPhase}
          className="flex-1"
        >
          End {gameState.phase}
        </Button>
        <Button
          onClick={onEndTurn}
          className="flex-1 bg-game-gold hover:bg-game-gold/90 text-black"
        >
          End Turn
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
