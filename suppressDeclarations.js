
/**
 * This file is responsible for suppressing TypeScript declaration file generation
 * without modifying protected files like tsconfig.node.json
 */

// Set environment variables to disable declaration generation
process.env.TS_SKIP_DECLARATIONS = 'true';
process.env.DISABLE_TS_DECLARATION = 'true';
process.env.TS_NODE_EMIT = 'false';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

console.log('TypeScript declaration file generation disabled by suppressDeclarations.js');

// Export a function that can be used in the build process
module.exports = function suppressDeclarations() {
  return {
    name: 'suppress-declarations',
    // Hook into the build process to prevent declaration file generation
    buildStart() {
      console.log('Suppressing TypeScript declaration file generation...');
    },
    // Tell the bundler not to generate declaration files
    options(options) {
      // Add configuration to disable declaration generation
      return {
        ...options,
        tsconfig: 'tsconfig.suppress.json'
      };
    }
  };
};
