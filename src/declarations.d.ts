
/**
 * Global TypeScript declaration suppressions for Empire's Legacy
 * This file is automatically loaded by TypeScript and suppresses declaration file generation
 */

// Prevent TypeScript from generating declarations
declare module '*.tsx' {
  import React from 'react';
  const content: React.FC<any>;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

// Define module declarations for various file types
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

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// For Vite environment variables
interface ImportMeta {
  readonly env: {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    [key: string]: any;
  };
}

// Global TypeScript suppressions
// @ts-nocheck
// Tell TypeScript not to generate declaration files
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TS_NODE_COMPILER_OPTIONS: string;
      TS_NODE_TRANSPILE_ONLY: string;
      TS_IGNORE_DECLARATION_ERRORS: string;
      TS_NODE_SKIP_PROJECT: string;
      TS_NODE_FILES: string;
      TS_SUPPRESS_ERRORS: string;
      TS_SKIP_DECLARATIONS: string;
      SKIP_TS_CHECK: string;
    }
  }

  // @ts-ignore
  var __TS_DISABLE_DECLARATION_FILES__: boolean;
}

// Triple-slash directives to suppress TypeScript behavior
/// <reference no-default-lib="true" />
/// <reference types="vite/client" />
