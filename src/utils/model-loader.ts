// ================================================
// File: src/utils/model-loader.ts
// ================================================
import * as THREE from 'three';
import { loadColladaModelWithCache } from './model-loaders/collada-loader';
import { loadGLTFModelWithCache } from './model-loaders/gltf-loader';
import { createPlaceholderModel } from './model-loaders/base-loader';

/**
 * Loads a 3D model from a given path, automatically determining the loader.
 * Uses caching to avoid reloading the same model.
 */
export const loadModel = async (modelPath: string): Promise<THREE.Group> => {
  console.log(`Attempting to load model: ${modelPath}`); // Debug log
  try {
    let modelLoader: (path: string) => Promise<THREE.Group>;

    if (modelPath.endsWith('.dae')) {
      modelLoader = loadColladaModelWithCache;
    } else if (modelPath.endsWith('.gltf') || modelPath.endsWith('.glb')) {
      modelLoader = loadGLTFModelWithCache;
    } else {
      console.warn(`Unsupported model format: ${modelPath}. Using placeholder.`);
      return createPlaceholderModel(modelPath.split('/').pop()?.split('.')[0] || 'unknown');
    }

    const model = await modelLoader(modelPath);
    console.log(`Successfully loaded model: ${modelPath}`); // Debug log

     // Add centering logic here if needed AFTER loading
     const box = new THREE.Box3().setFromObject(model);
     const center = box.getCenter(new THREE.Vector3());
     model.position.sub(center); // Center the geometry pivot

    return model;
  } catch (error) {
    console.error(`Error loading model ${modelPath}:`, error);
    // Return a placeholder model on error
    return createPlaceholderModel(modelPath.split('/').pop()?.split('.')[0] || 'unknown');
  }
};

// --- Re-export other necessary functions ---
// Removed invalid export as 'getTerritoryModel' is not exported from './model-loaders/base-loader'
export { createHighlightEffect } from './model-loaders/effects'; // Example if needed elsewhere