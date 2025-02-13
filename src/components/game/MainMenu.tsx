
import React from "react";
import GameStartMenu from "./GameStartMenu";

interface MainMenuProps {
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
  gameMode: "local" | "online" | null;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost?: boolean;
  onStartAnyway?: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  gameStatus,
  gameMode,
  onSelectMode,
  onCreateGame,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  isHost,
  onStartAnyway,
  onShowLeaderboard,
  onShowStats,
}) => {
  // Convert gameStatus to the type expected by GameStartMenu by excluding 'stats'
  const gameStartMenuStatus = gameStatus === 'stats' ? 'menu' : gameStatus;

  return (
    <div className="container mx-auto p-4">
      <GameStartMenu
        gameStatus={gameStartMenuStatus}
        gameMode={gameMode}
        onSelectMode={onSelectMode}
        onCreateGame={onCreateGame}
        onJoinGame={onJoinGame}
        joinRoomId={joinRoomId}
        onJoinRoomIdChange={onJoinRoomIdChange}
        isHost={isHost}
        onStartAnyway={onStartAnyway}
      />
      <div className="flex gap-4 mt-4 justify-center">
        <button
          onClick={onShowLeaderboard}
          className="px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
        >
          View Leaderboard
        </button>
        <button
          onClick={onShowStats}
          className="px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
        >
          View Statistics
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
