
import * as THREE from 'three';
import { loadModel } from './model-loader';
import { toast } from 'sonner';

// Create a fallback cube model in case a model fails to load
const createFallbackModel = (color = 0x777777): THREE.Object3D => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
};

// Safely load models with fallbacks and error handling
export const safeLoadModels = async (modelTypes: string[]): Promise<Record<string, THREE.Object3D>> => {
  const loadedModels: Record<string, THREE.Object3D> = {};
  
  // Predefine fallbacks for essential models
  loadedModels['base'] = createFallbackModel(0x555555);
  loadedModels['mountain'] = createFallbackModel(0x888888);
  loadedModels['forest'] = createFallbackModel(0x339933);
  
  // Try to load each model
  const loadPromises = modelTypes.map(async (modelType) => {
    try {
      const model = await loadModel(`/models/${modelType}.dae`);
      if (model) {
        loadedModels[modelType] = model;
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Failed to load model ${modelType}:`, err);
      loadedModels[modelType] = createFallbackModel();
      return false;
    }
  });
  
  // Wait for all loading attempts to complete
  const results = await Promise.allSettled(loadPromises);
  
  // Check if any critical models failed to load
  const failedCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length;
  
  if (failedCount > 0) {
    console.warn(`${failedCount} models failed to load, using fallbacks`);
    if (failedCount === modelTypes.length) {
      toast.warning('Using simplified graphics - 3D models could not be loaded');
    }
  }
  
  return loadedModels;
};

// Utility function to make type-safe model cloning
export const cloneModel = (models: Record<string, THREE.Object3D>, type: string): THREE.Object3D | null => {
  const model = models[type];
  if (!model) return null;
  
  try {
    return model.clone();
  } catch (error) {
    console.error(`Failed to clone model ${type}:`, error);
    return createFallbackModel();
  }
};
