import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Optimisation avancée du code splitting
          if (id.includes('node_modules')) {
            // React et ses dépendances
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI Libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('class-variance-authority')) {
              return 'vendor-ui';
            }
            // Utilitaires
            if (id.includes('@tanstack') || id.includes('date-fns') || id.includes('zod') || id.includes('clsx')) {
              return 'vendor-utils';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Autres dépendances
            return 'vendor-misc';
          }
          
          // Séparer les pages par route
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName.toLowerCase()}`;
          }
          
          // Séparer les composants lourds
          if (id.includes('/components/decision-maker/')) {
            return 'chunk-decision-maker';
          }
          if (id.includes('/components/settings/')) {
            return 'chunk-settings';
          }
          if (id.includes('/components/workspace/')) {
            return 'chunk-workspace';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Optimisations de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimisation des assets
    assetsInlineLimit: 4096, // Inline les assets < 4KB
    cssCodeSplit: true,
    sourcemap: false, // Désactiver les sourcemaps en production
  },
}));
