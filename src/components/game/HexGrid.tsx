
import React from "react";
import { Territory } from "@/types/game";
import { Trees, Mountain, Wheat, Coins } from "lucide-react";
import { toast } from "sonner";

interface HexGridProps {
  territories: Territory[];
  onTerritoryClick: (territory: Territory) => void;
  selectedTerritory: Territory | null;
  currentPlayer: string;
  playerResources: { gold: number; wood: number; stone: number; food: number };
  phase: string;
}

const HexGrid: React.FC<HexGridProps> = ({
  territories,
  onTerritoryClick,
  selectedTerritory,
  currentPlayer,
  playerResources,
  phase,
}) => {
  const hexSize = 40;
  
  // These ratios create the proper spacing for a flat-topped hexagonal grid
  const xSpacing = hexSize * 2;  // Reduced for tighter horizontal spacing
  const ySpacing = hexSize * 1.8; // Adjusted for better vertical spacing
  
  const getHexagonPoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = hexSize * Math.cos(angleRad);
      const y = hexSize * Math.sin(angleRad);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getHexPosition = (q: number, r: number) => {
    // Using odd-q offset coordinates for better spacing
    const x = q * xSpacing + (r % 2) * (xSpacing / 2);
    const y = r * ySpacing;
    return { x, y };
  };

  const canPurchaseTerritory = (territory: Territory) => {
    if (phase !== "setup" && phase !== "building") return false;
    if (territory.owner) return false;
    
    // Base cost for territory purchase
    const cost = {
      gold: 50,
      wood: 20,
      stone: 20,
      food: 20
    };

    return Object.entries(cost).every(
      ([resource, amount]) => playerResources[resource as keyof typeof playerResources] >= amount
    );
  };

  const handleTerritoryClick = (territory: Territory) => {
    if (!canInteractWithTerritory(territory)) return;
    onTerritoryClick(territory);
  };

  const canInteractWithTerritory = (territory: Territory) => {
    if (phase === "setup") {
      if (territory.owner) {
        toast.error("This territory is already claimed!");
        return false;
      }
      return true;
    }

    if (phase === "building") {
      if (!territory.owner) {
        if (canPurchaseTerritory(territory)) {
          return true;
        } else {
          toast.error("Insufficient resources to purchase this territory!");
          return false;
        }
      }
      return territory.owner === currentPlayer;
    }

    return territory.owner === currentPlayer;
  };

  const renderResourceIcon = (resource: keyof typeof resourceColors, amount: number, index: number, total: number) => {
    const IconComponent = resourceIcons[resource];
    const angleStep = (2 * Math.PI) / total;
    const angle = angleStep * index - Math.PI / 2;
    const radius = hexSize * 0.45;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    return (
      <g key={resource} transform={`translate(${x}, ${y})`}>
        <IconComponent 
          className={`w-4 h-4 ${resourceColors[resource]}`}
        />
        <text
          x="0"
          y="10"
          className="text-xs fill-white font-bold text-center select-none pointer-events-none"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {amount}
        </text>
      </g>
    );
  };

  const resourceColors = {
    wood: "text-game-wood",
    stone: "text-game-stone",
    food: "text-game-food",
    gold: "text-game-gold"
  };

  const resourceIcons = {
    wood: Trees,
    stone: Mountain,
    food: Wheat,
    gold: Coins
  };

  // Calculate grid boundaries
  const positions = territories.map(t => getHexPosition(t.coordinates.q, t.coordinates.r));
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  // Add padding
  const padding = hexSize * 2;
  const viewBoxWidth = (maxX - minX) + padding * 2;
  const viewBoxHeight = (maxY - minY) + padding * 2;

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden">
      <svg 
        viewBox={`${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full"
      >
        <g>
          {territories.map((territory) => {
            const { x, y } = getHexPosition(
              territory.coordinates.q,
              territory.coordinates.r
            );
            
            const resourceEntries = Object.entries(territory.resources);
            const isInteractable = canInteractWithTerritory(territory);

            return (
              <g
                key={territory.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => handleTerritoryClick(territory)}
                className={`
                  transition-transform duration-200
                  ${isInteractable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
              >
                <polygon
                  points={getHexagonPoints()}
                  className={`
                    ${territory.owner ? `fill-game-${territory.owner}` : "fill-game-neutral"}
                    stroke-gray-400 stroke-2
                    transition-colors duration-300
                    ${selectedTerritory?.id === territory.id ? "stroke-game-gold stroke-3" : ""}
                    ${isInteractable ? "hover:stroke-white" : "opacity-75"}
                  `}
                />
                {territory.building && (
                  <text
                    x="0"
                    y="0"
                    className="text-xs fill-white font-bold text-center select-none pointer-events-none"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {territory.building}
                  </text>
                )}
                <g>
                  {resourceEntries.map(([resource, amount], index) => 
                    renderResourceIcon(
                      resource as keyof typeof resourceColors,
                      amount,
                      index,
                      resourceEntries.length
                    )
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HexGrid;
