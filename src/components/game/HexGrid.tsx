
import React from 'react';
import { toast } from 'sonner';

interface HexGridProps {
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritoryClick: (id: number) => void;
  currentPlayer: number;
  phase: "setup" | "playing";
  expandableTerritories: number[];
  attackableTerritories: number[];
  buildableTerritories: number[];
  recruitableTerritories: number[];
  currentAction: "none" | "build" | "expand" | "attack" | "recruit";
}

export const HexGrid: React.FC<HexGridProps> = ({
  territories,
  players,
  selectedTerritory,
  onTerritoryClick,
  currentPlayer,
  phase,
  expandableTerritories,
  attackableTerritories,
  buildableTerritories,
  recruitableTerritories,
  currentAction
}) => {
  // Determine hex color based on state - IDENTICAL logic to HexGrid3D
  const getHexColor = (territory: any) => {
    if (!territory) return 'gray';
    
    if (territory.id === selectedTerritory) {
      return 'yellow';
    }
    
    if (territory.owner === null) {
      if (phase === "setup") {
        return 'white';
      }
      
      if (currentAction === "expand" && expandableTerritories.includes(territory.id)) {
        return 'lightgreen';
      }
      
      return 'lightgray';
    }
    
    const playerColor = players[territory.owner]?.color || 'gray';
    
    if (currentAction === "attack" && attackableTerritories.includes(territory.id)) {
      return 'red';
    }
    
    if (currentAction === "build" && buildableTerritories.includes(territory.id)) {
      return 'blue';
    }
    
    if (currentAction === "recruit" && recruitableTerritories.includes(territory.id)) {
      return 'purple';
    }
    
    return playerColor;
  };

  // Get icon for territory based on terrain and building - Same logic as the 3D model selection
  const getTerrainIcon = (territory: any) => {
    if (!territory) return '⬡';
    
    const terrain = territory.terrain || 'plains';
    
    if (terrain === 'mountains') return '⛰️';
    if (terrain === 'forest') return '🌲';
    
    if (territory.building) {
      switch(territory.building) {
        case 'fortress': return '🏰';
        case 'barracks': return '⚔️';
        case 'farm': return '🌾';
        case 'market': return '🏪';
        case 'mine': return '⛏️';
        case 'watchtower': return '🗼';
        case 'lumbermill': return '🪓';
        case 'castle': return '🏯';
        default: return '🏠';
      }
    }
    
    return '⬡';
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        {territories.map((territory) => {
          const color = getHexColor(territory);
          const icon = getTerrainIcon(territory);
          const isSelected = territory.id === selectedTerritory;
          
          // Calculate position with proper hex grid layout
          const q = territory.coordinates.q;
          const r = territory.coordinates.r;
          
          // Hex grid position calculation for proper spacing
          const x = q * 60 + r * 30; // Offset for axial coordinates
          const y = r * 52; // Height is 0.866 * size, simplified
          
          return (
            <div
              key={territory.id}
              className="absolute flex items-center justify-center cursor-pointer"
              style={{
                top: `${y}px`,
                left: `${x}px`,
                width: '50px',
                height: '50px',
                backgroundColor: color,
                borderRadius: '50%',
                border: isSelected ? '2px solid yellow' : 'none',
                opacity: 0.7,
                color: 'black',
                fontSize: '1.5em',
                textAlign: 'center',
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={() => onTerritoryClick(territory.id)}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </div>
  );
};
