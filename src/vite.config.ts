
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/',
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            '@supabase/supabase-js',
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
          ],
          'ui': [
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-label',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-avatar',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
          ],
          'game': [
            './src/components/game/GameBoard.tsx',
            './src/components/game/GameContainer.tsx',
            './src/components/game/GameControls.tsx',
            './src/components/game/GameScreen.tsx',
            './src/components/game/GameWrapper.tsx',
            './src/components/game/HexGrid.tsx',
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
  },
}));
