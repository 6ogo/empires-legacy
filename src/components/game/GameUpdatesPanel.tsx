
import React from "react";
import { GameState } from "@/types/game";

interface GameUpdatesPanelProps {
  gameState: GameState;
}

const GameUpdatesPanel: React.FC<GameUpdatesPanelProps> = ({ gameState }) => {
  return (
    <div className="fixed bottom-4 left-4 max-w-md bg-black/80 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Game Updates</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {gameState.updates.slice(-5).reverse().map((update, index) => (
          <div key={index} className="text-sm text-gray-300">
            <span className="text-xs text-gray-400">
              {new Date(update.timestamp).toLocaleTimeString()} - 
            </span>
            {update.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameUpdatesPanel;
