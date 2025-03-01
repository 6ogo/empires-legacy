
import React from "react";
import { Button } from "../ui/button";
import { Building2, Hammer, Users, ChevronsRight, Map, Sword } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const GameControls: React.FC<{
  onBuildClick: () => void;
  onRecruitClick: () => void;
  onExpandClick: () => void;
  onEndTurnClick: () => void;
  onAttackClick: () => void;
  disabled: boolean;
  actionTaken: boolean;
  expandMode?: boolean;
  attackMode?: boolean;
  canAttack: boolean;
  hasResourcesForExpansion: boolean;
  canRecruit: boolean;
  canBuild: boolean;
  actionsPerformed: {
    build: boolean;
    recruit: boolean;
    expand: boolean;
    attack: boolean;
  };
  errorMessages: {
    attack: string;
    recruit: string;
    build: string;
    expand: string;
  };
}> = ({ 
  onBuildClick, 
  onRecruitClick, 
  onExpandClick,
  onAttackClick,
  onEndTurnClick, 
  disabled,
  actionTaken,
  expandMode = false,
  attackMode = false,
  canAttack,
  hasResourcesForExpansion,
  canRecruit,
  canBuild,
  actionsPerformed,
  errorMessages
}) => {
  
  const renderTooltipButton = (
    label: string, 
    icon: React.ReactNode, 
    onClick: () => void, 
    isActive: boolean, 
    isEnabled: boolean, 
    isPerformed: boolean, 
    errorMessage: string, 
    endIcon?: React.ReactNode
  ) => {
    const buttonDisabled = !isEnabled || actionTaken || isPerformed;
    const buttonVariant = isActive ? "default" : "outline";
    const buttonClass = isActive 
      ? "bg-blue-600 hover:bg-blue-700 text-white" 
      : "border-gray-700 text-gray-300";
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={buttonVariant}
              className={`w-full flex items-center justify-between ${buttonClass}`}
              onClick={onClick}
              disabled={buttonDisabled}
            >
              {icon}
              <span className="flex-1 text-left">{label}</span>
              {!isEnabled && !actionTaken && !isPerformed && (
                <span className="text-xs text-gray-400">{errorMessage}</span>
              )}
              {endIcon && endIcon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {buttonDisabled 
              ? isPerformed 
                ? `You've already ${label.toLowerCase()}ed this turn` 
                : errorMessage 
              : `Click to ${label.toLowerCase()}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-3 mb-4">
      {renderTooltipButton(
        "Build", 
        <Building2 className="w-4 h-4 mr-2" />, 
        onBuildClick, 
        false, 
        canBuild, 
        actionsPerformed.build, 
        errorMessages.build,
        <Hammer className="w-4 h-4" />
      )}
      
      {renderTooltipButton(
        "Recruit", 
        <Users className="w-4 h-4 mr-2" />, 
        onRecruitClick, 
        false, 
        canRecruit, 
        actionsPerformed.recruit, 
        errorMessages.recruit,
        <div className="w-4 h-4" />
      )}
      
      {renderTooltipButton(
        "Expand", 
        <Map className="w-4 h-4 mr-2" />, 
        onExpandClick, 
        expandMode, 
        hasResourcesForExpansion, 
        actionsPerformed.expand, 
        errorMessages.expand,
        <div className="w-4 h-4" />
      )}
      
      {renderTooltipButton(
        "Attack", 
        <Sword className="w-4 h-4 mr-2" />, 
        onAttackClick, 
        attackMode, 
        canAttack, 
        actionsPerformed.attack, 
        errorMessages.attack,
        <div className="w-4 h-4" />
      )}
      
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
