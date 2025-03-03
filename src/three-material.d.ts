
/**
 * Enhanced type definitions for Three.js material properties
 * This helps with TypeScript errors related to emissive properties
 */

import * as THREE from 'three';

declare module 'three' {
  // Base Material interface extension
  interface Material {
    // Make emissive and emissiveIntensity properties optional for all materials
    emissive?: THREE.Color;
    emissiveIntensity?: number;
    emissiveMap?: THREE.Texture | null;
  }

  // Extend specific material types that support emissive properties
  interface MeshPhongMaterial {
    emissive: THREE.Color;
    emissiveIntensity: number;
    emissiveMap: THREE.Texture | null;
  }

  interface MeshStandardMaterial {
    emissive: THREE.Color;
    emissiveIntensity: number;
    emissiveMap: THREE.Texture | null;
  }

  // Add other materials that might have emissive properties
  interface MeshPhysicalMaterial {
    emissive: THREE.Color;
    emissiveIntensity: number;
    emissiveMap: THREE.Texture | null;
  }

  interface MeshToonMaterial {
    emissive: THREE.Color;
    emissiveIntensity: number;
    emissiveMap: THREE.Texture | null;
  }
}

// Export an empty object to make this a module
export {};
