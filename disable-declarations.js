
/**
 * This file is used to disable TypeScript declaration file generation
 * It's referenced by the build process to ensure no .d.ts files are created
 */

process.env.TS_SKIP_DECLARATIONS = 'true';
process.env.DISABLE_TS_DECLARATION = 'true';
console.log('TypeScript declaration file generation disabled');

// This script will be run during build to prevent declaration files
if (process.env.NODE_ENV === 'production') {
  try {
    const fs = require('fs');
    // Create a .ts-noemit file that will signal to the TypeScript compiler not to emit declarations
    fs.writeFileSync('.ts-noemit', '// This file signals TypeScript compiler not to emit declarations');
    console.log('Created .ts-noemit file to prevent declaration generation');
  } catch (error) {
    console.error('Failed to create .ts-noemit file:', error);
  }
}
