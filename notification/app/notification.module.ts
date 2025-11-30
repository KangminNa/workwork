import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { NotificationController } from '../interface/http/notification.controller';
import { NotificationService } from '../application/services/notification.service';
import { NotificationRepository } from '../infrastructure/notification.repository';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
})
export class NotificationModule extends BaseModule {
  protected moduleName = 'NotificationModule';
}
