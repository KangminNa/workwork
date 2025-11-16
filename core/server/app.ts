/**
 * Core Server App
 * Express 서버를 초기화하고 모든 비즈니스 모듈을 통합
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { autoResolver } from './resolver/AutoResolver';

export class CoreServerApp {
  private app: Express;
  private port: number;

  constructor(port: number = 4000) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * 미들웨어 초기화
   */
  private initializeMiddlewares(): void {
    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3100'],
      credentials: true,
    }));

    // JSON 파싱
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 로깅
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * 라우트 초기화
   */
  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API 라우트 (AutoResolver 사용)
    this.app.use('/api', autoResolver.getRouter());

    // 404 핸들러
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Not Found',
        path: req.path,
      });
    });
  }

  /**
   * 에러 핸들링 초기화
   */
  private initializeErrorHandling(): void {
    this.app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('[Core Server] Error:', err);
      
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });
  }

  /**
   * 서버 시작
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log('\n🚀 Core Server is running');
      console.log(`📋 API Base: http://localhost:${this.port}/api`);
      console.log(`🏥 Health Check: http://localhost:${this.port}/health\n`);
    });
  }

  /**
   * Express 앱 인스턴스 반환
   */
  public getApp(): Express {
    return this.app;
  }
}

