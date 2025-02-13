
import React from "react";
import GameModeSelect from "./GameModeSelect";
import BoardSizeSelect from "./BoardSizeSelect";
import { Button } from "@/components/ui/button";

interface GameStartMenuProps {
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting";
  gameMode: "local" | "online" | null;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost?: boolean;
  onStartAnyway?: () => void;
}

const GameStartMenu: React.FC<GameStartMenuProps> = ({
  gameStatus,
  gameMode,
  onSelectMode,
  onCreateGame,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  isHost,
  onStartAnyway,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-game-gold mb-8">Empire's Legacy</h1>
      
      {gameStatus === "menu" && (
        <GameModeSelect onSelectMode={onSelectMode} />
      )}

      {gameStatus === "mode_select" && (
        <BoardSizeSelect
          onCreateGame={onCreateGame}
          gameMode={gameMode!}
          onJoinGame={onJoinGame}
          joinRoomId={joinRoomId}
          onJoinRoomIdChange={onJoinRoomIdChange}
        />
      )}

      {gameStatus === "waiting" && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">Waiting for players...</h2>
          {isHost && (
            <Button onClick={onStartAnyway} className="mt-4">
              Start Game Anyway
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameStartMenu;
