import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', '**/coverage/**'],
    },
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
});
