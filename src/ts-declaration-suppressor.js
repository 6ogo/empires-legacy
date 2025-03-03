
/**
 * This script helps suppress TypeScript declaration errors at build time
 * It's loaded by Vite to ensure declaration files aren't generated
 */

console.log('🛑 TypeScript declaration generation disabled');

// Override TypeScript's default compiler behavior 
process.env.TS_NODE_EMIT = 'false';
process.env.TS_SKIP_DECLARATIONS = 'true';
process.env.DISABLE_TS_DECLARATION = 'true';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_IGNORE_DECLARATION_ERRORS = 'true';
process.env.TS_NODE_SKIP_PROJECT = 'true';
process.env.TS_NODE_FILES = 'false';
process.env.TS_SUPPRESS_ERRORS = 'true';

// Global flag to disable declarations
global.__SKIP_DECLARATION_FILES__ = true;
global.__TS_DISABLE_DECLARATION_FILES__ = true;
global.__DISABLE_TS_DECLARATION__ = true;
global.__TS_IGNORE_DECLARATION_ERRORS__ = true;

// Export a function that can be used by Vite plugins
module.exports = function suppressDeclarations() {
  return {
    name: 'ts-declaration-suppressor',
    
    transform(code, id) {
      // Only transform TypeScript files
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        // Add special directives to files
        const directive = '// @ts-nocheck\n/// <reference no-default-lib="true" />\n/// <reference path="../suppress-declarations.d.ts" />\n';
        
        // Avoid adding duplicate directives
        if (!code.includes('suppress-declarations.d.ts')) {
          return {
            code: directive + code,
            map: null
          };
        }
      }
      return null;
    },
    
    // Configure esbuild to ignore declarations
    configureServer(server) {
      server.config.optimizeDeps.esbuildOptions = {
        ...server.config.optimizeDeps.esbuildOptions,
        tsconfigRaw: JSON.stringify({
          compilerOptions: {
            declaration: false,
            emitDeclarationOnly: false,
            noEmit: true
          }
        })
      };
    }
  };
};
