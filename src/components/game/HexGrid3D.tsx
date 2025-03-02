
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadModel, createHighlightEffect } from '../../utils/model-loader';
import { createTextSprite } from './3d/TextSprite';
import { SceneSetup } from './3d/SceneSetup';
import { toast } from "sonner";

interface Territory {
  id: number;
  position: { x: number; y: number };
  owner: number | null;
  type: string;
  resources: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  };
  buildings: any[];
  units: any[];
}

interface HexGrid3DProps {
  territories: Territory[];
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
}

export const HexGrid3D: React.FC<HexGrid3DProps> = ({
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
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const hexMeshesRef = useRef<Map<number, THREE.Group>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const animationsRef = useRef<Map<number, any>>(new Map());
  
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [hoveredTerritory, setHoveredTerritory] = useState<number | null>(null);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Helper functions for hex grid calculations
  const calculateGridCenter = useCallback((territories: Territory[]): { x: number, y: number } => {
    if (territories.length === 0) return { x: 0, y: 0 };
    
    let sumX = 0, sumY = 0;
    territories.forEach(territory => {
      sumX += territory.position.x;
      sumY += territory.position.y;
    });
    
    return {
      x: sumX / territories.length,
      y: sumY / territories.length
    };
  }, []);
  
  const findEdgeTerritories = useCallback((territories: Territory[]): number[] => {
    const result: number[] = [];
    
    // Find the minimum and maximum coordinates
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    territories.forEach(territory => {
      minX = Math.min(minX, territory.position.x);
      maxX = Math.max(maxX, territory.position.x);
      minY = Math.min(minY, territory.position.y);
      maxY = Math.max(maxY, territory.position.y);
    });
    
    // Territories on the edge of the board
    territories.forEach(territory => {
      if (territory.position.x === minX || territory.position.x === maxX || 
          territory.position.y === minY || territory.position.y === maxY) {
        result.push(territory.id);
      }
    });
    
    return result;
  }, []);
  
  const selectCoastalTerritories = useCallback((edgeTerritories: number[], count: number): number[] => {
    // Shuffle edge territories
    const shuffled = [...edgeTerritories].sort(() => 0.5 - Math.random());
    // Return the first 'count' territories
    return shuffled.slice(0, Math.min(count, edgeTerritories.length));
  }, []);
  
  // Scene initialization callback
  const handleSceneReady = useCallback((
    scene: THREE.Scene, 
    camera: THREE.PerspectiveCamera, 
    renderer: THREE.WebGLRenderer, 
    controls: OrbitControls
  ) => {
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    
    setIsInitialized(true);
  }, []);
  
  // Handle territories rendering
  useEffect(() => {
    if (!isInitialized || !sceneRef.current) return;
    
    const scene = sceneRef.current;
    const loadTerritories = async () => {
      // Clear existing meshes
      hexMeshesRef.current.forEach((mesh) => {
        scene.remove(mesh);
      });
      hexMeshesRef.current.clear();
      
      // Stop any ongoing animations
      animationsRef.current.forEach(animation => {
        if (animation && animation.stop) {
          animation.stop();
        }
      });
      animationsRef.current.clear();
      
      // Optimize hex grid display with proper spacing
      const hexSize = 1.0; // Size of each hex
      const horizontalSpacing = hexSize * 1.5; // Reduced horizontal spacing
      const verticalSpacing = hexSize * 1.3; // Reduced vertical spacing
      
      // Calculate grid center for better positioning
      const gridCenter = calculateGridCenter(territories);
      
      // Determine if this is a small, medium, or large board based on territory count
      const territoryCount = territories.length;
      let coastalTerritoryCount = 0;
      if (territoryCount <= 30) {
        coastalTerritoryCount = 3; // Small board
      } else if (territoryCount <= 60) {
        coastalTerritoryCount = 4; // Medium board
      } else {
        coastalTerritoryCount = 5; // Large board
      }
      
      // Find edge territories for potential coastal territories
      const edgeTerritories = findEdgeTerritories(territories);
      
      // If we need to mark some territories as coastal, select random ones from the edge
      const coastalTerritories = selectCoastalTerritories(edgeTerritories, coastalTerritoryCount);
      
      // Load and place territory models
      for (const territory of territories) {
        // Convert from axial coordinates to 3D position with adjusted spacing
        const x = horizontalSpacing * (territory.position.x - gridCenter.x);
        const z = verticalSpacing * (territory.position.y - gridCenter.y);
        
        // Create a group for this territory and all its models
        const territoryGroup = new THREE.Group();
        territoryGroup.position.set(x, 0, z);
        territoryGroup.userData = { territoryId: territory.id };
        
        // Check if this territory should be coastal
        let terrainType = territory.type;
        if (coastalTerritories.includes(territory.id)) {
          terrainType = 'coast';
        }
        
        // Load base terrain model
        const baseModel = await loadModel('base');
        const terrainModel = await loadModel(terrainType);
        
        baseModel.position.y = 0;
        territoryGroup.add(baseModel);
        
        terrainModel.position.y = 0.05; // Slightly elevated from base
        territoryGroup.add(terrainModel);
        
        // Add buildings if any
        if (territory.buildings && territory.buildings.length > 0) {
          // Position buildings around the hex - smaller circle to fit within the closer hexes
          const buildingPositions = [
            { x: 0, z: 0 },       // Center
            { x: 0.3, z: 0 },     // Right (reduced from 0.4)
            { x: 0.15, z: 0.25 },  // Top right (reduced from 0.2, 0.35)
            { x: -0.15, z: 0.25 }, // Top left (reduced from -0.2, 0.35)
            { x: -0.3, z: 0 },    // Left (reduced from -0.4)
            { x: -0.15, z: -0.25 }, // Bottom left (reduced from -0.2, -0.35)
            { x: 0.15, z: -0.25 }   // Bottom right (reduced from 0.2, -0.35)
          ];
          
          for (let i = 0; i < Math.min(territory.buildings.length, buildingPositions.length); i++) {
            const buildingType = typeof territory.buildings[i] === 'object' 
              ? territory.buildings[i].type 
              : getBuildingTypeFromId(territory.buildings[i], players[territory.owner || 0]?.buildings || []);
            
            if (buildingType) {
              const buildingModel = await loadModel(buildingType);
              if (buildingModel) {
                buildingModel.position.set(
                  buildingPositions[i].x,
                  0.12, // On top of the terrain
                  buildingPositions[i].z
                );
                
                // Scale down buildings slightly to fit better
                buildingModel.scale.set(0.8, 0.8, 0.8);
                
                territoryGroup.add(buildingModel);
              }
            }
          }
        }
        
        // Add units if any
        if (territory.units && territory.units.length > 0) {
          // Position units in a circle around the hex
          const unitCount = territory.units.length;
          const radius = 0.3;
          
          for (let i = 0; i < Math.min(unitCount, 8); i++) {
            const angle = (i / Math.min(unitCount, 8)) * Math.PI * 2;
            const unitX = Math.sin(angle) * radius * 0.7; // Reduced radius
            const unitZ = Math.cos(angle) * radius * 0.7; // Reduced radius
            
            // Create a simple unit representation (use a placeholder for now)
            const unitModel = await loadModel('soldier');
            if (unitModel) {
              unitModel.position.set(unitX, 0.15, unitZ);
              unitModel.scale.set(0.5, 0.5, 0.5);
              territoryGroup.add(unitModel);
            }
          }
        }
        
        // Add owner marker
        if (territory.owner !== null && players[territory.owner]) {
          const color = players[territory.owner].color;
          const markerGeometry = new THREE.CylinderGeometry(hexSize * 0.5, hexSize * 0.5, 0.05, 6);
          const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.5
          });
          
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.y = -0.04; // Slightly below terrain
          territoryGroup.add(marker);
        }
        
        // Add selection highlight
        if (territory.id === selectedTerritory) {
          const highlightGeometry = new THREE.CylinderGeometry(hexSize * 0.6, hexSize * 0.6, 0.05, 6);
          const highlightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            wireframe: true
          });
          
          const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
          highlight.position.y = 0.1; // Above terrain
          territoryGroup.add(highlight);
        }
        
        // Add special highlights based on current action
        const addActionHighlight = (color: string, opacity: number) => {
          const actionHighlightGeometry = new THREE.CylinderGeometry(hexSize * 0.55, hexSize * 0.55, 0.05, 6);
          const actionHighlightMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity,
            wireframe: false
          });
          
          const actionHighlight = new THREE.Mesh(actionHighlightGeometry, actionHighlightMaterial);
          actionHighlight.position.y = 0.08; // Above terrain
          territoryGroup.add(actionHighlight);
        };
        
        if (currentAction === "expand" && expandableTerritories.includes(territory.id)) {
          addActionHighlight("#4CAF50", 0.4); // Green
        } else if (currentAction === "attack" && attackableTerritories.includes(territory.id)) {
          addActionHighlight("#F44336", 0.4); // Red
        } else if (currentAction === "build" && buildableTerritories.includes(territory.id)) {
          addActionHighlight("#2196F3", 0.4); // Blue
        } else if (currentAction === "recruit" && recruitableTerritories.includes(territory.id)) {
          addActionHighlight("#9C27B0", 0.4); // Purple
        }
        
        // Add resource display
        // Create text sprite for resources
        const resourceText = `G:${territory.resources.gold} W:${territory.resources.wood}\nS:${territory.resources.stone} F:${territory.resources.food}`;
        const resourceSprite = createTextSprite({
          text: resourceText,
          position: { x: 0, y: 0.5, z: 0 },
          scale: { x: 0.5, y: 0.25 }
        });
        
        territoryGroup.add(resourceSprite);
        
        // Add units count if any
        if (territory.units && territory.units.length > 0) {
          const unitsSprite = createTextSprite({
            text: `Units: ${territory.units.length}`,
            position: { x: 0, y: 0.7, z: 0 },
            scale: { x: 0.4, y: 0.2 },
            backgroundColor: 'rgba(139,0,0,0.7)'
          });
          
          territoryGroup.add(unitsSprite);
        }
        
        // Add to scene and store reference
        scene.add(territoryGroup);
        hexMeshesRef.current.set(territory.id, territoryGroup);
      }
      
      // Adjust camera position to see the entire board
      if (cameraRef.current) {
        // Find the extents of the board
        const boardWidth = territories.reduce((max, t) => 
          Math.max(max, Math.abs(t.position.x - gridCenter.x)), 0) * horizontalSpacing * 2;
        const boardDepth = territories.reduce((max, t) => 
          Math.max(max, Math.abs(t.position.y - gridCenter.y)), 0) * verticalSpacing * 2;
        
        // Position camera to see the whole board
        const maxDimension = Math.max(boardWidth, boardDepth);
        const distance = Math.max(8, maxDimension * 0.7); // Minimum distance of 8 units
        
        cameraRef.current.position.set(0, distance * 0.7, distance * 0.7);
        cameraRef.current.lookAt(0, 0, 0);
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      }
    };
    
    loadTerritories();
  }, [territories, players, selectedTerritory, currentAction, expandableTerritories, attackableTerritories, buildableTerritories, recruitableTerritories, isInitialized, calculateGridCenter, findEdgeTerritories, selectCoastalTerritories]);
  
  // Handle mouse interactions
  useEffect(() => {
    if (!isInitialized || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const raycaster = raycasterRef.current;
    const mouse = mouseRef.current;
    
    const getTerritoryFromIntersection = (intersects: THREE.Intersection[]) => {
      for (const intersect of intersects) {
        let object = intersect.object;
        
        // Traverse up to find the group with territoryId
        while (object && object.parent) {
          if (object.userData && object.userData.territoryId !== undefined) {
            return object.userData.territoryId;
          }
          object = object.parent;
        }
      }
      
      return null;
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Find intersections
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      const territoryId = getTerritoryFromIntersection(intersects);
      
      // Update cursor and hovered territory
      if (territoryId !== null) {
        containerRef.current.style.cursor = 'pointer';
        setHoveredTerritory(territoryId);
      } else {
        containerRef.current.style.cursor = 'grab';
        setHoveredTerritory(null);
      }
    };
    
    const handleMouseClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // If it's a very small movement, treat it as a click
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      const territoryId = getTerritoryFromIntersection(intersects);
      
      if (territoryId !== null) {
        onTerritoryClick(territoryId);
        
        // Add visual feedback
        const territory = territories.find(t => t.id === territoryId);
        if (territory) {
          const group = hexMeshesRef.current.get(territoryId);
          if (group && sceneRef.current) {
            // Get world position for effect
            const position = new THREE.Vector3();
            group.getWorldPosition(position);
            
            // Different colors based on action
            let effectColor = '#FFFFFF';
            if (currentAction === 'build' && buildableTerritories.includes(territoryId)) {
              effectColor = '#2196F3';
            } else if (currentAction === 'recruit' && recruitableTerritories.includes(territoryId)) {
              effectColor = '#9C27B0';
            } else if (currentAction === 'expand' && expandableTerritories.includes(territoryId)) {
              effectColor = '#4CAF50';
            } else if (currentAction === 'attack' && attackableTerritories.includes(territoryId)) {
              effectColor = '#F44336';
            }
            
            createHighlightEffect(sceneRef.current, position, effectColor);
          }
        }
      }
    };
    
    // Touch controls for mobile
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchStartRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      }
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      if (!touchStartRef.current || !containerRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // Check if it was a tap (not a drag)
      const touchEnd = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      };
      
      const dx = touchEnd.x - touchStartRef.current.x;
      const dy = touchEnd.y - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If it was a small movement, consider it a tap
      if (distance < 10) {
        const rect = containerRef.current.getBoundingClientRect();
        mouse.x = ((touchEnd.x - rect.left) / containerRef.current.clientWidth) * 2 - 1;
        mouse.y = -((touchEnd.y - rect.top) / containerRef.current.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
        const territoryId = getTerritoryFromIntersection(intersects);
        
        if (territoryId !== null) {
          onTerritoryClick(territoryId);
        }
      }
      
      touchStartRef.current = null;
    };
    
    // Add event listeners
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('click', handleMouseClick);
      containerRef.current.addEventListener('touchstart', handleTouchStart);
      containerRef.current.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleMouseClick);
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isInitialized, onTerritoryClick, territories, currentAction, expandableTerritories, attackableTerritories, buildableTerritories, recruitableTerritories]);
  
  // Territory hover effect
  useEffect(() => {
    if (!hoveredTerritory || !sceneRef.current) return;
    
    const territoryGroup = hexMeshesRef.current.get(hoveredTerritory);
    if (!territoryGroup) return;
    
    // Create a hover effect
    const originalY = territoryGroup.position.y;
    territoryGroup.position.y += 0.1;
    
    return () => {
      if (territoryGroup) {
        territoryGroup.position.y = originalY;
      }
    };
  }, [hoveredTerritory]);
  
  // Helper function to get building type from building ID
  const getBuildingTypeFromId = (buildingId: number, buildings: any[]): string | null => {
    if (!buildings) return null;
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.type : null;
  };
  
  // Display tooltip for hovered territory
  const getTooltipContent = () => {
    if (hoveredTerritory === null) return null;
    
    const territory = territories.find(t => t.id === hoveredTerritory);
    if (!territory) return null;
    
    return (
      <div className="bg-black/80 p-2 rounded-md text-white text-sm">
        <h3 className="font-bold capitalize">{territory.type}</h3>
        <div className="grid grid-cols-2 gap-x-4">
          <div>Gold: {territory.resources.gold}</div>
          <div>Wood: {territory.resources.wood}</div>
          <div>Stone: {territory.resources.stone}</div>
          <div>Food: {territory.resources.food}</div>
        </div>
        {territory.owner !== null && players[territory.owner] && (
          <div className="mt-1">
            Owner: {players[territory.owner].name || `Player ${territory.owner + 1}`}
          </div>
        )}
        {territory.buildings && territory.buildings.length > 0 && (
          <div className="mt-1">
            Buildings: {territory.buildings.length}
          </div>
        )}
        {territory.units && territory.units.length > 0 && (
          <div className="mt-1">
            Units: {territory.units.length}
          </div>
        )}
      </div>
    );
  };
  
  // Mobile instructions
  useEffect(() => {
    if (isMobile && isInitialized) {
      toast.info(
        "Mobile controls: One finger to rotate, two fingers to zoom and pan",
        { duration: 5000 }
      );
    }
  }, [isMobile, isInitialized]);
  
  return (
    <div className="w-full h-full relative">
      <div 
        ref={containerRef} 
        className="w-full h-full bg-gray-900"
      />
      
      <SceneSetup 
        containerRef={containerRef}
        onSceneReady={handleSceneReady}
        isMobile={isMobile}
      />
      
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black/70 text-white text-xs p-2 rounded-full">
            One finger: rotate • Two fingers: zoom & pan
          </div>
        </div>
      )}
      
      {hoveredTerritory !== null && (
        <div className="absolute top-4 left-4 pointer-events-none">
          {getTooltipContent()}
        </div>
      )}
    </div>
  );
};
