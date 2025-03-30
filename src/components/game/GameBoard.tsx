// ================================================
// File: src/components/game/GameBoard.tsx
// ================================================

import React, { useState } from 'react';
import { HexGrid } from './HexGrid';
import { HexGrid3D } from './HexGrid3D';
import { Button } from '../ui/button';
import LoadingScreen from './LoadingScreen';
import { toast } from 'sonner';
import { Box } from 'lucide-react';
import { GamePhase } from '@/types/game'; // Import GamePhase

interface GameBoardProps {
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritorySelect: (id: number) => void;
  onClaimTerritory: (id: number) => void;
  onAttackTerritory: (id: number) => void;
  currentPlayer: number | string; // Allow string ID
  phase: GamePhase; // Use imported GamePhase
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
  actionTaken, // Consider removing if actionsPerformed is sufficient
  expandableTerritories,
  attackableTerritories,
  buildableTerritories,
  recruitableTerritories,
  currentAction,
  actionsPerformed
}) => {
  const [use3D, setUse3D] = useState<boolean>(true); // Default to 3D view

  // --- Adjacency Logic (moved from GameContainer for direct use here if needed) ---
   const getAdjacentTerritoryIds = (territory: any, allTerritories: any[]): number[] => {
        if (!territory || !territory.coordinates) return [];
        const { q, r } = territory.coordinates;
        const directions = [
            { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
            { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
        ];
        return allTerritories
            .filter(t => t.coordinates && directions.some(dir => t.coordinates.q === q + dir.q && t.coordinates.r === r + dir.r))
            .map(t => t.id);
    };

   const isAdjacentToClaimedTerritory = (territoryId: number): boolean => {
       const territory = territories.find(t => t.id === territoryId);
       if (!territory) return false;
       const adjacentIds = getAdjacentTerritoryIds(territory, territories);
       return adjacentIds.some(adjId => {
           const adjTerritory = territories.find(t => t.id === adjId);
           // Check if adjacent is owned by *any* player
           return adjTerritory && adjTerritory.owner !== null;
       });
   };
   // Helper to check if adjacent is owned by *another* player
    const isAdjacentToEnemyTerritory = (territoryId: number): boolean => {
        const territory = territories.find(t => t.id === territoryId);
        if (!territory) return false;
        const adjacentIds = getAdjacentTerritoryIds(territory, territories);
        return adjacentIds.some(adjId => {
            const adjTerritory = territories.find(t => t.id === adjId);
             // Check if adjacent is owned by a *different* player
            return adjTerritory && adjTerritory.owner !== null && adjTerritory.owner !== currentPlayer;
        });
    };


  const handleTerritoryClick = (territoryId: number) => {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;

    console.log(`GameBoard Click: Territory ${territoryId}, Phase: ${phase}, Action: ${currentAction}`);


    if (phase === "setup") {
       const player = players.find(p => p.id === currentPlayer);
       if (!player) return;

       if (territory.owner === null) {
           // Basic setup rule: cannot claim adjacent to already claimed territory
           if (isAdjacentToClaimedTerritory(territoryId)) {
               toast.error("Cannot claim territory adjacent to another player during setup.");
               return;
           }
            // Prevent multiple claims if actionTaken isn't reset fast enough (should be handled in GameContainer ideally)
           // if (actionTaken) {
           //     toast.warning("Action already taken this turn.");
           //     return;
           // }
           console.log(`Setup claim for T${territoryId} by P${currentPlayer}`);
           onClaimTerritory(territoryId); // Let GameContainer handle state update and turn end
       } else {
            toast.error("Territory is already claimed.");
       }
       return; // End processing for setup phase
    }

    // Playing Phase Logic
    if (phase === "playing") {
      switch (currentAction) {
        case "expand":
          if (expandableTerritories.includes(territoryId)) {
            console.log(`Expand action on T${territoryId}`);
            onClaimTerritory(territoryId); // Use onClaimTerritory for expansion too
          } else if (actionsPerformed.expand) {
            toast.error("You have already expanded this turn.");
          } else {
             toast.error("You cannot expand to this territory.");
          }
          break;

        case "attack":
            // Attack requires two clicks: origin then target
            if (selectedTerritory === null) {
                // First click: Selecting origin
                if (territory.owner === currentPlayer && territory.units?.length > 0) {
                     console.log(`Attack origin selected: T${territoryId}`);
                     onTerritorySelect(territoryId); // Notify container of selection
                } else {
                     toast.error("Select one of your territories with units to attack from.");
                }
            } else {
                 // Second click: Selecting target
                 if (attackableTerritories.includes(territoryId)) {
                      console.log(`Attack target selected: T${territoryId} from T${selectedTerritory}`);
                      onAttackTerritory(territoryId); // Notify container to execute attack
                 } else if (territory.owner === currentPlayer && territory.units?.length > 0) {
                      // Allow changing the origin territory
                      console.log(`Changing attack origin to T${territoryId}`);
                      onTerritorySelect(territoryId);
                 }
                 else {
                      toast.error("Invalid attack target.");
                      // Optionally reset selection: onTerritorySelect(null);
                 }
            }
          break;

        case "build":
          if (buildableTerritories.includes(territoryId)) {
             console.log(`Build action initiated on T${territoryId}`);
            onTerritorySelect(territoryId); // Select territory to open build menu in container
          } else if (actionsPerformed.build) {
            toast.error("You have already built this turn.");
          } else {
             toast.error("You cannot build on this territory.");
          }
          break;

        case "recruit":
          if (recruitableTerritories.includes(territoryId)) {
             console.log(`Recruit action initiated on T${territoryId}`);
             onTerritorySelect(territoryId); // Select territory to open recruit menu in container
          } else if (actionsPerformed.recruit) {
            toast.error("You have already recruited this turn.");
          } else {
             toast.error("You cannot recruit on this territory (requires Barracks).");
          }
          break;

        default: // currentAction is 'none'
          if (territory.owner === currentPlayer) {
             console.log(`Selected own territory T${territoryId}`);
            onTerritorySelect(territoryId); // Select own territory for info or initiating action
          } else {
             // Clicked on neutral/enemy territory with no action active
             console.log(`Selected non-owned territory T${territoryId}, deselecting.`);
             onTerritorySelect(null); // Deselect if clicking outside own territory
          }
          break;
      }
    }
  };


  const toggleViewMode = () => {
    setUse3D(!use3D);
    toast.info(`Switched to ${!use3D ? '3D' : '2D'} view`);
  };

  // Loading state for models in 3D view
   const [modelsLoading] = useState(false); // Assume HexGrid3D handles its own loading state internally now


  return (
    <div className="w-full h-full overflow-hidden relative bg-gray-800"> {/* Ensure background */}
      {use3D ? (
          modelsLoading ? (
              <LoadingScreen message="Loading 3D Assets..." />
          ) : (
              <HexGrid3D
                  territories={territories}
                  players={players}
                  selectedTerritory={selectedTerritory}
                  onTerritoryClick={handleTerritoryClick}
                  currentPlayer={typeof currentPlayer === 'string' ? parseInt(currentPlayer, 10) : currentPlayer}
                  phase={phase === "setup" || phase === "playing" ? phase : "setup"} // Narrow phase type
                  expandableTerritories={expandableTerritories}
                  attackableTerritories={attackableTerritories}
                  buildableTerritories={buildableTerritories}
                  recruitableTerritories={recruitableTerritories}
                  currentAction={currentAction}
              />
          )
      ) : (
        <HexGrid
          territories={territories}
          players={players}
          selectedTerritory={selectedTerritory}
          onTerritoryClick={handleTerritoryClick}
          currentPlayer={typeof currentPlayer === 'string' ? parseInt(currentPlayer, 10) : currentPlayer}
          phase={phase === "setup" || phase === "playing" ? phase : "setup"} // Narrow phase type
          expandableTerritories={expandableTerritories}
          attackableTerritories={attackableTerritories}
          buildableTerritories={buildableTerritories}
          recruitableTerritories={recruitableTerritories}
          currentAction={currentAction}
        />
      )}

      <div className="absolute top-4 right-4 z-10"> {/* Ensure button is above canvas */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleViewMode}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white border-gray-600"
        >
          <Box className="mr-1 h-4 w-4" />
          {use3D ? '2D View' : '3D View'}
        </Button>
      </div>
    </div>
  );
};