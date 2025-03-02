
import React, { useRef, useEffect, useState } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadModel, getTerritoryModel, getBuildingModels, createHighlightEffect } from '../../utils/model-loader';
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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const hexMeshesRef = useRef<Map<number, THREE.Group>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
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

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.5; // Restrict vertical rotation
    controls.minPolarAngle = Math.PI / 6; // Minimum angle (prevent looking from below)
    controls.enableRotate = true; // Allow rotation but we'll configure it for specific behavior
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN, // Pan with left mouse button
      MIDDLE: THREE.MOUSE.DOLLY, // Zoom with middle mouse button
      RIGHT: THREE.MOUSE.ROTATE // Rotate with right mouse button (limited rotation)
    };
    
    // Adjust touch controls for mobile
    controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_ROTATE
    };
    
    controlsRef.current = controls;
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    gridHelper.visible = false; // Hide by default
    scene.add(gridHelper);
    
    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    setIsInitialized(true);
    
    // Clean up
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
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
      
      // Load and place territory models
      for (const territory of territories) {
        const hexSize = 1.2; // Size of each hex
        const spacing = hexSize * 1.8; // Spacing between hexes
        
        // Convert from axial coordinates to 3D position
        const x = spacing * (3/2 * territory.position.x);
        const z = spacing * (Math.sqrt(3)/2 * territory.position.x + Math.sqrt(3) * territory.position.y);
        
        // Create a group for this territory and all its models
        const territoryGroup = new THREE.Group();
        territoryGroup.position.set(x, 0, z);
        territoryGroup.userData = { territoryId: territory.id };
        
        // Load base terrain model
        const terrainType = getTerritoryModel(territory);
        const baseModel = await loadModel('base');
        const terrainModel = await loadModel(terrainType);
        
        if (baseModel) {
          baseModel.scale.set(0.1, 0.1, 0.1);
          baseModel.position.y = -0.05;
          territoryGroup.add(baseModel);
        }
        
        if (terrainModel) {
          terrainModel.scale.set(0.1, 0.1, 0.1);
          territoryGroup.add(terrainModel);
        }
        
        // Add buildings if any
        const buildingTypes = getBuildingModels(territory);
        
        if (territory.buildings && territory.buildings.length > 0) {
          // Position buildings around the hex
          const buildingPositions = [
            { x: 0.4, z: 0 },    // Right
            { x: 0.2, z: 0.35 },  // Top right
            { x: -0.2, z: 0.35 }, // Top left
            { x: -0.4, z: 0 },    // Left
            { x: -0.2, z: -0.35 }, // Bottom left
            { x: 0.2, z: -0.35 }   // Bottom right
          ];
          
          for (let i = 0; i < Math.min(buildingTypes.length, buildingPositions.length); i++) {
            const buildingModel = await loadModel(territory.buildings[i].type);
            if (buildingModel) {
              buildingModel.scale.set(0.08, 0.08, 0.08);
              buildingModel.position.set(
                buildingPositions[i].x,
                0.05, // Slightly elevated
                buildingPositions[i].z
              );
              territoryGroup.add(buildingModel);
            }
          }
        }
        
        // Add highlight or owner marker
        if (territory.owner !== null) {
          const color = players[territory.owner].color;
          const markerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 6);
          const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.5
          });
          
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.y = -0.04; // Slightly below terrain
          marker.rotation.x = Math.PI / 2;
          territoryGroup.add(marker);
        }
        
        // Add selection highlight
        if (territory.id === selectedTerritory) {
          const highlightGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 6);
          const highlightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            wireframe: true
          });
          
          const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
          highlight.position.y = 0.1; // Above terrain
          highlight.rotation.x = Math.PI / 2;
          territoryGroup.add(highlight);
        }
        
        // Add special highlights based on current action
        const addActionHighlight = (color: string, opacity: number) => {
          const actionHighlightGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 6);
          const actionHighlightMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity,
            wireframe: false
          });
          
          const actionHighlight = new THREE.Mesh(actionHighlightGeometry, actionHighlightMaterial);
          actionHighlight.position.y = 0.08; // Above terrain
          actionHighlight.rotation.x = Math.PI / 2;
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
        // Create floating text to show resources
        const createTextSprite = (text: string, offsetY: number) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return null;
          
          canvas.width = 64;
          canvas.height = 32;
          context.fillStyle = 'rgba(0,0,0,0.7)';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.font = '24px Arial';
          context.fillStyle = 'white';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(text, canvas.width / 2, canvas.height / 2);
          
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          
          sprite.scale.set(0.5, 0.25, 1);
          sprite.position.y = offsetY;
          
          return sprite;
        };
        
        // Add resource counts as floating text
        const resourceText = `G:${territory.resources.gold} W:${territory.resources.wood} S:${territory.resources.stone} F:${territory.resources.food}`;
        const resourceSprite = createTextSprite(resourceText, 0.5);
        if (resourceSprite) {
          territoryGroup.add(resourceSprite);
        }
        
        // Add units count if any
        if (territory.units && territory.units.length > 0) {
          const unitsText = `Units: ${territory.units.length}`;
          const unitsSprite = createTextSprite(unitsText, 0.7);
          if (unitsSprite) {
            territoryGroup.add(unitsSprite);
          }
        }
        
        // Add to scene and store reference
        scene.add(territoryGroup);
        hexMeshesRef.current.set(territory.id, territoryGroup);
      }
    };
    
    loadTerritories();
  }, [territories, players, selectedTerritory, currentAction, expandableTerritories, attackableTerritories, buildableTerritories, recruitableTerritories, isInitialized]);
  
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
    
    // Mobile-specific adjustments
    if (isMobile && controlsRef.current) {
      controlsRef.current.rotateSpeed = 0.3;
      controlsRef.current.enableZoom = true;
      controlsRef.current.zoomSpeed = 1.5;
      controlsRef.current.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE
      };
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleMouseClick);
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isInitialized, isMobile, onTerritoryClick, territories, currentAction, expandableTerritories, attackableTerritories, buildableTerritories, recruitableTerritories]);
  
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
        {territory.owner !== null && (
          <div className="mt-1">
            Owner: Player {territory.owner + 1}
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
        "Mobile controls: One finger to pan, two fingers to zoom and rotate",
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
      
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black/70 text-white text-xs p-2 rounded-full">
            One finger: pan • Two fingers: zoom & rotate
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
