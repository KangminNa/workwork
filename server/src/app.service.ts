import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'WorkWork NestJS Server is running! 🚀';
  }
}

