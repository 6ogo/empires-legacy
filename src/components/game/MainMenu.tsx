
import React from "react";
import { useNavigate } from "react-router-dom";
import GameStartMenu from "./GameStartMenu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  const navigate = useNavigate();
  const { profile } = useAuth();
  const gameStartMenuStatus = gameStatus === 'stats' ? 'menu' : gameStatus;

  return (
    <div className="fixed inset-0 bg-[#141B2C]">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div>
          {profile?.level && (
            <div className="text-game-gold">
              Level {profile.level} ({profile.xp} XP)
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onShowLeaderboard}
            className="bg-game-gold text-black hover:bg-game-gold/90 font-semibold"
          >
            View Leaderboard
          </Button>
          <Button
            onClick={onShowStats}
            className="bg-game-gold text-black hover:bg-game-gold/90 font-semibold"
          >
            View Statistics
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
        <div className="w-full max-w-xl -mt-20">
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
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
