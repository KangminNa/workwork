import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './'),
      '@core': path.resolve(__dirname, '../core'),
      '@config': path.resolve(__dirname, '../config'),
    },
  },
  root: './browser',
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/client/common',
    emptyOutDir: true,
  },
});

