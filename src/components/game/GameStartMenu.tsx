import React from "react";
import BoardSizeSelect from "./BoardSizeSelect";
import { Button } from "@/components/ui/button";

interface GameStartMenuProps {
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
  gameMode: "local" | "online" | null;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number, enableRNG?: boolean) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost?: boolean;
  onStartAnyway?: () => void;
  connectedPlayers?: { username: string }[];
  selectedBoardSize?: number;
  maxPlayers?: number;
  onShowRandomEventsInfo: () => void;
}

const GameStartMenu: React.FC<GameStartMenuProps> = ({
  gameStatus,
  gameMode,
  onSelectMode,
  onCreateGame,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  onShowRandomEventsInfo,
  connectedPlayers = []
}) => {
  return (
    <div className="text-center text-white w-full max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-game-gold mb-8 md:mb-12">Empires' Legacy</h1>
      
      {gameStatus === "mode_select" && (
        <BoardSizeSelect
          onCreateGame={onCreateGame}
          gameMode={gameMode!}
          onJoinGame={onJoinGame}
          joinRoomId={joinRoomId}
          onJoinRoomIdChange={onJoinRoomIdChange}
          onShowRandomEventsInfo={onShowRandomEventsInfo}
        />
      )}
    </div>
  );
};

export default GameStartMenu;