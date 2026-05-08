import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Territory } from "@/types/game";
import { TerrainType } from "@/types/game";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Module-level constants — computed exactly once, never recreated per render
// ---------------------------------------------------------------------------

const HEX_SIZE = 40;
const SQRT3 = Math.sqrt(3);

// Flat-top hexagon vertices: 0°, 60°, 120°, 180°, 240°, 300°
const HEX_POINTS = Array.from({ length: 6 }, (_, i) => {
  const rad = (Math.PI / 3) * i;
  return `${HEX_SIZE * Math.cos(rad)},${HEX_SIZE * Math.sin(rad)}`;
}).join(" ");

// Flat-top axial coordinate → pixel center
// x = size * 1.5 * q
// y = size * √3 * (r + q/2)
function getHexPosition(q: number, r: number) {
  return {
    x: HEX_SIZE * 1.5 * q,
    y: HEX_SIZE * SQRT3 * (r + q / 2),
  };
}

// Axial adjacency check (cube coordinates)
function isAdjacentAxial(q1: number, r1: number, q2: number, r2: number): boolean {
  const dq = Math.abs(q1 - q2);
  const dr = Math.abs(r1 - r2);
  const ds = Math.abs((-q1 - r1) - (-q2 - r2));
  return dq <= 1 && dr <= 1 && ds <= 1 && (dq + dr + ds) > 0;
}

const TERRAIN_FILL: Record<TerrainType, string> = {
  plains:    "#6B8E4E",
  forest:    "#2D5A27",
  hills:     "#8B7355",
  mountains: "#5A5A6E",
  river:     "#3A6B8C",
};

const PLAYER_OVERLAY: Record<string, string> = {
  player1: "rgba(159,122,234,0.35)",
  player2: "rgba(248,187,92,0.35)",
  player3: "rgba(72,187,120,0.35)",
  player4: "rgba(66,153,225,0.35)",
  player5: "rgba(245,101,101,0.35)",
  player6: "rgba(236,201,75,0.35)",
};

const PLAYER_STROKE: Record<string, string> = {
  player1: "#9F7AEA",
  player2: "#F8BB5C",
  player3: "#48BB78",
  player4: "#42A0E1",
  player5: "#F56565",
  player6: "#ECC94B",
};

// ---------------------------------------------------------------------------
// HexTile — memoized per-territory tile, only re-renders when its data changes
// ---------------------------------------------------------------------------

interface HexTileProps {
  territory: Territory;
  isSelected: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const HexTile = React.memo<HexTileProps>(({
  territory,
  isSelected,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { x, y } = getHexPosition(territory.coordinates.q, territory.coordinates.r);

  const strokeColor = isSelected
    ? "#F5D547"
    : isHovered
    ? "#FFFFFF"
    : territory.owner
    ? (PLAYER_STROKE[territory.owner] ?? "#6B7280")
    : "#4B5563";

  const strokeWidth = isSelected ? 3 : isHovered ? 2.5 : 1.5;

  return (
    <g
      data-territory-id={territory.id}
      transform={`translate(${x},${y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Layer 1: terrain fill */}
      <polygon
        points={HEX_POINTS}
        fill={TERRAIN_FILL[territory.terrain] ?? TERRAIN_FILL.plains}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Layer 2: owner overlay */}
      {territory.owner && (
        <polygon
          points={HEX_POINTS}
          fill={PLAYER_OVERLAY[territory.owner] ?? "transparent"}
          stroke="none"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Building indicator: gold dot top-right */}
      {territory.building && (
        <circle
          cx={HEX_SIZE * 0.55}
          cy={-HEX_SIZE * 0.55}
          r={5}
          fill="#F5D547"
          stroke="#1a1a2e"
          strokeWidth={1}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Unit indicator: red dot bottom-right */}
      {territory.militaryUnit && (
        <circle
          cx={HEX_SIZE * 0.55}
          cy={HEX_SIZE * 0.55}
          r={5}
          fill="#EF4444"
          stroke="#1a1a2e"
          strokeWidth={1}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Terrain label (subtle, center) */}
      <text
        x={0}
        y={3}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={9}
        fill="rgba(255,255,255,0.35)"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {territory.terrain.slice(0, 2).toUpperCase()}
      </text>
    </g>
  );
});

// ---------------------------------------------------------------------------
// HexGrid — main component
// ---------------------------------------------------------------------------

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
}) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const draggingRef = useRef(false);
  const dragThresholdRef = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const pinchStartRef = useRef(0);
  const touchPanStartRef = useRef({ tx: 0, ty: 0, px: 0, py: 0 });

  // Memoize the SVG viewBox — only recompute when territories change
  const viewBox = useMemo(() => {
    if (territories.length === 0) return "-100 -100 200 200";
    const positions = territories.map(t => getHexPosition(t.coordinates.q, t.coordinates.r));
    const xs = positions.map(p => p.x);
    const ys = positions.map(p => p.y);
    const pad = HEX_SIZE * 2.5;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
    const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
    return `${minX} ${minY} ${w} ${h}`;
  }, [territories]);

  // Memoize road lines — deduplicated, only road territories
  const roadLines = useMemo(() => {
    const roadTerrs = territories.filter(t => t.building === "road");
    const seen = new Set<string>();
    const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    for (const t of roadTerrs) {
      for (const other of territories) {
        if (other.owner !== t.owner) continue;
        if (!isAdjacentAxial(t.coordinates.q, t.coordinates.r, other.coordinates.q, other.coordinates.r)) continue;
        const pairKey = [t.id, other.id].sort().join("|");
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);
        const s = getHexPosition(t.coordinates.q, t.coordinates.r);
        const e = getHexPosition(other.coordinates.q, other.coordinates.r);
        lines.push({ x1: s.x, y1: s.y, x2: e.x, y2: e.y, key: pairKey });
      }
    }
    return lines;
  }, [territories]);

  // Stable per-tile hover handlers via refs to avoid breaking HexTile memo
  const hoverHandlers = useMemo(() => {
    const handlers: Record<string, { enter: () => void; leave: () => void }> = {};
    for (const t of territories) {
      handlers[t.id] = {
        enter: () => setHoveredId(t.id),
        leave: () => setHoveredId(null),
      };
    }
    return handlers;
  }, [territories]);

  // Single click handler via event delegation
  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragThresholdRef.current) return;
    const el = (e.target as Element).closest("[data-territory-id]");
    if (!el) return;
    const territory = territories.find(t => t.id === el.getAttribute("data-territory-id"));
    if (territory) onTerritoryClick(territory);
  }, [territories, onTerritoryClick]);

  // Mouse drag (desktop pan)
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    dragThresholdRef.current = false;
    dragStartRef.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mx;
    const dy = e.clientY - dragStartRef.current.my;
    if (Math.hypot(dx, dy) > 4) dragThresholdRef.current = true;
    // Divide by scale so 1px drag = 1 SVG unit regardless of zoom
    setPan({ x: dragStartRef.current.px + dx / scale, y: dragStartRef.current.py + dy / scale });
  }, [scale]);

  const handleMouseUp = useCallback(() => { draggingRef.current = false; }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.3), 4));
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      pinchStartRef.current = d;
    } else if (e.touches.length === 1) {
      touchPanStartRef.current = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, px: pan.x, py: pan.y };
      dragThresholdRef.current = false;
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const ratio = d / (pinchStartRef.current || d);
      pinchStartRef.current = d;
      setScale(prev => Math.min(Math.max(prev * ratio, 0.3), 4));
    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchPanStartRef.current.tx;
      const dy = e.touches[0].clientY - touchPanStartRef.current.ty;
      if (Math.hypot(dx, dy) > 4) dragThresholdRef.current = true;
      setPan({ x: touchPanStartRef.current.px + dx / scale, y: touchPanStartRef.current.py + dy / scale });
    }
  }, [scale]);

  const handleTouchEnd = useCallback(() => {}, []);

  const zoomIn  = useCallback(() => setScale(s => Math.min(s * 1.2, 4)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s * 0.8, 0.3)), []);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
      <svg
        viewBox={viewBox}
        className="w-full h-full touch-none select-none"
        style={{ cursor: draggingRef.current ? "grabbing" : "grab" }}
        onClick={handleSvgClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/*
          SVG transforms are applied right-to-left:
          scale(s) translate(x,y) → translate first in SVG units, then scale.
          This means pan.x/pan.y are in unscaled SVG coordinates — 1 drag pixel
          = 1 SVG unit regardless of zoom level. Correct for independent pan+zoom.
        */}
        <g transform={`scale(${scale}) translate(${pan.x},${pan.y})`}>
          {/* Road lines */}
          {roadLines.map(r => (
            <line
              key={r.key}
              x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeLinecap="round"
              style={{ pointerEvents: "none" }}
            />
          ))}

          {/* Territory hexes */}
          {territories.map(t => (
            <HexTile
              key={t.id}
              territory={t}
              isSelected={selectedTerritory?.id === t.id}
              isHovered={hoveredId === t.id}
              onMouseEnter={hoverHandlers[t.id]?.enter ?? (() => {})}
              onMouseLeave={hoverHandlers[t.id]?.leave ?? (() => {})}
            />
          ))}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomIn}
          className="rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomOut}
          className="rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default React.memo(HexGrid);
