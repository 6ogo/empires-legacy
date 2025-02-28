import React, { useState, useRef, useEffect } from "react";
import { Territory, Resources } from "@/types/game";
import { Trees, Mountain, Wheat, Coins, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HexGridProps {
  territories: Territory[];
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
  currentPlayer: string;
  playerResources: Resources;
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
  const isMobile = window.innerWidth < 768;

  const hexSize = 40;
  const xSpacing = hexSize * 2;
  const ySpacing = hexSize * 1.8;

  // Handle mouse controls for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left button
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 3));
  };

  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev * 0.8, 0.5));

  // Utility functions
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

  // Player colors
  const playerColors: Record<string, string> = {
    player1: "fill-purple-500",
    player2: "fill-orange-500",
    player3: "fill-blue-500",
    player4: "fill-green-500",
    player5: "fill-red-500",
    player6: "fill-yellow-500",
    neutral: "fill-gray-700"
  };

  // Resource colors and icons
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

  // Calculate the viewbox
  const positions = territories.map(t => getHexPosition(t.coordinates.q, t.coordinates.r));
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  const padding = hexSize * 2;
  const viewBoxWidth = (maxX - minX) + padding * 2;
  const viewBoxHeight = (maxY - minY) + padding * 2;

  // Render a territory's resources as icons
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

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg 
          viewBox={`${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full origin-center transition-transform"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
        >
          {territories.map((territory) => {
            const { x, y } = getHexPosition(
              territory.coordinates.q,
              territory.coordinates.r
            );
            
            const resourceEntries = Object.entries(territory.resources);
            const isInteractable = true; // We'll implement full logic for this later

            // Determine if this territory is selectable based on game phase
            let isSelectable = true;
            
            if (phase === 'setup') {
              isSelectable = territory.owner === null;
              // Add logic for preventing claiming territories adjacent to other players
            } else if (phase === 'building') {
              isSelectable = territory.owner === currentPlayer;
            } else if (phase === 'recruitment') {
              isSelectable = territory.owner === currentPlayer && territory.building === 'barracks';
            } else if (phase === 'combat') {
              isSelectable = territory.owner === currentPlayer || 
                (selectedTerritory?.militaryUnit && territory.owner !== currentPlayer);
            }

            return (
              <g
                key={territory.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => onTerritoryClick(territory)}
                className="origin-center"
              >
                <g className={`
                  transform-gpu transition-transform duration-200
                  ${isSelectable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-75'}
                `}>
                  <polygon
                    points={getHexagonPoints()}
                    className={`
                      ${territory.owner ? playerColors[territory.owner] : playerColors.neutral}
                      stroke-gray-400 stroke-2
                      transition-colors duration-300
                      ${selectedTerritory?.id === territory.id ? "stroke-game-gold stroke-3" : ""}
                      ${isSelectable ? "hover:stroke-white" : ""}
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