// ================================================
// File: src/components/game/GameTopBar.tsx
// ================================================

import React from "react";
import { Button } from "../ui/button";
import { Crown, ArrowLeft, Flag } from "lucide-react";
import { GamePhase } from "@/types/game"; // Import GamePhase type

// Removed local GamePhase declaration to avoid conflict with imported type

export const GameTopBar: React.FC<{
  turn: number;
  currentPlayer: number | string; // Allow string if player IDs are strings
  playerColor: string;
  playerName: string;
  onExitGame: () => void;
  phase: GamePhase; // Use imported GamePhase which includes 'completed'
}> = ({
  turn,
  currentPlayer,
  playerColor,
  playerName,
  onExitGame,
  phase
}) => {
  const displayPhase = () => {
    switch (phase) {
      case 'setup': return 'Setup Phase';
      case 'playing': return 'Playing Phase';
      case 'completed': return 'Game Over';
      // Add cases for other phases if needed ('building', 'recruitment', 'combat', 'end')
      default: return (phase as string).charAt(0).toUpperCase() + (phase as string).slice(1) + ' Phase';
    }
  };

  return (
    <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700/50 h-14"> {/* Fixed height */}
      <Button
        variant="outline"
        size="sm"
        className="border-gray-700 text-gray-300 hover:bg-gray-800"
        onClick={onExitGame}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Exit Game
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Crown className="w-5 h-5 text-amber-500 mr-2" />
          <span className="text-white font-bold">Turn: {turn}</span>
        </div>

        <div className="flex items-center">
          <Flag className="w-5 h-5 text-amber-500 mr-2" />
          <span className="text-white font-bold">
            {displayPhase()}
          </span>
        </div>
      </div>

      <div className="flex items-center min-w-[150px] justify-end"> {/* Ensure enough space */}
       {phase !== 'completed' && playerName && ( // Only show current player if game not completed
         <>
            <span className="text-white mr-2 hidden sm:inline">Current Player:</span> {/* Hide on small screens */}
            <div
                className="w-4 h-4 rounded-full mr-2 border border-black/20" // Add slight border
                style={{ backgroundColor: playerColor }}
                title={playerName} // Add tooltip for player name
            />
            <span className="text-white font-bold truncate max-w-[100px]">{playerName}</span> {/* Truncate long names */}
         </>
       )}
       {phase === 'completed' && (
           <span className="text-white font-bold">Game Over</span>
       )}
      </div>
    </div>
  );
};