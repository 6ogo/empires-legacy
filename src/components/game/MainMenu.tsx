
import React from "react";
import { useNavigate } from "react-router-dom";
import GameStartMenu from "./GameStartMenu";
import { Button } from "@/components/ui/button";
import { Settings, Trophy, BarChart2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MainMenuProps {
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
  gameMode: "local" | "online" | null;
  onSelectMode: (mode: "local" | "online" | null) => void;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost?: boolean;
  onStartAnyway?: () => void;
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
  const navigate = useNavigate();
  const { profile } = useAuth();
  const gameStartMenuStatus = gameStatus === 'stats' ? 'menu' : gameStatus;

  const handleBackClick = () => {
    if (gameStatus === "mode_select") {
      // Go back to main menu from mode selection
      onSelectMode(null);
    } else if (gameStatus === "stats") {
      // Go back to main menu from stats
      onSelectMode(null);
    } else if (gameStatus === "creating" || gameStatus === "joining" || gameStatus === "waiting") {
      // Go back to main menu from any game setup screen
      onSelectMode(null);
      onJoinRoomIdChange(''); // Clear the room ID when going back
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141B2C]">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {gameStatus !== "menu" && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBackClick}
              className="bg-white/10"
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {profile?.level && (
            <div className="text-game-gold ml-4">
              Level {profile.level} ({profile.xp} XP)
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onShowLeaderboard}
            className="bg-white/10"
            title="View Leaderboard"
          >
            <Trophy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onShowStats}
            className="bg-white/10"
            title="View Statistics"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/settings')}
            className="bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center Content */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
