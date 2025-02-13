
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BoardSizeSelectProps {
  onCreateGame: (numPlayers: number, boardSize: number) => void;
  gameMode: "local" | "online";
  onJoinGame: () => void;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
}

const BoardSizeSelect: React.FC<BoardSizeSelectProps> = ({
  onCreateGame,
  gameMode,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
}) => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [availableSizes, setAvailableSizes] = useState<number[]>([]);

  useEffect(() => {
    // Generate random board sizes based on player count
    const sizes = [];
    if (numPlayers === 2) {
      sizes.push(
        20,
        Math.floor(Math.random() * (40 - 20) + 20),
        Math.floor(Math.random() * (70 - 40) + 40),
        Math.floor(Math.random() * (100 - 70) + 70)
      );
    } else {
      sizes.push(
        35,
        Math.floor(Math.random() * (60 - 35) + 35),
        Math.floor(Math.random() * (90 - 60) + 60),
        Math.floor(Math.random() * (120 - 90) + 90)
      );
    }
    setAvailableSizes(sizes.sort((a, b) => a - b));
  }, [numPlayers]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Select number of players</h2>
        <div className="flex gap-4 justify-center">
          {[2, 3, 4].map((num) => (
            <Button
              key={num}
              onClick={() => setNumPlayers(num)}
              variant={numPlayers === num ? "default" : "outline"}
              className="px-6 py-3"
            >
              {num} Players
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl text-center mb-4">Select board size</h2>
        <div className="flex gap-4 justify-center">
          {availableSizes.map((size) => (
            <Button
              key={size}
              onClick={() => onCreateGame(numPlayers, size)}
              className="px-8 py-4 text-xl"
            >
              {size} Hexes
            </Button>
          ))}
        </div>
      </div>
      
      {gameMode === "online" && (
        <div className="mt-8 text-center">
          <p className="mb-4">or join an existing game:</p>
          <div className="flex gap-2 justify-center">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => onJoinRoomIdChange(e.target.value)}
              className="bg-white/10 border-white/20 max-w-xs"
            />
            <Button onClick={onJoinGame}>Join Game</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSizeSelect;
