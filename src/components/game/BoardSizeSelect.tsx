
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

interface BoardSizeSelectProps {
  onCreateGame: (numPlayers: number, boardSize: number, enableRNG?: boolean) => void;
  gameMode: "local" | "online";
  onJoinGame: () => void;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  onShowRandomEventsInfo: () => void;
}

const BoardSizeSelect: React.FC<BoardSizeSelectProps> = ({
  onCreateGame,
  gameMode,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  onShowRandomEventsInfo
}) => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [availableSizes, setAvailableSizes] = useState<number[]>([]);
  const [enableRNG, setEnableRNG] = useState(false);

  useEffect(() => {
    // Generate random board sizes based on player count
    const sizes = [];
    if (numPlayers <= 3) {
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
    setSelectedSize(null); // Reset selection when player count changes
  }, [numPlayers]);

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
  };

  const handleStartGame = () => {
    if (selectedSize) {
      onCreateGame(numPlayers, selectedSize, enableRNG);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl mb-6 text-white">Select number of players</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {[2, 3, 4, 5, 6].map((num) => (
            <Button
              key={num}
              onClick={() => setNumPlayers(num)}
              variant={numPlayers === num ? "default" : "outline"}
              className={`
                px-8 py-6 text-xl transition-all
                ${numPlayers === num 
                  ? 'bg-game-gold text-black hover:bg-game-gold/90' 
                  : 'bg-white/10 hover:bg-white/20 text-white'}
              `}
            >
              {num} Players
            </Button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Checkbox
            id="enableRNG"
            checked={enableRNG}
            onCheckedChange={(checked) => setEnableRNG(checked as boolean)}
            className="border-white/50"
          />
          <Label htmlFor="enableRNG" className="text-white text-lg">
            Enable Random Events
          </Label>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShowRandomEventsInfo}
            className="p-0 hover:bg-transparent"
          >
            <Info className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
          </Button>
        </div>

        <h2 className="text-2xl text-center mb-6 text-white">Select board size</h2>
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {availableSizes.map((size) => (
            <Button
              key={size}
              onClick={() => handleSizeSelect(size)}
              variant={selectedSize === size ? "default" : "outline"}
              className={`
                px-8 py-6 text-xl transition-all
                ${selectedSize === size
                  ? 'bg-game-gold text-black hover:bg-game-gold/90'
                  : 'bg-white/10 hover:bg-white/20 text-white'}
              `}
            >
              {size} Hexes
            </Button>
          ))}
        </div>

        {selectedSize && (
          <Button
            onClick={handleStartGame}
            className="px-12 py-6 text-xl bg-green-600 hover:bg-green-700 text-white transition-all"
            disabled={gameMode === 'online'}
          >
            {gameMode === 'local' ? 'Start Game' : 'Create Room'}
          </Button>
        )}
      </div>
      
      {gameMode === "online" && (
        <div className="mt-12 text-center">
          <p className="mb-4 text-white text-xl">or join an existing game:</p>
          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => onJoinRoomIdChange(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg py-6"
            />
            <Button 
              onClick={onJoinGame}
              className="px-8 text-lg bg-game-gold text-black hover:bg-game-gold/90"
            >
              Join Game
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSizeSelect;
