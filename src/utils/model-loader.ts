
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

// Asset cache to prevent loading the same model multiple times
const modelCache = new Map();

// Load a 3D model and cache it
export const loadModel = async (modelType: string) => {
  // If model is already cached, return it
  if (modelCache.has(modelType)) {
    return modelCache.get(modelType).clone();
  }
  
  // Placeholder model for testing
  // In a real implementation, this would load actual model files
  const geometry = getGeometryForType(modelType);
  const material = getMaterialForType(modelType);
  const mesh = new THREE.Mesh(geometry, material);
  
  // Cache the model
  modelCache.set(modelType, mesh);
  
  return mesh;
};

// Get the appropriate geometry based on model type
const getGeometryForType = (type: string) => {
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
    default:
      return new THREE.BoxGeometry(0.2, 0.2, 0.2);
  }
};

// Get the appropriate material based on model type
const getMaterialForType = (type: string) => {
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
    default:
      return new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
  }
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
    position: { x: 0, y: 0, z: 0 }
  }));
};

// Create a visual highlight effect
export const createHighlightEffect = (scene: THREE.Scene, position: THREE.Vector3, color: string = '#FFFFFF') => {
  // Create a expanding ring effect
  const geometry = new THREE.RingGeometry(0.2, 0.3, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  ring.position.y += 0.1;
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
  
  // Animate the ring
  let scale = 1;
  let opacity = 0.7;
  
  const animate = () => {
    scale += 0.05;
    opacity -= 0.02;
    
    ring.scale.set(scale, scale, scale);
    material.opacity = opacity;
    
    if (opacity <= 0) {
      scene.remove(ring);
      ring.geometry.dispose();
      material.dispose();
      return;
    }
    
    requestAnimationFrame(animate);
  };
  
  animate();
};
