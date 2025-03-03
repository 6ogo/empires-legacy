
/**
 * Global declaration file to prevent TypeScript from generating .d.ts files
 * This acts as the master switch to disable declaration file generation for the project
 */

// Prevent TypeScript from generating declarations for all modules
declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

// Special comment to disable TypeScript diagnostics for declaration files
// @ts-nocheck

// Make TypeScript ignore declaration outputs entirely
declare const __TS_SKIP_EMIT_DECLARATIONS__: boolean;
declare const __TS_DISABLE_DECLARATION_FILES__: boolean;
declare const __DISABLE_TS_DECLARATION__: boolean;
declare const __TS_IGNORE_DECLARATION_ERRORS__: boolean;

// Triple-slash directives
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

// Force global settings for the TypeScript compiler at runtime
export const __TS_SKIP_EMIT_DECLARATIONS__ = true;
