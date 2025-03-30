// ================================================
// File: src/utils/model-loaders/gltf-loader.ts
// ================================================

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

        // Default scaling for GLTF models - adjust as needed
        groupWrapper.scale.set(0.03, 0.03, 0.03);

        // Add traversal to enable shadow casting for all meshes
        groupWrapper.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Optional: Improve material appearance
             if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.metalness = 0.1;
                child.material.roughness = 0.7;
             }
          }
        });

        resolve(groupWrapper);
      },
      undefined, // onProgress callback not needed
      (error) => {
        console.error(`Error loading GLTF model: ${path}`, error);
        reject(error); // Reject the promise on error
      }
    );
  });
};

// Load a GLTF model and cache it
export const loadGLTFModelWithCache = async (modelPath: string): Promise<THREE.Group> => {
  // If model is already cached, return a clone
  const cachedModel = modelCache.get(modelPath);
  if (cachedModel) {
    console.log(`Using cached model: ${modelPath}`);
    return cachedModel.clone();
  }

  try {
    const model = await loadGLTFModel(modelPath);
    // Cache the model
    console.log(`Caching loaded model: ${modelPath}`);
    modelCache.set(modelPath, model);
    return model.clone(); // Return a clone from the original loaded model
  } catch (error) {
    console.warn(`Failed to load GLTF model ${modelPath}, using placeholder:`, error);
    const placeholderModel = createPlaceholderModel(modelPath.split('/').pop()?.split('.')[0] || 'unknown');
    // Cache the placeholder
    modelCache.set(modelPath, placeholderModel);
    return placeholderModel.clone(); // Return a clone of the placeholder
  }
};