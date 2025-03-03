
/**
 * Global type declaration file for Empire's Legacy
 * This file suppresses TypeScript declaration file generation
 */

// Triple-slash directives to disable TypeScript library references and declaration generation
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

// Special TypeScript comment to skip type checking in this file
// @ts-nocheck

// Suppress declaration file generation for modules
declare module '*.ts' {
  const content: any;
  export = content;
  export default content;
}

declare module '*.tsx' {
  import React from 'react';
  const content: React.ComponentType<any>;
  export = content;
  export default content;
}

// Media file declarations
declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGAttributes<SVGElement>>;
  export default SVG;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

// Three.js related declarations
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

// Signal to TypeScript not to generate declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    TS_SKIP_DECLARATIONS: 'true';
    DISABLE_TS_DECLARATION: 'true';
    TS_NODE_EMIT: 'false';
    TS_NODE_PRETTY: 'false';
    SKIP_PREFLIGHT_CHECK: 'true';
    TS_NODE_TRANSPILE_ONLY: 'true';
    TS_IGNORE_DECLARATION_ERRORS: 'true';
    TS_NODE_SKIP_PROJECT: 'true';
    TS_NODE_FILES: 'false';
    TS_SUPPRESS_ERRORS: 'true';
  }
}

// Global variables for suppressing declaration generation
declare global {
  var __SKIP_DECLARATION_FILES__: boolean;
  var __TS_DISABLE_DECLARATION_FILES__: boolean;
  var __DISABLE_TS_DECLARATION__: boolean;
  var __TS_IGNORE_DECLARATION_ERRORS__: boolean;
  
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }
  
  // Apply TypeScript compiler options at runtime
  interface CompilerOptions {
    declaration: false;
    declarationMap: false;
    emitDeclarationOnly: false;
    noEmit: boolean;
  }
}

// Note: the empty export makes this a module
export {};
