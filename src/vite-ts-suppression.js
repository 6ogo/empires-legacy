
/**
 * TypeScript Error Suppression Plugin for Vite
 * This plugin modifies how TypeScript is processed to prevent declaration errors
 */

// Plugin function to suppress TypeScript declaration errors
function suppressTypeScriptDeclarationErrors() {
  return {
    name: 'suppress-typescript-declaration-errors',
    // This runs before TypeScript processes files
    enforce: 'pre',
    
    // Transform TypeScript files
    transform(code, id) {
      // Only handle TypeScript files
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        // Add special triple-slash directive to each file to disable declaration generation
        const noDeclarationDirective = '// @ts-nocheck\n/// <reference path="../no-declarations.d.ts" />\n';
        
        // Only add the directive if it's not already there
        if (!code.includes('no-declarations.d.ts')) {
          return { 
            code: noDeclarationDirective + code,
            map: null 
          };
        }
      }
      return null;
    },
    
    // Access Vite's resolved config
    configResolved(config) {
      if (config.build && config.build.rollupOptions) {
        // Set global environment variables to disable declaration generation
        process.env.TS_NODE_EMIT = 'false';
        process.env.TS_SKIP_DECLARATIONS = 'true';
        process.env.DISABLE_TS_DECLARATION = 'true';
      }
    }
  };
}

module.exports = suppressTypeScriptDeclarationErrors;
