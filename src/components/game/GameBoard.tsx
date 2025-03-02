
import React, { useState } from "react";
import { HexGrid } from "./HexGrid";
import { HexGrid3D } from "./HexGrid3D";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Cube } from "lucide-react";

export const GameBoard: React.FC<{
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritorySelect: (id: number) => void;
  onClaimTerritory: (id: number) => void;
  onAttackTerritory: (id: number) => void;
  currentPlayer: number;
  phase: "setup" | "playing";
  actionTaken: boolean;
  expandableTerritories: number[];
  attackableTerritories: number[];
  buildableTerritories: number[];
  recruitableTerritories: number[];
  currentAction: "none" | "build" | "expand" | "attack" | "recruit";
  actionsPerformed: {
    build: boolean;
    recruit: boolean;
    expand: boolean;
    attack: boolean;
  };
}> = ({ 
  territories, 
  players, 
  selectedTerritory, 
  onTerritorySelect, 
  onClaimTerritory,
  onAttackTerritory,
  currentPlayer,
  phase,
  actionTaken,
  expandableTerritories,
  attackableTerritories,
  buildableTerritories,
  recruitableTerritories,
  currentAction,
  actionsPerformed
}) => {
  const [use3D, setUse3D] = useState<boolean>(true);
  
  const handleTerritoryClick = (territoryId: number) => {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;
    
    // Setup phase: claim unclaimed territory
    if (phase === "setup" && territory.owner === null) {
      // Check if claim has already been attempted to prevent double-clicks
      if (actionTaken) {
        toast.error("Please wait for your turn to complete");
        return;
      }
      onClaimTerritory(territoryId);
      return;
    }
    
    // Playing phase
    if (phase === "playing") {
      // Handle different actions based on currentAction
      switch (currentAction) {
        case "expand":
          // Expanding to territory
          if (expandableTerritories.includes(territoryId) && !actionsPerformed.expand) {
            onClaimTerritory(territoryId); // Use the same claim function for expansion
          } else if (actionsPerformed.expand) {
            toast.error("You've already expanded this turn");
          } else if (!expandableTerritories.includes(territoryId)) {
            toast.error("Cannot expand to this territory");
          }
          return;
          
        case "attack":
          // Attacking a territory
          if (attackableTerritories.includes(territoryId) && !actionsPerformed.attack) {
            if (selectedTerritory === null) {
              toast.error("Select your territory first");
            } else {
              onAttackTerritory(territoryId);
            }
          } else if (actionsPerformed.attack) {
            toast.error("You've already attacked this turn");
          } else if (!attackableTerritories.includes(territoryId)) {
            toast.error("Cannot attack this territory");
          }
          return;
          
        case "build":
          // Building on territory
          if (buildableTerritories.includes(territoryId) && !actionsPerformed.build) {
            onTerritorySelect(territoryId);
          } else if (actionsPerformed.build) {
            toast.error("You've already built this turn");
          } else if (!buildableTerritories.includes(territoryId)) {
            toast.error("Cannot build on this territory");
          }
          return;
          
        case "recruit":
          // Recruiting on territory
          if (recruitableTerritories.includes(territoryId) && !actionsPerformed.recruit) {
            onTerritorySelect(territoryId);
          } else if (actionsPerformed.recruit) {
            toast.error("You've already recruited this turn");
          } else if (!recruitableTerritories.includes(territoryId)) {
            toast.error("Cannot recruit on this territory");
          }
          return;
          
        default:
          // Select owned territory for default action
          if (territory.owner === currentPlayer) {
            onTerritorySelect(territoryId);
          }
      }
    }
  };

  const getInteractiveTerritories = () => {
    if (phase === "setup") {
      return territories.filter(t => t.owner === null).map(t => t.id);
    }
    
    switch (currentAction) {
      case "expand":
        return expandableTerritories;
      case "attack":
        // If a territory is selected, show possible attack targets
        if (selectedTerritory !== null) {
          return attackableTerritories;
        }
        // Otherwise, show territories that can be used to attack from
        return territories
          .filter(t => t.owner === currentPlayer && t.units.length > 0)
          .map(t => t.id);
      case "build":
        return buildableTerritories;
      case "recruit":
        return recruitableTerritories;
      default:
        return territories.filter(t => t.owner === currentPlayer).map(t => t.id);
    }
  };

  const toggleViewMode = () => {
    setUse3D(!use3D);
    toast.info(`Switched to ${!use3D ? '3D' : '2D'} view`);
  };

  return (
    <div className="w-full h-full overflow-hidden relative">
      {use3D ? (
        <HexGrid3D 
          territories={territories}
          players={players}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={currentPlayer}
          phase={phase}
          expandableTerritories={expandableTerritories}
          attackableTerritories={attackableTerritories}
          buildableTerritories={buildableTerritories}
          recruitableTerritories={recruitableTerritories}
          currentAction={currentAction}
        />
      ) : (
        <HexGrid 
          territories={territories}
          players={players}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={currentPlayer}
          phase={phase}
          expandableTerritories={expandableTerritories}
          attackableTerritories={attackableTerritories}
          buildableTerritories={buildableTerritories}
          recruitableTerritories={recruitableTerritories}
          currentAction={currentAction}
        />
      )}
      
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleViewMode}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white"
        >
          <Cube className="mr-1 h-4 w-4" />
          {use3D ? '2D View' : '3D View'}
        </Button>
      </div>
    </div>
  );
};
