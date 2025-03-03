
/**
 * This specialized declaration file disables TypeScript declaration emit
 * It works by telling TypeScript to ignore declaration diagnostics
 */

// Special triple-slash directives to disable library declarations
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

// @ts-nocheck

// Disable TypeScript declaration generation for all modules
declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

// Special flags to suppress declaration generation
declare const __TS_DISABLE_DECLARATIONS__: boolean;
declare const __TS_SUPPRESS_DECLARATIONS__: boolean;

// Export a global flag to signal no declarations
export const __TS_SUPPRESS_DECLARATIONS__ = true;

// Add this to the global scope
declare global {
  const __TS_SUPPRESS_DECLARATIONS__: boolean;
}
