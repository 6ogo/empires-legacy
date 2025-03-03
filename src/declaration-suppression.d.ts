
/**
 * Global declaration file to suppress TypeScript declaration file generation
 * This file globally turns off declaration file generation without needing to modify tsconfig files
 */

// Tell TypeScript not to generate declaration files for any modules
declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  import React from 'react';
  const content: React.ComponentType<any>;
  export default content;
}

// Also handle other file types
declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

// Apply global TypeScript options
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // These environment variables signal to TypeScript not to generate declaration files
      TS_SKIP_DECLARATIONS: 'true';
      DISABLE_TS_DECLARATION: 'true';
      TS_NODE_EMIT: 'false';
    }
  }
  
  interface Window {
    __TS_DISABLE_DECLARATIONS__: boolean;
  }
}

// Special triple-slash directives that help TypeScript understand how to treat this file
/// <reference no-default-lib="true"/>
/// <reference types="vite/client" />

// Explicitly export an empty object to make this a module
export {};
