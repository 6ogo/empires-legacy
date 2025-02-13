
import React from "react";
import GameModeSelect from "./GameModeSelect";
import BoardSizeSelect from "./BoardSizeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface GameStartMenuProps {
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting";
  gameMode: "local" | "online" | null;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number) => void;
  onJoinGame: () => void;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost?: boolean;
  onStartAnyway?: () => void;
  connectedPlayers?: { username: string }[];
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
  connectedPlayers = [],
}) => {
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(joinRoomId);
    toast.success("Room ID copied to clipboard!");
  };

  return (
    <div className="text-center text-white">
      <h1 className="text-5xl font-bold text-game-gold mb-12">Empire's Legacy</h1>
      
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
          <h2 className="text-2xl mb-4">Waiting Room</h2>
          <div className="mb-8 p-4 bg-white/10 rounded-lg inline-block min-w-[300px]">
            <h3 className="text-xl mb-2">Room ID</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="font-mono text-2xl text-game-gold">{joinRoomId}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyRoomId}
                className="hover:bg-white/10"
                title="Copy Room ID"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-400">Share this code with other players to join</p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl mb-4">Connected Players ({connectedPlayers.length})</h3>
            <ul className="space-y-2">
              {connectedPlayers.map((player, index) => (
                <li key={index} className="text-lg">
                  {player.username}
                  {index === 0 && " (Host)"}
                </li>
              ))}
            </ul>
          </div>

          {isHost && connectedPlayers.length >= 2 && (
            <Button onClick={onStartAnyway} className="mt-4 bg-game-gold text-black hover:bg-game-gold/90">
              Start Game
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameStartMenu;
