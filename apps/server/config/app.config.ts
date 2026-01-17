/**
 * Application Configuration
 * 앱 전역 설정
 */

export const appConfig = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Environment Check
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // API Prefix
  apiPrefix: process.env.API_PREFIX || 'api',
};

