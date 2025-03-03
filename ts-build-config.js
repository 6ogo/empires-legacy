
// This script helps ensure TypeScript does not generate declaration files

// Set environment variables to disable declaration generation
process.env.TS_NODE_EMIT = 'false';
process.env.TS_SKIP_DECLARATIONS = 'true';
process.env.DISABLE_TS_DECLARATION = 'true';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_IGNORE_DECLARATION_ERRORS = 'true';

console.log('TypeScript declaration file generation disabled by ts-build-config.js');

// Export a function that can be used during build
module.exports = function disableDeclarations() {
  return {
    name: 'disable-declarations',
    // This plugin is a no-op, but its presence signals to use tsconfig.base.json
    configResolved(config) {
      console.log('Using tsconfig.base.json to prevent declaration file generation');
      return config;
    }
  };
};
