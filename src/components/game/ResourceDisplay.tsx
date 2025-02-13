
import React from "react";
import { Resources } from "@/types/game";
import { Coins, Trees, Mountain, Wheat } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ResourceDisplayProps {
  resources: Resources;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources }) => {
  return (
    <div className="relative flex gap-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <HoverCard>
        <HoverCardTrigger>
          <div className="flex items-center gap-2 cursor-help">
            <Coins className="w-6 h-6 text-game-gold" />
            <span className="font-semibold text-lg">{resources.gold}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent sideOffset={5} className="w-80 bg-background/95 backdrop-blur-sm border border-border/50">
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold text-sm">Gold Income Sources</h4>
            <p className="text-sm">Base income: 10 per territory</p>
            <p className="text-sm">Market bonus: +20 gold, +2 per wood/stone, +5 per food</p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger>
          <div className="flex items-center gap-2 cursor-help">
            <Trees className="w-6 h-6 text-game-wood" />
            <span className="font-semibold text-lg">{resources.wood}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent sideOffset={5} className="w-80 bg-background/95 backdrop-blur-sm border border-border/50">
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold text-sm">Wood Income Sources</h4>
            <p className="text-sm">Base income: 5 per territory</p>
            <p className="text-sm">Forest bonus: x3 wood production</p>
            <p className="text-sm">Lumber Mill bonus: +20 wood</p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger>
          <div className="flex items-center gap-2 cursor-help">
            <Mountain className="w-6 h-6 text-game-stone" />
            <span className="font-semibold text-lg">{resources.stone}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent sideOffset={5} className="w-80 bg-background/95 backdrop-blur-sm border border-border/50">
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold text-sm">Stone Income Sources</h4>
            <p className="text-sm">Base income: 5 per territory</p>
            <p className="text-sm">Mountain bonus: x3 stone production</p>
            <p className="text-sm">Mine bonus: +20 stone</p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger>
          <div className="flex items-center gap-2 cursor-help">
            <Wheat className="w-6 h-6 text-game-food" />
            <span className="font-semibold text-lg">{resources.food}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent sideOffset={5} className="w-80 bg-background/95 backdrop-blur-sm border border-border/50">
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold text-sm">Food Income Sources</h4>
            <p className="text-sm">Base income: 5 per territory</p>
            <p className="text-sm">Plains bonus: x3 food production</p>
            <p className="text-sm">Farm bonus: +8 food</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default ResourceDisplay;
