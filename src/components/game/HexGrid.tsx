
import React from "react";
import { motion } from "framer-motion";
import { Territory } from "@/types/game";
import { Trees, Mountain, Wheat, Coins } from "lucide-react";

interface HexGridProps {
  territories: Territory[];
  onTerritoryClick: (territory: Territory) => void;
  selectedTerritory: Territory | null;
}

const HexGrid: React.FC<HexGridProps> = ({
  territories,
  onTerritoryClick,
  selectedTerritory,
}) => {
  const hexSize = 40;
  
  // Calculate proper hexagon spacing
  const width = hexSize * 2;
  const height = Math.sqrt(3) * hexSize;
  
  const getHexagonPoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = hexSize * Math.cos(angleRad);
      const y = hexSize * Math.sin(angleRad);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getHexPosition = (q: number, r: number) => {
    // Fix coordinate calculation using proper axial coordinates
    const x = width * (3/2 * q);
    const y = height * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  const renderResourceIcon = (resource: keyof typeof resourceColors, amount: number, index: number, total: number) => {
    const IconComponent = resourceIcons[resource];
    const angleStep = (2 * Math.PI) / total;
    const angle = angleStep * index;
    const radius = hexSize * 0.4;
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
          className="text-xs fill-white font-bold text-center"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: 'none' }}
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

  const padding = width;
  const viewBoxWidth = maxX - minX + padding * 2;
  const viewBoxHeight = maxY - minY + padding * 2;

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
            
            return (
              <g
                key={territory.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => onTerritoryClick(territory)}
                className={`
                  cursor-pointer
                  transition-transform duration-200 ease-in-out
                  ${selectedTerritory?.id === territory.id ? 'scale-110' : ''}
                  hover:scale-110
                `}
              >
                <polygon
                  points={getHexagonPoints()}
                  className={`
                    ${territory.owner ? `fill-game-${territory.owner}` : "fill-game-neutral"}
                    stroke-gray-400 stroke-2
                    transition-colors duration-300
                    ${selectedTerritory?.id === territory.id ? "stroke-game-gold stroke-3" : ""}
                    hover:stroke-white
                  `}
                />
                {territory.building && (
                  <text
                    x="0"
                    y="0"
                    className="text-xs fill-white font-bold text-center"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {territory.building}
                  </text>
                )}
                <g transform="translate(0, 0)">
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
