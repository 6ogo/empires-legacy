
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';
import { loadModel } from '../utils/model-loader';

interface HexGrid3DProps {
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
}

// Constants for hex geometry
const HEX_SIZE = 1.0; // Size of hexagons
const HEX_SPACING_X = 1.75; // Horizontal spacing factor
const HEX_SPACING_Z = 1.52; // Vertical spacing factor

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
  const [models, setModels] = useState<Record<string, THREE.Object3D>>({});
  const [loading, setLoading] = useState(true);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        
        const modelTypes = [
          'base', 'mountain', 'forest', 'fortress', 
          'barracks', 'farm', 'market', 'mine', 
          'watchtower', 'lumbermill', 'castle'
        ];
        
        const loadedModels: Record<string, THREE.Object3D> = {};
        
        for (const modelType of modelTypes) {
          try {
            const model = await loadModel(`/models/${modelType}.dae`);
            if (model) {
              loadedModels[modelType] = model;
            }
          } catch (err) {
            console.error(`Failed to load model ${modelType}:`, err);
          }
        }
        
        setModels(loadedModels);
        setLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        toast.error('Failed to load 3D assets');
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const hexPosition = (q: number, r: number) => {
    // Calculate hex position using axial coordinates
    const x = HEX_SIZE * (HEX_SPACING_X * q);
    const z = HEX_SIZE * (HEX_SPACING_Z * r + (HEX_SPACING_X * q) / 2);
    return [x, 0, z];
  };

  const getTerrainModel = (territory: any) => {
    if (!territory) return 'base';
    
    // Determine appropriate model based on territory type
    const terrain = territory.terrain || 'plains';
    
    if (terrain === 'mountains') return 'mountain';
    if (terrain === 'forest') return 'forest';
    
    // If territory has a building, return that building type
    if (territory.building) {
      return territory.building;
    }
    
    return 'base';
  };

  const getHexColor = (territory: any) => {
    if (!territory) return 'gray';
    
    if (territory.id === selectedTerritory) {
      return 'yellow';
    }
    
    if (territory.owner === null) {
      if (phase === "setup") {
        return 'white';
      }
      
      if (currentAction === "expand" && expandableTerritories.includes(territory.id)) {
        return 'lightgreen';
      }
      
      return 'lightgray';
    }
    
    const playerColor = players[territory.owner]?.color || 'gray';
    
    if (currentAction === "attack" && attackableTerritories.includes(territory.id)) {
      return 'red';
    }
    
    if (currentAction === "build" && buildableTerritories.includes(territory.id)) {
      return 'blue';
    }
    
    if (currentAction === "recruit" && recruitableTerritories.includes(territory.id)) {
      return 'purple';
    }
    
    return playerColor;
  };

  const renderHexes = () => {
    return territories.map((territory) => {
      const [x, y, z] = hexPosition(territory.coordinates.q, territory.coordinates.r);
      const color = getHexColor(territory);
      const modelType = getTerrainModel(territory);
      const isSelected = territory.id === selectedTerritory;
      
      return (
        <group 
          key={territory.id} 
          position={[x, y, z]}
          onClick={(e) => {
            e.stopPropagation();
            onTerritoryClick(territory.id);
          }}
        >
          {/* Base hex tile */}
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, 0.1, 6]} />
            <meshStandardMaterial 
              color={color} 
              transparent={true}
              opacity={0.7}
              emissive={isSelected ? 'yellow' : undefined}
              emissiveIntensity={isSelected ? 0.5 : 0}
            />
          </mesh>
          
          {/* Model for the hex (if available) */}
          {models[modelType] && (
            <primitive 
              object={models[modelType].clone()} 
              scale={[0.2, 0.2, 0.2]}
              position={[0, 0, 0]}
              rotation={[0, Math.random() * Math.PI * 2, 0]} // Random rotation for variety
            />
          )}
          
          {/* Owner indicator */}
          {territory.owner !== null && (
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={players[territory.owner]?.color || 'gray'} />
            </mesh>
          )}
          
          {/* Show territory ID for debugging */}
          {/* <Html position={[0, 1, 0]} center>
            <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
              {territory.id}
            </div>
          </Html> */}
        </group>
      );
    });
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <PerspectiveCamera makeDefault position={[0, 15, 20]} />
        <OrbitControls
          ref={controlsRef}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={10}
          maxDistance={50}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        
        {/* Grid floor for reference */}
        <gridHelper args={[100, 100, 'gray', 'gray']} position={[0, -0.1, 0]} />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2a623d" roughness={1} />
        </mesh>
        
        {/* Render all hex territories */}
        {!loading && renderHexes()}
      </Canvas>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-xl">Loading 3D assets...</div>
        </div>
      )}
    </div>
  );
};

export { HexGrid3D };
