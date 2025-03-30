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
    react({
      tsDecorators: true,
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Keep path alias if needed, but __dirname might need changing if switching vite.config to full ESM
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  base: "/",
  build: {
    sourcemap: true, // Keep true for debugging if needed, consider 'hidden' or false for prod
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          "data-layer": ["@tanstack/react-query", "@supabase/supabase-js"],
          // UI Components from Radix
          "ui-core": [
            "@radix-ui/react-slot",
            "@radix-ui/react-label",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
          ],
          "ui-overlay": [
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
            "@radix-ui/react-dropdown-menu",
          ],
          "ui-navigation": [
            "@radix-ui/react-tabs",
            "@radix-ui/react-navigation-menu",
          ],
          // Auth related components
          auth: [
            "./src/components/auth/PasswordLoginForm.tsx",
            "./src/components/auth/SignInForm.tsx",
            "./src/components/auth/SignUpForm.tsx",
            "./src/components/auth/MagicLinkForm.tsx",
            "./src/components/auth/GuestLoginButton.tsx",
            "./src/components/auth/Turnstile.tsx",
          ],
          // Game components split by functionality
          "game-core": [
            "./src/components/game/GameBoard.tsx",
            "./src/components/game/GameContainer.tsx",
            "./src/components/game/GameScreen.tsx",
          ],
          "game-ui": [
            "./src/components/game/GameControls.tsx",
            "./src/components/game/GameMenus.tsx",
            "./src/components/game/GameTopBar.tsx",
            "./src/components/game/GameNavigation.tsx",
          ],
          "game-features": [
            "./src/components/game/Achievements.tsx",
            "./src/components/game/Stats.tsx",
            "./src/components/game/Leaderboard.tsx",
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
}));
