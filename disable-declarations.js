
/**
 * This file is used to disable TypeScript declaration file generation
 * It's referenced by the build process to ensure no .d.ts files are created
 */

process.env.TS_SKIP_DECLARATIONS = 'true';
console.log('TypeScript declaration file generation disabled');
