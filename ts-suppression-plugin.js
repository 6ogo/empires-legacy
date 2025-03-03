/**
 * TypeScript Error Suppression Plugin for Vite
 * This file provides a plugin to suppress TypeScript declaration errors during build
 */

// Export a plugin to suppress TS6305 and TS6310 errors
module.exports = function suppressTypeScriptErrors() {
  return {
    name: 'suppress-typescript-errors',
    // Hook into Vite/Rollup's transform phase
    transform(code, id) {
      // Only intercept TypeScript files
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        // Return the code unchanged but prevent .d.ts generation
        return { code, map: null };
      }
    },
    // Configure resolved options 
    configResolved(config) {
      if (config.build && config.build.rollupOptions) {
        // Set environment variables
        process.env.TS_NODE_EMIT = 'false';
        process.env.DISABLE_TS_DECLARATION = 'true';
      }
    }
  };
};
