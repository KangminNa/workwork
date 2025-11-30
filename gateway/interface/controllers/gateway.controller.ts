import { Controller, Get } from '@nestjs/common';

@Controller()
export class GatewayController {
  @Get('health')
  health() {
    return { status: 'ok', modules: ['auth', 'user', 'schedule', 'notification', 'label', 'admin'] };
  }
}
