/**
 * Project Constants
 * 프로젝트 전역 상수 관리
 */

const CONSTANTS = {
  // 애플리케이션 정보
  APP_NAME: 'WorkWork',
  APP_VERSION: '1.0.0',
  
  // 환경
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 빌드 설정
  BUILD: {
    outDirServer: '../dist/server',
    outDirClient: '../dist/client',
    emptyOutDir: true,
  },
  
  // TypeScript 설정
  TYPESCRIPT: {
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
  },
  
  // Vite 설정
  VITE: {
    plugins: ['@vitejs/plugin-react'],
  },
};

module.exports = CONSTANTS;

