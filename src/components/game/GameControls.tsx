
import React from "react";
import { Button } from "@/components/ui/button";
import { GameState } from "@/types/game";

interface GameControlsProps {
  gameState: GameState;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onGiveUp: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onEndTurn,
  onEndPhase,
  onGiveUp,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="text-lg font-semibold text-white">
        Turn {gameState.turn} - {gameState.phase.toUpperCase()}
      </div>
      <div className="flex gap-2">
        {gameState.phase !== "setup" && (
          <Button
            variant="outline"
            onClick={onEndPhase}
            className="flex-1 hover:bg-white/10"
          >
            End {gameState.phase}
          </Button>
        )}
        <Button
          onClick={onEndTurn}
          className="flex-1 bg-game-gold hover:bg-game-gold/90 text-black"
          disabled={gameState.phase === "setup"}
        >
          End Turn
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={onGiveUp}
          className="flex-1"
        >
          Give Up
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
