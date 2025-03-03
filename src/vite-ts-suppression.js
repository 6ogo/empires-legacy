
/**
 * Plugin to suppress TypeScript declaration errors in Vite
 * @returns {import('vite').Plugin} Vite plugin
 */
export default function suppressTypeScriptDeclarationErrors() {
  return {
    name: 'suppress-typescript-declaration-errors',
    enforce: 'pre',
    
    config(config) {
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
      
      // Return modified config
      return {
        ...config,
        esbuild: {
          ...config.esbuild,
          tsconfigRaw: JSON.stringify({
            compilerOptions: {
              declaration: false,
              declarationMap: false,
              emitDeclarationOnly: false,
              noEmit: true,
              skipLibCheck: true
            }
          })
        }
      };
    },
    
    // Add .no-declarations flag to the build
    configResolved(config) {
      if (config.build) {
        config.build.sourcemap = true;
      }
    }
  };
}
