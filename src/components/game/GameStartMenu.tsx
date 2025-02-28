
import React from "react";
import GameModeSelect from "./GameModeSelect";
import BoardSizeSelect from "./BoardSizeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";

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
  connectedPlayers: { username: string }[];
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
  isHost,
  onStartAnyway,
  connectedPlayers = [],
  selectedBoardSize = 0,
  maxPlayers = 2,
  onShowRandomEventsInfo
}) => {
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(joinRoomId);
    toast.success("Room ID copied to clipboard!");
  };

  return (
    <div className="text-center text-white w-full max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-game-gold mb-8 md:mb-12">Empires' Legacy</h1>

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
          onShowRandomEventsInfo={onShowRandomEventsInfo}
        />
      )}

      {gameStatus === "waiting" && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">Waiting Room</h2>

          {/* Game Info */}
          <div className="mb-8 p-4 bg-white/5 rounded-lg inline-block w-full max-w-sm">
            <h3 className="text-xl mb-4">Game Details</h3>
            <div className="space-y-2 text-left px-4">
              <p><span className="text-game-gold">Game Mode:</span> {gameMode === 'local' ? 'Local Game' : 'Online Game'}</p>
              <p><span className="text-game-gold">Players:</span> {connectedPlayers.length} / {maxPlayers}</p>
              {selectedBoardSize > 0 && (
                <p><span className="text-game-gold">Board Size:</span> {selectedBoardSize} hexes</p>
              )}
              {gameMode === 'online' && (
                <p><span className="text-game-gold">Room ID:</span> {joinRoomId}</p>
              )}
            </div>
          </div>

          {/* Room ID Section for online games */}
          {gameMode === 'online' && (
            <div className="mb-8 p-4 md:p-6 bg-white/10 rounded-lg inline-block w-full max-w-sm border border-game-gold">
              <h3 className="text-xl md:text-2xl mb-4 text-game-gold">Room ID</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Input
                  value={joinRoomId}
                  readOnly
                  className="font-mono text-xl md:text-3xl text-game-gold bg-transparent border-none text-center tracking-wider"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyRoomId}
                  className="hover:bg-white/10 border border-game-gold"
                  title="Copy Room ID"
                >
                  <Copy className="h-4 w-4 text-game-gold" />
                </Button>
              </div>
              <p className="text-sm text-gray-400">Share this code with other players to join</p>
            </div>
          )}

          {/* Connected Players */}
          <div className="mb-8">
            <h3 className="text-xl mb-4">Connected Players ({connectedPlayers.length})</h3>
            {connectedPlayers.length === 0 ? (
              <p className="text-gray-400">Waiting for players to join...</p>
            ) : (
              <ul className="space-y-2">
                {connectedPlayers.map((player, index) => (
                  <li key={index} className="text-lg">
                    {player.username}
                    {index === 0 && " (Host)"}
                  </li>
                ))}
              </ul>
            )}
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
