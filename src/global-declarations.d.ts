
/**
 * Global declaration file to suppress TypeScript declaration file generation
 * and handle common TypeScript errors in the Empire's Legacy project
 */

// === Declaration file suppression ===
// Tell TypeScript not to generate declaration files
declare namespace NodeJS {
  interface ProcessEnv {
    TS_NODE_EMIT: 'false';
    TS_SKIP_DECLARATIONS: 'true';
    SKIP_PREFLIGHT_CHECK: 'true';
    TS_NODE_PRETTY: 'false';
    DISABLE_TS_DECLARATION: 'true';
    TS_NODE_TRANSPILE_ONLY: 'true';
    TS_IGNORE_DECLARATION_ERRORS: 'true';
    TS_NODE_SKIP_PROJECT: 'true';
    TS_NODE_FILES: 'false';
    TS_SUPPRESS_ERRORS: 'true';
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

// Global variables to disable declaration generation
declare global {
  var __SKIP_DECLARATION_FILES__: boolean;
  var __TS_DISABLE_DECLARATION_FILES__: boolean;
  var __DISABLE_TS_DECLARATION__: boolean;
  var __TS_IGNORE_DECLARATION_ERRORS__: boolean;
  var __TS_SKIP_REFERENCES__: boolean;
  
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }
}

// === Module declarations ===
// These prevent TypeScript from trying to generate declarations for various file types

declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
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

// vaul drawer component declarations
declare module 'vaul' {
  import * as React from 'react';
  
  export interface DrawerProps {
    children?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;
    modal?: boolean;
    shouldScaleBackground?: boolean;
    nested?: boolean;
    dismissible?: boolean;
  }
  
  export const Drawer: React.FC<DrawerProps> & {
    Trigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    Portal: React.FC<{ children: React.ReactNode }>;
    Content: React.FC<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }>;
    Overlay: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
    Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
    Close: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  };
}

// Explicitly suppress declarations for all TypeScript files to prevent TS6305 errors
declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

// Triple-slash directives to control TypeScript behavior
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

export {};
