import { Injectable } from '@nestjs/common';
import { NotificationGreeting } from '../../domain/models/notification-greeting.entity';
import { NotificationGreetingDto } from '../../shared/dto/notification-greeting.dto';

@Injectable()
export class NotificationService {
  getGreeting(): NotificationGreetingDto {
    const greeting: NotificationGreeting = {
      message: 'Notification module will ping users soon',
    };
    return greeting;
  }
}
