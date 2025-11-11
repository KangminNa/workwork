import "reflect-metadata";
import { BaseApp } from './core/BaseApp';
import { glob } from 'glob';
import path from 'path';

async function bootstrap() {
  // --- Dynamic Module Loading ---
  // 데코레이터가 Container에 등록을 수행하려면, 해당 파일들이 먼저 임포트되어야 합니다.
  console.log('🔄 Loading modules...');
  const modulePaths = await glob('src/{api,services,repositories}/**/*.ts', {
    cwd: __dirname,
    absolute: true,
  });

  for (const filePath of modulePaths) {
    await import(filePath);
    console.log(`  - Loaded: ${path.relative(__dirname, filePath)}`);
  }
  console.log('✅ Modules loaded successfully.');

  // --- Start Application ---
  const app = new BaseApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.start(PORT);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to bootstrap the application:', error);
  process.exit(1);
});
