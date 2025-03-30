// ================================================
// File: src/components/game/HexGrid.tsx
// ================================================
import React, { useRef, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useMediaQuery } from "../../hooks/use-media-query";
import * as THREE from 'three'; // Import THREE for Vector2 calculation if needed

interface HexGridProps {
    territories: any[]; // Replace with actual Territory type
    players: any[]; // Replace with actual Player type
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hexSize = 50; // Base size of the hex visually

  // --- Coordinate Conversion & Hex Drawing ---

  // Convert axial coordinates (q, r) to pixel coordinates (x, y) for pointy-top hexes
  const axialToPixel = (q: number, r: number): { x: number; y: number } => {
    const x = hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = hexSize * (3 / 2) * r;
    return { x, y };
  };

  // Calculate hex corner points for pointy-top hexes
  const hexCorners = (center: { x: number; y: number }, size: number): { x: number; y: number }[] => {
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30; // Start angle is -30 degrees for pointy top
      const angleRad = (Math.PI / 180) * angleDeg;
      corners.push({
        x: center.x + size * Math.cos(angleRad),
        y: center.y + size * Math.sin(angleRad)
      });
    }
    return corners;
  };

  // --- Styling and Interaction Logic ---

  const getTerritoryStyle = (territory: any): React.CSSProperties => {
        const isSelected = territory.id === selectedTerritory;
        const isExpandable = currentAction === "expand" && expandableTerritories.includes(territory.id);
        const isAttackable = currentAction === "attack" && attackableTerritories.includes(territory.id);
        const isBuildable = currentAction === "build" && buildableTerritories.includes(territory.id);
        const isRecruitable = currentAction === "recruit" && recruitableTerritories.includes(territory.id);
        const isActionable = isExpandable || isAttackable || isBuildable || isRecruitable;
        const isHovered = territory.id === hoveredTerritoryId;

        let fill = '#CCCCCC'; // Default gray for neutral
        let stroke = '#333333';
        let strokeWidth = 1;
        let opacity = 0.8;
        let filter = 'none';
        let cursor = 'default';

        if (territory.owner !== null && players[territory.owner]) {
            fill = players[territory.owner].color; // Player color
        } else {
             // Color based on type for unowned
             switch (territory.type) {
                 case "plains": fill = "#90EE90"; break; // Light green
                 case "mountains": fill = "#A9A9A9"; break; // Gray
                 case "forests": fill = "#228B22"; break; // Forest green
                 case "coast": fill = "#87CEEB"; break; // Sky blue
                 case "capital": fill = "#FFD700"; break; // Gold (though capitals should be owned)
                 default: fill = "#CCCCCC";
             }
        }


        if (isActionable) {
            opacity = 1;
            strokeWidth = 2.5;
            if (isExpandable) stroke = '#4CAF50'; // Green
            if (isAttackable) stroke = '#F44336'; // Red
            if (isBuildable) stroke = '#2196F3'; // Blue
            if (isRecruitable) stroke = '#9C27B0'; // Purple
             filter = 'brightness(1.2) drop-shadow(0 0 3px white)'; // Glow effect
             cursor = 'pointer';
        } else if (isHovered && isTerritorySelectable(territory)) {
             filter = 'brightness(1.1)';
             cursor = 'pointer';
        } else if (!isTerritorySelectable(territory)) {
             opacity = 0.5;
             cursor = 'not-allowed';
        }


        if (isSelected) {
            stroke = '#FFFFFF'; // White stroke for selected
            strokeWidth = 3;
            filter = 'brightness(1.3) drop-shadow(0 0 5px white)';
        }


        return {
            fill,
            stroke,
            strokeWidth: strokeWidth / scale, // Adjust stroke width based on zoom
            fillOpacity: opacity,
            transition: 'all 0.15s ease-in-out',
            filter,
            cursor
        };
    };

  const isTerritorySelectable = (territory: any): boolean => {
    if (phase === "setup") {
      return territory.owner === null;
    }

    // Playing phase logic
    switch (currentAction) {
      case "expand": return expandableTerritories.includes(territory.id);
      case "attack": return attackableTerritories.includes(territory.id) || (territory.owner === currentPlayer && territory.units.length > 0); // Allow selecting own unit territory first
      case "build": return buildableTerritories.includes(territory.id);
      case "recruit": return recruitableTerritories.includes(territory.id);
      default: // 'none' action
        return territory.owner === currentPlayer; // Can select own territories
    }
  };

  // --- Pan and Zoom Logic ---

  // Handle container resize and initial centering
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const handleResize = () => {
        const { clientWidth, clientHeight } = container;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        territories.forEach(t => {
            const { x, y } = axialToPixel(t.coordinates.q, t.coordinates.r);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const mapWidth = maxX - minX + hexSize * 2; // Add padding
        const mapHeight = maxY - minY + hexSize * 2;

        if (mapWidth <= 0 || mapHeight <= 0) return; // Avoid division by zero

        const scaleX = clientWidth / mapWidth;
        const scaleY = clientHeight / mapHeight;
        const newScale = Math.min(scaleX, scaleY, 1) * 0.8; // Start slightly zoomed out

        // Center the map
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const newOffsetX = clientWidth / 2 - centerX * newScale;
        const newOffsetY = clientHeight / 2 - centerY * newScale;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    };

    handleResize(); // Initial centering
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
}, [territories, hexSize]); // Recalculate on territory changes


  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomIntensity = 0.1;
    const delta = -Math.sign(e.deltaY) * zoomIntensity;
    const newScale = Math.max(0.1, Math.min(3, scale * (1 + delta))); // Clamp scale

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate world coordinates of the mouse pointer before zoom
    const worldXBefore = (mouseX - offset.x) / scale;
    const worldYBefore = (mouseY - offset.y) / scale;

    // Calculate new offset to keep the mouse pointer over the same world coordinates
    const newOffsetX = mouseX - worldXBefore * newScale;
    const newOffsetY = mouseY - worldYBefore * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Handle mouse/touch down for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).style.cursor = 'grabbing';
  };

  // Handle mouse/touch move for dragging
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse/touch up/leave for dragging
  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
     if (dragging) {
         setDragging(false);
         (e.target as HTMLElement).style.cursor = 'grab';
     }
  };


  // --- Unit Stat Calculation (Example) ---
    const getUnitStatsDisplay = (territory: any): { display: string; units: any[] } | null => {
        if (!territory.units || territory.units.length === 0 || territory.owner === null) return null;

        const player = players[territory.owner];
        if (!player || !player.units) return null; // Ensure player and units exist

        const unitsInTerritory = player.units.filter((u: any) => territory.units.includes(u.id));
        if (unitsInTerritory.length === 0) return null;

        // Example: Count types
        const counts: Record<string, number> = {};
        unitsInTerritory.forEach((u: any) => {
            counts[u.type] = (counts[u.type] || 0) + 1;
        });

        const displayString = Object.entries(counts)
            .map(([type, count]) => `${type.substring(0, 1).toUpperCase()}${count}`)
            .join(', ');

        return { display: displayString, units: unitsInTerritory };
    };

  // --- Rendering ---
  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-700 relative" // Added relative for absolute positioning of tooltips
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave} // End drag if mouse leaves container
      style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <svg width="100%" height="100%" style={{ minWidth: '100%', minHeight: '100%' }}>
        <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
          {territories.map(territory => {
            const { q, r } = territory.coordinates;
            const { x: pixelX, y: pixelY } = axialToPixel(q, r);
            const corners = hexCorners({ x: pixelX, y: pixelY }, hexSize);
            const style = getTerritoryStyle(territory);
            const selectable = isTerritorySelectable(territory);
            const unitStats = getUnitStatsDisplay(territory);

            const hexElement = (
              <g
                  key={territory.id}
                  onClick={() => selectable && onTerritoryClick(territory.id)}
                  onMouseEnter={() => setHoveredTerritoryId(territory.id)}
                  onMouseLeave={() => setHoveredTerritoryId(null)}
                  style={{ cursor: style.cursor }} // Apply cursor style
                  // Opacity is handled by style.fillOpacity now
              >
                {/* Base Hex Polygon */}
                <polygon
                    points={corners.map(p => `${p.x},${p.y}`).join(" ")}
                    style={style} // Apply dynamic styles
                />

                {/* Territory Info Text (Example) */}
                <text
                    x={pixelX}
                    y={pixelY - hexSize * 0.5} // Position above center
                    textAnchor="middle"
                    fontSize={12 / scale} // Adjust font size with scale
                    fill="#FFF"
                    stroke="#000"
                    strokeWidth={0.5 / scale}
                    paintOrder="stroke"
                    style={{ pointerEvents: 'none' }} // Prevent text from blocking clicks
                >
                    {territory.type.charAt(0).toUpperCase()} {/* Show first letter of type */}
                 </text>
                  {/* Unit indicator */}
                 {unitStats && (
                     <text
                         x={pixelX}
                         y={pixelY + hexSize * 0.1} // Below center
                         textAnchor="middle"
                         fontSize={10 / scale}
                         fill="#FFF"
                         stroke="#000"
                         strokeWidth={0.5 / scale}
                         paintOrder="stroke"
                         fontWeight="bold"
                         style={{ pointerEvents: 'none' }}
                     >
                         {unitStats.display} {/* Display unit counts */}
                     </text>
                 )}
                  {/* Building indicator (simple 'B') */}
                 {territory.buildings && territory.buildings.length > 0 && (
                     <text
                         x={pixelX}
                         y={pixelY + hexSize * 0.4} // Further below center
                         textAnchor="middle"
                         fontSize={10 / scale}
                         fill="#DDD" // Lighter gray for buildings
                         stroke="#000"
                         strokeWidth={0.5 / scale}
                         paintOrder="stroke"
                         fontWeight="bold"
                         style={{ pointerEvents: 'none' }}
                     >
                         B
                     </text>
                 )}
              </g>
            );

             // Wrap with TooltipProvider only if there's content to show
            if (unitStats) {
                 return (
                    <TooltipProvider key={`${territory.id}-tp`}>
                         <Tooltip>
                             <TooltipTrigger asChild>{hexElement}</TooltipTrigger>
                             <TooltipContent
                                 // Position tooltip near the hex (needs more precise calculation ideally)
                                 // This is a basic example, might need adjustment library/approach
                                 style={{
                                     position: 'fixed', // Use fixed to escape SVG transform
                                     // The positioning needs calculation based on SVG offset/scale and hex position
                                     // Left/Top values would need dynamic calculation based on `pixelX`, `pixelY`, `offset`, `scale`
                                     // This part is complex without a helper library.
                                     // For now, let's just show it, it might appear off-position.
                                     pointerEvents: 'none' // Prevent tooltip from interfering
                                 }}
                             >
                                 <p className="font-bold mb-1">Territory {territory.id}</p>
                                 {unitStats.units.map((unit: any, index: number) => (
                                     <p key={index} className="text-xs">
                                         {unit.type}: {unit.health.toFixed(0)} HP
                                     </p>
                                 ))}
                             </TooltipContent>
                         </Tooltip>
                    </TooltipProvider>
                 );
            } else {
                 return hexElement; // Render hex without tooltip if no units
            }

          })}
        </g>
      </svg>
    </div>
  );
};