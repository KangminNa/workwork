import { Injectable } from '@nestjs/common';
import { ConfigLoader } from './config/config.loader';

@Injectable()
export class AppService {
  getServerInfo() {
    const config = ConfigLoader.get();
    return {
      name: 'WorkWork API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: config.server.port,
      database: config.database.database,
      message: 'WorkWork Server is running! 🚀',
    };
  }
}

