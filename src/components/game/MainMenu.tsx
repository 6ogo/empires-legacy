import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGameStore } from "@/store/gameStore";
import { routes, getRoute } from "@/routes";
import { withErrorHandling, handleGameError } from "@/utils/error-handling";
import GameStartMenu from "./GameStartMenu";
import TopBar from "./menu/TopBar";
import RandomEventsDialog from "./menu/RandomEventsDialog";
import { toast } from "sonner";
import { GameStatus, GameMode } from "@/types/game";

interface MainMenuProps {
  gameStatus: GameStatus;
  gameMode: GameMode | null;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost: boolean;
  onStartAnyway: () => void;
  connectedPlayers: { username: string }[];
}

const MainMenu: React.FC<MainMenuProps> = ({
  gameStatus,
  gameMode,
  onCreateGame,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  isHost,
  onStartAnyway,
  connectedPlayers,
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    setGameMode,
    setGameStatus,
    setShowLeaderboard,
    showLeaderboard
  } = useGameStore();

  const [showRandomEventsInfo, setShowRandomEventsInfo] = React.useState(false);
  const gameStartMenuStatus = gameStatus === 'stats' ? 'menu' : gameStatus;

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
    navigate(getRoute('leaderboard'));
  };

  const handleShowStats = () => {
    setGameStatus('stats');
    navigate(getRoute('stats'));
  };

  const handleSelectMode = async (mode: GameMode | null) => {
    try {
      await withErrorHandling(
        (async () => {
          setGameMode(mode);
          if (mode === 'local') {
            setGameStatus('creating');
          } else if (mode === 'online') {
            setGameStatus('joining');
          } else {
            setGameStatus('menu');
          }
        })(),
        { context: 'Game Mode Selection' }
      );
    } catch (error) {
      handleGameError(error, 'Mode Selection Failed');
      setGameStatus('menu');
    }
  };

  const handleBackClick = async () => {
    try {
      if (["mode_select", "stats", "creating", "joining", "waiting"].includes(gameStatus)) {
        await handleSelectMode(null);
        if (gameStatus === "joining" || gameStatus === "waiting") {
          onJoinRoomIdChange('');
        }
        navigate(getRoute('game'));
      }
    } catch (error) {
      handleGameError(error, 'Navigation Failed');
      toast.error('Failed to return to menu');
    }
  };

  const handleCreateGame = async (numPlayers: number, boardSize: number) => {
    try {
      await withErrorHandling(
        onCreateGame(numPlayers, boardSize),
        { context: 'Game Creation' }
      );
    } catch (error) {
      handleGameError(error, 'Game Creation Failed');
      setGameStatus('menu');
    }
  };

  const handleJoinGame = async () => {
    try {
      await withErrorHandling(
        onJoinGame(),
        { context: 'Game Join' }
      );
    } catch (error) {
      handleGameError(error, 'Game Join Failed');
      setGameStatus('menu');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141B2C]">
      <TopBar
        gameStatus={gameStatus}
        handleBackClick={handleBackClick}
        onShowLeaderboard={handleShowLeaderboard}
        onShowStats={handleShowStats}
        profile={profile}
      />

      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-xl">
          <GameStartMenu
            gameStatus={gameStartMenuStatus}
            gameMode={gameMode}
            onSelectMode={handleSelectMode}
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
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