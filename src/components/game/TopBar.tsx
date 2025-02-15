
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Trophy, BarChart2, ArrowLeft, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/types/auth";
import CombatHistory from "@/components/game/CombatHistory";

interface TopBarProps {
  gameStatus: string;
  handleBackClick: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  profile: UserProfile | null;
}

const XP_PER_LEVEL = 1000;

const TopBar: React.FC<TopBarProps> = ({
  gameStatus,
  handleBackClick,
  onShowLeaderboard,
  onShowStats,
  profile,
}) => {
  const navigate = useNavigate();
  const [showCombatHistory, setShowCombatHistory] = React.useState(false);
  
  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  const progressToNextLevel = (xpInCurrentLevel / xpForNextLevel) * 100;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
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
          {profile && (
            <div className="flex items-center gap-2">
              <Button
                variant="link"
                onClick={() => handleNavigate('/game/achievements')}
                className="text-game-gold ml-4 hover:text-game-gold/80 flex flex-col items-start"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Level {currentLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
                </div>
                <Progress value={progressToNextLevel} className="w-32 h-1 mt-1" />
              </Button>
              <Button
                variant="link"
                onClick={() => setShowCombatHistory(true)}
                className="text-game-gold hover:text-game-gold/80"
                title="View Combat History"
              >
                <History className="h-4 w-4" />
                <span className="ml-1">Combat History</span>
              </Button>
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
            onClick={() => handleNavigate('/game/settings')}
            className="bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {showCombatHistory && (
        <CombatHistory onClose={() => setShowCombatHistory(false)} />
      )}
    </>
  );
};

export default TopBar;
