import { Controller, Get } from '@nestjs/common';
import { BaseController } from '@workwork/base';

@Controller()
export class GatewayController extends BaseController {
  @Get('health')
  health() {
    return this.success({
      status: 'ok',
      modules: ['auth', 'user', 'schedule', 'notification', 'label', 'admin'],
    });
  }
}
