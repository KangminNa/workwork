import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

// Config 로더
function loadConfig(mode: string) {
  const configPath = path.resolve(__dirname, '../config/default.json');
  const envConfigPath = path.resolve(__dirname, `../config/${mode}.json`);

  let config: any = JSON.parse(readFileSync(configPath, 'utf-8'));

  try {
    const envConfig = JSON.parse(readFileSync(envConfigPath, 'utf-8'));
    config = deepMerge(config, envConfig);
  } catch (e) {
    console.warn(`No ${mode}.json found, using default config`);
  }

  return config;
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = loadConfig(mode);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: `http://${config.server.host}:${config.server.port}`,
          changeOrigin: true,
        },
      },
    },
  };
});

