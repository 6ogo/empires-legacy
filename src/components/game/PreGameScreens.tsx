
import React from "react";
import Leaderboard from "./Leaderboard";
import Stats from "./Stats";

interface PreGameScreensProps {
  showLeaderboard: boolean;
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
  onBackToMenu: () => void;
  children?: React.ReactNode;
}

const PreGameScreens: React.FC<PreGameScreensProps> = ({
  showLeaderboard,
  gameStatus,
  onBackToMenu,
  children,
}) => {
  if (showLeaderboard) {
    return (
      <div className="p-4">
        <button
          onClick={onBackToMenu}
          className="mb-4 px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
        >
          Back to Menu
        </button>
        <Leaderboard />
      </div>
    );
  }

  if (gameStatus === "stats") {
    return (
      <div className="container mx-auto p-4">
        <button
          onClick={onBackToMenu}
          className="mb-4 px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
        >
          Back to Menu
        </button>
        <Stats />
      </div>
    );
  }

  return <>{children}</>;
};

export default PreGameScreens;
