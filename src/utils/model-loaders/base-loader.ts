
import * as THREE from 'three';

// Create a cache for loaded models to avoid reloading the same model multiple times
export const modelCache = new Map<string, THREE.Group>();

// Create a placeholder model for when loading fails
export const createPlaceholderModel = (modelType: string): THREE.Group => {
  const group = new THREE.Group();
  
  // Create a simple colored cube as a placeholder
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  
  // Choose color based on model type
  let color = 0xff0000; // Default red
  
  if (modelType.includes('forest')) {
    color = 0x00ff00; // Green for forest-related models
  } else if (modelType.includes('mountain')) {
    color = 0x8B4513; // Brown for mountain-related models
  } else if (modelType.includes('farm') || modelType.includes('mill')) {
    color = 0xFFD700; // Gold for buildings
  } else if (modelType.includes('barracks') || modelType.includes('fortress')) {
    color = 0xA9A9A9; // Gray for military buildings
  }
  
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  
  // Add a wireframe to make it clear this is a placeholder
  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  
  mesh.add(wireframe);
  group.add(mesh);
  
  return group;
};

// Export a type for model loaders
export type ModelLoader = (path: string) => Promise<THREE.Group>;
