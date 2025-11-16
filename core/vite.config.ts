import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// config/paths.js에서 설정 가져오기
const { PATHS, PORTS, API } = require('../config/paths');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': PATHS.core,
      '@common': PATHS.common,
      '@config': PATHS.config,
    },
  },
  root: path.join(PATHS.core, 'browser'),
  publicDir: path.join(PATHS.core, 'browser/public'),
  server: {
    port: PORTS.clientCore,
    proxy: {
      '/api': {
        target: API.baseUrl,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.join(PATHS.distClient, 'core'),
    emptyOutDir: true,
  },
});

