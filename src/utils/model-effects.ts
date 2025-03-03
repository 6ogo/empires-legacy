
import * as THREE from 'three';

/**
 * Adds emissive highlight effect to a mesh
 * @param mesh The mesh to highlight
 * @param color The highlight color
 * @returns The update function to animate the highlight
 */
export const createEmissiveHighlight = (mesh: THREE.Mesh, color: THREE.Color = new THREE.Color(0x88ccff)) => {
  // Clone the original material to preserve it
  let originalMaterial: THREE.Material | THREE.Material[] | null = null;
  
  // Store original material for reset
  if (mesh.material) {
    originalMaterial = Array.isArray(mesh.material) 
      ? mesh.material.map(m => m.clone()) 
      : mesh.material.clone();
  }
  
  // Set emissive color on materials
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => {
        // Type guard to check if material has emissive property
        if ('emissive' in mat) {
          // Type assertion to access emissive properties
          const emissiveMat = mat as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
          emissiveMat.emissive = color.clone();
          if ('emissiveIntensity' in emissiveMat) {
            emissiveMat.emissiveIntensity = 0.6;
          }
        }
      });
    } else if ('emissive' in mesh.material) {
      // Type assertion to access emissive properties
      const emissiveMat = mesh.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
      emissiveMat.emissive = color.clone();
      if ('emissiveIntensity' in emissiveMat) {
        emissiveMat.emissiveIntensity = 0.6;
      }
    }
  }
  
  // Animation update function
  const update = (time: number) => {
    if (mesh.material) {
      const pulseFactor = Math.sin(time * 3) * 0.2 + 0.8; // Pulse between 0.6 and 1.0
      
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => {
          // Type guard for materials with emissive properties
          if ('emissiveIntensity' in mat) {
            // Type assertion to access emissiveIntensity
            const emissiveMat = mat as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
            emissiveMat.emissiveIntensity = pulseFactor;
          }
        });
      } else if ('emissiveIntensity' in mesh.material) {
        // Type assertion to access emissiveIntensity
        const emissiveMat = mesh.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
        emissiveMat.emissiveIntensity = pulseFactor;
      }
    }
  };
  
  // Reset function to restore original material
  const reset = () => {
    if (originalMaterial) {
      mesh.material = originalMaterial;
    }
  };
  
  return { update, reset };
};
