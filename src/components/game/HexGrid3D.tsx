// ================================================
// File: src/components/game/HexGrid3D.tsx
// ================================================
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';
import { loadColladaModel } from '../../utils/model-loaders/collada-loader'; // Assuming DAE
// If using GLTF: import { loadModelWithCache as loadGLTFModel } from '../../utils/model-loaders/gltf-loader';
import { createPlaceholderModel } from '../../utils/model-loaders/base-loader';
import { BuildingType, TerrainType } from '@/types/game'; // Assuming you have these types

interface HexGrid3DProps {
  territories: any[]; // Replace 'any' with your actual Territory type
  players: any[]; // Replace 'any' with your actual Player type
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

// Constants for hex geometry and spacing
const HEX_SIZE = 0.9; // Slightly smaller hex base size
const HEX_SPACING_X = Math.sqrt(3) * HEX_SIZE; // Correct horizontal spacing for pointy-top hexes
const HEX_SPACING_Z = 1.5 * HEX_SIZE;      // Correct vertical spacing for pointy-top hexes

// Function to convert axial coordinates to world position
const hexPosition = (q: number, r: number): [number, number, number] => {
  const x = HEX_SPACING_X * (q + r / 2);
  const z = HEX_SPACING_Z * r;
  return [x, 0, z];
};

// Function to determine the model path based on territory properties
const getModelPath = (territory: any): string | null => {
    // Prioritize building model
    if (territory.building && typeof territory.building === 'string') {
        // Map building type string to model filename
        const buildingModelMap: Record<BuildingType | string, string> = {
            fortress: 'fortress.dae',
            farm: 'farm.dae',
            mine: 'mine.dae',
            lumbermill: 'lumbermill.dae',
            market: 'market.dae',
            barracks: 'barracks.dae',
            watchtower: 'watchtower.dae',
            castle: 'castle.dae',
            // Add other building types here
        };
        const modelFile = buildingModelMap[territory.building];
        return modelFile ? `/models/${modelFile}` : null; // Return null if no mapping found
    }

    // Then terrain model
    const terrain = territory.terrain as TerrainType || 'plains';
    const terrainModelMap: Record<TerrainType | string, string> = {
        plains: 'base.dae', // Or a specific plains model if you have one
        mountains: 'mountain.dae',
        forest: 'forest.dae',
        hills: 'base.dae', // Or specific hills model
        river: 'base.dae', // Or specific river model
        coast: 'base.dae', // Or specific coast model
        capital: 'castle.dae' // Example: use castle model for capital
        // Add other terrain types here
    };
    const terrainFile = terrainModelMap[terrain];
    return terrainFile ? `/models/${terrainFile}` : '/models/base.dae'; // Fallback to base
};


// --- Hex Component ---
interface HexProps {
  territory: any;
  color: string;
  isSelected: boolean;
  isActionable: boolean;
  actionColor?: string;
  models: Record<string, THREE.Group | null>;
  onClick: () => void;
  players: any[]; // Pass players array to get color
}

const Hex: React.FC<HexProps> = React.memo(({ territory, color, isSelected, isActionable, actionColor, models, onClick, players }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [x, y, z] = hexPosition(territory.coordinates.q, territory.coordinates.r);
  const modelPath = getModelPath(territory);
  const model = modelPath ? models[modelPath] : null;

  const ownerColor = territory.owner !== null && players[territory.owner]
    ? players[territory.owner].color
    : '#888888'; // Default color for unowned

  // Determine the final base color based on state
  let finalBaseColor = color;
  if (isActionable && actionColor) {
      finalBaseColor = actionColor; // Use action highlight color if actionable
  }

  useFrame(({ clock }) => {
    if (groupRef.current && (isSelected || isActionable)) {
      // Simple pulsing effect for selected/actionable hexes
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.05 + 0.95;
      groupRef.current.scale.set(pulse, pulse, pulse);
    } else if (groupRef.current) {
      // Reset scale if not selected/actionable
       groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      scale={[1,1,1]} // Base scale
    >
      {/* Base Hex Mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, 0.1, 6]} />
        <meshStandardMaterial
          color={finalBaseColor} // Use the determined color
          transparent={true}
          opacity={isActionable ? 0.85 : 0.7} // Slightly more opaque if actionable
          emissive={isSelected ? '#FFFF00' : undefined} // Yellow emissive for selected
          emissiveIntensity={isSelected ? 0.6 : 0}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

       {/* Render the loaded model if available */}
       {model ? (
           <primitive
               object={model.clone()} // Clone the model from cache/state
               scale={[0.1, 0.1, 0.1]} // ** ADJUST SCALE ** based on your model size
               position={[0, 0.05, 0]} // Position slightly above the hex base
               castShadow
               receiveShadow
           />
       ) : (
            // Optional: Render a placeholder if model is missing or loading
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.3, 0.4, 0.3]} />
                <meshStandardMaterial color="#555555" />
            </mesh>
       )}

        {/* Owner Indicator (Small colored sphere) */}
        {territory.owner !== null && (
            <mesh position={[0, 0.2, -HEX_SIZE * 0.6]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={ownerColor} />
            </mesh>
        )}

         {/* Optional: Simple Text Label for Territory ID or Type */}
         <Text
            position={[0, 0.5, 0]} // Position label above the hex
            color="white"
            fontSize={0.15}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="black"
         >
             ID: {territory.id} {/* Or territory.type */}
         </Text>
    </group>
  );
});


// --- Main Component ---
const HexGrid3D: React.FC<HexGrid3DProps> = ({
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
  const [models, setModels] = useState<Record<string, THREE.Group | null>>({});
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Function to get color based on territory state
  const getHexColor = (territory: any): string => {
    // If actionable, return a neutral color, the action highlight will provide visual cue
     if (currentAction === "expand" && expandableTerritories.includes(territory.id)) return '#CCCCCC';
     if (currentAction === "attack" && attackableTerritories.includes(territory.id)) return '#CCCCCC';
     if (currentAction === "build" && buildableTerritories.includes(territory.id)) return '#CCCCCC';
     if (currentAction === "recruit" && recruitableTerritories.includes(territory.id)) return '#CCCCCC';

    // Color by owner if not actionable
    if (territory.owner !== null && players[territory.owner]) {
      return players[territory.owner].color || '#888888';
    }

    // Default color for unowned, non-actionable territories
    return '#666666';
  };

   // Function to get highlight color for actionable territories
   const getActionColor = (territory: any): string | undefined => {
    if (currentAction === "expand" && expandableTerritories.includes(territory.id)) return '#4CAF50'; // Green
    if (currentAction === "attack" && attackableTerritories.includes(territory.id)) return '#F44336'; // Red
    if (currentAction === "build" && buildableTerritories.includes(territory.id)) return '#2196F3'; // Blue
    if (currentAction === "recruit" && recruitableTerritories.includes(territory.id)) return '#9C27B0'; // Purple
    return undefined;
};


  // Load models on component mount
  useEffect(() => {
    const loadAllModels = async () => {
      setLoading(true);
      const modelPaths = new Set<string>();
      territories.forEach(t => {
        const path = getModelPath(t);
        if(path) modelPaths.add(path);
      });

      const loadedModels: Record<string, THREE.Group | null> = {};
      for (const path of modelPaths) {
        try {
          // Determine loader based on path extension if needed, assuming Collada for now
          const model = await loadColladaModel(path);
          loadedModels[path] = model;
        } catch (error) {
           console.error(`Failed to load model: ${path}`, error);
           loadedModels[path] = createPlaceholderModel(path); // Use placeholder on error
        }
      }
      setModels(loadedModels);
      setLoading(false);
      toast.info("3D assets loaded.");
    };

    if (territories.length > 0) {
        loadAllModels();
    } else {
        setLoading(false); // No territories, no models to load
    }
  }, [territories]); // Reload models if territories change fundamentally


  const renderedHexes = useMemo(() => {
    console.log("Rendering 3D hexes. Model Status:", loading ? "Loading..." : `${Object.keys(models).length} models ready`);
    if (loading) return null; // Don't render hexes until models are loaded

    return territories.map((territory) => {
        const isSelected = territory.id === selectedTerritory;
        const actionColor = getActionColor(territory);
        const isActionable = !!actionColor;

        return (
            <Hex
                key={territory.id}
                territory={territory}
                color={getHexColor(territory)}
                isSelected={isSelected}
                isActionable={isActionable}
                actionColor={actionColor}
                models={models}
                onClick={() => onTerritoryClick(territory.id)}
                players={players}
            />
        );
    });
  }, [
      territories,
      players,
      selectedTerritory,
      onTerritoryClick,
      currentAction,
      expandableTerritories,
      attackableTerritories,
      buildableTerritories,
      recruitableTerritories,
      models, // Re-render when models are loaded/updated
      loading // Re-render when loading state changes
  ]);

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas shadows camera={{ position: [0, 10, 12], fov: 60 }}> {/* Adjusted camera position */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[8, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
         <pointLight position={[-8, 10, -10]} intensity={0.5} />

        {/* Use PerspectiveCamera directly and make it default */}
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 15, 0]} fov={55} near={0.1} far={1000} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#386641" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Render hexes */}
        <group>{renderedHexes}</group>

         {/* Fog for atmosphere */}
         <fog attach="fog" args={['#111827', 15, 40]} />
      </Canvas>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white z-10">
          <div className="text-xl animate-pulse">Loading 3D Assets...</div>
        </div>
      )}
    </div>
  );
};

export { HexGrid3D };