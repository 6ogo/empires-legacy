
import React from "react";
import { useNavigate } from "react-router-dom";
import GameStartMenu from "./GameStartMenu";
import { Button } from "@/components/ui/button";
import { Settings, Trophy, BarChart2, ArrowLeft, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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

const XP_PER_LEVEL = 1000; // XP needed for each level

const randomEvents = [
  {
    title: "Resource Events",
    descriptions: [
      "Bountiful Harvest: +50% food production for 2 turns",
      "Gold Rush: +100% gold production for 1 turn",
      "Drought: -30% food production for 3 turns",
      "Trade Boom: +75% trade income for 2 turns"
    ]
  },
  {
    title: "Combat Events",
    descriptions: [
      "Fog of War: Combat visibility reduced for 1 turn",
      "Morale Surge: Units gain +25% combat strength for 1 turn",
      "Supply Line Disruption: Units cost +50% upkeep for 2 turns",
      "Veteran Training: New units start with +1 experience"
    ]
  },
  {
    title: "Territory Events",
    descriptions: [
      "Natural Disaster: Random territory loses 50% production for 1 turn",
      "Border Dispute: Random neutral territory becomes claimable",
      "Resource Discovery: Random territory gains +1 resource production",
      "Cultural Festival: +50% influence generation in a random territory"
    ]
  }
];

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
  const [showRandomEventsInfo, setShowRandomEventsInfo] = React.useState(false);
  const gameStartMenuStatus = gameStatus === 'stats' ? 'menu' : gameStatus;

  // Calculate XP progress to next level
  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  const progressToNextLevel = (xpInCurrentLevel / xpForNextLevel) * 100;

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
          {profile && (
            <Button
              variant="link"
              onClick={() => navigate('/achievements')}
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
            onShowRandomEventsInfo={() => setShowRandomEventsInfo(true)}
          />
        </div>
      </div>

      {/* Random Events Info Dialog */}
      <Dialog open={showRandomEventsInfo} onOpenChange={setShowRandomEventsInfo}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4 text-white">Random Events</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-gray-300">
              Random events add an exciting layer of unpredictability to your game, creating unique challenges and opportunities that can dramatically change the course of battle!
            </p>
            {randomEvents.map((category, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-semibold text-game-gold">{category.title}</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {category.descriptions.map((desc, i) => (
                    <li key={i} className="text-white">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainMenu;
