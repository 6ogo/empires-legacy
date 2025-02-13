
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
  const hexSize = 40; // Slightly smaller hexagons for better spacing
  const width = Math.sqrt(3) * hexSize;
  const height = 2 * hexSize;

  const getHexagonPoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = hexSize * Math.cos(angle);
      const y = hexSize * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getHexPosition = (q: number, r: number) => {
    // Adjusted spacing formula
    const x = width * (q + r/2);
    const y = r * (height * 0.75); // Overlap hexagons vertically by 25%
    return { x, y };
  };

  const renderResourceIcon = (resource: keyof typeof resourceColors, amount: number) => {
    const IconComponent = resourceIcons[resource];
    return (
      <g transform={`translate(${-hexSize/3}, ${hexSize/2})`}>
        <IconComponent 
          className={`w-4 h-4 ${resourceColors[resource]}`}
        />
        <text
          x="15"
          y="12"
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

  // Add padding and calculate viewBox
  const padding = hexSize * 2;
  const viewBoxWidth = gridExtent.maxX - gridExtent.minX + padding * 2;
  const viewBoxHeight = gridExtent.maxY - gridExtent.minY + padding * 2;
  const viewBoxX = gridExtent.minX - padding;
  const viewBoxY = gridExtent.minY - padding;

  return (
    <svg 
      viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {territories.map((territory) => {
        const { x, y } = getHexPosition(
          territory.coordinates.q,
          territory.coordinates.r
        );
        
        return (
          <motion.g
            key={territory.id}
            transform={`translate(${x}, ${y})`}
            whileHover={{ scale: 1.05 }}
            animate={{
              scale: selectedTerritory?.id === territory.id ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            onClick={() => onTerritoryClick(territory)}
            className="cursor-pointer"
            style={{ transformOrigin: '0 0' }}
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
            {Object.entries(territory.resources).map(([resource, amount], index) => (
              <g key={resource} transform={`translate(0, ${index * 20})`}>
                {renderResourceIcon(resource as keyof typeof resourceColors, amount)}
              </g>
            ))}
          </motion.g>
        );
      })}
    </svg>
  );
};

export default HexGrid;
