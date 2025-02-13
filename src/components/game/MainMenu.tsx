
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
    <div className="container mx-auto p-4">
      <div className="min-h-screen flex flex-col">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {profile?.level && (
              <div className="text-game-gold">
                Level {profile.level} ({profile.xp} XP)
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={onShowLeaderboard}
              className="bg-game-gold text-black hover:bg-game-gold/90"
            >
              View Leaderboard
            </Button>
            <Button
              onClick={onShowStats}
              className="bg-game-gold text-black hover:bg-game-gold/90"
            >
              View Statistics
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - Moved up by adjusting margin */}
        <div className="flex-1 flex items-center justify-center -mt-20">
          <div className="w-full max-w-md">
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
    </div>
  );
};

export default MainMenu;
