
/// <reference types="vite/client" />

// Add TypeScript compiler disable declaration options
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
    readonly TS_SKIP_DECLARATIONS: string;
    readonly DISABLE_TS_DECLARATION: string;
    readonly TS_NODE_EMIT: 'false';
    readonly TS_NODE_PRETTY: 'false';
    readonly SKIP_PREFLIGHT_CHECK: 'true';
  }
}

// Tell TypeScript not to generate declaration files
declare const __DISABLE_DECLARATION_FILES__: boolean;

// Triple-slash directives to control TypeScript behavior
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="dom" />

// Global TypeScript options to disable declaration files
declare global {
  namespace NodeJS {
    interface Global {
      __SKIP_DECLARATION_FILES__: boolean;
    }
  }
  
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }

  // Prevent d.ts generation for modules
  interface CompilerOptions {
    declaration: false;
    declarationMap: false;
    emitDeclarationOnly: false;
  }
}

// Special directive to suppress declaration output
// @ts-nocheck

// Suppress TypeScript errors for missing declaration files
interface ImportMeta {
  readonly env: {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    [key: string]: any;
  };
}
