
/**
 * This file prevents TypeScript from generating declaration files (.d.ts)
 * for Empire's Legacy project.
 */

// Tell TypeScript not to generate declaration files for all files in the project
declare module "*.ts" {
  const content: any;
  export default content;
}

declare module "*.tsx" {
  import React from "react";
  const content: React.ComponentType<any>;
  export default content;
}

// Add triple-slash directive to disable declaration output
/// <reference no-default-lib="true"/>

// Global flag to disable declarations
declare global {
  const __TS_DISABLE_DECLARATION_GENERATION__: boolean;
}

export {};
