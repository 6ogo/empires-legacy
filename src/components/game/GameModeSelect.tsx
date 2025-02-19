
import React from "react";
import { Button } from "@/components/ui/button";

interface GameModeSelectProps {
  onSelectMode: (mode: "local" | "online") => void;
}

const GameModeSelect: React.FC<GameModeSelectProps> = ({ onSelectMode }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-semibold mb-12">Select Game Mode</h2>
      <div className="flex gap-8 justify-center">
        <Button
          onClick={() => onSelectMode("local")}
          className="bg-[#141B2C] hover:bg-[#1f2937] text-white text-2xl px-12 py-8 rounded-lg border border-white/10"
        >
          Local Game
        </Button>
        <Button
          onClick={() => onSelectMode("online")}
          className="bg-[#141B2C] hover:bg-[#1f2937] text-white text-2xl px-12 py-8 rounded-lg border border-white/10"
        >
          Online Game
        </Button>
      </div>
    </div>
  );
};

export default GameModeSelect;
