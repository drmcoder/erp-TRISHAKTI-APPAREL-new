import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.REACT_APP_USE_EMULATORS': JSON.stringify(process.env.REACT_APP_USE_EMULATORS || 'false'),
    'process.env.VITE_ERROR_REPORTING_ENDPOINT': JSON.stringify(process.env.VITE_ERROR_REPORTING_ENDPOINT || '/api/errors'),
    'process.env.VITE_PERFORMANCE_ENDPOINT': JSON.stringify(process.env.VITE_PERFORMANCE_ENDPOINT || '/api/performance'),
    'process.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0'),
    'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || 'https://api.tsa-erp.com/v1'),
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/shared/components'),
      '@/hooks': resolve(__dirname, 'src/shared/hooks'),  
      '@/utils': resolve(__dirname, 'src/shared/utils'),
      '@/types': resolve(__dirname, 'src/shared/types'),
      '@/constants': resolve(__dirname, 'src/shared/constants'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@/app': resolve(__dirname, 'src/app'),
      '@/assets': resolve(__dirname, 'src/assets'),
    },
    // Ensure consistent module resolution
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Faster builds
    reportCompressedSize: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Add timestamp to filenames for cache busting
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'ui-vendor': ['lucide-react', '@headlessui/react', '@heroicons/react'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'immer'],
          'query-vendor': ['@tanstack/react-query', 'zustand']
        },
      },
    },
  },

  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from network
    open: true,
    cors: true,
    hmr: {
      overlay: false,
      port: 3001, // Change to different port to avoid conflicts
    },
    // Configure middleware for API endpoints
    middlewareMode: false,
    // Add headers to prevent caching during development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Force module resolution consistency
    fs: {
      strict: true,
    },
  },

  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'lucide-react',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'zustand',
      '@tanstack/react-query'
    ],
    exclude: ['firebase-admin'],
    // Force rebuild on cache inconsistencies
    force: process.env.NODE_ENV === 'development',
  },

  // Enable better source mapping for debugging
  esbuild: {
    sourcemap: process.env.NODE_ENV === 'development',
    target: 'esnext',
    keepNames: false,
  },
});
