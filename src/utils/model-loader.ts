
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';

// Model mapping based on territory type and buildings
const MODEL_MAPPING = {
  // Base territory types
  base: 'base.dae',
  plains: 'forest_stone.dae',
  mountains: 'mountain.dae',
  forests: 'forest.dae',
  coast: 'Forest_stone_food.dae',
  capital: 'castle.dae',
  
  // Buildings
  lumberMill: 'lumbermill.dae',
  mine: 'mine.dae',
  market: 'market.dae',
  farm: 'farm.dae',
  barracks: 'barracks.dae',
  fortress: 'fortress.dae',
  archery: 'archery.dae',
  watchtower: 'watchtower.dae',
};

// Cache loaded models to avoid redundant loading
const modelCache = new Map<string, THREE.Object3D>();

// Load Collada model
export const loadModel = async (modelName: string): Promise<THREE.Object3D | null> => {
  if (!modelName || !MODEL_MAPPING[modelName as keyof typeof MODEL_MAPPING]) {
    console.warn(`Model ${modelName} not found in mapping`);
    return null;
  }
  
  const fileName = MODEL_MAPPING[modelName as keyof typeof MODEL_MAPPING];
  
  // Return cached model if available
  if (modelCache.has(fileName)) {
    return modelCache.get(fileName)!.clone();
  }
  
  try {
    const loader = new ColladaLoader();
    const modelPath = `/models/${fileName}`;
    
    return new Promise((resolve, reject) => {
      loader.load(
        modelPath,
        (collada) => {
          const model = collada.scene;
          modelCache.set(fileName, model);
          resolve(model.clone());
        },
        undefined,
        (error) => {
          console.error(`Error loading model ${modelName}:`, error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error(`Failed to load model ${modelName}:`, error);
    return null;
  }
};

// Get appropriate model for territory
export const getTerritoryModel = (territory: any): string => {
  return territory.type;
};

// Get building models
export const getBuildingModels = (territory: any): string[] => {
  if (!territory.buildings || territory.buildings.length === 0) return [];
  
  return territory.buildings.map((building: any) => building.type);
};

// Animation mixer for handling model animations
export const createAnimationMixer = (model: THREE.Object3D): THREE.AnimationMixer => {
  return new THREE.AnimationMixer(model);
};

// Create a highlight animation effect
export const createHighlightEffect = (
  scene: THREE.Scene, 
  position: THREE.Vector3, 
  color: string = '#4CAF50', 
  duration: number = 1
): void => {
  // Create a glowing ring
  const geometry = new THREE.RingGeometry(0.8, 1, 32);
  const material = new THREE.MeshBasicMaterial({ 
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  ring.position.y += 0.1;
  ring.rotation.x = -Math.PI / 2; // Lay flat
  
  scene.add(ring);
  
  // Animate and remove
  const startTime = Date.now();
  const animate = () => {
    const elapsedTime = (Date.now() - startTime) / 1000;
    const t = elapsedTime / duration;
    
    if (t < 1) {
      ring.scale.set(1 + t, 1 + t, 1);
      material.opacity = 0.7 * (1 - t);
      requestAnimationFrame(animate);
    } else {
      scene.remove(ring);
      material.dispose();
      geometry.dispose();
    }
  };
  
  animate();
};
