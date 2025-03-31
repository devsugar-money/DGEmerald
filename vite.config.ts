import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import type { ConfigEnv, UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  return {
    plugins: [
      react({
        // Always use automatic JSX runtime to avoid 'React is not defined' errors
        jsxRuntime: 'automatic',
      }),
      mode === 'analyze' && 
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // Improved visualization
        }),
    ],
    build: {
      // Optimize chunks and lazy loading
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Create specific chunks for larger dependencies
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react';
            }
            if (id.includes('node_modules/react-router-dom')) {
              return 'router';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
            if (id.includes('node_modules/react-quill')) {
              return 'quill';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            if (id.includes('node_modules/zustand')) {
              return 'state';
            }
            
            // Group page components
            if (id.includes('/src/pages/')) {
              return 'pages';
            }
          },
          // Optimize asset file names for better caching
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
            
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          // Optimize chunk file names
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // Optimize entry point file names
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      // Enable minification in all modes
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // Target newer browsers for smaller bundles
      target: 'es2018',
      // Reduce chunk size
      chunkSizeWarningLimit: 600,
      // Generate smaller CSS
      cssMinify: 'lightningcss',
      // Improve asset optimization
      assetsInlineLimit: 4096, // 4kb
      // Enable source maps only in development
      sourcemap: mode === 'development',
      // Optimize for module preloading
      modulePreload: {
        polyfill: true,
      },
      // Compression settings
      reportCompressedSize: true,
    },
    // Set up asset handling
    assetsInclude: ['**/*.{png,jpg,jpeg,gif,svg}'],
    // Optimize CSS
    css: {
      devSourcemap: mode === 'development',
      // Minify CSS
      postcss: './postcss.config.js',
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        '@supabase/supabase-js',
        'zustand'
      ],
      exclude: ['lucide-react'],
      // Force-include some dependencies that might not be detected
      force: true,
      // Improve esbuild optimization
      esbuildOptions: {
        target: 'es2018',
        treeShaking: true,
        legalComments: 'none',
      },
    },
    // Performance optimizations
    server: {
      hmr: {
        overlay: true,
      },
    },
    preview: {
      // Enable compression for preview
      port: 4173,
      host: true,
    },
    // Add custom Vite options
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __PRODUCTION__: mode === 'production',
    },
  };
});