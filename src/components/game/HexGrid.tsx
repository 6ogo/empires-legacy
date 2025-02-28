
import React, { useRef, useEffect, useState } from "react";

export const HexGrid: React.FC<{
  territories: any[];
  players: any[];
  selectedTerritory: number | null;
  onTerritoryClick: (id: number) => void;
  currentPlayer: number;
  phase: "setup" | "playing";
  expandableTerritories: number[];
}> = ({ 
  territories, 
  players, 
  selectedTerritory, 
  onTerritoryClick,
  currentPlayer,
  phase,
  expandableTerritories
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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
  
  // Get territory color based on owner
  const getTerritoryColor = (territory: any) => {
    if (territory.id === selectedTerritory) {
      return "#FFFFFF";
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
  
  // Get territory border color
  const getTerritoryBorder = (territory: any) => {
    if (territory.id === selectedTerritory) {
      return 3;
    }
    
    if (territory.owner !== null) {
      return 2;
    }
    
    return 1;
  };
  
  // Check if territory is selectable in current game phase
  const isTerritorySelectable = (territory: any) => {
    if (phase === "setup") {
      return territory.owner === null;
    }
    
    // If territory is expandable
    if (expandableTerritories.includes(territory.id)) {
      return true;
    }
    
    // In playing phase, can select own territories
    if (territory.owner === currentPlayer) {
      return true;
    }
    
    return false;
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
      const newScale = Math.min(scaleX, scaleY, 1);
      
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
  }, [territories]);
  
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
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setOffset({
      x: offset.x + dx,
      y: offset.y + dy
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  // Handle mouse leave for dragging
  const handleMouseLeave = () => {
    setDragging(false);
  };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden bg-gray-800"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
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
            
            return (
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
                
                {/* Expandable territory highlight */}
                {isExpandable && (
                  <g>
                    <polygon
                      points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="url(#expandableGradient)"
                      stroke="white"
                      strokeWidth="2"
                      strokeOpacity="0.7"
                      className="animate-pulse"
                      filter="url(#glow)"
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
                
                {/* Show unit count */}
                {territory.units.length > 0 && (
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
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
