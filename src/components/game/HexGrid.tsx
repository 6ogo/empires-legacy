
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
  const hexSize = 45;
  const width = Math.sqrt(3) * hexSize;
  const height = 2 * hexSize;

  const getHexagonPoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6; // Rotate hexagon to point up
      const x = hexSize * Math.cos(angle);
      const y = hexSize * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getHexPosition = (q: number, r: number) => {
    // Adjusted spacing formula for better hex grid layout
    const x = width * q;
    const y = height * (r - q/2);
    return { x, y };
  };

  const renderResourceIcon = (resource: keyof typeof resourceColors, amount: number, index: number) => {
    const IconComponent = resourceIcons[resource];
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    const radius = hexSize * 0.5;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    return (
      <g key={resource} transform={`translate(${x}, ${y})`}>
        <IconComponent 
          className={`w-4 h-4 ${resourceColors[resource]}`}
        />
        <text
          x="12"
          y="4"
          className="text-xs fill-white font-bold"
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

  // Calculate grid bounds
  const gridExtent = territories.reduce(
    (acc, territory) => {
      const pos = getHexPosition(territory.coordinates.q, territory.coordinates.r);
      return {
        minX: Math.min(acc.minX, pos.x),
        maxX: Math.max(acc.maxX, pos.x),
        minY: Math.min(acc.minY, pos.y),
        maxY: Math.max(acc.maxY, pos.y),
      };
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  const padding = hexSize * 3;
  const viewBoxWidth = gridExtent.maxX - gridExtent.minX + padding * 2;
  const viewBoxHeight = gridExtent.maxY - gridExtent.minY + padding * 2;
  const viewBoxX = gridExtent.minX - padding;
  const viewBoxY = gridExtent.minY - padding;

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden">
      <svg 
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          {territories.map((territory) => {
            const { x, y } = getHexPosition(
              territory.coordinates.q,
              territory.coordinates.r
            );
            
            return (
              <motion.g
                key={territory.id}
                transform={`translate(${x}, ${y})`}
                whileHover={{ scale: 1.1 }}
                animate={{
                  scale: selectedTerritory?.id === territory.id ? 1.15 : 1,
                }}
                transition={{ duration: 0.2 }}
                onClick={() => onTerritoryClick(territory)}
                className="cursor-pointer"
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                <polygon
                  points={getHexagonPoints()}
                  className={`
                    ${territory.owner ? `fill-game-${territory.owner}` : "fill-game-neutral"}
                    stroke-gray-400 stroke-2
                    transition-colors duration-300
                    ${selectedTerritory?.id === territory.id ? "stroke-game-gold stroke-3" : ""}
                  `}
                />
                {Object.entries(territory.resources).map(([resource, amount], index) => 
                  renderResourceIcon(resource as keyof typeof resourceColors, amount, index)
                )}
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HexGrid;
