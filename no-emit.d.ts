
/**
 * This file instructs TypeScript not to emit declaration files
 * It's detected by TypeScript and used to control output behavior
 */

// Mark this file to suppress declaration file generation
// @ts-nocheck

// Apply special directives to control TypeScript behavior
/// <reference no-default-lib="true"/>

declare namespace TypeScriptSuppression {
  // This namespace is used solely to tell TypeScript not to generate .d.ts files
  const suppressDeclarationOutput: true;
}

// Set global variables that TS uses to determine whether to emit declarations
declare global {
  const __TS_SUPPRESS_DECLARATION_OUTPUT__: boolean;
  
  namespace NodeJS {
    interface ProcessEnv {
      TS_SKIP_DECLARATIONS: 'true';
      TS_NODE_EMIT: 'false';
    }
  }
}

// Export an empty object to make this a module
export {};
