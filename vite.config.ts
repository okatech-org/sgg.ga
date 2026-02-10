import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy charting library
          'vendor-recharts': ['recharts', 'react-smooth', 'd3-interpolate', 'd3-scale', 'd3-shape'],
          // UI framework (Radix primitives)
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
          ],
          // React core + router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Query + state
          'vendor-state': ['@tanstack/react-query', 'zustand'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
}));
