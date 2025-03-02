
import React, { useState } from "react";
import { HexGrid } from "./HexGrid";
import { HexGrid3D } from "./HexGrid3D";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Cube, Box3D } from "lucide-react";

// Define interface for the component props
interface GameBoardProps {
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
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
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
          handleExpandAction(territoryId);
          break;
          
        case "attack":
          handleAttackAction(territoryId);
          break;
          
        case "build":
          handleBuildAction(territoryId);
          break;
          
        case "recruit":
          handleRecruitAction(territoryId);
          break;
          
        default:
          // Select owned territory for default action
          if (territory.owner === currentPlayer) {
            onTerritorySelect(territoryId);
          }
      }
    }
  };

  // Handler for expand action
  const handleExpandAction = (territoryId: number) => {
    if (expandableTerritories.includes(territoryId) && !actionsPerformed.expand) {
      onClaimTerritory(territoryId); // Use the same claim function for expansion
    } else if (actionsPerformed.expand) {
      toast.error("You've already expanded this turn");
    } else if (!expandableTerritories.includes(territoryId)) {
      toast.error("Cannot expand to this territory");
    }
  };

  // Handler for attack action
  const handleAttackAction = (territoryId: number) => {
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
  };

  // Handler for build action
  const handleBuildAction = (territoryId: number) => {
    if (buildableTerritories.includes(territoryId) && !actionsPerformed.build) {
      onTerritorySelect(territoryId);
    } else if (actionsPerformed.build) {
      toast.error("You've already built this turn");
    } else if (!buildableTerritories.includes(territoryId)) {
      toast.error("Cannot build on this territory");
    }
  };

  // Handler for recruit action
  const handleRecruitAction = (territoryId: number) => {
    if (recruitableTerritories.includes(territoryId) && !actionsPerformed.recruit) {
      onTerritorySelect(territoryId);
    } else if (actionsPerformed.recruit) {
      toast.error("You've already recruited this turn");
    } else if (!recruitableTerritories.includes(territoryId)) {
      toast.error("Cannot recruit on this territory");
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
          {use3D ? (
            <>
              <Cube className="mr-1 h-4 w-4" />
              2D View
            </>
          ) : (
            <>
              <Box3D className="mr-1 h-4 w-4" />
              3D View
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
