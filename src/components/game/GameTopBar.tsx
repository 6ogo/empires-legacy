import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ResourceDisplay from "./ResourceDisplay";
import { Resources, Territory } from "@/types/game";

interface GameTopBarProps {
  onBack: () => void;
  resources: Resources;
  territories: Territory[];
  currentPlayerId: string;
}

const GameTopBar: React.FC<GameTopBarProps> = ({ onBack, resources, territories, currentPlayerId }) => {
  return (
    <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-30 bg-black/40 backdrop-blur-sm border-b border-white/10">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="shrink-0 text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <ResourceDisplay resources={resources} territories={territories} currentPlayerId={currentPlayerId} />
      <div className="w-9" /> {/* spacer to center the resource strip */}
    </div>
  );
};

export default GameTopBar;
