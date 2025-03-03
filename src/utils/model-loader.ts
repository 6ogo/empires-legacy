
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
                      
                      // Add emissiveIntensity only if it's a material that supports it
                      if ('emissive' in mat) {
                        const phongMat = mat as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
                        if ('emissiveIntensity' in phongMat) {
                          phongMat.emissiveIntensity = 0.5;
                        }
                      }
                    });
                  } else {
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                    
                    // Add emissiveIntensity only if it's a material that supports it
                    if ('emissive' in child.material) {
                      const phongMat = child.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
                      if ('emissiveIntensity' in phongMat) {
                        phongMat.emissiveIntensity = 0.5;
                      }
                    }
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

// Functions that Hex3DRenderer is trying to import
export const getTerritoryModel = (terrain: string, building: string | null): string => {
  // Return the appropriate model path based on terrain and building
  if (building) {
    switch(building) {
      case 'fortress': return '/models/fortress.dae';
      case 'barracks': return '/models/barracks.dae';
      case 'farm': return '/models/farm.dae';
      case 'market': return '/models/market.dae';
      case 'mine': return '/models/mine.dae';
      case 'watchtower': return '/models/watchtower.dae';
      case 'lumbermill': return '/models/lumbermill.dae';
      case 'castle': return '/models/castle.dae';
      default: return '/models/base.dae';
    }
  }
  
  // Return terrain-based model if no building
  switch(terrain) {
    case 'mountains': return '/models/mountain.dae';
    case 'forest': return '/models/forest.dae';
    default: return '/models/base.dae';
  }
};

export const createHighlightEffect = (mesh: THREE.Mesh): { update: (time: number) => void } => {
  // Create a pulsing highlight effect
  const originalMaterial = mesh.material;
  const highlightMaterial = Array.isArray(originalMaterial) 
    ? originalMaterial.map(m => m.clone()) 
    : originalMaterial.clone();
    
  // Set up the update function
  const update = (time: number) => {
    const pulseFactor = Math.sin(time * 3) * 0.1 + 0.9; // Pulse between 0.8 and 1.0
    
    if (Array.isArray(highlightMaterial)) {
      highlightMaterial.forEach(material => {
        // Check if the material has emissive properties
        if ('emissive' in material && 'emissiveIntensity' in material) {
          const phongMat = material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
          phongMat.emissiveIntensity = pulseFactor;
        }
      });
    } else if (highlightMaterial) {
      // Check if the material has emissive properties
      if ('emissive' in highlightMaterial && 'emissiveIntensity' in highlightMaterial) {
        const phongMat = highlightMaterial as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
        phongMat.emissiveIntensity = pulseFactor;
      }
    }
  };
  
  return { update };
};
