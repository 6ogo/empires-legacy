
import React from "react";
import { GameStatus } from "@/types/game";
import PreGameScreens from "@/components/game/PreGameScreens";
import MainMenu from "@/components/game/MainMenu";

interface GameWrapperProps {
  showLeaderboard: boolean;
  gameStatus: GameStatus;
  gameMode: "local" | "online" | null;
  onBackToMenu: () => void;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost: boolean;
  onStartAnyway: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  connectedPlayers: { username: string }[];
}

const GameWrapper = ({
  showLeaderboard,
  gameStatus,
  gameMode,
  onBackToMenu,
  onSelectMode,
  onCreateGame,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  isHost,
  onStartAnyway,
  onShowLeaderboard,
  onShowStats,
  connectedPlayers,
}: GameWrapperProps) => {
  const handleBackToMenu = () => {
    console.log("Back to menu clicked");
    onBackToMenu();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-6 md:px-0 md:py-0">
      <PreGameScreens
        showLeaderboard={showLeaderboard}
        gameStatus={gameStatus}
        onBackToMenu={handleBackToMenu}
      >
        <MainMenu
          gameStatus={gameStatus}
          gameMode={gameMode}
          onSelectMode={onSelectMode}
          onCreateGame={onCreateGame}
          onJoinGame={onJoinGame}
          joinRoomId={joinRoomId}
          onJoinRoomIdChange={onJoinRoomIdChange}
          isHost={isHost}
          onStartAnyway={onStartAnyway}
          onShowLeaderboard={onShowLeaderboard}
          onShowStats={onShowStats}
          connectedPlayers={connectedPlayers}
        />
      </PreGameScreens>
    </div>
  );
};

export default GameWrapper;
