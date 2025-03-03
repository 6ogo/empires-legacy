
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache for loaded models
const modelCache: Record<string, THREE.Object3D> = {};

/**
 * Loads a 3D model from a given path
 */
export const loadModel = async (modelPath: string): Promise<THREE.Object3D | null> => {
  // Check if model is already in cache
  if (modelCache[modelPath]) {
    return modelCache[modelPath].clone();
  }
  
  try {
    let model: THREE.Object3D | null = null;
    
    // Determine loader based on file extension
    if (modelPath.endsWith('.dae')) {
      model = await loadColladaModel(modelPath);
    } else if (modelPath.endsWith('.gltf') || modelPath.endsWith('.glb')) {
      model = await loadGLTFModel(modelPath);
    } else {
      console.error(`Unsupported model format: ${modelPath}`);
      // Create a simple geometry as a fallback
      model = createSimpleModel();
    }
    
    if (model) {
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      
      // Add to cache
      modelCache[modelPath] = model;
      
      return model.clone();
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading model ${modelPath}:`, error);
    // Return a simple fallback model
    return createSimpleModel();
  }
};

/**
 * Loads a COLLADA (.dae) model
 */
const loadColladaModel = async (modelPath: string): Promise<THREE.Object3D> => {
  return new Promise((resolve, reject) => {
    const loader = new ColladaLoader();
    loader.load(
      modelPath,
      (collada) => {
        resolve(collada.scene);
      },
      undefined,
      (error) => {
        console.error(`Error loading COLLADA model: ${modelPath}`, error);
        reject(error);
      }
    );
  });
};

/**
 * Loads a GLTF/GLB model
 */
const loadGLTFModel = async (modelPath: string): Promise<THREE.Object3D> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        console.error(`Error loading GLTF model: ${modelPath}`, error);
        reject(error);
      }
    );
  });
};

/**
 * Creates a simple geometric model as a fallback
 */
const createSimpleModel = (): THREE.Object3D => {
  const group = new THREE.Group();
  
  // Create a simple cube
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.25, 0);
  
  group.add(cube);
  
  return group;
};

// Function to get territory model type based on territory data
export const getTerritoryModel = (territory: any): string => {
  if (!territory) return 'base';
  
  // Determine model based on terrain type
  const terrain = territory.terrain || 'plains';
  
  if (terrain === 'mountains') return 'mountain';
  if (terrain === 'forest') return 'forest';
  
  // Check for buildings
  if (territory.building) {
    return territory.building;
  }
  
  return 'base';
};

// Function to create a highlight effect for selected territories
export const createHighlightEffect = (color: string): THREE.Mesh => {
  const geometry = new THREE.CylinderGeometry(1, 1, 0.05, 6);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.6,
    depthWrite: false
  });
  
  const highlight = new THREE.Mesh(geometry, material);
  highlight.position.y = -0.025;
  highlight.rotation.x = Math.PI / 2;
  
  return highlight;
};

// Add dependencies for three.js loaders
<lov-add-dependency>three@^0.161.0</lov-add-dependency>
