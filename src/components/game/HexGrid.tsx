
import React from "react";
import { motion } from "framer-motion";
import { Territory } from "@/types/game";

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
  const hexSize = 50; // Size of hexagon
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
    const x = width * (q + r/2);
    const y = height * (3/4) * r;
    return { x, y };
  };

  return (
    <svg 
      viewBox="-400 -300 800 600" 
      className="w-full max-w-4xl mx-auto"
    >
      <g transform="translate(400, 300)">
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
              {/* Territory type icon or indicator could go here */}
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
};

export default HexGrid;
