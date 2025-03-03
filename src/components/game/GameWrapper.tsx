
import React, { useState, useCallback, useEffect } from "react";
import { GameContainer } from "./GameContainer";
import { MainMenu } from "./MainMenu";
import { ErrorScreen } from "./ErrorScreen";
import { toast } from "sonner";

export const GameWrapper: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameSettings, setGameSettings] = useState({
    boardSize: "medium",
    playerCount: 2,
    gameMode: "local",
    playerNames: ["Player 1", "Player 2"],
    playerColors: ["#FF5733", "#33A1FF"]
  });

  // Error handling function
  const handleGameError = useCallback((errorMessage: string) => {
    console.error("Game error:", errorMessage);
    setError(errorMessage);
    setGameStarted(false);
  }, []);

  // Reset error state when starting a new game
  useEffect(() => {
    if (gameStarted) {
      setError(null);
    }
  }, [gameStarted]);

  const startGame = useCallback((settings: any) => {
    try {
      setGameSettings(settings);
      setError(null);
      setGameStarted(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start game";
      toast.error(errorMsg);
      setError(errorMsg);
    }
  }, []);

  const exitGame = useCallback(() => {
    setGameStarted(false);
  }, []);

  if (error) {
    return (
      <ErrorScreen 
        message={error} 
        onBack={() => {
          setError(null);
        }} 
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {!gameStarted ? (
        <MainMenu onStartGame={startGame} />
      ) : (
        <GameContainer 
          settings={gameSettings} 
          onExitGame={exitGame} 
          onError={handleGameError}
        />
      )}
    </div>
  );
};
