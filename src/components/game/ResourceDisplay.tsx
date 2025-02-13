
import React from "react";
import { Resources } from "@/types/game";
import { Coins, Tree, Mountain, Wheat } from "lucide-react";

interface ResourceDisplayProps {
  resources: Resources;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources }) => {
  return (
    <div className="flex gap-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-game-gold" />
        <span className="font-semibold">{resources.gold}</span>
      </div>
      <div className="flex items-center gap-2">
        <Tree className="w-5 h-5 text-game-wood" />
        <span className="font-semibold">{resources.wood}</span>
      </div>
      <div className="flex items-center gap-2">
        <Mountain className="w-5 h-5 text-game-stone" />
        <span className="font-semibold">{resources.stone}</span>
      </div>
      <div className="flex items-center gap-2">
        <Wheat className="w-5 h-5 text-game-food" />
        <span className="font-semibold">{resources.food}</span>
      </div>
    </div>
  );
};

export default ResourceDisplay;
