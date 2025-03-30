// ================================================
// File: src/utils/model-loaders/collada-loader.ts
// ================================================

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
        if (collada?.scene) {
          // Add the scene to our group wrapper
          groupWrapper.add(collada.scene);
        } else {
           console.warn(`Collada file loaded but no scene found: ${path}`);
           // Resolve with an empty group or reject, depending on desired behavior
           // resolve(new THREE.Group()); // Or reject(new Error('No scene'));
           // Let's add a placeholder in this case as well
           resolve(createPlaceholderModel(path.split('/').pop()?.split('.')[0] || 'unknown'));
           return;
        }

        // Default scaling - adjust as needed per model or type later
        groupWrapper.scale.set(0.04, 0.04, 0.04);

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
        console.error(`Error loading Collada model: ${path}`, error);
        reject(error); // Reject the promise on error
      }
    );
  });
};

// Load a Collada model with caching
export const loadColladaModelWithCache = async (modelPath: string): Promise<THREE.Group> => {
  // If model is already cached, return a clone
  const cachedModel = modelCache.get(modelPath);
  if (cachedModel) {
    console.log(`Using cached model: ${modelPath}`);
    return cachedModel.clone();
  }

  try {
    const model = await loadColladaModel(modelPath);
    // Cache the model
    console.log(`Caching loaded model: ${modelPath}`);
    modelCache.set(modelPath, model);
    return model.clone(); // Return a clone from the original loaded model
  } catch (error) {
    console.warn(`Failed to load Collada model ${modelPath}, using placeholder:`, error);
    const placeholderModel = createPlaceholderModel(modelPath.split('/').pop()?.split('.')[0] || 'unknown');
    // Cache the placeholder to avoid repeated load attempts for the same failed model
    modelCache.set(modelPath, placeholderModel);
    return placeholderModel.clone(); // Return a clone of the placeholder
  }
};