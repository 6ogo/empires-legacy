// ================================================
// File: src/utils/model-loaders/base-loader.ts
// ================================================

import * as THREE from 'three';

// Create a cache for loaded models to avoid reloading the same model multiple times
export const modelCache = new Map<string, THREE.Group>();

// Create a placeholder model for when loading fails
export const createPlaceholderModel = (modelType: string): THREE.Group => {
  const group = new THREE.Group();

  // Create a simple colored cube as a placeholder
  const geometry = new THREE.BoxGeometry(0.5, 0.8, 0.5); // Taller cube for visibility

  // Choose color based on model type
  let color = 0xff0000; // Default red

  if (modelType.includes('forest')) {
    color = 0x228B22; // Forest green
  } else if (modelType.includes('mountain')) {
    color = 0x8B4513; // Brown
  } else if (modelType.includes('farm')) {
    color = 0xFFD700; // Gold
  } else if (modelType.includes('mill')) {
    color = 0xDEB887; // Burlywood
  } else if (modelType.includes('barracks')) {
    color = 0x708090; // Slate gray
  } else if (modelType.includes('fortress') || modelType.includes('castle')) {
    color = 0xA9A9A9; // Dark gray
  } else if (modelType.includes('base') || modelType.includes('plains')) {
      color = 0x90EE90; // Light green for base/plains
  }

  const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Optional: Add a wireframe outline for clarity
  // const wireframe = new THREE.LineSegments(
  //   new THREE.EdgesGeometry(geometry),
  //   new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
  // );
  // mesh.add(wireframe);

  group.add(mesh);
  console.log(`Created placeholder model for type: ${modelType}`); // Debug log
  return group;
};

// Function to get territory model type based on territory data
// Keep this logic consistent with HexGrid3D's getModelPath logic
export const getTerritoryModel = (territory: any): string => {
  if (!territory) return 'base'; // Default model name

  // Determine model based on terrain type
  const terrain = territory.terrain || 'plains';

  if (terrain === 'mountains') return 'mountain';
  if (terrain === 'forest') return 'forest';

  // Check for buildings - map building type to model name if different
  if (territory.building) {
    // Example mapping (adjust based on your actual model names)
    const buildingModelMap: { [key: string]: string } = {
        fortress: 'fortress',
        farm: 'farm',
        mine: 'mine',
        lumbermill: 'lumbermill',
        market: 'market',
        barracks: 'barracks',
        watchtower: 'watchtower',
        castle: 'castle',
        // Add other building types and their corresponding model names
    };
    return buildingModelMap[territory.building] || 'base'; // Fallback if building type unknown
  }

  // Fallback to base model if no specific terrain or building model applies
  return 'base';
};


// Export a type for model loaders
export type ModelLoader = (path: string) => Promise<THREE.Group>;