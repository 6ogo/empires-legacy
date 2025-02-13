
import React from "react";
import { Button } from "@/components/ui/button";

interface GameModeSelectProps {
  onSelectMode: (mode: "local" | "online") => void;
}

const GameModeSelect: React.FC<GameModeSelectProps> = ({ onSelectMode }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-center mb-4">Select Game Mode</h2>
      <div className="flex gap-4">
        <Button
          onClick={() => onSelectMode("local")}
          className="px-8 py-4 text-xl"
        >
          Local Game
        </Button>
        <Button
          onClick={() => onSelectMode("online")}
          className="px-8 py-4 text-xl"
        >
          Online Game
        </Button>
      </div>
    </div>
  );
};

export default GameModeSelect;
