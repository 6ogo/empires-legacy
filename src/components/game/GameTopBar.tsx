
import React from "react";
import { Button } from "../ui/button";
import { Crown, ArrowLeft } from "lucide-react";

export const GameTopBar: React.FC<{
  turn: number;
  currentPlayer: number;
  playerColor: string;
  playerName: string;
  onExitGame: () => void;
}> = ({ 
  turn, 
  currentPlayer, 
  playerColor, 
  playerName,
  onExitGame 
}) => {
  return (
    <div className="bg-gray-900 p-3 flex items-center justify-between">
      <Button 
        variant="outline" 
        size="sm"
        className="border-gray-700 text-gray-300"
        onClick={onExitGame}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Exit Game
      </Button>
      
      <div className="flex items-center">
        <Crown className="w-5 h-5 text-amber-500 mr-2" />
        <span className="text-white font-bold">Turn: {turn}</span>
      </div>
      
      <div className="flex items-center">
        <span className="text-white mr-2">Current Player:</span>
        <div 
          className="w-4 h-4 rounded-full mr-2"
          style={{ backgroundColor: playerColor }}
        />
        <span className="text-white font-bold">{playerName}</span>
      </div>
    </div>
  );
};
