import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './'),
      '@common': path.resolve(__dirname, '../common'),
      '@config': path.resolve(__dirname, '../config'),
    },
  },
  root: './browser',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/client/core',
    emptyOutDir: true,
  },
});

