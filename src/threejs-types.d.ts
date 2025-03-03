
/**
 * This file contains type declarations for Three.js modules
 * to prevent TypeScript from generating declaration files for them
 */

// Define GLTFLoader module
declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import { Object3D, LoadingManager } from 'three';
  
  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string, 
      onLoad: (gltf: { scene: Object3D }) => void, 
      onProgress?: (event: ProgressEvent) => void, 
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
      data: ArrayBuffer | string, 
      path: string, 
      onLoad: (gltf: { scene: Object3D }) => void, 
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

// Define ColladaLoader module
declare module 'three/examples/jsm/loaders/ColladaLoader.js' {
  import { Object3D, Group, LoadingManager } from 'three';
  
  export class ColladaLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string, 
      onLoad: (collada: { scene: Object3D | Group }) => void, 
      onProgress?: (event: ProgressEvent) => void, 
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

// Triple-slash reference directives to indicate this is a declaration file
/// <reference types="three" />
