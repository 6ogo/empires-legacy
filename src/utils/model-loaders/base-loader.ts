
import * as THREE from 'three';

// Asset cache to prevent loading the same model multiple times
export const modelCache = new Map();
export const textureLoader = new THREE.TextureLoader();

// Helper function to get the appropriate geometry based on model type
export const getGeometryForType = (type: string) => {
  switch (type) {
    case 'base':
      return new THREE.CylinderGeometry(1, 1, 0.1, 6);
    case 'plains':
      return new THREE.CylinderGeometry(1, 1, 0.1, 6);
    case 'mountains':
      return new THREE.ConeGeometry(0.8, 0.8, 6);
    case 'forests':
      return new THREE.CylinderGeometry(1, 1, 0.1, 6);
    case 'coast':
      return new THREE.CylinderGeometry(1, 1, 0.05, 6);
    case 'capital':
      return new THREE.CylinderGeometry(1, 1, 0.15, 6);
    case 'lumberMill':
      return new THREE.BoxGeometry(0.3, 0.3, 0.3);
    case 'mine':
      return new THREE.ConeGeometry(0.2, 0.4, 4);
    case 'farm':
      return new THREE.BoxGeometry(0.4, 0.2, 0.4);
    case 'market':
      return new THREE.BoxGeometry(0.3, 0.4, 0.3);
    case 'barracks':
      return new THREE.BoxGeometry(0.4, 0.3, 0.3);
    case 'fortress':
      return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    case 'soldier':
      return new THREE.CapsuleGeometry(0.1, 0.3, 4, 8);
    default:
      return new THREE.BoxGeometry(0.2, 0.2, 0.2);
  }
};

// Helper function to get the appropriate material based on model type
export const getMaterialForType = (type: string) => {
  switch (type) {
    case 'base':
      return new THREE.MeshPhongMaterial({ color: 0x666666 });
    case 'plains':
      return new THREE.MeshPhongMaterial({ color: 0x90EE90 });
    case 'mountains':
      return new THREE.MeshPhongMaterial({ color: 0xA9A9A9 });
    case 'forests':
      return new THREE.MeshPhongMaterial({ color: 0x228B22 });
    case 'coast':
      return new THREE.MeshPhongMaterial({ color: 0x87CEEB });
    case 'capital':
      return new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    case 'lumberMill':
      return new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    case 'mine':
      return new THREE.MeshPhongMaterial({ color: 0x708090 });
    case 'farm':
      return new THREE.MeshPhongMaterial({ color: 0xF5DEB3 });
    case 'market':
      return new THREE.MeshPhongMaterial({ color: 0xDAA520 });
    case 'barracks':
      return new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    case 'fortress':
      return new THREE.MeshPhongMaterial({ color: 0x696969 });
    case 'soldier':
      return new THREE.MeshPhongMaterial({ color: 0x4682B4 });
    default:
      return new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
  }
};

// Create placeholder model when actual model can't be loaded
export const createPlaceholderModel = (type: string): THREE.Group => {
  const geometry = getGeometryForType(type);
  const material = getMaterialForType(type);
  const mesh = new THREE.Mesh(geometry, material);
  
  // Setup shadow properties
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // Create a group to match the structure of loaded models
  const group = new THREE.Group();
  group.add(mesh);
  
  return group;
};
