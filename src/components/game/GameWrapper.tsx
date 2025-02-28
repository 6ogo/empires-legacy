
import React, { useState } from "react";
import { GameContainer } from "./GameContainer";
import { MainMenu } from "./MainMenu";

export const GameWrapper: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    boardSize: "medium",
    playerCount: 2,
    gameMode: "local",
    playerNames: ["Player 1", "Player 2"],
    playerColors: ["#FF5733", "#33A1FF"]
  });

  const startGame = (settings: any) => {
    setGameSettings(settings);
    setGameStarted(true);
  };

  const exitGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!gameStarted ? (
        <MainMenu onStartGame={startGame} />
      ) : (
        <GameContainer 
          settings={gameSettings} 
          onExitGame={exitGame} 
        />
      )}
    </div>
  );
};
