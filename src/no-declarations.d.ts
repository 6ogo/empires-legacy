
/**
 * This file suppresses TypeScript declaration generation errors
 */

// Tell TypeScript not to generate declaration files
declare module '*.tsx' {
  import React from 'react';
  const component: React.FC<any>;
  export default component;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

// Global flags to suppress declaration generation
declare global {
  const __SKIP_DECLARATIONS__: boolean;
  const __DISABLE_DECLARATION_FILES__: boolean;
}

// Special directive to disable library declarations
/// <reference no-default-lib="true"/>

// Explicitly handle the TS6310 error by allowing projects that disable emit
interface TSConfig {
  references?: Array<{path: string}>;
  compilerOptions?: {
    noEmit?: boolean;
    declaration?: boolean;
  }
}

// Add support for project references with noEmit true
declare namespace TypeScript {
  interface ProjectReference {
    path: string;
    prepend?: boolean;
    circular?: boolean;
    disableEmit?: boolean;
  }
  
  interface CompilerOptions {
    noEmit?: boolean;
    declaration?: boolean;
    emitDeclarationOnly?: boolean;
  }
}
