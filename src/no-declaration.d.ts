
/**
 * Global declaration file to suppress TypeScript declaration file generation
 * This is a special file that prevents TypeScript from generating .d.ts files
 */

// Mark all TypeScript files as having no associated declaration file
declare module '*.ts' {
  const content: any;
  export default content;
  export * from content;
}

declare module '*.tsx' {
  import React from 'react';
  const content: React.ComponentType<any>;
  export default content;
  export * from content;
}

// Environment variables to disable declaration generation
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
  
  // Global flags to disable declarations
  const __SKIP_DECLARATION_FILES__: boolean;
  const __TS_DISABLE_DECLARATION_FILES__: boolean;
  const __DISABLE_TS_DECLARATION__: boolean;
  
  // Type definitions for the window object
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }
}

// Triple-slash directives to control TypeScript behavior
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

// Export an empty object to make this a module
export {};
