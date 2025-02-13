
import React from "react";
import GameModeSelect from "./GameModeSelect";
import BoardSizeSelect from "./BoardSizeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          <div className="mb-8 p-4 bg-white/10 rounded-lg inline-block">
            <h3 className="text-xl mb-2">Room ID</h3>
            <p className="font-mono text-2xl text-game-gold">{joinRoomId}</p>
            <p className="text-sm text-gray-400 mt-2">Share this code with other players to join</p>
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
