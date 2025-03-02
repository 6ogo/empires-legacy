
import * as THREE from 'three';
import { modelCache, createPlaceholderModel } from './model-loaders/base-loader';
import { loadColladaModelWithCache } from './model-loaders/collada-loader';
import { loadGLTFModelWithCache } from './model-loaders/gltf-loader';
import { createHighlightEffect, createPulsingHighlight, animatePulsingHighlight } from './model-loaders/effects';

// Load a 3D model and cache it
export const loadModel = async (modelType: string) => {
  // If model is already cached, return a clone
  if (modelCache.has(modelType)) {
    return modelCache.get(modelType).clone();
  }
  
  let model;
  
  try {
    // First try to load actual model files
    if (modelType === 'base') {
      model = await loadColladaModelWithCache('/models/base.dae');
    } else if (modelType === 'plains') {
      model = await loadColladaModelWithCache('/models/plains.dae');
    } else if (modelType === 'mountains') {
      model = await loadColladaModelWithCache('/models/mountain.dae');
    } else if (modelType === 'forests') {
      model = await loadColladaModelWithCache('/models/forest.dae');
    } else if (modelType === 'coast') {
      model = await loadColladaModelWithCache('/models/coast.dae');
    } else if (modelType === 'capital') {
      model = await loadColladaModelWithCache('/models/castle.dae');
    } else if (modelType === 'lumberMill') {
      model = await loadColladaModelWithCache('/models/lumbermill.dae');
    } else if (modelType === 'mine') {
      model = await loadColladaModelWithCache('/models/mine.dae');
    } else if (modelType === 'farm') {
      model = await loadColladaModelWithCache('/models/farm.dae');
    } else if (modelType === 'market') {
      model = await loadColladaModelWithCache('/models/market.dae');
    } else if (modelType === 'barracks') {
      model = await loadColladaModelWithCache('/models/barracks.dae');
    } else if (modelType === 'fortress') {
      model = await loadColladaModelWithCache('/models/fortress.dae');
    } else if (modelType === 'soldier') {
      // Add a simple soldier representation if needed
      model = createPlaceholderModel('soldier');
    } else {
      // Fallback to placeholder geometry if model not found
      model = createPlaceholderModel(modelType);
    }
  } catch (error) {
    console.warn(`Failed to load model for ${modelType}, using placeholder:`, error);
    model = createPlaceholderModel(modelType);
  }
  
  // Cache the model
  modelCache.set(modelType, model);
  
  return model.clone();
};

// Helper function to determine territory model type
export const getTerritoryModel = (territory: any) => {
  return territory.type || 'plains';
};

// Helper function to get building models for a territory
export const getBuildingModels = (territory: any) => {
  if (!territory.buildings || territory.buildings.length === 0) {
    return [];
  }
  
  // In a real implementation, this would map building IDs to actual models
  return territory.buildings.map((building: any) => ({
    type: typeof building === 'object' ? building.type : 'lumberMill',
    position: { x: 0, y: 0.12, z: 0 } // Position on top of the hex
  }));
};

// Export all the effects
export { createHighlightEffect, createPulsingHighlight, animatePulsingHighlight };
