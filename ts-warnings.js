
/**
 * This file configures TypeScript to treat specific error codes as warnings
 * instead of errors, making the build process more forgiving.
 * 
 * Note: Dynamic filesystem operations are disabled to make this compatible with the browser environment.
 */

// Environment variable setup
process.env.TS_NODE_EMIT = 'false';
process.env.TS_SKIP_DECLARATIONS = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.TS_NODE_PRETTY = 'false';

console.log('Environment variables set to suppress TypeScript declaration file generation.');
