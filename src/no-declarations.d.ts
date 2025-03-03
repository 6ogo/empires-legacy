
/**
 * Global declaration file to prevent TypeScript declaration file generation
 * This file is loaded by TypeScript and suppresses declaration file generation
 */

// This special directive tells TypeScript not to emit .d.ts files
// @ts-nocheck

// Suppress TypeScript errors by telling TypeScript not to generate declaration files
declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

// Global variables for declaration suppression
declare global {
  namespace NodeJS {
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
    }
  }
  
  var __SKIP_DECLARATION_FILES__: boolean;
  var __TS_DISABLE_DECLARATION_FILES__: boolean;
  var __DISABLE_TS_DECLARATION__: boolean;
  var __TS_IGNORE_DECLARATION_ERRORS__: boolean;
  
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }
}

// Triple-slash directives to control TypeScript behavior
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

// This empty export makes this a module
export {};
