import "reflect-metadata";
import { BaseApp } from './core/BaseApp';
import { glob } from 'glob';
import path from 'path';

/**
 * 애플리케이션의 모든 구성요소를 로드하고 서버를 시작하는
 * 메인 부트스트랩 함수입니다.
 */
export async function bootstrap() {
  // --- Dynamic Module Loading ---
  console.log('🔄 Loading application modules...');
  const modulePaths = await glob('src/{api,services,repositories}/**/*.ts', {
    cwd: path.join(__dirname, '..'), // CWD를 src의 부모, 즉 'server' 디렉토리로 설정
    absolute: true,
  });

  for (const filePath of modulePaths) {
    await import(filePath);
    console.log(`  - Loaded: ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
  console.log('✅ Modules loaded successfully.');

  // --- Start Application ---
  const app = new BaseApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.start(PORT);
}
