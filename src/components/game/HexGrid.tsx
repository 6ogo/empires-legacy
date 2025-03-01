
import React, { useRef, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useMediaQuery } from "../../hooks/use-media-query";

export const HexGrid: React.FC<{
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
}> = ({ 
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Calculate hex corners for flat-topped hexes
  const hexCorners = (center: { x: number, y: number }, size: number) => {
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      corners.push({
        x: center.x + size * Math.cos(angleRad),
        y: center.y + size * Math.sin(angleRad)
      });
    }
    return corners;
  };
  
  // Get territory color based on owner and interaction status
  const getTerritoryColor = (territory: any) => {
    if (territory.id === selectedTerritory) {
      return "#FFFFFF";
    }
    
    // For territories that can be interacted with based on current action
    if (currentAction === "expand" && expandableTerritories.includes(territory.id)) {
      return "#4CAF50"; // Green highlight for expandable
    }
    
    if (currentAction === "attack" && attackableTerritories.includes(territory.id)) {
      return "#F44336"; // Red highlight for attackable
    }
    
    if (currentAction === "build" && buildableTerritories.includes(territory.id)) {
      return "#2196F3"; // Blue highlight for buildable
    }
    
    if (currentAction === "recruit" && recruitableTerritories.includes(territory.id)) {
      return "#9C27B0"; // Purple highlight for recruitable
    }
    
    if (territory.owner !== null) {
      return players[territory.owner].color;
    }
    
    // Color based on territory type
    switch (territory.type) {
      case "plains": return "#90EE90"; // Light green
      case "mountains": return "#A9A9A9"; // Gray
      case "forests": return "#228B22"; // Forest green
      case "coast": return "#87CEEB"; // Sky blue
      case "capital": return "#FFD700"; // Gold
      default: return "#CCCCCC";
    }
  };
  
  // Get territory border color and width
  const getTerritoryBorder = (territory: any) => {
    if (territory.id === selectedTerritory) {
      return 3;
    }
    
    if (territory.owner !== null) {
      return 2;
    }
    
    return 1;
  };
  
  // Check if territory is selectable in current game phase and action
  const isTerritorySelectable = (territory: any) => {
    if (phase === "setup") {
      return territory.owner === null;
    }
    
    // Based on current action
    switch (currentAction) {
      case "expand":
        return expandableTerritories.includes(territory.id);
      case "attack":
        return attackableTerritories.includes(territory.id);
      case "build":
        return buildableTerritories.includes(territory.id);
      case "recruit":
        return recruitableTerritories.includes(territory.id);
      default:
        // In playing phase with no specific action, can select own territories
        return territory.owner === currentPlayer;
    }
  };
  
  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      if (!containerRef.current) return;
      
      // Adjust scale based on container size and map size
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Find map bounds
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      
      territories.forEach(territory => {
        // Convert from axial to pixel coordinates
        const pixelPos = axialToPixel(territory.position, 60);
        minX = Math.min(minX, pixelPos.x);
        maxX = Math.max(maxX, pixelPos.x);
        minY = Math.min(minY, pixelPos.y);
        maxY = Math.max(maxY, pixelPos.y);
      });
      
      const mapWidth = maxX - minX + 150; // Add padding
      const mapHeight = maxY - minY + 150;
      
      // Calculate scale to fit map in container
      const scaleX = containerWidth / mapWidth;
      const scaleY = containerHeight / mapHeight;
      
      // On mobile, use a slightly smaller default scale for better overview
      const baseScale = isMobile ? 0.7 : 1;
      const newScale = Math.min(scaleX, scaleY, baseScale);
      
      setScale(newScale);
      
      // Center the map
      setOffset({
        x: (containerWidth / 2) - ((minX + maxX) / 2 * newScale),
        y: (containerHeight / 2) - ((minY + maxY) / 2 * newScale)
      });
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [territories, isMobile]);
  
  // Convert from axial coordinates to pixel coordinates
  const axialToPixel = (hex: { x: number, y: number }, size: number) => {
    const x = size * (3/2 * hex.x);
    const y = size * (Math.sqrt(3)/2 * hex.x + Math.sqrt(3) * hex.y);
    return { x, y };
  };
  
  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newScale = Math.max(0.2, Math.min(2, scale + delta));
    
    // Adjust offset to zoom toward mouse position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newOffset = {
        x: mouseX - (mouseX - offset.x) * (newScale / scale),
        y: mouseY - (mouseY - offset.y) * (newScale / scale)
      };
      
      setScale(newScale);
      setOffset(newOffset);
    }
  };
  
  // Handle mouse/touch down for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse/touch move for dragging
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setOffset({
      x: offset.x + dx,
      y: offset.y + dy
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse/touch up for dragging
  const handlePointerUp = () => {
    setDragging(false);
  };
  
  // Get military unit stats display
  const getUnitStatsDisplay = (territory: any, players: any[]) => {
    if (!territory.units || territory.units.length === 0) return null;
    
    let unitStats = [];
    let totalAttackPower = 0;
    let totalHealth = 0;
    
    // Get player to access the unit details
    const player = territory.owner !== null ? players[territory.owner] : null;
    if (!player) return null;
    
    // Calculate stats from units
    territory.units.forEach((unitId: number) => {
      const unit = player.units.find((u: any) => u.id === unitId);
      if (!unit) return;
      
      // For each unit type, calculate attack power
      let attackPower = 0;
      switch(unit.type) {
        case "infantry": 
          attackPower = 10; 
          break;
        case "cavalry": 
          attackPower = 15; 
          break;
        case "artillery": 
          attackPower = 25; 
          break;
      }
      
      totalAttackPower += attackPower;
      totalHealth += unit.health;
      
      // Check if we already have this unit type in our stats
      const existingUnitIndex = unitStats.findIndex(u => u.type === unit.type);
      if (existingUnitIndex >= 0) {
        unitStats[existingUnitIndex].count += 1;
        unitStats[existingUnitIndex].health += unit.health;
        unitStats[existingUnitIndex].attack += attackPower;
      } else {
        unitStats.push({
          type: unit.type,
          count: 1,
          health: unit.health,
          attack: attackPower
        });
      }
    });
    
    return {
      units: unitStats,
      totalAttackPower,
      totalHealth
    };
  };
  
  // Mobile-specific pinch zoom handler
  // const handleTouchMove = (e: React.TouchEvent) => {
  //   if (e.touches.length === 2) {
  //     // Handle pinch zoom
  //     // Implement pinch zoom logic here
  //   }
  // };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden bg-gray-800"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ 
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none" // Disable browser handling of touch events
      }}
    >
      <svg width="100%" height="100%">
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="glow"
            />
            <feBlend in="SourceGraphic" in2="glow" mode="normal" />
          </filter>
          
          <radialGradient id="expandableGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          
          <animate 
            xlinkHref="#expandablePulse"
            attributeName="opacity"
            values="0.7;0.2;0.7"
            dur="2s"
            repeatCount="indefinite"
          />
        </defs>
        
        <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
          {territories.map(territory => {
            const hexSize = 50;
            const pixelPos = axialToPixel(territory.position, hexSize);
            const corners = hexCorners(pixelPos, hexSize);
            const color = getTerritoryColor(territory);
            const borderWidth = getTerritoryBorder(territory);
            const selectable = isTerritorySelectable(territory);
            const isExpandable = expandableTerritories.includes(territory.id);
            const isAttackable = attackableTerritories.includes(territory.id);
            const isBuildable = buildableTerritories.includes(territory.id);
            const isRecruitable = recruitableTerritories.includes(territory.id);
            const unitStats = getUnitStatsDisplay(territory, players);
            
            // Determine the interaction state for visual cues
            let interactionState = "";
            if (isExpandable && currentAction === "expand") interactionState = "expand";
            if (isAttackable && currentAction === "attack") interactionState = "attack";
            if (isBuildable && currentAction === "build") interactionState = "build";
            if (isRecruitable && currentAction === "recruit") interactionState = "recruit";
            
            const hexElement = (
              <g 
                key={territory.id} 
                onClick={() => onTerritoryClick(territory.id)}
                style={{ cursor: selectable ? 'pointer' : 'not-allowed' }}
                opacity={selectable ? 1 : 0.6}
              >
                <polygon
                  points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={color}
                  stroke="#000"
                  strokeWidth={borderWidth}
                  strokeOpacity="0.5"
                  fillOpacity="0.7"
                />
                
                {/* Interaction state highlights */}
                {interactionState === "expand" && (
                  <g>
                    <polygon
                      points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="url(#expandableGradient)"
                      stroke="#4CAF50"
                      strokeWidth="2"
                      strokeOpacity="0.7"
                      className="animate-pulse"
                      filter="url(#glow)"
                    />
                  </g>
                )}
                
                {interactionState === "attack" && (
                  <g>
                    <polygon
                      points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#F44336"
                      strokeWidth="3"
                      strokeOpacity="0.7"
                      className="animate-pulse"
                      filter="url(#glow)"
                    />
                  </g>
                )}
                
                {interactionState === "build" && (
                  <g>
                    <polygon
                      points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#2196F3"
                      strokeWidth="2"
                      strokeOpacity="0.7"
                      strokeDasharray="5,5"
                    />
                  </g>
                )}
                
                {interactionState === "recruit" && (
                  <g>
                    <polygon
                      points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#9C27B0"
                      strokeWidth="2"
                      strokeOpacity="0.7"
                      strokeDasharray="10,5"
                    />
                  </g>
                )}
                
                {/* Show territory type */}
                <text
                  x={pixelPos.x}
                  y={pixelPos.y - 25}
                  textAnchor="middle"
                  fill="#FFF"
                  fontSize="12"
                  fontWeight="bold"
                  stroke="#000"
                  strokeWidth="0.5"
                >
                  {territory.type.charAt(0).toUpperCase() + territory.type.slice(1)}
                </text>
                
                {/* Show resources */}
                <g transform={`translate(${pixelPos.x - 30}, ${pixelPos.y - 10})`}>
                  <text 
                    x="0" 
                    y="0" 
                    fill="#FFD700" 
                    fontSize="10" 
                    fontWeight="bold"
                    stroke="#000"
                    strokeWidth="0.5"
                  >
                    G:{territory.resources.gold}
                  </text>
                  <text 
                    x="20" 
                    y="0" 
                    fill="#8BC34A" 
                    fontSize="10" 
                    fontWeight="bold"
                    stroke="#000" 
                    strokeWidth="0.5"
                  >
                    W:{territory.resources.wood}
                  </text>
                  <text 
                    x="0" 
                    y="12" 
                    fill="#9E9E9E" 
                    fontSize="10" 
                    fontWeight="bold"
                    stroke="#000" 
                    strokeWidth="0.5"
                  >
                    S:{territory.resources.stone}
                  </text>
                  <text 
                    x="20" 
                    y="12" 
                    fill="#EF5350" 
                    fontSize="10" 
                    fontWeight="bold"
                    stroke="#000" 
                    strokeWidth="0.5"
                  >
                    F:{territory.resources.food}
                  </text>
                </g>
                
                {/* Show owner indicator */}
                {territory.owner !== null && (
                  <circle
                    cx={pixelPos.x}
                    cy={pixelPos.y + 10}
                    r={10}
                    fill={players[territory.owner].color}
                    stroke="#000"
                    strokeWidth="1"
                  />
                )}
                
                {/* Show building count */}
                {territory.buildings.length > 0 && (
                  <text
                    x={pixelPos.x - 20}
                    y={pixelPos.y + 25}
                    fill="#FFF"
                    fontSize="12"
                    fontWeight="bold"
                    stroke="#000"
                    strokeWidth="0.5"
                  >
                    B: {territory.buildings.length}
                  </text>
                )}
                
                {/* Show military units with stats */}
                {unitStats && (
                  <g>
                    <text
                      x={pixelPos.x + 20}
                      y={pixelPos.y + 25}
                      fill="#FFF"
                      fontSize="12"
                      fontWeight="bold"
                      stroke="#000"
                      strokeWidth="0.5"
                    >
                      U: {territory.units.length}
                    </text>
                    
                    {/* Unit power indicator */}
                    <text
                      x={pixelPos.x}
                      y={pixelPos.y + 40}
                      textAnchor="middle"
                      fill="#FFF"
                      fontSize="10"
                      fontWeight="bold"
                      stroke="#000"
                      strokeWidth="0.5"
                    >
                      ATK: {unitStats.totalAttackPower} | HP: {unitStats.totalHealth}
                    </text>
                  </g>
                )}
              </g>
            );
            
            // Wrap with tooltip for detailed unit info
            return territory.units && territory.units.length > 0 ? (
              <TooltipProvider key={territory.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {hexElement}
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2">
                      <h3 className="font-bold text-center mb-1">Military Units</h3>
                      <div className="space-y-1">
                        {unitStats?.units.map((unit, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="capitalize">{unit.type} x{unit.count}:</span>
                            <span>ATK: {unit.attack} | HP: {unit.health}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : hexElement;
          })}
        </g>
      </svg>
    </div>
  );
};
