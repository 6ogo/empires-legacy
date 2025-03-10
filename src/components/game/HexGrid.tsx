import React, { useState, useRef, useEffect } from "react";
import { Territory } from "@/types/game";
import { Trees, Mountain, Wheat, Coins, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HexGridProps {
  territories: Territory[];
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const hexSize = 40;
  const xSpacing = hexSize * 2;
  const ySpacing = hexSize * 1.8;

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
    const x = q * xSpacing + (r % 2) * (xSpacing / 2);
    const y = r * ySpacing;
    return { x, y };
  };

  const isAdjacent = (t1: Territory, t2: Territory) => {
    const dx = Math.abs(t1.coordinates.q - t2.coordinates.q);
    const dy = Math.abs(t1.coordinates.r - t2.coordinates.r);
    const ds = Math.abs((t1.coordinates.q + t1.coordinates.r) - (t2.coordinates.q + t2.coordinates.r));
    return (dx <= 1 && dy <= 1 && ds <= 1) && !(dx === 0 && dy === 0);
  };

  const hasAdjacentOwnedTerritory = (territory: Territory) => {
    return territories.some(t => 
      t.owner === currentPlayer && isAdjacent(t, territory)
    );
  };

  const canClaimTerritory = (territory: Territory) => {
    if (phase !== "setup") return false;
    if (territory.owner) {
      toast.error("This territory is already claimed!");
      return false;
    }

    // Check if current player already has claimed a territory
    const playerTerritoryCount = territories.filter(
      t => t.owner === currentPlayer
    ).length;

    if (playerTerritoryCount >= 1) {
      toast.error("You can only claim one starting territory!");
      return false;
    }

    // Check if territory is adjacent to opponent's territory
    const hasAdjacentOpponentTerritory = territories.some(t => 
      t.owner && t.owner !== currentPlayer && isAdjacent(t, territory)
    );

    if (hasAdjacentOpponentTerritory) {
      toast.error("Starting territories cannot be adjacent to each other!");
      return false;
    }

    return true;
  };
  
  const validateTerritorySelection = (territory: Territory, phase: string, currentPlayer: string): boolean => {
  // Setup phase validation
  if (phase === 'setup') {
    if (territory.owner !== null) {
      return false;
    }
    
    // Check if there are any adjacent claimed territories
    const hasAdjacentClaimed = territories.some(t => 
      t.owner !== null && isAdjacent(territory, t)
    );
    
    return !hasAdjacentClaimed;
  }

  // Building phase validation
  if (phase === 'building') {
    if (territory.owner !== currentPlayer) {
      return false;
    }
    
    // Can only build in territories adjacent to owned territories
    return hasAdjacentOwnedTerritory(territory);
  }

  // Recruitment phase validation
  if (phase === 'recruitment') {
    if (territory.owner !== currentPlayer) {
      return false;
    }
    
    // Can only recruit in territories with barracks
    return territory.building === 'barracks';
  }

  // Combat phase validation
  if (phase === 'combat') {
    // Can select own territories with units for attack
    if (territory.owner === currentPlayer) {
      return territory.militaryUnit !== null;
    }
    
    // Can select enemy territories adjacent to selected territory
    if (selectedTerritory && territory.owner !== currentPlayer) {
      return isAdjacent(territory, selectedTerritory);
    }
  }

  return false;
};
  const canPurchaseTerritory = (territory: Territory) => {
    if (phase !== "building") return false;
    if (territory.owner) return false;
    if (!hasAdjacentOwnedTerritory(territory)) return false;
    
    const cost = {
      gold: 50,
      wood: 20,
      stone: 20,
      food: 20
    };

    const canAfford = Object.entries(cost).every(
      ([resource, amount]) => playerResources[resource as keyof typeof playerResources] >= amount
    );

    return canAfford;
  };

  const canInteractWithTerritory = (territory: Territory) => {
    if (phase === "setup") return canClaimTerritory(territory);
    if (phase === "building") return canPurchaseTerritory(territory);
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

  const renderRoad = (territory: Territory) => {
    if (!territory.building || territory.building !== "road") return null;
    
    const adjacentTerritories = territories.filter(t => isAdjacent(territory, t));
    return adjacentTerritories.map(adjTerritory => {
      if (adjTerritory.owner !== territory.owner) return null;
      
      const start = getHexPosition(territory.coordinates.q, territory.coordinates.r);
      const end = getHexPosition(adjTerritory.coordinates.q, adjTerritory.coordinates.r);
      
      return (
        <line
          key={`road-${territory.id}-${adjTerritory.id}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          className="stroke-gray-400 stroke-2"
          strokeLinecap="round"
        />
      );
    });
  };

  const playerColors = {
    player1: "fill-purple-500",
    player2: "fill-orange-500",
    neutral: "fill-gray-700"
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

  const positions = territories.map(t => getHexPosition(t.coordinates.q, t.coordinates.r));
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  const padding = hexSize * 2;
  const viewBoxWidth = (maxX - minX) + padding * 2;
  const viewBoxHeight = (maxY - minY) + padding * 2;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 3));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStart(distance);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const delta = distance / pinchStart;
      setScale(prev => Math.min(Math.max(prev * delta, 0.5), 3));
      setPinchStart(distance);
    } else if (isDragging) {
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setPinchStart(0);
  };

  const [pinchStart, setPinchStart] = useState(0);

  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev * 0.8, 0.5));

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden touch-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg 
          viewBox={`${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full origin-center transition-transform"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          }}
        >
          {territories.map(territory => renderRoad(territory))}
          
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
                onClick={() => onTerritoryClick(territory)}
                className="origin-center"
              >
                <g className={`
                  transform-gpu transition-transform duration-200
                  ${isInteractable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-75'}
                `}>
                  <polygon
                    points={getHexagonPoints()}
                    className={`
                      ${territory.owner ? playerColors[territory.owner] : playerColors.neutral}
                      stroke-gray-400 stroke-2
                      transition-colors duration-300
                      ${selectedTerritory?.id === territory.id ? "stroke-game-gold stroke-3" : ""}
                      ${isInteractable ? "hover:stroke-white" : ""}
                    `}
                  />
                  {territory.building && (
                    <text
                      x="0"
                      y="-15"
                      className="text-base fill-white font-bold text-center select-none pointer-events-none"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {territory.building.replace(/_/g, ' ')}
                    </text>
                  )}
                  {territory.militaryUnit && (
                    <g>
                      <text
                        x="0"
                        y="0"
                        className="text-xs fill-white font-bold text-center select-none pointer-events-none"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {territory.militaryUnit.type}
                      </text>
                      <text
                        x="-15"
                        y="15"
                        className="text-xs fill-red-400 font-bold text-center select-none pointer-events-none"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        ❤️{territory.militaryUnit.health}
                      </text>
                      <text
                        x="15"
                        y="15"
                        className="text-xs fill-blue-400 font-bold text-center select-none pointer-events-none"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        ⚔️{territory.militaryUnit.damage}
                      </text>
                    </g>
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
              </g>
            );
          })}
        </svg>
      </div>
      
      {isMobile && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={zoomOut}
            className="rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={zoomIn}
            className="rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default HexGrid;
