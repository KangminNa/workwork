import { Controller, Get } from '@nestjs/common';
import { BaseController } from '@workwork/base';
import { NotificationService } from '../../application/services/notification.service';

@Controller('notification')
export class NotificationController extends BaseController {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  @Get('hello')
  greet() {
    return this.success(this.notificationService.getGreeting());
  }
}
