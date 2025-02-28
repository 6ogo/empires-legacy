
import React, { useState } from "react";
import { BoardSizeSelect } from "./BoardSizeSelect";
import { Button } from "../ui/button";

interface GameStartMenuProps {
  onStartGame: (settings: any) => void;
}

const GameStartMenu: React.FC<GameStartMenuProps> = ({ onStartGame }) => {
  const [boardSize, setBoardSize] = useState("medium");
  const [playerCount, setPlayerCount] = useState(2);
  const [gameMode, setGameMode] = useState<"local" | "online">("local");

  const handleStart = () => {
    onStartGame({
      boardSize,
      playerCount,
      gameMode
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Game Setup</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-gray-300 block">Game Mode</label>
          <div className="flex gap-2">
            <Button
              variant={gameMode === "local" ? "default" : "outline"}
              className={gameMode === "local" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
              onClick={() => setGameMode("local")}
            >
              Local
            </Button>
            <Button
              variant={gameMode === "online" ? "default" : "outline"}
              className={gameMode === "online" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
              onClick={() => setGameMode("online")}
            >
              Online
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-gray-300 block">Map Size</label>
          <BoardSizeSelect 
            value={boardSize} 
            onChange={setBoardSize} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-gray-300 block">Number of Players</label>
          <div className="flex gap-2 flex-wrap">
            {[2, 3, 4, 5, 6].map((num) => (
              <Button
                key={num}
                variant={playerCount === num ? "default" : "outline"}
                className={playerCount === num ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
                onClick={() => setPlayerCount(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-8 bg-amber-600 hover:bg-amber-700"
        onClick={handleStart}
      >
        Start Game
      </Button>
    </div>
  );
};

export default GameStartMenu;
