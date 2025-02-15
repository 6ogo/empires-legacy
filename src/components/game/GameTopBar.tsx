
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ResourceDisplay from "./ResourceDisplay";
import { Resources } from "@/types/game";

interface GameTopBarProps {
  onBack: () => void;
  resources: Resources;
}

const GameTopBar: React.FC<GameTopBarProps> = ({ onBack, resources }) => {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={onBack}
        className="absolute top-4 left-4 z-50 bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-center">
        <ResourceDisplay resources={resources} />
      </div>
    </>
  );
};

export default GameTopBar;
