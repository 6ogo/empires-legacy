
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

// Add timeout to prevent loading hanging indefinitely
const LOAD_TIMEOUT = 30000; // 30 seconds timeout

export const loadModel = (url: string): Promise<THREE.Object3D> => {
  return new Promise((resolve, reject) => {
    // Create a timeout to abort loading if it takes too long
    const timeoutId = setTimeout(() => {
      reject(new Error(`Loading model timed out: ${url}`));
    }, LOAD_TIMEOUT);
    
    try {
      const loader = new ColladaLoader();
      
      loader.load(
        url,
        (collada) => {
          clearTimeout(timeoutId);
          
          try {
            const model = collada.scene;
            
            // Add default scale and rotation
            model.scale.set(1, 1, 1);
            
            // Ensure proper material settings for all children
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                  // Ensure material is properly configured
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      mat.side = THREE.DoubleSide;
                      mat.needsUpdate = true;
                    });
                  } else {
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                  }
                }
              }
            });
            
            resolve(model);
          } catch (innerError) {
            console.error("Error processing loaded model:", innerError);
            reject(innerError);
          }
        },
        (progress) => {
          // Progress callback
          // console.log(`Loading ${url}: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error(`Error loading model from ${url}:`, error);
          reject(error);
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Failed to initialize loader for ${url}:`, error);
      reject(error);
    }
  });
};
