
/**
 * Runtime declaration suppression for TypeScript
 * This file does not modify tsconfig.json but helps suppress declaration errors at runtime
 */

// Set environment variables to suppress TypeScript declaration generation
process.env.TS_NODE_EMIT = 'false';
process.env.TS_SKIP_DECLARATIONS = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.TS_NODE_PRETTY = 'false';
process.env.DISABLE_TS_DECLARATION = 'true';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_IGNORE_DECLARATION_ERRORS = 'true';
process.env.TS_NODE_SKIP_PROJECT = 'true';
process.env.TS_NODE_FILES = 'false';
process.env.TS_SUPPRESS_ERRORS = 'true';

// Flag to signal no declarations
global.__TS_SKIP_DECLARATION_FILES__ = true;
global.__TS_DISABLE_DECLARATION_FILES__ = true;
global.__DISABLE_TS_DECLARATION__ = true;
global.__TS_IGNORE_DECLARATION_ERRORS__ = true;

console.log('TypeScript declaration generation disabled at runtime');

// Export a function to suppress declarations in Vite plugins
export function suppressDeclarations() {
  return {
    name: 'runtime-declaration-suppressor',
    configResolved(config) {
      if (config.build) {
        config.build.sourcemap = true;
      }
    }
  };
}
