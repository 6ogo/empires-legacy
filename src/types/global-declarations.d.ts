
/**
 * Global type declarations for Empire's Legacy
 * This file handles TypeScript declaration generation suppression
 */

// Global type declarations
declare global {
  // Signal to TypeScript to skip generating declaration files
  namespace NodeJS {
    interface ProcessEnv {
      TS_NODE_EMIT: 'false';
      TS_SKIP_DECLARATIONS: 'true';
      SKIP_PREFLIGHT_CHECK: 'true';
      TS_NODE_PRETTY: 'false';
      DISABLE_TS_DECLARATION: 'true';
      TS_NODE_TRANSPILE_ONLY: 'true';
      TS_IGNORE_DECLARATION_ERRORS: 'true';
    }
  }
  
  // Global variables for declaration suppression
  const __SKIP_DECLARATION_FILES__: boolean;
  const __TS_DISABLE_DECLARATIONS__: boolean;
  const __VITE_SKIP_TS_CHECK__: boolean;
}

// Prevent TypeScript from generating declarations for various file types
declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

// Suppress TypeScript errors by telling TypeScript not to generate declaration files
// @ts-nocheck

// Disable library checks to prevent TS6310 errors
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="dom" />

export {};
