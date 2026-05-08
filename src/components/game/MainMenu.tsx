import React from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { withErrorHandling, handleGameError } from "@/utils/error-handling";
import { toast } from "sonner";
import { GameStatus, GameMode } from "@/types/game";
import GameStartMenu from "./GameStartMenu";
import TopBar from "./menu/TopBar";
import RandomEventsDialog from "./menu/RandomEventsDialog";

interface MainMenuProps {
  gameStatus: GameStatus;
  gameMode: GameMode | null;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: (roomId: string) => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost: boolean;
  onStartAnyway: () => void;
  onSelectMode: (mode: GameMode) => void;
  connectedPlayers: { username: string }[];
  onBackToMenu: () => void;
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
  onSelectMode,
  connectedPlayers,
  onBackToMenu,
}) => {
  const navigate = useNavigate();
  const { setGameStatus } = useGameStore();
  const [showRandomEventsInfo, setShowRandomEventsInfo] = React.useState(false);
  const [pendingJoinRoomId, setPendingJoinRoomId] = React.useState('');

  // Map creating/joining status so BoardSizeSelect renders in "mode_select" slot
  const gameStartMenuStatus =
    gameStatus === 'creating' || gameStatus === 'joining'
      ? 'mode_select'
      : gameStatus === 'stats'
      ? 'menu'
      : gameStatus;

  const handleBackClick = () => {
    if (["mode_select", "creating", "joining", "waiting", "stats"].includes(gameStatus)) {
      onBackToMenu();
    } else {
      navigate('/');
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
        onJoinGame(pendingJoinRoomId || joinRoomId),
        { context: 'Game Join' }
      );
    } catch (error) {
      handleGameError(error, 'Game Join Failed');
      toast.error('Failed to join game');
    }
  };

  const handleJoinRoomIdChange = (value: string) => {
    setPendingJoinRoomId(value);
    onJoinRoomIdChange(value);
  };

  return (
    <div className="fixed inset-0 bg-[#141B2C]">
      <TopBar
        gameStatus={gameStatus}
        handleBackClick={handleBackClick}
        onShowLeaderboard={() => {}}
        onShowStats={() => {}}
        profile={null}
      />

      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-xl">
          <GameStartMenu
            gameStatus={gameStartMenuStatus}
            gameMode={gameMode}
            onSelectMode={onSelectMode}
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            joinRoomId={joinRoomId || pendingJoinRoomId}
            onJoinRoomIdChange={handleJoinRoomIdChange}
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
