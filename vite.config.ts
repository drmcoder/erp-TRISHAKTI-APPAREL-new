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
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
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
      port: 3001,
    },
    // Proxy configuration for API calls if needed
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
