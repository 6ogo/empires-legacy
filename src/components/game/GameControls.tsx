
import React from "react";
import { Button } from "../ui/button";
import { Building2, Hammer, Users, ChevronsRight } from "lucide-react";

export const GameControls: React.FC<{
  onBuildClick: () => void;
  onRecruitClick: () => void;
  onEndTurnClick: () => void;
  disabled: boolean;
}> = ({ 
  onBuildClick, 
  onRecruitClick, 
  onEndTurnClick, 
  disabled 
}) => {
  return (
    <div className="space-y-3 mb-4">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-between border-gray-700 text-gray-300"
        onClick={onBuildClick}
        disabled={disabled}
      >
        <Building2 className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Build</span>
        <Hammer className="w-4 h-4" />
      </Button>
      
      <Button 
        variant="outline"
        className="w-full flex items-center justify-between border-gray-700 text-gray-300"
        onClick={onRecruitClick}
        disabled={disabled}
      >
        <Users className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Recruit</span>
        <div className="w-4 h-4" />
      </Button>
      
      <Button 
        className="w-full bg-amber-600 hover:bg-amber-700 mt-8"
        onClick={onEndTurnClick}
      >
        End Turn
        <ChevronsRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
