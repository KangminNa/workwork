import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'auth', time: new Date().toISOString() };
  }

  @Get()
  getRoot(): string {
    return this.appService.getHello();
  }
}
