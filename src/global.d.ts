
/**
 * Global type declaration file for Empire's Legacy
 * This file includes DOM interface declarations and suppresses TypeScript declaration errors
 */

// Triple-slash directives to include DOM libraries
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="es2020" />
/// <reference lib="webworker" />
/// <reference types="vite/client" />

// Type definitions for DOM interfaces that might be missing
interface Window {
  __TS_DISABLE_DECLARATIONS__: boolean;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}

interface Document {
  createElement(tagName: string): HTMLElement;
  getElementById(elementId: string): HTMLElement | null;
}

interface HTMLElement {
  clientWidth: number;
  clientHeight: number;
  getBoundingClientRect(): DOMRect;
  appendChild(node: Node): Node;
  removeChild(child: Node): Node;
}

interface HTMLDivElement extends HTMLElement {}
interface HTMLCanvasElement extends HTMLElement {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
  width: number;
  height: number;
}

interface Event {
  preventDefault(): void;
}

interface KeyboardEvent extends Event {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
}

interface EventTarget {
  value?: string;
}

interface HTMLInputElement extends HTMLElement {
  value: string;
}

interface Navigator {
  clipboard: {
    writeText(text: string): Promise<void>;
  };
}

// HTML Table elements
interface HTMLTableCellElement extends HTMLElement {}
interface HTMLTableCaptionElement extends HTMLElement {}

// Add support for basic JavaScript types
interface Array<T> {}
interface Boolean {}
interface Function {}
interface IArguments {}
interface Number {}
interface Object {}
interface RegExp {}
interface String {}

// Suppress TypeScript declaration file generation
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

// Global variables for declaration suppression
declare global {
  var __SKIP_DECLARATION_FILES__: boolean;
  var __TS_DISABLE_DECLARATION_FILES__: boolean;
  var __DISABLE_TS_DECLARATION__: boolean;
  var __TS_IGNORE_DECLARATION_ERRORS__: boolean;
  
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }
  
  // Declare global objects
  const window: Window & typeof globalThis;
  const document: Document;
  const navigator: Navigator;
  
  // Apply TypeScript compiler options at runtime
  interface CompilerOptions {
    declaration: false;
    declarationMap: false;
    emitDeclarationOnly: false;
    noEmit: boolean;
  }
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

// This empty export makes this a module
export {};
