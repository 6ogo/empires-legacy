
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { BoardSizeSelect } from "./BoardSizeSelect";
import { GameModeSelect } from "./GameModeSelect";
import { 
  Sword, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  UserCircle,
  Palette
} from "lucide-react";

export const MainMenu: React.FC<{
  onStartGame: (settings: any) => void;
}> = ({ onStartGame }) => {
  const [step, setStep] = useState<"main" | "new-game" | "player-setup">("main");
  const [boardSize, setBoardSize] = useState("medium");
  const [playerCount, setPlayerCount] = useState(2);
  const [gameMode, setGameMode] = useState<"local" | "online">("local");
  const [playerSetupIndex, setPlayerSetupIndex] = useState(0);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [playerColors, setPlayerColors] = useState<string[]>([]);

  const predefinedColors = [
    "#FF5733", // Red
    "#33A1FF", // Blue
    "#33FF57", // Green
    "#F333FF", // Purple
    "#FFD433", // Yellow
    "#33FFF6", // Cyan
    "#FF33A8", // Pink
    "#A64B00", // Brown
    "#3F33FF", // Indigo
    "#FF8333"  // Orange
  ];

  // Initialize player names and colors when player count changes
  useEffect(() => {
    const newPlayerNames = Array(playerCount).fill('').map((_, i) => 
      playerNames[i] || `Player ${i + 1}`
    );
    setPlayerNames(newPlayerNames);

    const newPlayerColors = Array(playerCount).fill('').map((_, i) => 
      playerColors[i] || predefinedColors[i % predefinedColors.length]
    );
    setPlayerColors(newPlayerColors);
  }, [playerCount]);

  const handleStartGame = () => {
    onStartGame({
      boardSize,
      playerCount,
      gameMode,
      playerNames,
      playerColors
    });
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[playerSetupIndex] = e.target.value;
    setPlayerNames(newPlayerNames);
  };

  const handlePlayerColorChange = (color: string) => {
    const newPlayerColors = [...playerColors];
    newPlayerColors[playerSetupIndex] = color;
    setPlayerColors(newPlayerColors);
  };

  const handleNextPlayer = () => {
    if (playerSetupIndex < playerCount - 1) {
      setPlayerSetupIndex(playerSetupIndex + 1);
    } else {
      handleStartGame();
    }
  };

  const handlePrevPlayer = () => {
    if (playerSetupIndex > 0) {
      setPlayerSetupIndex(playerSetupIndex - 1);
    } else {
      setStep("new-game");
    }
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

  if (step === "new-game") {
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
              <div className="flex gap-2 flex-wrap">
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
              onClick={() => setStep("player-setup")}
            >
              Player Setup
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Player Setup</h2>
        <p className="text-gray-400 mb-6">Player {playerSetupIndex + 1} of {playerCount}</p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 block flex items-center">
              <UserCircle className="w-5 h-5 mr-2" />
              Player Name
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
              value={playerNames[playerSetupIndex] || ''}
              onChange={handlePlayerNameChange}
              placeholder={`Player ${playerSetupIndex + 1}`}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-300 block flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Player Color
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 ${playerColors[playerSetupIndex] === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePlayerColorChange(color)}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h3 className="text-white text-sm font-bold mb-2">Preview</h3>
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: playerColors[playerSetupIndex] || predefinedColors[0] }}
              />
              <span className="text-white font-bold">
                {playerNames[playerSetupIndex] || `Player ${playerSetupIndex + 1}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            className="border-gray-700 text-gray-300"
            onClick={handlePrevPlayer}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleNextPlayer}
          >
            {playerSetupIndex < playerCount - 1 ? (
              <>
                Next Player
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Start Game
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
