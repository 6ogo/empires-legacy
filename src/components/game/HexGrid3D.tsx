
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';
import { loadModel } from '../../utils/model-loader';

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
const HEX_SIZE = 1.0;
const HEX_SPACING_X = 1.75; 
const HEX_SPACING_Z = 1.52;

const HexModel: React.FC<{
  modelType: string; 
  models: Record<string, THREE.Object3D>;
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ modelType, models, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  // Only render if we have the model
  if (!models[modelType]) {
    return null;
  }
  
  return (
    <primitive 
      object={models[modelType].clone()} 
      scale={[0.15, 0.15, 0.15]}
      position={position}
      rotation={rotation}
    />
  );
};

const HexTile: React.FC<{
  territory: any;
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  models: Record<string, THREE.Object3D>;
  onClick: () => void;
  players: any[];
  modelType: string;
}> = ({ territory, position, color, isSelected, models, onClick, players, modelType }) => {
  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Base hex tile */}
      <mesh 
        position={[0, -0.1, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onClick} // Make sure click works on the base
      >
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
      <HexModel 
        modelType={modelType}
        models={models}
        rotation={[0, Math.random() * Math.PI * 2, 0]}
      />
      
      {/* Territory type label */}
      <mesh position={[0, 0.5, 0]} onClick={onClick}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={territory.owner !== null ? players[territory.owner]?.color || 'gray' : 'white'} />
      </mesh>
      
      {/* Show resources as a small indicator */}
      {territory.resources && (
        <group position={[0, 0.1, 0]}>
          <mesh position={[0.3, 0, 0.3]} scale={[0.1, 0.1, 0.1]} onClick={onClick}>
            <boxGeometry />
            <meshStandardMaterial color="gold" /> {/* Gold */}
          </mesh>
          <mesh position={[-0.3, 0, 0.3]} scale={[0.1, 0.1, 0.1]} onClick={onClick}>
            <boxGeometry />
            <meshStandardMaterial color="brown" /> {/* Wood */}
          </mesh>
          <mesh position={[0.3, 0, -0.3]} scale={[0.1, 0.1, 0.1]} onClick={onClick}>
            <boxGeometry />
            <meshStandardMaterial color="gray" /> {/* Stone */}
          </mesh>
          <mesh position={[-0.3, 0, -0.3]} scale={[0.1, 0.1, 0.1]} onClick={onClick}>
            <boxGeometry />
            <meshStandardMaterial color="red" /> {/* Food */}
          </mesh>
        </group>
      )}
    </group>
  );
};

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        toast.info("Loading 3D models...");
        
        const modelTypes = [
          'base', 'mountain', 'forest', 'fortress', 
          'barracks', 'farm', 'market', 'mine', 
          'watchtower', 'lumbermill', 'castle'
        ];
        
        const loadedModels: Record<string, THREE.Object3D> = {};
        
        // Load each model type
        for (const modelType of modelTypes) {
          try {
            console.log(`Loading model: ${modelType}`);
            const model = await loadModel(`/models/${modelType}.dae`);
            if (model) {
              loadedModels[modelType] = model;
              console.log(`Successfully loaded model: ${modelType}`);
            }
          } catch (err) {
            console.error(`Failed to load model ${modelType}:`, err);
          }
        }
        
        setModels(loadedModels);
        setLoading(false);
        toast.success("3D models loaded successfully!");
      } catch (error) {
        console.error('Error loading models:', error);
        toast.error('Failed to load 3D assets');
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const hexPosition = (q: number, r: number): [number, number, number] => {
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
      const position = hexPosition(territory.coordinates.q, territory.coordinates.r);
      const color = getHexColor(territory);
      const modelType = getTerrainModel(territory);
      const isSelected = territory.id === selectedTerritory;
      
      return (
        <HexTile
          key={territory.id}
          territory={territory}
          position={position}
          color={color}
          isSelected={isSelected}
          models={models}
          onClick={() => onTerritoryClick(territory.id)}
          players={players}
          modelType={modelType}
        />
      );
    });
  };

  return (
    <div className="w-full h-full">
      <Canvas 
        shadows 
        ref={canvasRef}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#101624'));
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Using OrbitControls for better user interaction */}
        <OrbitControls 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 8}
          maxDistance={30}
          minDistance={5}
        />
        
        {/* Camera positioned to see the board from a good angle */}
        <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={60} near={0.1} far={1000} />
        
        {/* Grid floor for reference */}
        <gridHelper args={[100, 100, 'gray', 'gray']} position={[0, -0.15, 0]} />
        
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
