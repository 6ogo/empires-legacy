
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { modelCache, createPlaceholderModel } from './base-loader';

const gltfLoader = new GLTFLoader();

// Helper function to load GLTF models
export const loadGLTFModel = (path: string): Promise<THREE.Group> => {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        
        // Create a Group to contain the model
        const groupWrapper = new THREE.Group();
        groupWrapper.add(model);
        
        // Scale and position adjustment based on model type
        const modelType = path.split('/').pop()?.split('.')[0] || '';
        
        // Default scaling for GLTF models
        groupWrapper.scale.set(0.03, 0.03, 0.03);
        
        // Add traversal to enable shadow casting for all meshes
        groupWrapper.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        resolve(groupWrapper);
      },
      undefined, // onProgress callback not needed
      (error) => {
        console.error('Error loading GLTF model:', error);
        reject(error);
      }
    );
  });
};

// Load a GLTF model and cache it
export const loadGLTFModelWithCache = async (modelPath: string): Promise<THREE.Group> => {
  // If model is already cached, return a clone
  if (modelCache.has(modelPath)) {
    return modelCache.get(modelPath).clone();
  }
  
  try {
    const model = await loadGLTFModel(modelPath);
    // Cache the model
    modelCache.set(modelPath, model);
    return model.clone();
  } catch (error) {
    console.warn(`Failed to load GLTF model ${modelPath}, using placeholder:`, error);
    const placeholderModel = createPlaceholderModel(modelPath.split('/').pop()?.split('.')[0] || '');
    return placeholderModel;
  }
};
