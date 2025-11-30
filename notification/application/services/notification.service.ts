import { Injectable } from '@nestjs/common';
import { BaseService } from '@workwork/base';
import { NotificationGreeting } from '../../domain/models/notification-greeting.entity';
import { NotificationGreetingDto } from '../../shared/dto/notification-greeting.dto';
import { NotificationRepository } from '../../infrastructure/notification.repository';

@Injectable()
export class NotificationService extends BaseService<NotificationGreeting> {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super(notificationRepository);
  }

  getGreeting(): NotificationGreetingDto {
    return this.findById('notification-default');
  }
}
