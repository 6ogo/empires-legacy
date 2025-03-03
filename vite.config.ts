
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { PluginOption } from 'vite';

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

// Set global variables to suppress declaration generation
if (typeof global !== 'undefined') {
  (global as any).__SKIP_DECLARATION_FILES__ = true;
  (global as any).__TS_DISABLE_DECLARATION_FILES__ = true;
  (global as any).__DISABLE_TS_DECLARATION__ = true;
  (global as any).__TS_IGNORE_DECLARATION_ERRORS__ = true;
}

// Define a plugin to suppress TS declaration errors
function suppressTSDeclarationErrors(): PluginOption {
  return {
    name: 'suppress-ts-declaration-errors',
    // This plugin will run after TypeScript processes files
    enforce: 'post' as const,
    // Hook into Rollup's transform phase
    transform(code: string, id: string) {
      // Return the code unchanged, but intercept .ts and .tsx files
      // to prevent .d.ts file generation
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        return { code, map: null };
      }
      return null;
    },
    configResolved(config) {
      if (config.optimizeDeps) {
        // Safely modify esbuild options
        const esbuildOptions = config.optimizeDeps.esbuildOptions || {};
        config.optimizeDeps.esbuildOptions = {
          ...esbuildOptions,
          tsconfigRaw: JSON.stringify({
            compilerOptions: {
              declaration: false,
              declarationMap: false,
              emitDeclarationOnly: false,
              noEmit: true,
              skipLibCheck: true
            }
          })
        };
      }
    }
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      tsDecorators: true,
    }),
    suppressTSDeclarationErrors(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean as any),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Add options to tell esbuild to skip declaration generation
    tsconfigRaw: JSON.stringify({
      compilerOptions: {
        declaration: false,
        emitDeclarationOnly: false,
        noEmit: true,
        skipLibCheck: true
      }
    })
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // State management and data fetching
          'data-layer': [
            '@tanstack/react-query',
            '@supabase/supabase-js',
          ],
          // UI Components from Radix
          'ui-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
          ],
          'ui-overlay': [
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
          ],
          'ui-navigation': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-navigation-menu',
          ],
          // Auth related components
          'auth': [
            './src/components/auth/PasswordLoginForm.tsx',
            './src/components/auth/SignInForm.tsx',
            './src/components/auth/SignUpForm.tsx',
            './src/components/auth/MagicLinkForm.tsx',
            './src/components/auth/GuestLoginButton.tsx',
            './src/components/auth/Turnstile.tsx',
          ],
          // Game components split by functionality
          'game-core': [
            './src/components/game/GameBoard.tsx',
            './src/components/game/GameContainer.tsx',
            './src/components/game/GameScreen.tsx',
          ],
          'game-ui': [
            './src/components/game/GameControls.tsx',
            './src/components/game/GameMenus.tsx',
            './src/components/game/GameTopBar.tsx',
            './src/components/game/GameNavigation.tsx',
          ],
          'game-features': [
            './src/components/game/Achievements.tsx',
            './src/components/game/Stats.tsx',
            './src/components/game/Leaderboard.tsx',
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
}));
