import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base';
import { NotificationGreeting } from '../domain/models/notification-greeting.entity';

@Injectable()
export class NotificationRepository extends BaseInMemoryRepository<NotificationGreeting> {
  constructor() {
    super([
      {
        id: 'notification-default',
        message: 'Notification module will ping users soon',
        createdAt: new Date(),
      },
    ]);
  }
}
