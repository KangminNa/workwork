import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', time: new Date().toISOString() };
  }

  @Get()
  @Header('Content-Type', 'text/html')
  getRoot(@Res() res: Response) {
    res.sendFile(this.appService.getLandingPage());
  }
}
