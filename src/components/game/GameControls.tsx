
import React from "react";
import { Button } from "../ui/button";
import { Building2, Hammer, Users, ChevronsRight, Map, Sword } from "lucide-react";

export const GameControls: React.FC<{
  onBuildClick: () => void;
  onRecruitClick: () => void;
  onExpandClick: () => void;
  onEndTurnClick: () => void;
  disabled: boolean;
  actionTaken: boolean;
  expandMode?: boolean;
  canAttack?: boolean;
  hasResourcesForExpansion?: boolean;
}> = ({ 
  onBuildClick, 
  onRecruitClick, 
  onExpandClick,
  onEndTurnClick, 
  disabled,
  actionTaken,
  expandMode = false,
  canAttack = false,
  hasResourcesForExpansion = false
}) => {
  return (
    <div className="space-y-3 mb-4">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-between border-gray-700 text-gray-300"
        onClick={onBuildClick}
        disabled={disabled || actionTaken || expandMode}
      >
        <Building2 className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Build</span>
        <Hammer className="w-4 h-4" />
      </Button>
      
      <Button 
        variant="outline"
        className="w-full flex items-center justify-between border-gray-700 text-gray-300"
        onClick={onRecruitClick}
        disabled={disabled || actionTaken || expandMode}
      >
        <Users className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Recruit</span>
        <div className="w-4 h-4" />
      </Button>
      
      <Button 
        variant={expandMode ? "default" : "outline"}
        className={`w-full flex items-center justify-between ${expandMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-700 text-gray-300"}`}
        onClick={onExpandClick}
        disabled={actionTaken || !hasResourcesForExpansion}
      >
        <Map className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Expand</span>
        {!hasResourcesForExpansion && !actionTaken && (
          <span className="text-xs text-gray-400">Needs resources</span>
        )}
        <div className="w-4 h-4" />
      </Button>
      
      <Button 
        variant="outline"
        className={`w-full flex items-center justify-between border-gray-700 ${canAttack ? "text-red-400" : "text-gray-500"}`}
        disabled={!canAttack || actionTaken}
      >
        <Sword className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Attack</span>
        {!canAttack && !actionTaken && (
          <span className="text-xs text-gray-400">Need units & enemy</span>
        )}
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
