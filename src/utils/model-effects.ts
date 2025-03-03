
import * as THREE from 'three';

// Create a helper file for model effects to isolate the functionality

export const createHighlightEffect = (mesh: THREE.Mesh): { update: (time: number) => void } => {
  // Create a pulsing highlight effect
  if (!mesh) {
    console.warn('Cannot create highlight effect: mesh is undefined');
    return { update: () => {} };
  }
  
  const originalMaterial = mesh.material;
  
  if (!originalMaterial) {
    console.warn('Cannot create highlight effect: material is undefined');
    return { update: () => {} };
  }
  
  const highlightMaterial = Array.isArray(originalMaterial) 
    ? originalMaterial.map(m => m.clone()) 
    : originalMaterial.clone();
    
  // Add emissive properties if they don't exist
  if (Array.isArray(highlightMaterial)) {
    highlightMaterial.forEach(material => {
      if (!material.emissive) {
        material.emissive = new THREE.Color(0xffff00);
      }
      material.emissiveIntensity = 0.5;
    });
  } else if (highlightMaterial.emissive !== undefined) {
    highlightMaterial.emissive = new THREE.Color(0xffff00);
    highlightMaterial.emissiveIntensity = 0.5;
  }
    
  // Set up the update function
  const update = (time: number) => {
    const pulseFactor = Math.sin(time * 3) * 0.1 + 0.9; // Pulse between 0.8 and 1.0
    
    if (Array.isArray(highlightMaterial)) {
      highlightMaterial.forEach(material => {
        if (material.emissiveIntensity !== undefined) {
          material.emissiveIntensity = pulseFactor;
        }
      });
    } else if (highlightMaterial.emissiveIntensity !== undefined) {
      highlightMaterial.emissiveIntensity = pulseFactor;
    }
  };
  
  return { update };
};

export const getTerrainColor = (terrain: string): THREE.Color => {
  switch(terrain) {
    case 'mountains': return new THREE.Color(0x888888); // Gray
    case 'forest': return new THREE.Color(0x228822); // Green
    case 'plains': return new THREE.Color(0x88aa44); // Light green
    default: return new THREE.Color(0xcccccc); // Light gray
  }
};
