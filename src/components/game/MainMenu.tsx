
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import GameStartMenu from "./GameStartMenu";
import TopBar from "./menu/TopBar";
import RandomEventsDialog from "./menu/RandomEventsDialog";

interface MainMenuProps {
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
  gameMode: "local" | "online" | null;
  onSelectMode: (mode: "local" | "online" | null) => void;
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
  connectedPlayers,
}) => {
  const { profile } = useAuth();
  const [showRandomEventsInfo, setShowRandomEventsInfo] = React.useState(false);
  const gameStartMenuStatus = gameStatus === 'stats' ? 'menu' : gameStatus;

  const handleBackClick = () => {
    if (["mode_select", "stats", "creating", "joining", "waiting"].includes(gameStatus)) {
      onSelectMode(null);
      if (gameStatus === "joining" || gameStatus === "waiting") {
        onJoinRoomIdChange('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141B2C]">
      <TopBar
        gameStatus={gameStatus}
        handleBackClick={handleBackClick}
        onShowLeaderboard={onShowLeaderboard}
        onShowStats={onShowStats}
        profile={profile}
      />

      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-xl">
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
            connectedPlayers={connectedPlayers}
            onShowRandomEventsInfo={() => setShowRandomEventsInfo(true)}
          />
        </div>
      </div>

      <RandomEventsDialog 
        open={showRandomEventsInfo} 
        onOpenChange={setShowRandomEventsInfo} 
      />
    </div>
  );
};

export default MainMenu;
