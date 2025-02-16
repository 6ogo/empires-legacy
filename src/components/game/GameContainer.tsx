
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GameMode } from '@/types/game';

interface GameContainerProps {
  gameMode: GameMode;
  onBack: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ gameMode, onBack }) => {
  return (
    <div className="relative">
      <Button
        onClick={onBack}
        className="absolute top-4 left-4 z-50"
        variant="ghost"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>
      {/* Rest of your game container content */}
    </div>
  );
};

export default GameContainer;
