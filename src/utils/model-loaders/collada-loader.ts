
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
        
        switch (modelType) {
          case 'base':
            groupWrapper.scale.set(0.03, 0.03, 0.03);
            break;
          case 'plains':
            groupWrapper.scale.set(0.03, 0.03, 0.03);
            break;
          case 'mountain':
            groupWrapper.scale.set(0.03, 0.03, 0.03);
            break;
          case 'forest':
            groupWrapper.scale.set(0.03, 0.03, 0.03);
            break;
          case 'coast':
            groupWrapper.scale.set(0.03, 0.03, 0.03);
            break;
          case 'castle':
            groupWrapper.scale.set(0.015, 0.015, 0.015); // Smaller to fit better
            groupWrapper.position.y = 0.1;
            break;
          case 'lumbermill':
            groupWrapper.scale.set(0.015, 0.015, 0.015);
            groupWrapper.position.y = 0.1;
            break;
          case 'mine':
            groupWrapper.scale.set(0.015, 0.015, 0.015);
            groupWrapper.position.y = 0.1;
            break;
          case 'farm':
            groupWrapper.scale.set(0.015, 0.015, 0.015);
            groupWrapper.position.y = 0.1;
            break;
          case 'market':
            groupWrapper.scale.set(0.015, 0.015, 0.015);
            groupWrapper.position.y = 0.1;
            break;
          case 'barracks':
            groupWrapper.scale.set(0.015, 0.015, 0.015);
            groupWrapper.position.y = 0.1;
            break;
          case 'fortress':
            groupWrapper.scale.set(0.015, 0.015, 0.015);
            groupWrapper.position.y = 0.1;
            break;
          default:
            groupWrapper.scale.set(0.03, 0.03, 0.03);
        }
        
        // Add traversal to enable shadow casting for all meshes
        groupWrapper.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Ensure all materials are MeshPhongMaterial for consistent lighting
            if (!(child.material instanceof THREE.MeshPhongMaterial)) {
              const color = child.material.color ? child.material.color : new THREE.Color(0xFFFFFF);
              child.material = new THREE.MeshPhongMaterial({ 
                color: color, 
                shininess: 30
              });
            }
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

// Load a Collada model and cache it
export const loadColladaModelWithCache = async (modelPath: string): Promise<THREE.Group> => {
  // If model is already cached, return a clone
  if (modelCache.has(modelPath)) {
    return modelCache.get(modelPath).clone();
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
