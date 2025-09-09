import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Performance-optimized Vite configuration
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/components': path.resolve(__dirname, './src/components'),
    }
  },
  
  build: {
    // Optimize for production
    target: 'es2018',
    minify: 'esbuild',
    sourcemap: false,
    
    // Bundle splitting for better caching
    rollupOptions: {
      output: {
        // Split vendor chunks
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          
          // Routing
          'router-vendor': ['react-router-dom'],
          
          // UI libraries
          'ui-vendor': ['@heroicons/react', '@headlessui/react'],
          
          // Firebase
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          
          // Charts and visualization
          'chart-vendor': ['recharts'],
          
          // Utilities
          'utils-vendor': ['date-fns', 'clsx', 'zod'],
          
          // Work assignment features
          'work-assignment': [
            './src/features/work-assignment/components/smart-work-assignment-dashboard',
            // './src/features/work-assignment/components/kanban-mapping-assignment', // Temporarily disabled
            './src/features/work-assignment/components/sequential-workflow-assignment',
            './src/features/work-assignment/components/drag-drop-assignment-dashboard'
          ],
          
          // Bundle management features
          'bundle-management': [
            './src/features/bundles/components/bundle-assignment-dashboard',
            './src/features/bundles/components/operator-work-dashboard',
            './src/services/enhanced-bundle-service'
          ]
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId))
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      }
    },
    
    // Increase chunk size warning limit for large business apps
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    // Development optimizations
    hmr: {
      overlay: false // Disable error overlay for better UX
    },
    
    // Enable GZIP compression
    middlewareMode: false
  },
  
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'date-fns',
      'clsx'
    ],
    
    // Exclude large dependencies that change frequently
    exclude: ['firebase']
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    postcss: './postcss.config.js'
  },
  
  // Define globals for better tree shaking
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__DEV__': process.env.NODE_ENV !== 'production'
  }
});