/**
 * Core Server Entry Point
 * Express 서버 초기화 및 시작
 */

import { CoreServerApp } from './app';

// Core 서버 앱 생성 및 시작
const app = new CoreServerApp(4000);
app.start();

export { CoreServerApp };
