/**
 * NPM Scripts Generator
 * paths.js를 사용하여 스크립트 생성
 */

const { PATHS, MODULES } = require('./paths');

// 스크립트 생성 함수
const generateScripts = () => {
  const scripts = {
    // 서버 개발
    'dev:server': `cd ${PATHS.root} && nodemon --watch 'server/**/*' --watch 'core/**/*' --watch 'login/**/*' --ext ts --exec 'ts-node --project server/tsconfig.json' server/index.ts`,
    
    // 빌드
    'build:server': MODULES.map(m => `npm run build:server:${m}`).join(' && '),
    'build:client': MODULES.map(m => `npm run build:client:${m}`).join(' && '),
    'build': 'npm run build:server && npm run build:client',
    
    // 정리
    'clean': `rm -rf ${PATHS.dist}`,
    
    // 린트
    'lint': MODULES.map(m => `npm run lint:${m}`).join(' && '),
  };
  
  // 각 모듈별 스크립트 추가
  MODULES.forEach(module => {
    scripts[`dev:client:${module}`] = `cd ${PATHS[module]} && vite`;
    scripts[`build:server:${module}`] = `cd ${PATHS[module]} && tsc --project tsconfig.server.json`;
    scripts[`build:client:${module}`] = `cd ${PATHS[module]} && vite build`;
    scripts[`lint:${module}`] = `cd ${PATHS[module]} && eslint . --ext .ts,.tsx`;
  });
  
  return scripts;
};

module.exports = { generateScripts };

