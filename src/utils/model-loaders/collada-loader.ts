
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { modelCache, createPlaceholderModel } from './base-loader';

const colladaLoader = new ColladaLoader();

// Helper function to load Collada models
export const loadColladaModel = (path: string): Promise<THREE.Group> => {
  return new Promise((resolve, reject) => {
    colladaLoader.load(
      path,
      (collada) => {
        // Create a Group to contain the model
        const groupWrapper = new THREE.Group();
        
        // Handle the case where the scene might be any type of Object3D
        if (collada && collada.scene) {
          // Add the scene to our group wrapper
          groupWrapper.add(collada.scene);
        }
        
        // Scale and position adjustment based on model type
        const modelType = path.split('/').pop()?.split('.')[0] || '';
        
        // Specific scaling for different model types
        switch(true) {
          case modelType.includes('forest'):
            groupWrapper.scale.set(0.05, 0.05, 0.05);
            break;
          case modelType.includes('mountain'):
            groupWrapper.scale.set(0.07, 0.07, 0.07);
            break;
          case modelType === 'farm':
            groupWrapper.scale.set(0.03, 0.03, 0.03);
            break;
          case modelType.includes('barracks') || modelType.includes('fortress'):
            groupWrapper.scale.set(0.04, 0.04, 0.04);
            break;
          default:
            groupWrapper.scale.set(0.04, 0.04, 0.04);
        }
        
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
        console.error('Error loading Collada model:', error);
        reject(error);
      }
    );
  });
};

// Load a Collada model with caching
export const loadColladaModelWithCache = async (modelPath: string): Promise<THREE.Group> => {
  // If model is already cached, return a clone
  if (modelCache.has(modelPath)) {
    return modelCache.get(modelPath)!.clone();
  }
  
  try {
    const model = await loadColladaModel(modelPath);
    // Cache the model
    modelCache.set(modelPath, model);
    return model.clone();
  } catch (error) {
    console.warn(`Failed to load Collada model ${modelPath}, using placeholder:`, error);
    const placeholderModel = createPlaceholderModel(modelPath.split('/').pop()?.split('.')[0] || '');
    return placeholderModel;
  }
};
