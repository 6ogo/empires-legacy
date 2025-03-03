
/**
 * Enhanced type definitions for Three.js material properties
 * This helps with TypeScript errors related to emissive properties
 */

import * as THREE from 'three';

declare module 'three' {
  interface Material {
    // Make emissive and emissiveIntensity properties optional for all materials
    emissive?: THREE.Color;
    emissiveIntensity?: number;
  }

  // Extend specific material types with required emissive properties
  interface MeshPhongMaterial {
    emissive: THREE.Color;
    emissiveIntensity: number;
  }

  interface MeshStandardMaterial {
    emissive: THREE.Color;
    emissiveIntensity: number;
  }
}

// Export an empty object to make this a module
export {};
