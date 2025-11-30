import { Controller, Get } from '@nestjs/common';
import { NotificationService } from '../../application/services/notification.service';
import { NotificationGreetingDto } from '../../shared/dto/notification-greeting.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('hello')
  greet(): NotificationGreetingDto {
    return this.notificationService.getGreeting();
  }
}
