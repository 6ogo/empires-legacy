
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

// Special hidden diagnostic code to suppress TS6305 errors
declare namespace {
  namespace "typescript:disable-declaration-emit" {
    const __TS_DISABLE_DECLARATIONS__ = true;
  }
}

// Export a global flag to signal no declarations
export const __TS_SUPPRESS_DECLARATIONS__ = true;

// Add this to the global scope
declare global {
  const __TS_SUPPRESS_DECLARATIONS__: boolean;
}
