/**
 * Project Paths Configuration
 * 프로젝트의 모든 경로를 중앙에서 관리
 */

const path = require('path');

// 루트 디렉토리
const ROOT_DIR = path.resolve(__dirname, '..');

// 주요 디렉토리
const PATHS = {
  root: ROOT_DIR,
  server: path.join(ROOT_DIR, 'server'),
  config: path.join(ROOT_DIR, 'config'),
  dist: path.join(ROOT_DIR, 'dist'),
  distServer: path.join(ROOT_DIR, 'dist', 'server'),
  distClient: path.join(ROOT_DIR, 'dist', 'client'),
  
  // 모듈 디렉토리
  core: path.join(ROOT_DIR, 'core'),
  common: path.join(ROOT_DIR, 'common'),
  login: path.join(ROOT_DIR, 'login'),
  
  // Core 하위
  coreServer: path.join(ROOT_DIR, 'core', 'server'),
  coreBrowser: path.join(ROOT_DIR, 'core', 'browser'),
  coreShared: path.join(ROOT_DIR, 'core', 'shared'),
  
  // Common 하위
  commonServer: path.join(ROOT_DIR, 'common', 'server'),
  commonBrowser: path.join(ROOT_DIR, 'common', 'browser'),
  commonShared: path.join(ROOT_DIR, 'common', 'shared'),
  
  // Login 하위
  loginServer: path.join(ROOT_DIR, 'login', 'server'),
  loginBrowser: path.join(ROOT_DIR, 'login', 'browser'),
  loginShared: path.join(ROOT_DIR, 'login', 'shared'),
};

// 서버 포트 설정
const PORTS = {
  server: process.env.PORT || 4000,
  clientCore: 3000,
  clientCommon: 3001,
  clientLogin: 3100,
};

// API 설정
const API = {
  prefix: '/api',
  version: 'v1',
  baseUrl: process.env.VITE_API_URL || `http://localhost:${PORTS.server}`,
};

// 모듈 목록
const MODULES = ['core', 'common', 'login'];

module.exports = {
  PATHS,
  PORTS,
  API,
  MODULES,
  ROOT_DIR,
};

