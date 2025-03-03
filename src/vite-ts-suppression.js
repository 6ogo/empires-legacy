
// This file contains TypeScript declaration suppression logic for Vite
// ESM export instead of CommonJS to fix build errors

/**
 * Plugin to suppress TypeScript declaration errors in Vite
 * @returns {import('vite').Plugin} Vite plugin
 */
function suppressTypeScriptDeclarationErrors() {
  return {
    name: 'suppress-typescript-declaration-errors',
    enforce: 'pre',
    
    config(config) {
      // Modify TypeScript compiler options
      if (config.esbuild) {
        config.esbuild.tsconfigRaw = JSON.stringify({
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            emitDeclarationOnly: false,
            noEmit: true,
          }
        });
      }
      
      return config;
    },
    
    // Add .no-declarations flag to the build
    configResolved(config) {
      process.env.TS_SKIP_DECLARATIONS = 'true';
      process.env.DISABLE_TS_DECLARATION = 'true';
      process.env.TS_NODE_EMIT = 'false';
      
      if (config.build) {
        config.build.sourcemap = true;
      }
    }
  };
}

// Use ESM export 
export default suppressTypeScriptDeclarationErrors;
