
import React, { useState, useEffect } from "react";
import { GameContainer } from "./GameContainer";
import { MainMenu } from "./MainMenu";
import { toast } from "sonner";
import { LoadingScreen } from "./LoadingScreen";

// Define game phases
export type GamePhase = "setup" | "playing" | "completed";

export interface GameSettings {
  boardSize: "small" | "medium" | "large";
  playerCount: number;
  gameMode: "local" | "online";
  playerNames: string[];
  playerColors: string[];
}

export const GameWrapper: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    boardSize: "medium",
    playerCount: 2,
    gameMode: "local",
    playerNames: ["Player 1", "Player 2"],
    playerColors: ["#FF5733", "#33A1FF"]
  });

  // Initialize game state
  useEffect(() => {
    if (gameStarted) {
      setIsLoading(true);
      // Simulate loading time for map generation and game initialization
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        toast.success("Game started successfully!");
      }, 1500);
      
      return () => clearTimeout(loadingTimer);
    }
  }, [gameStarted]);

  const startGame = (settings: GameSettings) => {
    setGameSettings(settings);
    setGameStarted(true);
  };

  const exitGame = () => {
    if (confirm("Are you sure you want to exit the current game? All progress will be lost.")) {
      setGameStarted(false);
      toast.info("Game exited");
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!gameStarted ? (
        <MainMenu onStartGame={startGame} />
      ) : isLoading ? (
        <LoadingScreen message="Generating game world..." />
      ) : (
        <GameContainer 
          settings={gameSettings} 
          onExitGame={exitGame} 
        />
      )}
    </div>
  );
};
