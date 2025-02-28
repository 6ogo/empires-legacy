
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { BoardSizeSelect } from "./BoardSizeSelect";
import { GameModeSelect } from "./GameModeSelect";
import { 
  Sword, 
  Users, 
  ChevronRight, 
  ArrowLeft 
} from "lucide-react";

export const MainMenu: React.FC<{
  onStartGame: (settings: any) => void;
}> = ({ onStartGame }) => {
  const [step, setStep] = useState<"main" | "new-game">("main");
  const [boardSize, setBoardSize] = useState("medium");
  const [playerCount, setPlayerCount] = useState(2);
  const [gameMode, setGameMode] = useState<"local" | "online">("local");

  const handleStartGame = () => {
    onStartGame({
      boardSize,
      playerCount,
      gameMode,
    });
  };

  if (step === "main") {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Empire's Legacy</h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Build your empire through strategic resource management and military conquest
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white p-6"
            onClick={() => setStep("new-game")}
          >
            <Sword className="w-6 h-6 mr-2" />
            <span className="flex-1 text-left text-xl">New Game</span>
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <Link to="/" className="w-full">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white p-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Landing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Game Setup</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 block">Game Mode</label>
            <GameModeSelect 
              value={gameMode} 
              onChange={(mode) => setGameMode(mode as "local" | "online")} 
            />
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
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <Button
                  key={num}
                  variant={playerCount === num ? "default" : "outline"}
                  className={playerCount === num ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
                  onClick={() => setPlayerCount(num)}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {num}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            className="border-gray-700 text-gray-300"
            onClick={() => setStep("main")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleStartGame}
          >
            Start Game
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
