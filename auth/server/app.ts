/**
 * Auth Module Server Entry Point
 */

import 'reflect-metadata';
import express from 'express';
import { glob } from 'glob';
import { container } from '../../core/server/Container.js';
import { Resolver } from '../../core/server/Resolver.js';

const app = express();
app.use(express.json());

/**
 * 1. 모듈 로딩 (Controller, Service, Repository)
 */
async function loadModules() {
  console.log('📦 Loading Auth module...');
  
  const files = await glob('./**/*.{ts,js}', {
    cwd: __dirname,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/entities/**', '**/dto/**', '**/shared/**', '**/app.ts'],
  });

  for (const file of files) {
    await import(file);
  }

  console.log('✅ Modules loaded');
  container.printRegistry();
}

/**
 * 2. HTTP 라우팅
 */
app.all('/api/*', async (req, res) => {
  try {
    await Resolver.handle('http', req.path, { req, res });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 3. 서버 시작
 */
async function start() {
  await loadModules();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);

