
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { toast } from 'sonner';

// Cache to prevent loading the same model multiple times
const modelCache = new Map<string, THREE.Object3D>();

/**
 * Loads a 3D model from the given URL
 * Supports Collada (.dae) and GLTF/GLB formats
 */
export const loadModel = (url: string): Promise<THREE.Object3D> => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (modelCache.has(url)) {
      const cachedModel = modelCache.get(url);
      if (cachedModel) {
        // Return a clone of the cached model to prevent modifications affecting the cache
        resolve(cachedModel.clone());
        return;
      }
    }

    // Determine loader based on file extension
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (extension === 'dae') {
      // Load Collada model
      const loader = new ColladaLoader();
      
      loader.load(
        url,
        (collada) => {
          const model = collada.scene;
          
          // Apply some standard optimizations
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              
              // Enable shadows
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              
              // Ensure materials are properly configured
              if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                
                materials.forEach((material) => {
                  // Enable basic material features
                  material.side = THREE.DoubleSide;
                  material.needsUpdate = true;
                });
              }
            }
          });
          
          // Center and normalize the model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          // Center the model
          model.position.sub(center);
          
          // Scale to a consistent size (1 unit tall)
          const scale = 1 / Math.max(size.x, size.y, size.z);
          model.scale.multiplyScalar(scale);
          
          // Cache the model for future use
          modelCache.set(url, model.clone());
          
          resolve(model);
        },
        (xhr) => {
          // Progress callback (optional)
          console.log(`${url}: ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
        },
        (error) => {
          console.error(`Error loading Collada model ${url}:`, error);
          reject(error);
        }
      );
    } else if (extension === 'gltf' || extension === 'glb') {
      // Load GLTF model
      const loader = new GLTFLoader();
      
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          
          // Apply standard optimizations (similar to Collada)
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          
          // Center and normalize
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          model.position.sub(center);
          
          const scale = 1 / Math.max(size.x, size.y, size.z);
          model.scale.multiplyScalar(scale);
          
          // Cache the model
          modelCache.set(url, model.clone());
          
          resolve(model);
        },
        (xhr) => {
          console.log(`${url}: ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
        },
        (error) => {
          console.error(`Error loading GLTF model ${url}:`, error);
          reject(error);
        }
      );
    } else {
      // Unsupported format
      const error = new Error(`Unsupported model format: ${extension}`);
      console.error(error);
      reject(error);
    }
  });
};

/**
 * Preloads a list of models to have them ready in cache
 */
export const preloadModels = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(url => 
      loadModel(url).catch(error => {
        console.warn(`Failed to preload model ${url}:`, error);
        return null;
      })
    ));
    console.log('Models preloaded successfully');
  } catch (error) {
    console.error('Error preloading models:', error);
    toast.error('Some game assets could not be loaded');
  }
};

/**
 * Clears the model cache to free memory
 */
export const clearModelCache = (): void => {
  modelCache.clear();
  console.log('Model cache cleared');
};
