
import * as THREE from 'three';

// Create a highlight effect for selected objects
export const createHighlightEffect = (mesh: THREE.Mesh): { update: (time: number) => void } => {
  // Check if the mesh has a material to modify
  if (!mesh.material) {
    console.warn('Cannot create highlight effect: mesh has no material');
    return {
      update: () => {} // Return empty update function
    };
  }

  // Store original materials
  const originalMaterials = Array.isArray(mesh.material) 
    ? mesh.material.map(m => m.clone()) 
    : mesh.material.clone();
  
  // Create a pulsing effect function
  const update = (time: number) => {
    const pulseFactor = Math.sin(time * 3) * 0.1 + 0.9; // Pulse between 0.8 and 1.0
    
    try {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => {
          // We need to check if the material has emissive property (like MeshPhongMaterial, MeshStandardMaterial)
          if ('emissive' in material && material.emissive instanceof THREE.Color) {
            // TypeScript doesn't know this property exists, so we need to use type assertion
            const phongMaterial = material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
            if ('emissiveIntensity' in phongMaterial) {
              phongMaterial.emissiveIntensity = pulseFactor;
            }
          }
        });
      } else if (mesh.material) {
        // Single material
        if ('emissive' in mesh.material && mesh.material.emissive instanceof THREE.Color) {
          const phongMaterial = mesh.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
          if ('emissiveIntensity' in phongMaterial) {
            phongMaterial.emissiveIntensity = pulseFactor;
          }
        }
      }
    } catch (error) {
      console.error('Error updating highlight effect:', error);
    }
  };
  
  return { update };
};

// Create a color pulse effect
export const createColorPulseEffect = (mesh: THREE.Mesh, color: THREE.Color): { update: (time: number) => void } => {
  // Check if the mesh has a material to modify
  if (!mesh.material) {
    console.warn('Cannot create color pulse effect: mesh has no material');
    return {
      update: () => {} // Return empty update function
    };
  }

  const update = (time: number) => {
    const pulseFactor = Math.sin(time * 2) * 0.5 + 0.5; // Pulse between 0 and 1
    
    try {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => {
          if ('emissive' in material && material.emissive instanceof THREE.Color) {
            const phongMaterial = material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
            phongMaterial.emissive.copy(color).multiplyScalar(pulseFactor);
            if ('emissiveIntensity' in phongMaterial) {
              phongMaterial.emissiveIntensity = pulseFactor;
            }
          }
        });
      } else if (mesh.material) {
        if ('emissive' in mesh.material && mesh.material.emissive instanceof THREE.Color) {
          const phongMaterial = mesh.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;
          phongMaterial.emissive.copy(color).multiplyScalar(pulseFactor);
          if ('emissiveIntensity' in phongMaterial) {
            phongMaterial.emissiveIntensity = pulseFactor;
          }
        }
      }
    } catch (error) {
      console.error('Error updating color pulse effect:', error);
    }
  };
  
  return { update };
};
