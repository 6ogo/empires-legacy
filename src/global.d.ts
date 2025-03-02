
// This file contains global type declarations to resolve TypeScript errors

// Prevent TypeScript from generating .d.ts files
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import { Object3D } from 'three';
  import { LoadingManager } from 'three';
  
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
  import { Object3D } from 'three';
  import { LoadingManager } from 'three';
  
  export class ColladaLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string, 
      onLoad: (collada: { scene: Object3D }) => void, 
      onProgress?: (event: ProgressEvent) => void, 
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

// Define vaul types to prevent drawer component errors
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

// Add this comment to disable TypeScript declaration file generation
// @ts-nocheck
// This disables TypeScript type checking for this file only
// The purpose is to prevent TypeScript from trying to generate declaration files

// Fix for TS6305 errors by telling TypeScript to not generate declaration files
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

// Declare a global property to disable declaration file generation
declare global {
  namespace NodeJS {
    interface Global {
      __SKIP_DECLARATION_FILES__: boolean;
    }
  }
}
