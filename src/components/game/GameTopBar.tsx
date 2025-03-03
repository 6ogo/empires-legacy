
import React from "react";
import { Button } from "../ui/button";

interface GameTopBarProps {
  currentPlayer: number;
  players: any[];
  phase: "setup" | "playing";
  onExitGame: () => void;
  // These were in the error, but not used in GameContainer
  turn?: number;
  playerColor?: string;
  playerName?: string;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  currentPlayer,
  players,
  phase,
  onExitGame,
  turn = 1, // Default value
  playerColor,
  playerName
}) => {
  // Get actual player color and name from players array
  const currentPlayerColor = playerColor || players[currentPlayer]?.color || "gray";
  const currentPlayerName = playerName || players[currentPlayer]?.name || `Player ${currentPlayer + 1}`;

  return (
    <div className="flex justify-between items-center p-3 bg-gray-800 text-white">
      <div className="flex items-center space-x-2">
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: currentPlayerColor }}
        ></div>
        <span>{currentPlayerName}'s Turn</span>
        {phase === "playing" && <span className="text-xs text-gray-400">(Turn {turn})</span>}
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExitGame}
          className="text-white hover:text-gray-200 border-gray-600"
        >
          Exit Game
        </Button>
      </div>
    </div>
  );
};
